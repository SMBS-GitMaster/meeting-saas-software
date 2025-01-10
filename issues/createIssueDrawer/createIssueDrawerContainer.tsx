import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useMemo } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useStatefulPromise } from '@mm/core/ui/hooks'

import {
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomIssuesMutations,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { isContextAwareMeetingItem } from '@mm/bloom-web/shared'
import { getContextAwareNotesText } from '@mm/bloom-web/shared/contextAware/contextAwareNotesText'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getCreateIssueDrawerPermissions } from './createIssueDrawerPermissions'
import {
  ICreateIssueDrawerActions,
  ICreateIssueDrawerContainerProps,
} from './createIssueDrawerTypes'

export const CreateIssueDrawerContainer = observer(
  function CreateIssueDrawerContainer(props: ICreateIssueDrawerContainerProps) {
    const [contextAwareNoteId, setContextAwareNoteId] = React.useState<
      string | null
    >()

    const diResolver = useDIResolver()
    const issuesMutations = useBloomIssuesMutations()
    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()
    const { createNote } = useBloomNoteMutations()
    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()
    const { openOverlazy } = useOverlazyController()

    const { getNoteById } = useBloomNoteQueries()
    const { t } = useTranslation()

    const renderOnlyOrgUsersAsLookupOption = !props.meetingId
    const { context } = props

    const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id }) => ({
            id,
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        users: queryDefinition({
          def: useBloomUserNode(),
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
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        meeting: props.meetingId
          ? queryDefinition({
              def: meetingNode,
              map: ({ name, currentMeetingAttendee, attendeesLookup }) => ({
                name,
                currentMeetingAttendee: currentMeetingAttendee({
                  map: ({ permissions }) => ({
                    permissions: permissions({
                      map: ({ view, edit, admin }) => ({ view, edit, admin }),
                    }),
                  }),
                }),
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
              }),
              useSubOpts: {
                doNotSuspend: true,
              },
              target: { id: props.meetingId },
            })
          : null,
      },
      { subscriptionId: 'CreateIssueDrawer' }
    )

    const currentUserPermissions = useMemo(() => {
      return getCreateIssueDrawerPermissions({
        currentUserPermissions:
          subscription().data.meeting?.currentMeetingAttendee.permissions ??
          null,
        isUniversalAdd: props.isUniversalAdd,
      })
    }, [
      subscription().data.meeting?.currentMeetingAttendee.permissions,
      props.isUniversalAdd,
    ])

    const meeting = subscription().data.meeting
    const meetingAttendeesAndOrgUsersLookup = useMemo(() => {
      return getMeetingAttendeesAndOrgUsersLookup({
        orgUsers: subscription().data?.users || null,
        meetings: meeting ? [meeting] : null,
        displayOrgUsersOnly: renderOnlyOrgUsersAsLookupOption,
      })
    }, [subscription().data?.users, meeting, renderOnlyOrgUsersAsLookupOption])

    const onCreateIssue: ICreateIssueDrawerActions['createIssue'] = async (
      values
    ) => {
      try {
        await issuesMutations.createIssue({
          title: values.title,
          notesId: contextAwareNoteId ? contextAwareNoteId : values.notesId,
          ownerId: values.ownerId,
          recurrenceId: values.meetingId,
          addToDepartmentPlan: values.addToDepartmentPlan,
          context: context
            ? {
                fromNodeTitle: context.title,
                fromNodeType: context.type,
              }
            : null,
        })

        if (!values.createAnotherCheckedInDrawer) {
          openOverlazy('Toast', {
            type: 'success',
            text: t(`{{issue}} created`, {
              issue: terms.issue.singular,
            }),
            undoClicked: () =>
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              ),
          })
        }

        if (values.createAnotherCheckedInDrawer) {
          setTimeout(() => {
            openOverlazy('CreateIssueDrawer', {
              meetingId: props.meetingId,
            })
          }, 0)
        }
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to create this {{issue}}', {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
        throw error
      }
    }

    const onCreateNotes: ICreateIssueDrawerActions['createNotes'] = useCallback(
      async (opts) => {
        try {
          return createNote(opts)
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue creating notes for this {{issue}}`, {
              issue: terms.issue.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      },
      [createNote, openOverlazy, t, terms]
    )

    const onHandleChangeDrawerViewSetting: ICreateIssueDrawerActions['onHandleChangeDrawerViewSetting'] =
      useCallback(
        async (drawerView) => {
          await editAuthenticatedUserSettings({ drawerView })
        },
        [editAuthenticatedUserSettings]
      )

    const onHandleCloseDrawerWithUnsavedChangesProtection: ICreateIssueDrawerActions['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useCallback(
        ({ onHandleLeaveWithoutSaving }) => {
          openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
        },
        [openOverlazy]
      )

    const { call: onCreateNewContextAwareIssueNotes } = useStatefulPromise(
      async () => {
        try {
          if (context) {
            const noteInfoFromContext = isContextAwareMeetingItem(context)
              ? await getNoteById({
                  noteId: context.notesId,
                })
              : null

            const notesTextForContextItem = getContextAwareNotesText({
              context,
              notesText: noteInfoFromContext?.text ?? null,
              diResolver,
            })

            const contextAwareNoteId = await createNote({
              notes: notesTextForContextItem || '',
            })

            return setContextAwareNoteId(contextAwareNoteId)
          }
        } catch (e) {
          throwLocallyLogInProd(
            diResolver,
            new Error('Error creating context aware notes for Issue')
          )
        }
      }
    )

    const contextNotesId = isContextAwareMeetingItem(context)
      ? context.notesId
      : null

    useEffect(() => {
      if (context) {
        onCreateNewContextAwareIssueNotes()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextNotesId])

    const CreateIssueDrawerView = props.children
    return (
      <CreateIssueDrawerView
        data={{
          currentUserPermissions,
          currentUser: subscription().data.currentUser,
          meetingId: props.meetingId,
          meetingAttendeesAndOrgUsersLookup,
          initialItemValues: props.initialItemValues,
          isLoading: subscription().querying,
          meetingLookup: getUsersMeetingsLookup({
            meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
            includePersonalMeeting: false,
          }),
          context,
          contextAwareNoteId: contextAwareNoteId ? contextAwareNoteId : null,
          drawerIsRenderedInMeeting,
          drawerView,
        }}
        actions={{
          createIssue: onCreateIssue,
          createNotes: onCreateNotes,
          onHandleChangeDrawerViewSetting,
          onHandleCloseDrawerWithUnsavedChangesProtection,
        }}
      />
    )
  }
)
