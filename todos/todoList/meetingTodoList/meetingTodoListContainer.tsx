import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import {
  addOrRemoveDays,
  getStartOfDaySecondsSinceEpochUTC,
} from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomTodoMutations,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'
import { useHeaderListMoreOptions } from '@mm/bloom-web/shared'

import { TODO_LIST_SORT_BY_VALUE } from '../todoListConstants'
import { getTodoListPermissions } from '../todoListPermissions'
import { TTodoListSortType } from '../todoListTypes'
import { ITodoListSharedActions } from '../todoListTypes'
import {
  IMeetingTodoListContainerProps,
  IMeetingTodoListViewActions,
} from './meetingTodoListTypes'

export const MeetingTodoListContainer = observer(
  function MeetingTodoListContainer(props: IMeetingTodoListContainerProps) {
    const { meetingId } = props

    const pageState = useObservable<{
      sortBy: TTodoListSortType
      isViewingArchivedTodos: boolean
    }>({
      sortBy: 'ASSIGNEE_ASC',
      isViewingArchivedTodos: false,
    })

    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()
    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { createNote } = useBloomNoteMutations()
    const { createTodo, editTodo } = useBloomTodoMutations()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { t } = useTranslation()
    const { openOverlazy, closeOverlazy } = useOverlazyController()

    const { checkIfEmbeddedDrawerIsAvailable } = useDrawerController()
    const diResolver = useDIResolver()

    const sortParams = pageState.sortBy
      ? TODO_LIST_SORT_BY_VALUE[pageState.sortBy]
      : {}

    const IsExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const breadcrumbs = useComputed(
      () =>
        pageState.isViewingArchivedTodos
          ? [props.getPageToDisplayData()?.pageName || '', t('Archived')]
          : [props.getPageToDisplayData()?.pageName || ''],
      {
        name: `MeetingTodoListContainer-breadcrumbs`,
      }
    )

    const activeTodosSubscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({
            id,
            firstName,
            lastName,
            fullName,
            avatar,
            userAvatarColor,
          }) => ({
            id,
            firstName,
            lastName,
            fullName,
            avatar,
            userAvatarColor,
          }),
        }),
        meeting: queryDefinition({
          def: meetingNode,
          map: ({
            name,
            meetingType,
            currentMeetingAttendee,
            currentMeetingInstance,
            attendeesLookup,
            todosActives,
          }) => ({
            name,
            meetingType,
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
            currentMeetingInstance: currentMeetingInstance({
              map: ({ meetingStartTime }) => ({ meetingStartTime }),
            }),
            attendees: attendeesLookup({
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
            activeTodos: todosActives({
              filter: {
                and: [
                  {
                    archived: false,
                  },
                ],
              },
              sort: {
                ...sortParams,
              },
              map: ({
                archived,
                title,
                completed,
                dateCreated,
                dueDate,
                notesId,
                assignee,
              }) => ({
                archived,
                title,
                completed,
                dateCreated,
                dueDate,
                notesId,
                assignee: assignee({
                  map: ({
                    firstName,
                    lastName,
                    avatar,
                    userAvatarColor,
                    fullName,
                  }) => ({
                    firstName,
                    lastName,
                    avatar,
                    userAvatarColor,
                    fullName,
                  }),
                }),
              }),
            }),
          }),
          target: { id: meetingId },
        }),
      },
      {
        subscriptionId: `TodoListContainer-${meetingId}`,
      }
    )

    const archivedTodosSubscription = useSubscription(
      {
        meeting: queryDefinition({
          def: meetingNode,
          map: ({
            meetingType,
            currentMeetingAttendee,
            currentMeetingInstance,
            attendeesLookup,
            todos,
          }) => ({
            meetingType,
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
            currentMeetingInstance: currentMeetingInstance({
              map: ({ meetingStartTime }) => ({ meetingStartTime }),
            }),
            attendees: attendeesLookup({
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
            archivedTodos: todos({
              filter: {
                and: [
                  {
                    archived: true,
                  },
                ],
              },
              sort: {
                ...sortParams,
                archivedTimestamp: 'desc',
              },
              map: ({
                title,
                completed,
                dateCreated,
                dueDate,
                archived,
                notesId,
                assignee,
                archivedTimestamp,
              }) => ({
                title,
                completed,
                dateCreated,
                dueDate,
                archived,
                notesId,
                archivedTimestamp,
                assignee: assignee({
                  map: ({
                    firstName,
                    lastName,
                    avatar,
                    userAvatarColor,
                    fullName,
                  }) => ({
                    firstName,
                    lastName,
                    avatar,
                    userAvatarColor,
                    fullName,
                  }),
                }),
              }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
          target: { id: meetingId },
        }),
      },
      {
        subscriptionId: `MeetingTodoListContainer-${meetingId}-archivedTodos`,
      }
    )

    const listHeaderMoreOptions = useHeaderListMoreOptions({
      id: meetingId || '',
      meetingType: activeTodosSubscription().data.meeting?.meetingType || '',
    })

    const currentUserPermissions = useComputed(
      () => {
        return getTodoListPermissions(
          activeTodosSubscription().data.meeting?.currentMeetingAttendee
            .permissions ?? null
        )
      },
      {
        name: `MeetingTodoListContainer-currentUserPermissions`,
      }
    )

    const quickAddMeetingAttendeesLookup = useComputed(
      () => {
        return (
          activeTodosSubscription().data.meeting?.attendees.nodes || []
        ).map((attendee) => {
          return {
            value: attendee.id,
            metadata: {
              firstName: attendee.firstName,
              lastName: attendee.lastName,
              fullName: attendee.fullName,
              avatar: attendee.avatar,
              userAvatarColor: attendee.userAvatarColor,
            },
          }
        })
      },
      {
        name: `MeetingTodoListContainer-quickAddMeetingAttendeesLookup`,
      }
    )

    const sortedActiveTodos = useComputed(
      () => {
        return pageState.sortBy === 'OVERDUE'
          ? (activeTodosSubscription().data.meeting.activeTodos.nodes || [])
              .slice()
              .sort((a, b) => {
                return Number(b.isOverdue) - Number(a.isOverdue)
              })
          : activeTodosSubscription().data.meeting.activeTodos.nodes || []
      },
      {
        name: `MeetingTodoListContainer-sortedActiveTodos`,
      }
    )

    const sortedArchivedTodos = useComputed(
      () => {
        const archivedTodos =
          archivedTodosSubscription().data.meeting?.archivedTodos.nodes || []
        return pageState.sortBy === 'OVERDUE'
          ? archivedTodos.slice().sort((a, b) => {
              return Number(b.isOverdue) - Number(a.isOverdue)
            })
          : archivedTodos
      },
      {
        name: `MeetingTodoListContainer-sortedArchivedTodos`,
      }
    )

    const onViewArchivedTodos: IMeetingTodoListViewActions['onViewArchivedTodos'] =
      useAction((isViewArchivedTodos) => {
        pageState.isViewingArchivedTodos = isViewArchivedTodos
      })

    const onExportTodos: IMeetingTodoListViewActions['export'] = useAction(
      () => {
        listHeaderMoreOptions.onExport()
      }
    )

    const onUploadTodos: IMeetingTodoListViewActions['upload'] = useAction(
      () => {
        listHeaderMoreOptions.onUpload('todos')
      }
    )

    const onPrintTodos: IMeetingTodoListViewActions['print'] = useAction(() => {
      listHeaderMoreOptions.onPrint('todos')
    })

    const onCreateContextAwareIssueFromTodo: IMeetingTodoListViewActions['onCreateContextAwareIssueFromTodo'] =
      useAction((opts) => {
        openOverlazy('CreateIssueDrawer', {
          meetingId,
          context: opts,
          initialItemValues: {
            title: opts.title,
          },
        })
      })

    const onUpdateTodo: ITodoListSharedActions['onUpdateTodo'] = useAction(
      async (values) => {
        try {
          if (values.id) {
            await editTodo({
              todoId: values.id,
              completed: values.completed,
              dueDate: values.dueDate,
            })
          }
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Failed to update {{todo}}', {
              todo: terms.todo.lowercaseSingular,
            }),
            error: new UserActionError(e),
          })
        }
      }
    )

    const onQuickAddTodoEnter: IMeetingTodoListViewActions['onQuickAddTodoEnter'] =
      useAction(async (todo) => {
        try {
          const notesId = await createNote({
            notes: '',
          })

          await createTodo({
            meetingRecurrenceId: meetingId,
            assigneeId: todo.assigneeId,
            title: todo.title,
            dueDate: addOrRemoveDays({
              secondsSinceEpochUTC:
                getStartOfDaySecondsSinceEpochUTC(diResolver),
              days: 7,
            }),
            notesId,
            context: null,
          })
          runInAction(() => {
            pageState.sortBy = 'ASSIGNEE_ASC'
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Failed to create {{todo}}', {
              todo: terms.todo.lowercaseSingular,
            }),
            error: new UserActionError(e),
          })
        }
      })

    const onEditTodoRequest: IMeetingTodoListViewActions['onEditTodoRequest'] =
      useAction((todoId: Id) => {
        openOverlazy('EditTodoDrawer', {
          todoId,
          meetingId,
        })
      })

    const onDeleteTile: IMeetingTodoListViewActions['onDeleteTile'] = useAction(
      async () => {
        if (props.workspaceTileId) {
          try {
            await editWorkspaceTile({
              id: props.workspaceTileId,
              meetingId: null,
              archived: true,
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`There was an issue deleting the tile`),
              error: new UserActionError(error),
            })
            throw error
          }
        }
      }
    )

    useEffect(() => {
      if (checkIfEmbeddedDrawerIsAvailable()) {
        const todoId = sortedActiveTodos().length
          ? sortedActiveTodos()[0].id
          : null

        if (!todoId) {
          return closeOverlazy({ type: 'Drawer' })
        }

        openOverlazy('EditTodoDrawer', {
          meetingId,
          todoId,
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const currentUser = useComputed(
      () => ({
        ...activeTodosSubscription().data.currentUser,
        permissions: currentUserPermissions,
      }),
      {
        name: `MeetingTodoListContainer-currentUser`,
      }
    )

    const setSortBy = useAction((sortBy: TTodoListSortType) => {
      pageState.sortBy = sortBy
    })

    const getData = useComputed(
      () => ({
        meetingId: props.meetingId,
        meetingName: activeTodosSubscription().data.meeting.name,
        isLoadingActiveTodos: activeTodosSubscription().querying,
        isLoadingArchivedTodos: archivedTodosSubscription().querying,
        activeTodos: sortedActiveTodos,
        archivedTodos: sortedArchivedTodos,
        currentUser: currentUser,
        quickAddMeetingAttendeesLookup,
        meetingStartTime:
          activeTodosSubscription().data.meeting.currentMeetingInstance
            ?.meetingStartTime ?? null,
        sortBy: pageState.sortBy,
        isViewingArchivedTodos: pageState.isViewingArchivedTodos,
        breadcrumbs,
        pageType: props.pageType || 'MEETING',
        workspaceType: props.workspaceType || 'PERSONAL',
        isCurrentMeetingInstance:
          activeTodosSubscription().data.meeting.currentMeetingInstance !==
          null,
        IsExpandedOnWorkspacePage,
        workspaceTileId: props.workspaceTileId,
      }),
      {
        name: `MeetingTodoListContainer-getData`,
      }
    )

    const actions = useComputed(
      () => ({
        sort: setSortBy,
        onViewArchivedTodos,
        export: onExportTodos,
        upload: onUploadTodos,
        print: onPrintTodos,
        onCreateContextAwareIssueFromTodo,
        onUpdateTodo,
        onQuickAddTodoEnter,
        onEditTodoRequest,
        onDeleteTile,
      }),
      {
        name: `MeetingTodoListContainer-actions`,
      }
    )

    const TodoListView = (
      <props.children
        className={props.className}
        data={getData}
        actions={actions}
      />
    )

    if (IsExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {TodoListView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return TodoListView
    }
  }
)
