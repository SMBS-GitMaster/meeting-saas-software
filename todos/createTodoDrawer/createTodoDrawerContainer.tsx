import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { guessTimezone } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useStatefulPromise } from '@mm/core/ui/hooks'

import {
  getMeetingAttendeesLookup,
  getUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomTodoMutations,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  getContextAwareNotesText,
  isContextAwareMeetingItem,
} from '@mm/bloom-web/shared'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getCreateTodoDrawerPermissions } from './createTodoDrawerPermissions'
import {
  ICreateTodoDrawerActions,
  ICreateTodoDrawerContainerProps,
} from './createTodoDrawerTypes'

export const CREATE_TODO_DRAWER_ID = 'CREATE_TODO_DRAWER'

export const CreateTodoDrawerContainer = observer(
  function CreateTodoDrawerContainer(props: ICreateTodoDrawerContainerProps) {
    const [selectedMeetingId, setSelectedMeetingId] = useState(props.meetingId)

    const [contextAwareNoteId, setContextAwareNoteId] = useState<
      string | null
    >()

    const diResolver = useDIResolver()
    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()
    const { createNote } = useBloomNoteMutations()
    const { createTodo } = useBloomTodoMutations()
    const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()
    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { getNoteById } = useBloomNoteQueries()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const { context } = props
    const renderOnlyOrgUsersAsLookupOption = !props.meetingId
    const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ settings }) => ({
            settings: settings({
              map: ({ timezone }) => ({ timezone }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        users: queryDefinition({
          def: useBloomUserNode(),
          sort: { fullName: 'asc' },
          map: ({
            avatar,
            firstName,
            lastName,
            fullName,
            userAvatarColor,
          }) => ({
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
        meeting: selectedMeetingId
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
              target: { id: selectedMeetingId },
              useSubOpts: {
                doNotSuspend: true,
              },
            })
          : null,
      },
      { subscriptionId: 'CreateTodoDrawer' }
    )

    const currentUserPermissions = useMemo(() => {
      return getCreateTodoDrawerPermissions({
        isPersonalTodo: selectedMeetingId === null,
        currentUserPermissions:
          subscription().data.meeting?.currentMeetingAttendee.permissions ??
          null,
        isUniversalAdd: props.isUniversalAdd,
      })
    }, [
      selectedMeetingId,
      props.isUniversalAdd,
      subscription().data.meeting?.currentMeetingAttendee.permissions,
    ])

    const meetingAttendeesOrOrgUsersLookup = useMemo(() => {
      return renderOnlyOrgUsersAsLookupOption
        ? getUsersLookup(subscription().data.users?.nodes || null)
        : getMeetingAttendeesLookup(
            subscription().data.meeting?.attendees.nodes || null
          )
    }, [
      subscription().data.meeting?.attendees.nodes,
      subscription().data.users?.nodes,
      renderOnlyOrgUsersAsLookupOption,
    ])

    const { call: onCreateNewContextAwareTodoNotes } = useStatefulPromise(
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
            new Error(`Error creating context aware notes for to-do`)
          )
        }
      }
    )

    const contextNotesId = isContextAwareMeetingItem(context)
      ? context.notesId
      : null

    useEffect(() => {
      if (props.context) {
        onCreateNewContextAwareTodoNotes()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextNotesId])

    const onCreateTodo: ICreateTodoDrawerActions['createTodo'] = async (
      values
    ) => {
      try {
        await Promise.all(
          values.ownerIds.map((owner) =>
            createTodo({
              meetingRecurrenceId: values.meetingId,
              assigneeId: owner,
              title: values.title,
              dueDate: values.dueDate,
              notesId: contextAwareNoteId ? contextAwareNoteId : values.notesId,
              context: props.context
                ? {
                    fromNodeTitle: props.context.title,
                    fromNodeType: props.context.type,
                  }
                : null,
            })
          )
        )
        if (!values.createAnotherCheckedInDrawer) {
          const toastText =
            values.ownerIds.length > 1
              ? t(`{{todo}} created for {{count}} members`, {
                  todo: terms.todo.singular,
                  count: values.ownerIds.length,
                })
              : t(`{{todo}} created`, {
                  todo: terms.todo.singular,
                })

          openOverlazy('Toast', {
            type: 'success',
            text: toastText,
            undoClicked: () => {
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              )
            },
          })
        }

        if (values.createAnotherCheckedInDrawer) {
          setTimeout(() => {
            openOverlazy('CreateTodoDrawer', {
              meetingId: props.meetingId,
            })
          }, 0)
        }
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error creating {{todo}}`, {
            todo: terms.todo.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
        throw error
      }
    }

    const onCreateNotes: ICreateTodoDrawerActions['createNotes'] = useCallback(
      async (opts) => {
        return createNote(opts)
      },
      [createNote]
    )

    const onHandleChangeDrawerViewSetting: ICreateTodoDrawerActions['onHandleChangeDrawerViewSetting'] =
      useCallback(
        async (drawerView) => {
          await editAuthenticatedUserSettings({ drawerView })
        },
        [editAuthenticatedUserSettings]
      )

    const onHandleCloseDrawerWithUnsavedChangesProtection: ICreateTodoDrawerActions['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useCallback(
        ({ onHandleLeaveWithoutSaving }) => {
          openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
        },
        [openOverlazy]
      )

    const currentUser = subscription().data.currentUser
    const CreateTodoDrawerView = props.children
    return (
      <CreateTodoDrawerView
        data={{
          currentUser: currentUser
            ? {
                id: currentUser.id,
                timezone: guessTimezone(), //@TODO subscription().data.currentUser.timezone
              }
            : null,
          currentUserPermissions,
          meetingAttendeesOrOrgUsersLookup,
          meetingLookup: getUsersMeetingsLookup({
            meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
            includePersonalMeeting: true,
          }),
          meetingId: selectedMeetingId,
          context: props.context,
          contextAwareNoteId: contextAwareNoteId ? contextAwareNoteId : null,
          isLoading: subscription().querying,
          drawerIsRenderedInMeeting,
          drawerView,
        }}
        actions={{
          createTodo: onCreateTodo,
          createNotes: onCreateNotes,
          onHandleChangeDrawerViewSetting,
          onHandleCloseDrawerWithUnsavedChangesProtection,
          setSelectedMeetingId,
        }}
      />
    )
  }
)
