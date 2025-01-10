import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import {
  queryDefinition,
  useAction,
  useComputed,
  useSubscription,
} from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useBloomCustomTerms,
  useBloomTodoMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useObservable } from '@mm/bloom-web/pages/performance/mobx'

import {
  QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_COLLAPSED_HEIGHT,
  QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_HEIGHT,
  QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_TODOS_LIST_HEIGHT,
} from '../constants'
import { QUARTERLY_ALIGNMENT_RECORD_OF_TODOS_COUNT_TO_TILE_HEIGHT } from '../lookups'
import { getQuaterlyAlignmentWorkspaceTodoPermissions } from './quarterlyAlignmentWorkspaceTodoPermissions'
import {
  IQuarterlyAlignmentWorkspaceTodoItem,
  IQuarterlyAlignmentWorkspaceTodosActions,
  IQuarterlyAlignmentWorkspaceTodosContainerProps,
  IQuarterlyAlignmentWorkspaceTodosData,
} from './quarterlyAlignmentWorkspaceTodosTypes'

export const QuarterlyAlignmentWorkspaceTodosContainer = observer(
  (props: IQuarterlyAlignmentWorkspaceTodosContainerProps) => {
    const bloomUserNode = useBloomUserNode()
    const terms = useBloomCustomTerms()
    const { editTodo } = useBloomTodoMutations()
    const { openOverlazy } = useOverlazyController()
    const { t } = useTranslation()

    const pageState = useObservable<{
      isTileExpanded: boolean
      isTodosListExpanded: boolean
    }>({
      isTileExpanded: false,
      isTodosListExpanded: false,
    })

    const subscription = useSubscription(
      {
        currentUser: props.alignmentUser?.id
          ? queryDefinition({
              def: bloomUserNode,
              useSubOpts: { doNotSuspend: true },
              target: { id: props.alignmentUser.id },
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
                  filter: {
                    and: [
                      {
                        archived: false,
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
            })
          : null,
      },
      {
        subscriptionId: `QuarterlyAlignmentWorkspaceTodosContainer`,
      }
    )

    const getCompletedTodosPercentage = useComputed(
      () => {
        const allTodosWithoutPersonalTodos =
          subscription().data.currentUser?.todos.nodes.filter((todo) => {
            return !!todo.meeting
          }) || []

        const completedTodos = allTodosWithoutPersonalTodos.filter((todo) => {
          return todo.completed
        })

        return Math.round(
          (completedTodos.length / allTodosWithoutPersonalTodos.length) * 100
        )
      },
      {
        name: 'QuarterlyAlignmentWorkspaceTodosContainer-getCompletedTodosPercentage',
      }
    )

    const getUserTodosInAllMeetings = useComputed(
      () => {
        const currentUser = subscription().data.currentUser

        if (!currentUser) {
          return null
        }

        return currentUser.todos.nodes.reduce((acc, todoDatum) => {
          // note: excluding personal todos here
          if (todoDatum.meeting === null) {
            return acc
          }

          const todoData: IQuarterlyAlignmentWorkspaceTodoItem = {
            ...todoDatum,
            meeting: todoDatum.meeting,
            assignee: {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              fullName: currentUser.fullName,
              avatar: currentUser.avatar,
              userAvatarColor: currentUser.userAvatarColor,
            },
            permissions: getQuaterlyAlignmentWorkspaceTodoPermissions(
              todoDatum.meeting.currentMeetingAttendee.permissions
            ),
          }

          acc.push(todoData)
          return acc
        }, [] as Array<IQuarterlyAlignmentWorkspaceTodoItem>)
      },
      {
        name: 'QuarterlyAlignmentWorkspaceTodoContainer-userTodosInAllMeetings',
      }
    )

    const getExpandedTodosListHeightBasedOnTodosCount = useComputed(
      () => {
        const todosCount = (getUserTodosInAllMeetings() || []).length

        if (todosCount >= 9) {
          return QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_TODOS_LIST_HEIGHT
        }

        return QUARTERLY_ALIGNMENT_RECORD_OF_TODOS_COUNT_TO_TILE_HEIGHT[
          todosCount
        ]
      },
      {
        name: 'QuarterlyAlignmentWorkspaceTodosContainer-getExpandedTodosListHeightBasedOnTodosCount',
      }
    )

    const onHandleToggleIsTileExpanded: IQuarterlyAlignmentWorkspaceTodosActions['onHandleToggleIsTileExpanded'] =
      useAction(() => {
        // Note - if we have the todos list expanded, we should close it when we collapse the tile
        if (pageState.isTileExpanded) {
          pageState.isTodosListExpanded = false
        }

        pageState.isTileExpanded = !pageState.isTileExpanded
        const height = pageState.isTileExpanded
          ? QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_HEIGHT
          : QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_COLLAPSED_HEIGHT
        props.onHandleUpdateTileHeight({ height, tileId: props.tileId })
      })

    const onHandleSetTodosListExpanded = useAction(() => {
      const height = !pageState.isTodosListExpanded
        ? getExpandedTodosListHeightBasedOnTodosCount()
        : QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_HEIGHT
      props.onHandleUpdateTileHeight({ height, tileId: props.tileId })

      // Note: when expanding the tile, we have to make sure gridstack updates prior to the tile expanding or it jiggles on expansion.
      if (pageState.isTodosListExpanded) {
        pageState.isTodosListExpanded = !pageState.isTodosListExpanded
      } else {
        return setTimeout(() => {
          return runInAction(() => {
            pageState.isTodosListExpanded = !pageState.isTodosListExpanded
          })
        }, 300)
      }
    })

    const onHandleUpdateTodo: IQuarterlyAlignmentWorkspaceTodosActions['onHandleUpdateTodo'] =
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

    const onHandleEditTodoRequest: IQuarterlyAlignmentWorkspaceTodosActions['onHandleEditTodoRequest'] =
      useAction((opts) => {
        openOverlazy('EditTodoDrawer', {
          todoId: opts.todoId,
          meetingId: opts.meetingId,
          hideContextAwareButtons: true,
        })
      })

    const onHandleCreateContextAwareIssueFromTodo: IQuarterlyAlignmentWorkspaceTodosActions['onHandleCreateContextAwareIssueFromTodo'] =
      useAction((opts) => {
        openOverlazy('CreateIssueDrawer', {
          meetingId: opts.meetingId,
          context: opts.todo,
          initialItemValues: {
            title: opts.todo.title,
          },
        })
      })

    const getData = useComputed(
      () => {
        const data: IQuarterlyAlignmentWorkspaceTodosData = {
          currentUser: subscription().data.currentUser,
          isLoading: subscription().querying,
          getCompletedTodosPercentage,
          getUserTodosInAllMeetings,
          pageState,
          tileId: props.tileId,
        }
        return data
      },
      {
        name: `QuarterlyAlignmentWorkspaceTodosContainer-getData`,
      }
    )

    const getActions = useComputed(
      () => {
        const actions: IQuarterlyAlignmentWorkspaceTodosActions = {
          onHandleCreateContextAwareIssueFromTodo,
          onHandleEditTodoRequest,
          onHandleSetTodosListExpanded,
          onHandleToggleIsTileExpanded,
          onHandleUpdateTodo,
        }
        return actions
      },
      {
        name: `QuarterlyAlignmentWorkspaceTodosContainer-getActions`,
      }
    )

    return <props.children data={getData} actions={getActions} />
  }
)
