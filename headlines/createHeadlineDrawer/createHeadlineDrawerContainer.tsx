import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  PERSONAL_MEETING_VALUE,
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBloomHeadlineMutations } from '@mm/core-bloom/headlines/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getCreateHeadlineDrawerPermissions } from './createHeadlineDrawerPermissions'
import {
  ICreateHeadlineDrawerActionHandlers,
  ICreateHeadlineDrawerContainerProps,
} from './createHeadlineDrawerTypes'

export default observer(function CreateHeadlineContainer(
  props: ICreateHeadlineDrawerContainerProps
) {
  const meetingNode = useBloomMeetingNode()
  const { createNote } = useBloomNoteMutations()
  const { createHeadline } = useBloomHeadlineMutations()
  const { editAuthenticatedUserSettings } = useBloomUserMutations()
  const { openOverlazy } = useOverlazyController()

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()
  const renderOnlyOrgUsersAsLookupOption = !props.meetingId

  const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

  const subscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ fullName }) => ({
          fullName,
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
      users: queryDefinition({
        def: useBloomUserNode(),
        sort: { fullName: 'asc' },
        map: ({ avatar, firstName, lastName, fullName, userAvatarColor }) => ({
          avatar,
          firstName,
          lastName,
          fullName,
          userAvatarColor,
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
    { subscriptionId: 'CreateHeadlineDrawer' }
  )

  const currentUserPermissions = useMemo(() => {
    return getCreateHeadlineDrawerPermissions({
      currentUserPermissions:
        subscription().data.meeting?.currentMeetingAttendee.permissions ?? null,
      isUniversalAdd: props.isUniversalAdd,
    })
  }, [
    subscription().data.meeting?.currentMeetingAttendee.permissions,
    props.isUniversalAdd,
  ])

  const currentMeetingsLookup = getUsersMeetingsLookup({
    meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
    includePersonalMeeting: false,
  })

  const meeting = subscription().data.meeting
  const meetingAttendeesAndOrgUsersLookup = useMemo(() => {
    return getMeetingAttendeesAndOrgUsersLookup({
      orgUsers: subscription().data?.users || null,
      meetings: meeting ? [meeting] : null,
      displayOrgUsersOnly: renderOnlyOrgUsersAsLookupOption,
    })
  }, [subscription().data?.users, meeting, renderOnlyOrgUsersAsLookupOption])

  const onSubmit: ICreateHeadlineDrawerActionHandlers['onSubmit'] = async (
    values
  ) => {
    try {
      await Promise.all(
        values.createHeadlineAttachToMeetings.map((meetingId) =>
          createHeadline({
            title: values.createHeadlineTitle,
            archived: false,
            archivedTimestamp: null,
            assignee: values.createHeadlineAttachToOwner,
            notesId: values.createHeadlineNotes,
            meetings: meetingId === PERSONAL_MEETING_VALUE ? [] : [meetingId],
          })
        )
      )

      if (!values.createAnotherCheckedInDrawer) {
        openOverlazy('Toast', {
          type: 'success',
          text: t('{{headline}} created successfully.', {
            headline: terms.headline.singular,
          }),
          undoClicked: () =>
            console.log(
              '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
            ),
        })
      }

      if (values.createAnotherCheckedInDrawer) {
        setTimeout(() => {
          openOverlazy('CreateHeadlineDrawer', {
            meetingId: props.meetingId,
          })
        }, 0)
      }
    } catch (e) {
      openOverlazy('Toast', {
        type: 'error',
        text: t('Failed to create {{headline}}', {
          headline: terms.headline.lowercaseSingular,
        }),
        error: new UserActionError(e),
      })
      throw e
    }
  }

  const onCreateNotes: ICreateHeadlineDrawerActionHandlers['onCreateNotes'] =
    useCallback(
      async (opts) => {
        try {
          return createNote(opts)
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
      [createNote, openOverlazy, t, terms]
    )

  const onHandleChangeDrawerViewSetting: ICreateHeadlineDrawerActionHandlers['onHandleChangeDrawerViewSetting'] =
    useCallback(
      async (drawerView) => {
        await editAuthenticatedUserSettings({ drawerView })
      },
      [editAuthenticatedUserSettings]
    )

  const onHandleCloseDrawerWithUnsavedChangesProtection: ICreateHeadlineDrawerActionHandlers['onHandleCloseDrawerWithUnsavedChangesProtection'] =
    useCallback(
      ({ onHandleLeaveWithoutSaving }) => {
        openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
      },
      [openOverlazy]
    )

  return (
    <props.children
      data={{
        isLoading: subscription().querying,
        currentUserId: subscription().data.currentUser?.id || null,
        meetingId: props.meetingId,
        currentUserPermissions,
        currentMeetingsLookup,
        meetingAttendeesAndOrgUsersLookup,
        drawerIsRenderedInMeeting,
        drawerView,
      }}
      actionHandlers={{
        onSubmit,
        onCreateNotes,
        onHandleChangeDrawerViewSetting,
        onHandleCloseDrawerWithUnsavedChangesProtection,
      }}
    />
  )
})
