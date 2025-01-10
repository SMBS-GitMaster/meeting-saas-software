import { observer } from 'mobx-react'
import React from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  getMeetingAttendeesAndOrgUsersLookup,
  useBloomCustomTerms,
  useBloomIssuesMutations,
  useBloomMeetingNode,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction, useComputed } from '@mm/bloom-web/pages/performance/mobx'

import {
  IBusinessPlanIssuesListActionHandlers,
  IBusinessPlanIssuesListContainerProps,
} from './businessPlanIssuesListTypes'

export const BusinessPlanIssuesListContainer = observer(
  function BusinessPlanIssueListContainer(
    props: IBusinessPlanIssuesListContainerProps
  ) {
    const diResolver = useDIResolver()
    const meetingNode = useBloomMeetingNode()

    const terms = useBloomCustomTerms()

    const { editIssue } = useBloomIssuesMutations()
    const { getSecondsSinceEpochUTC } = useTimeController()

    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const {
      listCollection,
      getIsEditingDisabled,
      getBusinessPlanData,
      className,
    } = props

    const meetingIdForBusinessPlan =
      getBusinessPlanData().businessPlan?.meetingId

    const subscription = useSubscription(
      {
        meeting: meetingIdForBusinessPlan
          ? queryDefinition({
              def: meetingNode,
              map: ({ name, attendeesLookup, longTermIssues }) => ({
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
                issues: longTermIssues({
                  filter: {
                    and: [
                      {
                        addToDepartmentPlan: true,
                      },
                    ],
                  },
                  sort: { assignee: { fullName: 'asc' } },
                  map: ({
                    title,
                    archived,
                    addToDepartmentPlan,
                    assignee,
                  }) => ({
                    title,
                    archived,
                    addToDepartmentPlan,
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
                  }),
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
        subscriptionId: `BusinessPlanBusinessPlanIssueListContainer-${meetingIdForBusinessPlan}`,
      }
    )

    const getIssueListItems = useComputed(
      () => {
        return (subscription().data.meeting?.issues.nodes || []).map(
          (issue) => {
            return {
              id: issue.id,
              ownerId: issue.assignee.id,
              title: issue.title,
            }
          }
        )
      },
      { name: 'businessPlanIssueListContainer-getIssueDataListItems' }
    )

    const getMeetingAttendeesAndOrgUsersLookupOptions = useComputed(
      () => {
        const meeting = subscription().data.meeting

        return getMeetingAttendeesAndOrgUsersLookup({
          orgUsers: subscription().data?.users || null,
          meetings: meeting ? [meeting] : null,
        })
      },
      {
        name: 'businessPlanIssueListContainer-getMeetingAttendeesAndOrgUsersLookup',
      }
    )

    const onCreateIssueRequest: IBusinessPlanIssuesListActionHandlers['onCreateIssueRequest'] =
      useAction(({ meetingId }) => {
        if (!meetingId) return
        openOverlazy('CreateIssueDrawer', {
          meetingId,
          initialItemValues: {
            addToDepartmentPlan: true,
          },
        })
      })

    const onEditIssueRequest: IBusinessPlanIssuesListActionHandlers['onEditIssueRequest'] =
      useAction(({ issueId }) => {
        openOverlazy('EditIssueDrawer', {
          issueId,
          meetingId: getBusinessPlanData().businessPlan?.meetingId || null,
        })
      })

    const onHandleEditBusinessPlanIssues: IBusinessPlanIssuesListActionHandlers['onHandleEditBusinessPlanIssues'] =
      useAction(async ({ values }) => {
        try {
          const businessPlanId =
            getData().getBusinessPlanData().businessPlan?.id
          const meetingId = subscription().data.meeting?.id

          if (
            !businessPlanId ||
            !values.issues ||
            values.issues.length === 0 ||
            !meetingId
          )
            return

          await Promise.all(
            values.issues.map(async (issue) => {
              switch (issue.action) {
                case 'ADD': {
                  return throwLocallyLogInProd(
                    diResolver,
                    new UnreachableCaseError({
                      eventType: issue,
                      errorMessage: `The action of ADD does not exist in onHandleEditBusinessPlanIssuesListCollection for businessPlan issues`,
                    } as never)
                  )
                }
                case 'UPDATE': {
                  return await editIssue({
                    id: issue.item.id,
                    title: issue.item.title,
                    assigneeId: issue.item.ownerId,
                  })
                }
                case 'REMOVE': {
                  return await editIssue({
                    id: issue.item.id,
                    archived: true,
                    archivedTimestamp: getSecondsSinceEpochUTC(),
                  })
                }
                default: {
                  throwLocallyLogInProd(
                    diResolver,
                    new UnreachableCaseError({
                      eventType: issue,
                      errorMessage: `The action ${issue} does not exist in onHandleEditBusinessPlanIssues for businessPlan issues`,
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

    const onMoveIssueToShortTerm: IBusinessPlanIssuesListActionHandlers['onMoveIssueToShortTerm'] =
      useAction(async ({ issueId }) => {
        try {
          await editIssue({
            id: issueId,
            addToDepartmentPlan: false,
          })
          openOverlazy('Toast', {
            type: 'success',
            text: t(`{{issue}} moved to short term`, {
              issue: terms.issue.singular,
            }),
            undoClicked: () => {
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              )
            },
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing {{issue}}`, {
              issue: terms.issue.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      })

    const getData = useComputed(
      () => {
        return {
          isLoading: subscription().querying,
          getBusinessPlanData,
          getIssueListItems,
          getIsEditingDisabled,
          getMeetingAttendeesAndOrgUsersLookupOptions,
          listCollection,
          meetingId: getBusinessPlanData().businessPlan?.meetingId || null,
        }
      },
      { name: 'businessPlanIssueListContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        return {
          onCreateIssueRequest,
          onEditIssueRequest,
          onHandleEditBusinessPlanIssues,
          onMoveIssueToShortTerm,
        }
      },
      {
        name: 'businessPlanIssueListContainer-getActions',
      }
    )

    const BusinessPlanIssuesListView = (
      <props.children
        className={className}
        isPdfPreview={props.isPdfPreview}
        getData={getData}
        getActions={getActions}
      />
    )

    return BusinessPlanIssuesListView
  }
)
