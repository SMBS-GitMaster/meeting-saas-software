import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useMMErrorLogger } from '@mm/core/logging'

import {
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBloomHeadlineNode } from '@mm/core-bloom/headlines/headlineNode'
import { useBloomHeadlineMutations } from '@mm/core-bloom/headlines/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getEditHeadlineDrawerPermissions } from './editHeadlineDrawerPermissions'
import {
  IEditHeadlineDrawerActionHandlers,
  IEditHeadlineDrawerContainerProps,
} from './editHeadlineDrawerTypes'

export default observer(function EditHeadlineDrawerContainer(
  props: IEditHeadlineDrawerContainerProps
) {
  const [headlineNotesText, setHeadlineNotesText] =
    useState<Maybe<string>>(null)

  const meetingNode = useBloomMeetingNode()
  const terms = useBloomCustomTerms()
  const { createNote } = useBloomNoteMutations()
  const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()
  const { editHeadline } = useBloomHeadlineMutations()
  const { editAuthenticatedUserSettings } = useBloomUserMutations()
  const { getNoteById } = useBloomNoteQueries()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { logError } = useMMErrorLogger()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

  const sharedSubscription = useSubscription(
    {
      users: queryDefinition({
        def: useBloomUserNode(),
        sort: { fullName: 'asc' },
        map: ({ avatar, userAvatarColor, firstName, lastName, fullName }) => ({
          avatar,
          userAvatarColor,
          firstName,
          lastName,
          fullName,
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
      meeting: props.meetingId
        ? queryDefinition({
            def: meetingNode,
            map: ({ name, attendeesLookup, currentMeetingAttendee }) => ({
              name,
              attendees: attendeesLookup({
                sort: { fullName: 'asc' },
                map: ({
                  firstName,
                  lastName,
                  fullName,
                  avatar,
                  userAvatarColor,
                }) => ({
                  firstName,
                  lastName,
                  fullName,
                  avatar,
                  userAvatarColor,
                }),
              }),
              currentMeetingAttendee: currentMeetingAttendee({
                map: ({ permissions }) => ({
                  permissions: permissions({
                    map: ({ view, edit, admin }) => ({ view, edit, admin }),
                  }),
                }),
              }),
            }),
            useSubOpts: {
              doNotSuspend: true,
            },
            target: { id: props.meetingId },
          })
        : null,
    },
    { subscriptionId: `EditHeadlineDrawerContainer-sharedSubscription` }
  )

  const headlineSubscription = useSubscription(
    {
      headline: queryDefinition({
        def: useBloomHeadlineNode(),
        map: ({ title, meeting, notesId, assignee }) => ({
          title,
          notesId,
          meeting: meeting({
            map: ({ id, name }) => ({ id, name }),
          }),
          assignee: assignee({
            map: ({ avatar, firstName, lastName, fullName }) => ({
              avatar,
              firstName,
              lastName,
              fullName,
            }),
          }),
        }),
        target: { id: props.headlineId },
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
    },
    {
      subscriptionId: `EditHeadlineDrawerContainer-headlineSubscription-${props.headlineId}`,
    }
  )

  const currentUserPermissions = useMemo(() => {
    return getEditHeadlineDrawerPermissions(
      sharedSubscription().data.meeting?.currentMeetingAttendee.permissions ??
        null
    )
  }, [sharedSubscription().data.meeting?.currentMeetingAttendee.permissions])

  const currentMeetingsLookup = getUsersMeetingsLookup({
    meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
    includePersonalMeeting: false,
  })

  const meeting = sharedSubscription().data.meeting
  const meetingAttendeesAndOrgUsersLookup = useMemo(() => {
    return getMeetingAttendeesAndOrgUsersLookup({
      orgUsers: sharedSubscription().data.users || null,
      meetings: meeting ? [meeting] : null,
    })
  }, [sharedSubscription().data.users, meeting])

  const headlineData = {
    id: headlineSubscription().data.headline?.id || '',
    title: headlineSubscription().data.headline?.title || '',
    assignee: headlineSubscription().data.headline?.assignee || {
      id: '',
      firstName: '',
      lastName: '',
      avatar: '',
      fullName: '',
    },
    meeting: headlineSubscription().data.headline?.meeting || {
      id: '',
      name: '',
    },
    notesId: headlineSubscription().data.headline?.notesId || '',
  }

  const onSubmit: IEditHeadlineDrawerActionHandlers['onSubmit'] = async (
    values
  ) => {
    try {
      await editHeadline({
        headlineId: props.headlineId,
        title: values.editHeadlineTitle,
        assignee: values.editHeadlineAttachToOwner,
      })
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error editing {{headline}}`, {
          headline: terms.headline.lowercaseSingular,
        }),
        error: new UserActionError(error),
      })
      throw error
    }
  }

  const onCreateNotes: IEditHeadlineDrawerActionHandlers['onCreateNotes'] =
    useCallback(
      async (opts) => {
        try {
          const response = await createNote(opts)
          await editHeadline({
            headlineId: props.headlineId,
            notesId: response,
          })
          return response
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue creating notes for this {{headline}}`, {
              headline: terms.headline.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      },
      [props.headlineId, createNote, editHeadline, openOverlazy, t, terms]
    )

  const onArchiveHeadline: IEditHeadlineDrawerActionHandlers['onArchiveHeadline'] =
    async () => {
      try {
        await editHeadline({
          headlineId: props.headlineId,
          archivedTimestamp: getSecondsSinceEpochUTC(),
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t(`{{headline}} archived`, {
            headline: terms.headline.singular,
          }),
          undoClicked: () => {
            // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410
          },
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error archiving {{headline}}`, {
            headline: terms.headline.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
      }
    }

  const onHandleChangeDrawerViewSetting: IEditHeadlineDrawerActionHandlers['onHandleChangeDrawerViewSetting'] =
    useCallback(
      async (drawerView) => {
        await editAuthenticatedUserSettings({ drawerView })
      },
      [editAuthenticatedUserSettings]
    )

  const onGetNoteById = useCallback(async () => {
    const notesId = headlineSubscription().data.headline?.notesId
    if (notesId && !currentUserPermissions.canEditHeadlinesInMeeting.allowed) {
      try {
        const response = await getNoteById({
          noteId: notesId,
        })
        setHeadlineNotesText(response.text)
      } catch (e) {
        logError(e, {
          context: `Error fetching note data for headline ${props.headlineId} with notesId ${notesId}`,
        })
      }
    }
  }, [
    headlineSubscription().data.headline?.notesId,
    currentUserPermissions.canEditHeadlinesInMeeting.allowed,
    props.headlineId,
    getNoteById,
    setHeadlineNotesText,
    logError,
  ])

  const onHandleCloseDrawerWithUnsavedChangesProtection: IEditHeadlineDrawerActionHandlers['onHandleCloseDrawerWithUnsavedChangesProtection'] =
    useCallback(
      ({ onHandleLeaveWithoutSaving }) => {
        openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
      },
      [openOverlazy]
    )

  useEffect(() => {
    if (!headlineSubscription().querying) {
      onGetNoteById()
    }
  }, [headlineSubscription().querying, onGetNoteById])

  const Component = props.children
  return (
    <Component
      data={{
        currentUserPermissions,
        isLoading: headlineSubscription().querying,
        meetingId: props.meetingId,
        meetingAttendeesAndOrgUsersLookup,
        currentMeetingsLookup,
        headline: headlineData,
        headlineNotesText,
        headlineIdFromProps: props.headlineId,
        drawerIsRenderedInMeeting,
        drawerView,
      }}
      actionHandlers={{
        onArchiveHeadline,
        onCreateNotes,
        onSubmit,
        onHandleChangeDrawerViewSetting,
        onHandleCloseDrawerWithUnsavedChangesProtection,
      }}
    />
  )
})
