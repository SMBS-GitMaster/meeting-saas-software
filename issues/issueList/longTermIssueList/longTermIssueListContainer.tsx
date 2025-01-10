import { observer } from 'mobx-react'
import React from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useBloomMeetingNode } from '@mm/core-bloom'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { ISSUE_LIST_SORT_BY_VALUE } from '../issueListConstants'
import { ILongTermIssueListContainerProps } from './longTermIssueListViewTypes'

export const LongTermIssueListContainer = observer(
  (props: ILongTermIssueListContainerProps) => {
    const sortIssuesBy = props.getData().sortIssuesBy
    const currentMeetingId = props.getData().currentMeetingId
    const sortIssuesParams = sortIssuesBy
      ? ISSUE_LIST_SORT_BY_VALUE[sortIssuesBy]
      : {}

    const longTermIssuesSubscription = useSubscription(
      {
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ longTermIssues }) => ({
            longTermIssues: longTermIssues({
              filter: {
                and: [
                  {
                    addToDepartmentPlan: true,
                  },
                ],
              },
              sort: {
                ...sortIssuesParams,
              },
              map: ({
                title,
                completed,
                addToDepartmentPlan,
                dateCreated,
                numStarVotes,
                priorityVoteRank,
                archived,
                archivedTimestamp,
                completedTimestamp,
                notesId,
                issueNumber,
                sentFromIssueMeetingName,
                sentToIssueMeetingName,
                assignee,
              }) => ({
                title,
                addToDepartmentPlan,
                completed,
                dateCreated,
                numStarVotes,
                priorityVoteRank,
                archived,
                archivedTimestamp,
                completedTimestamp,
                notesId,
                issueNumber,
                sentFromIssueMeetingName,
                sentToIssueMeetingName,
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
          target: { id: currentMeetingId },
        }),
      },
      {
        subscriptionId: `IssueListContainer-${currentMeetingId}-longTermIssues`,
      }
    )

    const getData = useComputed(
      () => {
        return {
          ...props.getData(),
          longTermIssues:
            longTermIssuesSubscription().data.meeting.longTermIssues,
        }
      },
      {
        name: `LongTermIssueListContainer.getData`,
      }
    )

    const LongTermIssuesView = props.children

    return (
      <LongTermIssuesView
        getData={getData}
        responsiveSize={props.responsiveSize}
        getActionHandlers={props.getActionHandlers}
      />
    )
  }
)
