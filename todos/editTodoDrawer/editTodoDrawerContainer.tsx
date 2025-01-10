import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { guessTimezone, useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useMMErrorLogger } from '@mm/core/logging'

import {
  PERSONAL_MEETING_VALUE,
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomTodoMutations,
  useBloomTodoNode,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getEditTodoDrawerPermissions } from './editTodoDrawerPermissions'
import {
  IEditTodoDrawerActions,
  IEditTodoDrawerContainerProps,
} from './editTodoDrawerTypes'

export const EditTodoDrawerContainer = observer(
  function EditTodoDrawerContainer(props: IEditTodoDrawerContainerProps) {
    const componentState = useObservable({
      todoNotesText: null as Maybe<string>,
    })

    const setTodoNotesText = useAction((text: Maybe<string>) => {
      componentState.todoNotesText = text
    })

    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()
    const { createNote } = useBloomNoteMutations()
    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { editTodo } = useBloomTodoMutations()
    const drawerController = useDrawerController()
    const { getNoteById } = useBloomNoteQueries()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { logError } = useMMErrorLogger()
    const { openOverlazy, closeOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

    const sharedPanelSubscription = useSubscription(
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
              target: { id: props.meetingId },
              useSubOpts: {
                doNotSuspend: true,
              },
            })
          : null,
      },
      { subscriptionId: `EditTodoDrawerContainer-sharedSubscription` }
    )

    const todoSubscription = useSubscription(
      {
        todo: queryDefinition({
          def: useBloomTodoNode(),
          map: ({
            title,
            dateCreated,
            dueDate,
            completed,
            notesId,
            context,
            assignee,
            meeting,
          }) => ({
            title,
            dateCreated,
            dueDate,
            completed,
            notesId,
            context,
            assignee: assignee({
              map: ({ firstName, lastName, fullName, avatar }) => ({
                firstName,
                lastName,
                fullName,
                avatar,
              }),
            }),
            meeting: meeting({ map: ({ name, id }) => ({ name, id }) }),
          }),
          target: { id: props.todoId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `EditTodoDrawerContainer-todoSubscription-${props.todoId}`,
      }
    )

    const currentUserPermissions = useComputed(
      () => {
        const isPersonalTodo = todoSubscription().data.todo?.meeting == null
        const isOwnTodo =
          todoSubscription().data.todo?.assignee.id ===
          sharedPanelSubscription().data.currentUser?.id

        return getEditTodoDrawerPermissions({
          isCurrentUserPersonalTodo: isPersonalTodo && isOwnTodo,
          currentUserPermissions:
            sharedPanelSubscription().data.meeting?.currentMeetingAttendee
              .permissions ?? null,
        })
      },
      { name: 'EditTodoDrawerContainer-currentUserPermissions' }
    )

    const meetingAttendeesAndOrgUsersLookup = useComputed(
      () => {
        const meeting = sharedPanelSubscription().data?.meeting
        return getMeetingAttendeesAndOrgUsersLookup({
          orgUsers: sharedPanelSubscription().data?.users || null,
          meetings: meeting ? [meeting] : null,
        })
      },
      { name: 'EditTodoDrawerContainer-meetingAttendeesAndOrgUsersLookup' }
    )

    const onEditTodo: IEditTodoDrawerActions['editTodo'] = useAction(
      async (values) => {
        try {
          const todoId = todoSubscription().data.todo?.id
          if (!todoId) {
            throw new Error('No todo id found')
          }
          await editTodo({
            todoId,
            meetingId: values.meetingId,
            ownerId: values.ownerId,
            title: values.title,
            completed: values.completed,
            dueDate: values.dueDate,
            notesId: values.notesId,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing {{todo}}`, {
              todo: terms.todo.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    )

    const onCreateNotes: IEditTodoDrawerActions['createNotes'] = useAction(
      async (opts) => {
        try {
          const response = await createNote(opts)
          const todoId = todoSubscription().data.todo?.id
          if (!todoId) {
            throw new Error('No todo id found')
          }
          await editTodo({
            todoId,
            notesId: response,
          })
          return response
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue creating notes for this {{todo}}`, {
              todo: terms.todo.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    )

    const onArchiveTodo: IEditTodoDrawerActions['archiveTodo'] = useAction(
      async () => {
        try {
          const todoId = todoSubscription().data.todo?.id
          if (!todoId) {
            throw new Error('No todo id found')
          }
          await editTodo({
            todoId,
            archivedTimestamp: getSecondsSinceEpochUTC(),
          })
          openOverlazy('Toast', {
            type: 'success',
            text: t(`{{todo}} archived`, {
              todo: terms.todo.singular,
            }),
            undoClicked: () =>
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              ),
          })
          closeOverlazy({ type: 'Drawer' })
        } catch (error) {
          closeOverlazy({ type: 'Drawer' })
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing {{todo}}`, {
              todo: terms.todo.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      }
    )

    const onHandleChangeDrawerViewSetting: IEditTodoDrawerActions['onHandleChangeDrawerViewSetting'] =
      useAction(async (drawerView) => {
        await editAuthenticatedUserSettings({ drawerView })
      })

    const onHandleCloseDrawerWithUnsavedChangesProtection: IEditTodoDrawerActions['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useAction(({ onHandleLeaveWithoutSaving }) => {
        openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
      })

    const onGetNoteById = useAction(async () => {
      const notesId = todoSubscription().data.todo?.notesId
      const canEditTodosInMeeting =
        currentUserPermissions().canEditTodosInMeeting

      if (notesId && !canEditTodosInMeeting.allowed) {
        try {
          const response = await getNoteById({
            noteId: notesId,
          })
          setTodoNotesText(response.text)
        } catch (e) {
          const todoId = todoSubscription().data.todo?.id
          logError(e, {
            context: `Error fetching note data for todo ${todoId} with notesId ${notesId}`,
          })
        }
      }
    })

    const isQueryingTodoData = todoSubscription().querying
    useEffect(() => {
      if (!isQueryingTodoData) {
        onGetNoteById()
      }
    }, [isQueryingTodoData, onGetNoteById])

    const getData = useComputed(
      () => {
        const currentUser = sharedPanelSubscription().data.currentUser

        return {
          isLoading: todoSubscription().querying,
          currentUserPermissions,
          todo: {
            assigneeFullName:
              todoSubscription().data.todo?.assignee.fullName ?? '',
            title: todoSubscription().data.todo?.title ?? '',
            dateCreated: todoSubscription().data.todo?.dateCreated ?? 0,
            dueDate: todoSubscription().data.todo?.dueDate ?? 0,
            completed: todoSubscription().data.todo?.completed ?? false,
            assigneeId: todoSubscription().data.todo?.assignee.id ?? '',
            meetingId:
              todoSubscription().data.todo?.meeting?.id ??
              PERSONAL_MEETING_VALUE,
            notesId: todoSubscription().data.todo?.notesId ?? '',
            context: todoSubscription().data.todo?.context ?? null,
          },
          currentUser: currentUser
            ? {
                id: currentUser.id,
                timezone: guessTimezone(), //@TODO currentUser.timezone
              }
            : null,
          meetingId: todoSubscription().data.todo?.meeting?.id ?? null,
          meetingAttendeesAndOrgUsersLookup,
          meetingLookup: getUsersMeetingsLookup({
            meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
            includePersonalMeeting: true,
          }),
          todoNotesText: componentState.todoNotesText,
          drawerIsRenderedInMeeting: drawerController.drawerIsRenderedInMeeting,
          drawerView: drawerController.drawerView,
          hideContextAwareButtons: props.hideContextAwareButtons ?? false,
        }
      },
      { name: 'EditTodoDrawerContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        return {
          editTodo: onEditTodo,
          createNotes: onCreateNotes,
          archiveTodo: onArchiveTodo,
          onHandleChangeDrawerViewSetting,
          onHandleCloseDrawerWithUnsavedChangesProtection,
        }
      },
      {
        name: 'EditTodoDrawerContainer-getActions',
      }
    )

    const EditTodoDrawerView = props.children
    return <EditTodoDrawerView data={getData} actions={getActions} />
  }
)
