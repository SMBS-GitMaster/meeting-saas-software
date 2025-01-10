import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { ValidSortForNode, queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useWindow } from '@mm/core/ssr'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { BloomGoalNode } from '@mm/core-bloom/goals/goalNode'
import { useBloomGoalMutations } from '@mm/core-bloom/goals/mutations'

import { useBrowserEnvironment } from '@mm/core-web/envs'
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

import { getGoalListPermissions } from '../goalsListPermissions'
import { getMeetingGoalListFilterByTab } from './meetingGoalsListConstants'
import type {
  IMeetingGoalsListActionHandlers,
  IMeetingGoalsListContainerProps,
  TMeetingGoalsListSortingType,
  TMeetingGoalsListTab,
} from './meetingGoalsListTypes'

export const MeetingGoalsListContainer = observer(
  function MeetingGoalsListContainer(props: IMeetingGoalsListContainerProps) {
    const pageState = useObservable({
      sortBy: 'ASSIGNEE_ASC' as TMeetingGoalsListSortingType,
      shouldCreateTodosForMilestone: false,
      selectedTab: 'this_meeting' as TMeetingGoalsListTab,
      isShowingAllMilestones: false,
    })

    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()
    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { checkIfEmbeddedDrawerIsAvailable } = useDrawerController()
    const { editGoal, editMilestone } = useBloomGoalMutations()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { openOverlazy, closeOverlazy } = useOverlazyController()

    const { t } = useTranslation()
    const { v1Url } = useBrowserEnvironment()
    const { window } = useWindow()

    const pageType = props.pageType || 'MEETING'
    const isExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const goalsSortParams: Record<
      TMeetingGoalsListSortingType,
      ValidSortForNode<BloomGoalNode>
    > = {
      ASSIGNEE_ASC: {
        assignee: {
          fullName: { direction: 'asc', priority: 1 },
        },
      },
      ASSIGNEE_DESC: {
        assignee: {
          fullName: { direction: 'desc', priority: 1 },
        },
      },
      NEWEST: {
        dateCreated: { direction: 'desc', priority: 2 },
        assignee: {
          fullName: { direction: 'asc', priority: 1 },
        },
      },
      OLDEST: {
        dateCreated: { direction: 'asc', priority: 2 },
        assignee: {
          fullName: { direction: 'asc', priority: 1 },
        },
      },
      STATUS: { status: 'desc' },
      BUSINESS_PLAN: {},
    }

    const goalsFilterParams = getMeetingGoalListFilterByTab(props.meetingId)[
      pageState.selectedTab
    ]

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id }) => ({
            id,
          }),
        }),
        meeting: queryDefinition({
          def: meetingNode,
          map: ({ meetingType, name, currentMeetingAttendee, goals }) => ({
            meetingType,
            name,
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
            goals: goals({
              map: ({
                title,
                status,
                archived,
                archivedTimestamp,
                dateCreated,
                notesId,
                dueDate,
                assignee,
                departmentPlanRecords,
                milestones,
              }) => ({
                title,
                status,
                archived,
                dateCreated,
                notesId,
                dueDate,
                archivedTimestamp,
                assignee: assignee({
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
                departmentPlanRecords: departmentPlanRecords({
                  map: ({ meetingId, isInDepartmentPlan }) => ({
                    meetingId,
                    isInDepartmentPlan,
                  }),
                }),
                milestones: milestones({
                  filter: {
                    and: [
                      {
                        dateDeleted: { eq: null },
                      },
                    ],
                  },
                  map: ({ title, dueDate, completed, dateDeleted }) => ({
                    title,
                    dueDate,
                    completed,
                    dateDeleted,
                  }),
                  sort: { dueDate: 'asc' },
                }),
              }),
              pagination: {
                includeTotalCount: true,
              },
              filter: {
                and: [
                  goalsFilterParams,
                  {
                    archived: false,
                  },
                ],
              },
              sort: {
                ...goalsSortParams[pageState.sortBy],
              },
            }),
          }),
          target: { id: props.meetingId },
        }),
      },
      { subscriptionId: `GoalsListContainer-${props.meetingId}` }
    )

    const totalCountSubscription = useSubscription(
      {
        meeting: queryDefinition({
          def: meetingNode,
          map: ({ goals }) => ({
            departmentPlanGoalsForTotalCount: goals({
              pagination: {
                includeTotalCount: true,
              },
              filter: {
                and: [
                  {
                    archived: false,
                  },
                  {
                    _relational: {
                      departmentPlanRecords: {
                        isInDepartmentPlan: { eq: true, condition: 'some' },
                        meetingId: { eq: props.meetingId, condition: 'some' },
                      },
                    },
                  },
                ],
              },
              map: ({ id, archived, departmentPlanRecords }) => ({
                id,
                archived,
                departmentPlanRecords: departmentPlanRecords({
                  map: ({ meetingId, isInDepartmentPlan }) => ({
                    meetingId,
                    isInDepartmentPlan,
                  }),
                }),
              }),
            }),
            allGoalsTotalCount: goals({
              pagination: {
                includeTotalCount: true,
              },
              filter: {
                and: [
                  {
                    archived: false,
                  },
                ],
              },
              map: ({ id, archived }) => ({
                id,
                archived,
              }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
          target: { id: props.meetingId },
        }),
      },
      {
        subscriptionId: `GoalsListContainer-query2-notSuspendedData-${props.meetingId}`,
      }
    )

    const listHeaderMoreOptions = useHeaderListMoreOptions({
      id: props.meetingId,
      meetingType: subscription().data.meeting?.meetingType || '',
    })

    const getCurrentUserPermissions = useComputed(
      () => {
        return getGoalListPermissions(
          subscription().data.meeting?.currentMeetingAttendee.permissions ??
            null
        )
      },
      { name: 'goalsListContainer-getCurrentUserPermissions' }
    )

    const getBreadcrumbs = useComputed(
      () => {
        const items = [props.getPageToDisplayData()?.pageName || '']
        return items
      },
      { name: 'goalListContainer-getBreadcrumbs' }
    )

    // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2922
    const getSortedByBPGoalsIfApplicable = useComputed(
      () => {
        return pageState.sortBy === 'BUSINESS_PLAN'
          ? (subscription().data?.meeting?.goals.nodes || [])
              .slice()
              .sort((goalA, goalB) => {
                const goalAInBP = (
                  goalA.departmentPlanRecords.nodes || []
                ).some(
                  ({ meetingId, isInDepartmentPlan }) =>
                    meetingId === props.meetingId && isInDepartmentPlan
                )
                const goalBInBP = (
                  goalB.departmentPlanRecords.nodes || []
                ).some(
                  ({ meetingId, isInDepartmentPlan }) =>
                    meetingId === props.meetingId && isInDepartmentPlan
                )

                return Number(goalBInBP) - Number(goalAInBP)
              })
          : subscription().data?.meeting?.goals.nodes || []
      },
      { name: 'GoalsListContainer.getSortedByBPGoalsIfApplicable' }
    )

    const setSortBy = useAction((newSortBy: TMeetingGoalsListSortingType) => {
      pageState.sortBy = newSortBy
    })

    const setShouldCreateTodosForMilestone = useAction(
      (shouldCreateTodosForMilestone: boolean) => {
        pageState.shouldCreateTodosForMilestone = shouldCreateTodosForMilestone
      }
    )

    const setSelectedTab = useAction((selectedTab: TMeetingGoalsListTab) => {
      pageState.selectedTab = selectedTab
    })

    const setIsShowingAllMilestones = useAction(
      (isShowingAllMilestones: boolean) => {
        pageState.isShowingAllMilestones = isShowingAllMilestones
      }
    )

    const onUpdateMilestone: IMeetingGoalsListActionHandlers['onUpdateMilestone'] =
      useAction(async (values) => {
        try {
          const milestoneValues = {
            milestoneId: values.id ?? undefined,
            dueDate: values.dueDate ?? undefined,
            completed: values.completed ?? undefined,
          }
          return await editMilestone(milestoneValues)
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error updating {{milestone}}.`, {
              milestone: terms.milestone.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      })

    const onUpdateGoalStatus: IMeetingGoalsListActionHandlers['onUpdateGoalStatus'] =
      useAction(async (props) => {
        try {
          await editGoal({
            goalId: props.id,
            status: props.status,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error updating {{goal}} status`, {
              goal: terms.goal.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      })

    const onExportGoals: IMeetingGoalsListActionHandlers['onExportGoals'] =
      useAction(() => {
        listHeaderMoreOptions.onExport()
      })

    const onUploadGoals: IMeetingGoalsListActionHandlers['onUploadGoals'] =
      useAction(() => {
        listHeaderMoreOptions.onUpload('goals')
      })

    const onPrintGoals: IMeetingGoalsListActionHandlers['onPrintGoals'] =
      useAction(() => {
        listHeaderMoreOptions.onPrint('goals')
      })

    const onRestoreGoal: IMeetingGoalsListActionHandlers['onRestoreGoal'] =
      useAction(async (goalId) => {
        try {
          await editGoal({
            goalId: goalId,
            archived: false,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error restoring {{goal}}`, {
              goal: terms.goal.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      })

    const onViewArchivedGoals: IMeetingGoalsListActionHandlers['onViewArchivedGoals'] =
      useAction((meetingId) => {
        window.open(`${v1Url}L10/Details/${meetingId}#/Rocks`, '_blank')
      })

    const onEditGoalRequest: IMeetingGoalsListActionHandlers['onEditGoalRequest'] =
      useAction(({ goalId, meetingId }) => {
        openOverlazy('EditGoalDrawer', {
          goalId,
          meetingId,
        })
      })

    const onCreateGoal: IMeetingGoalsListActionHandlers['onCreateGoal'] =
      useAction((meetingId) => {
        openOverlazy('CreateGoalDrawer', { meetingId })
      })

    const onCreateTodosForMilestone: IMeetingGoalsListActionHandlers['onCreateTodosForMilestone'] =
      useAction(
        // @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1836
        //  use CreateTodosForMilestones
        async (value) => {
          setShouldCreateTodosForMilestone(value)
          console.log(
            '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-427'
          )
        }
      )

    const onCreateContextAwareIssueFromGoal: IMeetingGoalsListActionHandlers['onCreateContextAwareIssueFromGoal'] =
      useAction(({ context, meetingId }) => {
        openOverlazy('CreateIssueDrawer', {
          meetingId,
          context,
          initialItemValues: {
            title: context.title,
          },
        })
      })

    const onCreateContextAwareTodoFromGoal: IMeetingGoalsListActionHandlers['onCreateContextAwareTodoFromGoal'] =
      useAction(({ context, meetingId }) => {
        openOverlazy('CreateTodoDrawer', {
          meetingId,
          context,
        })
      })

    const onDeleteTile: IMeetingGoalsListActionHandlers['onDeleteTile'] =
      useAction(async () => {
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
      })

    useEffect(() => {
      if (checkIfEmbeddedDrawerIsAvailable()) {
        const goalId = subscription().data?.meeting?.goals.nodes.length
          ? subscription().data?.meeting?.goals.nodes[0].id
          : null

        if (!goalId) {
          return closeOverlazy({ type: 'Drawer' })
        }

        openOverlazy('EditGoalDrawer', {
          meetingId: props.meetingId,
          goalId,
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getDepartmentPlanGoalsForTotalCount = useComputed(
      () => {
        return (
          totalCountSubscription().data?.meeting
            ?.departmentPlanGoalsForTotalCount.totalCount ?? 0
        )
      },
      { name: 'goalsListContainer-getDepartmentPlanGoalsForTotalCount' }
    )

    const getGoalsTotalCount = useComputed(
      () => {
        return (
          totalCountSubscription().data?.meeting?.allGoalsTotalCount
            .totalCount ?? 0
        )
      },
      { name: 'goalsListContainer-getGoalsTotalCount' }
    )

    const getData = useComputed(
      () => {
        return {
          getCurrentUserPermissions,
          getBreadcrumbs,
          getDepartmentPlanGoalsForTotalCount,
          getGoals: getSortedByBPGoalsIfApplicable,
          getGoalsTotalCount,
          isLoading: subscription().querying,
          isShowingAllMilestones: pageState.isShowingAllMilestones,
          meetingId: props.meetingId,
          meetingName: subscription().data?.meeting?.name ?? '',
          pageType,
          workspaceType: props.workspaceType || 'MEETING',
          selectedTab: pageState.selectedTab,
          shouldCreateTodosForMilestone:
            pageState.shouldCreateTodosForMilestone,
          sortBy: pageState.sortBy,
          workspaceTileId: props.workspaceTileId,
          isExpandedOnWorkspacePage,
        }
      },
      { name: 'goalsListContainer-getData' }
    )

    const getActionHandlers = useComputed(
      () => {
        return {
          onCreateContextAwareIssueFromGoal,
          onCreateContextAwareTodoFromGoal,
          onCreateGoal,
          onCreateTodosForMilestone,
          onEditGoalRequest,
          onExportGoals,
          onPrintGoals,
          onRestoreGoal,
          onSelectGoalsSorting: setSortBy,
          onSelectGoalTab: setSelectedTab,
          onToggleMilestones: setIsShowingAllMilestones,
          onUpdateGoalStatus,
          onUpdateMilestone,
          onUploadGoals,
          onViewArchivedGoals,
          onDeleteTile,
        }
      },
      {
        name: 'goalsListContainer-getActionHandlers',
      }
    )

    const GoalsListView = (
      <props.children
        className={props.className}
        getData={getData}
        getActionHandlers={getActionHandlers}
      />
    )

    if (isExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {GoalsListView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return GoalsListView
    }
  }
)
