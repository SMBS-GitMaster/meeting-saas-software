import { observer } from 'mobx-react'
import React from 'react'

import {
  type Id,
  ValidSortForNode,
  queryDefinition,
  useSubscription,
} from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomUserNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { BloomGoalNode } from '@mm/core-bloom/goals/goalNode'
import { useBloomGoalMutations } from '@mm/core-bloom/goals/mutations'

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

import { getGoalListPermissions } from '../goalsListPermissions'
import type {
  IPersonalGoalsListContainerProps,
  IPersonalGoalsListPageState,
  IPersonalGoalsListViewActions,
  IUserGoalsForMeeting,
  TPersonalGoalsListSortBy,
} from './personalGoalsListTypes'

export const PersonalGoalsListContainer = observer(
  function PersonalGoalsListContainer(props: IPersonalGoalsListContainerProps) {
    const pageState = useObservable<IPersonalGoalsListPageState>({
      selectedGroupSortBy: 'MEETING_ASC',
      selectedContentSortBy: 'NEWEST',
      isExpandedMilestones: false,
    })

    const authenticatedBloomUserQueryDefinition =
      useAuthenticatedBloomUserQueryDefinition
    const bloomUserNode = useBloomUserNode()
    const meetingColorController = useMeetingColorController()
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { editGoal, editMilestone } = useBloomGoalMutations()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { openOverlazy } = useOverlazyController()
    const { t } = useTranslation()

    const isComponentPurposedForAnotherUser = !!props.userId
    const isExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const contentSortParams: Record<
      TPersonalGoalsListSortBy,
      ValidSortForNode<BloomGoalNode>
    > = {
      MEETING_ASC: {},
      MEETING_DESC: {},
      NEWEST: {
        dateCreated: { direction: 'desc', priority: 2 },
      },
      OLDEST: {
        dateCreated: { direction: 'asc', priority: 2 },
      },
      STATUS: { status: 'desc' },
      TITLE_ASC: { title: 'asc' },
      TITLE_DESC: { title: 'desc' },
    }

    const subscription = useSubscription(
      {
        currentUser: props.userId
          ? queryDefinition({
              def: bloomUserNode,
              target: { id: props.userId },
              map: ({
                id,
                firstName,
                lastName,
                fullName,
                avatar,
                userAvatarColor,
                goals,
              }) => ({
                id,
                firstName,
                lastName,
                fullName,
                avatar,
                userAvatarColor,
                goals: goals({
                  map: ({
                    id,
                    title,
                    status,
                    dateCreated,
                    dueDate,
                    archived,
                    notesId,
                    departmentPlanRecords,
                    milestones,
                    meetings,
                  }) => ({
                    id,
                    title,
                    status,
                    dateCreated,
                    dueDate,
                    archived,
                    notesId,
                    meetings: meetings({
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
                  filter: {
                    and: [
                      {
                        archived: false,
                      },
                    ],
                  },
                  sort: {
                    ...contentSortParams[pageState.selectedContentSortBy],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
            })
          : authenticatedBloomUserQueryDefinition({
              map: ({
                id,
                firstName,
                lastName,
                fullName,
                avatar,
                userAvatarColor,
                goals,
              }) => ({
                id,
                firstName,
                lastName,
                fullName,
                avatar,
                userAvatarColor,
                goals: goals({
                  map: ({
                    id,
                    title,
                    status,
                    dateCreated,
                    dueDate,
                    archived,
                    notesId,
                    departmentPlanRecords,
                    milestones,
                    meetings,
                  }) => ({
                    id,
                    title,
                    status,
                    dateCreated,
                    dueDate,
                    archived,
                    notesId,
                    meetings: meetings({
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
                  filter: {
                    and: [
                      {
                        archived: false,
                      },
                    ],
                  },
                  sort: {
                    ...contentSortParams[pageState.selectedContentSortBy],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
            }),
      },
      { subscriptionId: `PersonalGoalsListContainer-${props.workspaceTileId}` }
    )

    const userGoalsInAllMeetings = useComputed(
      () => {
        const currentUser = subscription().data.currentUser
        const goalsByMeetingIdMap: Record<Id, IUserGoalsForMeeting> = {}
        const colorsByMeetingId = meetingColorController.meetingColorByMeetingId

        currentUser.goals.nodes.forEach((goalDatum) => {
          const goalData = {
            id: goalDatum.id,
            title: goalDatum.title,
            status: goalDatum.status,
            dateCreated: goalDatum.dateCreated,
            dueDate: goalDatum.dueDate,
            notesId: goalDatum.notesId,
            assignee: {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              fullName: currentUser.fullName,
              avatar: currentUser.avatar,
              userAvatarColor: currentUser.userAvatarColor,
            },
            milestones: goalDatum.milestones,
            departmentPlanRecords: goalDatum.departmentPlanRecords,
          }

          if (
            goalDatum.meetings.nodes.length === 0 &&
            !isComponentPurposedForAnotherUser
          ) {
            if (!goalsByMeetingIdMap['PERSONAL']) {
              goalsByMeetingIdMap['PERSONAL'] = {
                id: 'PERSONAL',
                meetingId: 'PERSONAL',
                meetingName: 'PERSONAL',
                meetingColor:
                  theme.colors.workspacePersonalTilePersonalItemsColor,
                permissions: {
                  canEditGoalsInMeeting: { allowed: true },
                  canCreateIssuesInMeeting: { allowed: true },
                  canCreateTodosInMeeting: { allowed: true },
                  canCreateGoalsInMeeting: { allowed: true },
                },
                goals: [goalData],
              }
            } else {
              goalsByMeetingIdMap['PERSONAL'].goals.push(goalData)
            }
          } else {
            goalDatum.meetings.nodes.forEach((goalMeeting) => {
              if (goalsByMeetingIdMap[goalMeeting.id]) {
                goalsByMeetingIdMap[goalMeeting.id].goals.push(goalData)
              } else {
                const permissionsForMeeting = getGoalListPermissions(
                  goalMeeting.currentMeetingAttendee.permissions
                )

                goalsByMeetingIdMap[goalMeeting.id] = {
                  id: goalMeeting.id,
                  meetingId: goalMeeting.id,
                  meetingName: goalMeeting.name,
                  meetingColor: colorsByMeetingId[goalMeeting.id],
                  permissions: permissionsForMeeting,
                  goals: [goalData],
                }
              }
            })
          }
        })

        const sortedByMeetingName = Object.values(goalsByMeetingIdMap).sort(
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

        return sortedByMeetingName
      },
      { name: 'PersonalTodoListContainer-userTodosInAllMeetings' }
    )

    const onToggleMilestones: IPersonalGoalsListViewActions['onToggleMilestones'] =
      useAction((isShowingAllMilestones: boolean) => {
        pageState.isExpandedMilestones = isShowingAllMilestones
      })

    const onCreateGoal: IPersonalGoalsListViewActions['onCreateGoal'] =
      useAction(() => {
        const props = isComponentPurposedForAnotherUser
          ? {}
          : { meetingId: null }
        openOverlazy('CreateGoalDrawer', props)
      })

    const onEditGoalRequest: IPersonalGoalsListViewActions['onEditGoalRequest'] =
      useAction(({ goalId, meetingId }) => {
        openOverlazy('EditGoalDrawer', {
          goalId,
          meetingId: meetingId === 'PERSONAL' ? null : meetingId,
        })
      })

    const onUpdateGoalStatus: IPersonalGoalsListViewActions['onUpdateGoalStatus'] =
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

    const onUpdateMilestone: IPersonalGoalsListViewActions['onUpdateMilestone'] =
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

    const onDeleteTile: IPersonalGoalsListViewActions['onDeleteTile'] =
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

    const setGroupSortBy: IPersonalGoalsListViewActions['setGroupSortBy'] =
      useAction((sortBy) => {
        pageState.selectedGroupSortBy = sortBy
      })

    const setContentSortBy: IPersonalGoalsListViewActions['setContentSortBy'] =
      useAction((sortBy) => {
        pageState.selectedContentSortBy = sortBy
      })

    const getData = useComputed(
      () => {
        return {
          isLoading: subscription().querying,
          isComponentPurposedForAnotherUser,
          workspaceTileId: props.workspaceTileId,
          selectedGroupSortBy: pageState.selectedGroupSortBy,
          selectedContentSortBy: pageState.selectedContentSortBy,
          isExpandedMilestones: pageState.isExpandedMilestones,
          userGoalsInAllMeetings,
          isExpandedOnWorkspacePage,
        }
      },
      { name: 'PersonalGoalsListContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        return {
          onToggleMilestones,
          onCreateGoal,
          onEditGoalRequest,
          onUpdateGoalStatus,
          onUpdateMilestone,
          onDeleteTile,
          setGroupSortBy,
          setContentSortBy,
        }
      },
      {
        name: 'PersonalGoalsListContainer-getActions',
      }
    )

    const PersonalGoalsListView = (
      <props.children
        data={getData}
        actions={getActions}
        className={props.className}
      />
    )

    if (isExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {PersonalGoalsListView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return PersonalGoalsListView
    }
  }
)
