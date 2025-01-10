import React from 'react'

import { queryDefinition, useComputed, useSubscription } from '@mm/gql'

import {
  addOrRemoveWeeks,
  getStartOfDaySecondsSinceEpochUTCForDate,
  useTimeController,
} from '@mm/core/date'

import { useBloomMeetingNode } from '@mm/core-bloom'

import { ICompletedIssueListContainerProps } from './completedIssueListViewTypes'

export const CompletedIssueListContainer = (
  props: ICompletedIssueListContainerProps
) => {
  const { getSecondsSinceEpochUTC } = useTimeController()

  const subscription = useSubscription(
    {
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({ recentlySolvedIssues }) => ({
          completedIssues: recentlySolvedIssues({
            filter: {
              and: [
                {
                  completed: true,
                  archived: false,
                  completedTimestamp: {
                    gte: getStartOfDaySecondsSinceEpochUTCForDate({
                      secondsSinceEpochUTC: addOrRemoveWeeks({
                        secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
                        weeks: -1,
                      }),
                    }),
                  },
                },
              ],
            },
            sort: {
              completedTimestamp: 'desc',
            },
            map: ({
              title,
              completedTimestamp,
              archivedTimestamp,
              completed,
              archived,
              dateCreated,
              issueNumber,
              sentFromIssueMeetingName,
              assignee,
            }) => ({
              title,
              completedTimestamp,
              archivedTimestamp,
              completed,
              archived,
              dateCreated,
              issueNumber,
              sentFromIssueMeetingName,
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
        target: { id: props.getData().currentMeetingId },
      }),
    },
    {
      subscriptionId: `IssueListContainer-${
        props.getData().currentMeetingId
      }-completedIssues`,
    }
  )

  const CompletedIssuesView = props.children

  const getData = useComputed(
    () => {
      return {
        ...props.getData(),
        completedIssues: subscription().data.meeting.completedIssues,
      }
    },
    {
      name: `CompletedIssueListContainer_getData`,
    }
  )

  return (
    <CompletedIssuesView
      getData={getData}
      responsiveSize={props.responsiveSize}
      getActionHandlers={props.getActionHandlers}
    />
  )
}
