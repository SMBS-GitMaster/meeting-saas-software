import { observer } from 'mobx-react'
import React from 'react'

import { Id, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomTodoMutations,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useTheme } from '@mm/core-web/ui'

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
import { useMeetingColorController } from '@mm/bloom-web/shared'

import { TODO_LIST_SORT_BY_VALUE } from '../todoListConstants'
import { getTodoListPermissions } from '../todoListPermissions'
import { TTodoListSortType } from '../todoListTypes'
import {
  IPersonalTodoListContainerProps,
  IPersonalTodoListViewActions,
  IUserTodosForMeeting,
} from './personalTodoListTypes'

export const PersonalTodoListContainer = observer(
  function PersonalTodoListContainer(props: IPersonalTodoListContainerProps) {
    const pageState = useObservable<{
      selectedGroupSortBy: TTodoListSortType
      selectedContentSortBy: TTodoListSortType
    }>({
      selectedGroupSortBy: 'MEETING_ASC',
      selectedContentSortBy: 'TITLE',
    })

    const meetingColorController = useMeetingColorController()
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { editTodo } = useBloomTodoMutations()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const IsExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const contentSortParams = {
      ...TODO_LIST_SORT_BY_VALUE[pageState.selectedContentSortBy],
    }

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({
            id,
            firstName,
            lastName,
            fullName,
            avatar,
            userAvatarColor,
            todos,
          }) => ({
            id,
            firstName,
            lastName,
            fullName,
            avatar,
            userAvatarColor,
            todos: todos({
              sort: contentSortParams,
              filter: {
                and: [
                  {
                    archived: false,
                  },
                  {
                    completed: false,
                  },
                ],
              },
              map: ({
                id,
                title,
                completed,
                dateCreated,
                dueDate,
                archived,
                archivedTimestamp,
                notesId,
                meeting,
              }) => ({
                id,
                title,
                completed,
                dateCreated,
                dueDate,
                archived,
                archivedTimestamp,
                notesId,
                meeting: meeting({
                  map: ({ id, name, currentMeetingAttendee }) => ({
                    id,
                    name,
                    currentMeetingAttendee: currentMeetingAttendee({
                      map: ({ permissions }) => ({
                        permissions: permissions({
                          map: ({ view, edit, admin }) => ({
                            view,
                            edit,
                            admin,
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      },
      {
        subscriptionId: `PersonalTodoListContainer`,
      }
    )

    const userTodosInAllMeetings = useComputed(
      () => {
        const currentUser = subscription().data.currentUser
        const todosByMeetingIdMap: Record<Id, IUserTodosForMeeting> = {}
        const colorsByMeetingId = meetingColorController.meetingColorByMeetingId

        currentUser.todos.nodes.forEach((todoDatum) => {
          const todoData = {
            id: todoDatum.id,
            title: todoDatum.title,
            completed: todoDatum.completed,
            dateCreated: todoDatum.dateCreated,
            dueDate: todoDatum.dueDate,
            archived: todoDatum.archived,
            isOverdue: todoDatum.isOverdue,
            notesId: todoDatum.notesId,
            isNew: todoDatum.isNew,
            assignee: {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              fullName: currentUser.fullName,
              avatar: currentUser.avatar,
              userAvatarColor: currentUser.userAvatarColor,
            },
          }

          if (todoDatum.meeting === null) {
            if (!todosByMeetingIdMap['PERSONAL']) {
              todosByMeetingIdMap['PERSONAL'] = {
                id: 'PERSONAL',
                meetingId: 'PERSONAL',
                meetingName: 'PERSONAL',
                meetingColor:
                  theme.colors.workspacePersonalTilePersonalItemsColor,
                permissions: {
                  canCreateIssuesInMeeting: { allowed: true },
                  canCreateTodosInMeeting: { allowed: true },
                  canEditTodosInMeeting: { allowed: true },
                },
                todos: [todoData],
              }
            } else {
              todosByMeetingIdMap['PERSONAL'].todos.push(todoData)
            }
          } else {
            if (todosByMeetingIdMap[todoDatum.meeting.id]) {
              todosByMeetingIdMap[todoDatum.meeting.id].todos.push(todoData)
            } else {
              const permissionsForMeeting = getTodoListPermissions(
                todoDatum.meeting.currentMeetingAttendee.permissions
              )

              todosByMeetingIdMap[todoDatum.meeting.id] = {
                id: todoDatum.meeting.id,
                meetingId: todoDatum.meeting.id,
                meetingName: todoDatum.meeting.name,
                meetingColor: colorsByMeetingId[todoDatum.meeting.id],
                permissions: permissionsForMeeting,
                todos: [todoData],
              }
            }
          }
        })

        const sortedByMeetingName = Object.values(todosByMeetingIdMap).sort(
          (a, b) => {
            if (pageState.selectedGroupSortBy === 'MEETING_ASC') {
              if (
                a.meetingName === 'PERSONAL' &&
                b.meetingName !== 'PERSONAL'
              ) {
                return -1
              } else if (
                a.meetingName === 'PERSONAL' &&
                b.meetingName === 'PERSONAL'
              ) {
                return 0
              } else {
                return a.meetingName.localeCompare(b.meetingName)
              }
            } else {
              if (
                a.meetingName === 'PERSONAL' &&
                b.meetingName !== 'PERSONAL'
              ) {
                return 1
              } else if (
                a.meetingName === 'PERSONAL' &&
                b.meetingName === 'PERSONAL'
              ) {
                return 0
              } else {
                return b.meetingName.localeCompare(a.meetingName)
              }
            }
          }
        )

        if (pageState.selectedContentSortBy === 'OVERDUE') {
          return sortedByMeetingName.map((todosByMeeting) => {
            return {
              ...todosByMeeting,
              todos: todosByMeeting.todos.sort(
                (a, b) => Number(b.isOverdue) - Number(a.isOverdue)
              ),
            }
          })
        } else {
          return sortedByMeetingName
        }
      },
      { name: 'PersonalTodoListContainer-userTodosInAllMeetings' }
    )

    const onUpdateTodo: IPersonalTodoListViewActions['onUpdateTodo'] =
      useAction(async (values) => {
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
      })

    const onEditTodoRequest: IPersonalTodoListViewActions['onEditTodoRequest'] =
      useAction((opts) => {
        openOverlazy('EditTodoDrawer', {
          todoId: opts.todoId,
          meetingId: opts.meetingId,
          hideContextAwareButtons: true,
        })
      })

    const onCreateContextAwareIssueFromTodo: IPersonalTodoListViewActions['onCreateContextAwareIssueFromTodo'] =
      useAction((opts) => {
        openOverlazy('CreateIssueDrawer', {
          meetingId: opts.meetingId,
          context: opts.todo,
          initialItemValues: {
            title: opts.todo.title,
          },
        })
      })

    const onDeleteTile: IPersonalTodoListViewActions['onDeleteTile'] =
      useAction(async () => {
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
      })

    const setGroupSortBy = useAction((sortBy: TTodoListSortType) => {
      pageState.selectedGroupSortBy = sortBy
    })

    const setContentSortBy = useAction((sortBy: TTodoListSortType) => {
      pageState.selectedContentSortBy = sortBy
    })

    const getData = useComputed(
      () => ({
        isLoading: subscription().querying,
        selectedGroupSortBy: pageState.selectedGroupSortBy,
        selectedContentSortBy: pageState.selectedContentSortBy,
        userTodosInAllMeetings,
        workspaceTileId: props.workspaceTileId,
        IsExpandedOnWorkspacePage,
      }),
      {
        name: `PersonalTodoListContainer-getData`,
      }
    )

    const getActions = useComputed(
      () => ({
        onUpdateTodo,
        onEditTodoRequest,
        onCreateContextAwareIssueFromTodo,
        onDeleteTile,
        setGroupSortBy,
        setContentSortBy,
      }),
      {
        name: `TodoListContainer-getActions`,
      }
    )

    const UserTodoListView = (
      <props.children
        className={props.className}
        data={getData}
        actions={getActions}
      />
    )

    if (IsExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {UserTodoListView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return UserTodoListView
    }
  }
)
