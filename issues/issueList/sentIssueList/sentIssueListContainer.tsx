import React from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useBloomMeetingNode } from '@mm/core-bloom'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { ISSUE_LIST_SORT_BY_VALUE } from '../issueListConstants'
import { ISentIssueListContainerProps } from './types'

export const SentIssueListContainer = (props: ISentIssueListContainerProps) => {
  const { currentMeetingId, sortIssuesBy } = props.getData()

  const sortIssuesParams = sortIssuesBy
    ? ISSUE_LIST_SORT_BY_VALUE[sortIssuesBy]
    : {}

  const subscription = useSubscription(
    {
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({ sentToIssues }) => ({
          issuesSentToOtherMeetings: sentToIssues({
            filter: {
              and: [
                {
                  sentToIssueMeetingName: { neq: null },
                  archivedTimestamp: null,
                  archived: false,
                },
              ],
            },
            sort: {
              ...sortIssuesParams,
            },
            map: ({
              sentToIssueMeetingName,
              archived,
              archivedTimestamp,
              priorityVoteRank,
              assignee,
              sentToIssue,
            }) => ({
              sentToIssueMeetingName,
              archived,
              priorityVoteRank,
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
              sentToIssue: sentToIssue({
                map: ({
                  title,
                  completed,
                  archived,
                  archivedTimestamp,
                  sentToIssueMeetingName,
                  assignee,
                }) => ({
                  title,
                  completed,
                  archived,
                  archivedTimestamp,
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
          }),
        }),
        target: { id: currentMeetingId },
      }),
    },
    {
      subscriptionId: `IssueListContainer-${currentMeetingId}-issuesSentToOtherMeetings`,
    }
  )

  const SentIssuesView = props.children

  const getData = useComputed(
    () => {
      return {
        ...props.getData(),
        issuesSentToOtherMeetings:
          subscription().data.meeting.issuesSentToOtherMeetings,
      }
    },
    {
      name: `SentIssueListContainer.getData`,
    }
  )

  return (
    <SentIssuesView
      getData={getData}
      responsiveSize={props.responsiveSize}
      getActionHandlers={props.getActionHandlers}
    />
  )
}
