import { observer } from 'mobx-react'
import React from 'react'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  getMeetingAttendeesAndOrgUsersLookup,
  useBloomBusinessPlanMutations,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBloomGoalMutations } from '@mm/core-bloom/goals/mutations'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction, useComputed } from '@mm/bloom-web/pages/performance/mobx'

import {
  getBusinessPlanListCollectionTitlePlaceholder,
  getRecordOfBusinessPlanTileTypeToDefaultTileTitle,
} from '../lookups'
import {
  IBusinessPlanGoalsListActionHandlers,
  IBusinessPlanGoalsListContainerProps,
} from './businessPlanGoalsListTypes'

export const BusinessPlanGoalsListContainer = observer(
  function BusinessPlanGoalListContainer(
    props: IBusinessPlanGoalsListContainerProps
  ) {
    const diResolver = useDIResolver()
    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()

    const { editGoal } = useBloomGoalMutations()
    const { editBusinessPlanListCollection } = useBloomBusinessPlanMutations()

    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const {
      listCollection,
      getIsEditingDisabled,
      getBusinessPlanData,
      getTileData,
      className,
    } = props

    const meetingIdForBusinessPlan =
      getBusinessPlanData().businessPlan?.meetingId

    const subscription = useSubscription(
      {
        meeting: meetingIdForBusinessPlan
          ? queryDefinition({
              def: meetingNode,
              map: ({ name, attendeesLookup, goals }) => ({
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
                goals: goals({
                  map: ({
                    title,
                    archived,
                    assignee,
                    departmentPlanRecords,
                  }) => ({
                    title,
                    archived,
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
                  }),
                  filter: {
                    and: [
                      {
                        _relational: {
                          departmentPlanRecords: {
                            isInDepartmentPlan: { eq: true, condition: 'some' },
                            meetingId: {
                              eq: meetingIdForBusinessPlan,
                              condition: 'some',
                            },
                          },
                        },
                      },
                      {
                        archived: false,
                      },
                    ],
                  },
                }),
              }),
              target: { id: meetingIdForBusinessPlan },
            })
          : null,
        users: queryDefinition({
          def: useBloomUserNode(),
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
        }),
      },
      {
        subscriptionId: `BusinessPlanBusinessPlanGoalListContainer-${meetingIdForBusinessPlan}`,
      }
    )

    const getGoalListItems = useComputed(
      () => {
        return (subscription().data.meeting?.goals.nodes || []).map((goal) => {
          return {
            id: goal.id,
            ownerId: goal.assignee.id,
            title: goal.title,
          }
        })
      },
      { name: 'businessPlanGoalListContainer-getGoalDataListItems' }
    )

    const titlePlaceholder = getBusinessPlanListCollectionTitlePlaceholder({
      diResolver,
      listType: listCollection.listType,
      tileType: getTileData().tileType,
    })

    const getMeetingAttendeesAndOrgUsersLookupOptions = useComputed(
      () => {
        const meeting = subscription().data.meeting

        return getMeetingAttendeesAndOrgUsersLookup({
          orgUsers: subscription().data?.users || null,
          meetings: meeting ? [meeting] : null,
        })
      },
      {
        name: 'businessPlanGoalListContainer-getMeetingAttendeesAndOrgUsersLookup',
      }
    )

    const getGoalData = useAction((goalId: Id) => {
      return (subscription().data.meeting?.goals.nodes || []).find(
        (goal) => goal.id === goalId
      )
    })

    const onCreateGoalRequest: IBusinessPlanGoalsListActionHandlers['onCreateGoalRequest'] =
      useAction(({ meetingId }) => {
        if (!meetingId) return
        openOverlazy('CreateGoalDrawer', {
          meetingId,
          initialItemValues: {
            addToDepartmentPlans: [
              { addToDepartmentPlan: true, id: meetingId },
            ],
          },
        })
      })

    const onEditGoalRequest: IBusinessPlanGoalsListActionHandlers['onEditGoalRequest'] =
      useAction(({ goalId }) => {
        openOverlazy('EditGoalDrawer', {
          goalId,
          meetingId: getBusinessPlanData().businessPlan?.meetingId || null,
        })
      })

    const onHandleCreateContextAwareIssueFromBusinessPlan: IBusinessPlanGoalsListActionHandlers['onHandleCreateContextAwareIssueFromBusinessPlan'] =
      useAction(({ text, goalId }) => {
        const goalData = getGoalData(goalId)

        const goalAssigneeFullName = goalData
          ? goalData.assignee.fullName
          : t('N/A')

        return openOverlazy('CreateIssueDrawer', {
          context: {
            type: 'BusinessPlanQuarterlyGoals',
            businessPlanPage: getBusinessPlanData().pageState.parentPageType,
            title: text,
            tile:
              getTileData().title ||
              getRecordOfBusinessPlanTileTypeToDefaultTileTitle({ diResolver })[
                getTileData().tileType
              ],
            owner: goalAssigneeFullName,
          },
          meetingId: getBusinessPlanData().businessPlan?.meetingId || null,
          initialItemValues: {
            title: text,
          },
        })
      })

    const onHandleEditBusinessPlanGoalsListCollection: IBusinessPlanGoalsListActionHandlers['onHandleEditBusinessPlanGoalsListCollection'] =
      useAction(async ({ listCollectionId, meetingId, values }) => {
        try {
          const businessPlanId =
            getData().getBusinessPlanData().businessPlan?.id

          if (!businessPlanId) return

          if (values.title) {
            await editBusinessPlanListCollection({
              listCollectionId,
              businessPlanId,
              title: values.title,
            })
          }

          if (!values.goals || values.goals.length === 0) {
            return
          }

          await Promise.all(
            values.goals.map(async (goal) => {
              switch (goal.action) {
                case 'ADD': {
                  return throwLocallyLogInProd(
                    diResolver,
                    new UnreachableCaseError({
                      eventType: goal,
                      errorMessage: `The action of ADD does not exist in onHandleEditBusinessPlanGoalsListCollection for businessPlan goals`,
                    } as never)
                  )
                }
                case 'UPDATE': {
                  return await editGoal({
                    goalId: goal.item.id,
                    title: goal.item.title,
                    assignee: goal.item.ownerId,
                  })
                }
                case 'REMOVE': {
                  const goalData = getGoalData(goal.item.id)

                  if (!goalData) {
                    return openOverlazy('Toast', {
                      type: 'error',
                      text: t(`Unable to remove goal from {{bp}},`, {
                        bp: terms.businessPlan.singular,
                      }),
                      error: new UserActionError(
                        t(`Unable to remove goal from {{bp}},`, {
                          bp: terms.businessPlan.singular,
                        })
                      ),
                    })
                  }

                  const meetingsAndPlansWithCurrentMeetingRemoved =
                    goalData.departmentPlanRecords.nodes.map((record) => {
                      if (meetingId === record.meetingId) {
                        return {
                          meetingId: record.meetingId,
                          addToDepartmentPlan: false,
                        }
                      } else {
                        return {
                          meetingId: record.meetingId,
                          addToDepartmentPlan: record.isInDepartmentPlan,
                        }
                      }
                    })

                  return await editGoal({
                    goalId: goal.item.id,
                    meetingsAndPlans: meetingsAndPlansWithCurrentMeetingRemoved,
                  })
                }
                default: {
                  throwLocallyLogInProd(
                    diResolver,
                    new UnreachableCaseError({
                      eventType: goal,
                      errorMessage: `The action ${goal} does not exist in onHandleEditBusinessPlanGoalsListCollection for businessPlan goals`,
                    } as never)
                  )
                }
              }
            })
          )
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing title.`),
            error: new UserActionError(error),
          })
        }
      })

    const getData = useComputed(
      () => {
        return {
          isLoading: subscription().querying,
          getBusinessPlanData,
          getGoalListItems,
          getIsEditingDisabled,
          getMeetingAttendeesAndOrgUsersLookupOptions,
          listCollection,
          meetingId: getBusinessPlanData().businessPlan?.meetingId || null,
          titlePlaceholder,
        }
      },
      { name: 'businessPlanGoalListContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        return {
          onHandleCreateContextAwareIssueFromBusinessPlan,
          onCreateGoalRequest,
          onEditGoalRequest,
          onHandleEditBusinessPlanGoalsListCollection,
        }
      },
      {
        name: 'businessPlanGoalListContainer-getActions',
      }
    )

    const BusinessPlanGoalsListView = (
      <props.children
        className={className}
        isPdfPreview={props.isPdfPreview}
        getData={getData}
        getActions={getActions}
      />
    )

    return BusinessPlanGoalsListView
  }
)
