import { observer } from 'mobx-react'
import React, { useEffect, useMemo, useState } from 'react'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import {
  addOrRemoveWeeks,
  getStartAndEndOfQuarterSecondsSinceEpochUTC,
  getStartOfDaySecondsSinceEpochUTCForDate,
  guessTimezone,
  useTimeController,
} from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { useStatefulPromise } from '@mm/core/ui/hooks'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomMeetingNode,
  useBloomNoteQueries,
} from '@mm/core-bloom'

import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '../bloomProvider/overlazy/overlazyController'
import {
  IMeetingStatsContainerProps,
  IMeetingStatsViewData,
} from './meetingStatsTypes'

export const MeetingStatsContainer = observer(function MeetingStatsContainer(
  props: IMeetingStatsContainerProps
) {
  const Component = props.children

  const diResolver = useDIResolver()
  const meetingNode = useBloomMeetingNode()
  const { closeOverlazy } = useOverlazyController()

  const { checkIfEmbeddedDrawerIsAvailable } = useDrawerController()
  const { getNoteById } = useBloomNoteQueries()
  const { getSecondsSinceEpochUTC } = useTimeController()

  const [recordOfUserIdToNotesText] = useState<
    Record<Id, Record<Id, string | null>>
  >({})

  const [
    recordOfSelectedNotesIdToNotesText,
    setRecordOfSelectedNotesIdToNotesText,
  ] = useState<IMeetingStatsViewData['recordOfSelectedNotesIdToNotesText']>([])

  const currentQuarter = getStartAndEndOfQuarterSecondsSinceEpochUTC()

  const subscription1 = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ settings }) => ({
          settings: settings({
            map: ({
              timezone,
              hasViewedFeedbackModalOnce,
              doNotShowFeedbackModalAgain,
            }) => ({
              timezone,
              hasViewedFeedbackModalOnce,
              doNotShowFeedbackModalAgain,
            }),
          }),
        }),
      }),
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        target: {
          id: props.meetingId,
        },
        map: ({
          meetingInstances,
          todos,
          headlines,
          name,
          concludeActions,
          recentlySolvedIssues,
        }) => ({
          name,
          meetingInstancesForMeetingStats: meetingInstances({
            sort: { dateCreated: 'desc' },
            pagination: { itemsPerPage: 2 },
            map: ({
              averageMeetingRating,
              dateCreated,
              todosCompletedPercentage,
              meetingDurationInSeconds,
              issuesSolvedCount,
              meetingConcludedTime,
              meetingStartTime,
              selectedNotes,
              attendeeInstances,
            }) => ({
              todosCompletedPercentage,
              meetingDurationInSeconds,
              dateCreated,
              averageMeetingRating,
              issuesSolvedCount,
              meetingConcludedTime,
              meetingStartTime,
              selectedNotes,
              attendeeInstances: attendeeInstances({
                map: ({ id, rating, notesText, attendee }) => ({
                  id,
                  rating,
                  notesText,
                  attendee: attendee({
                    map: ({
                      id,
                      firstName,
                      lastName,
                      fullName,
                      avatar,
                      userAvatarColor,
                      isPresent,
                    }) => ({
                      id,
                      firstName,
                      lastName,
                      fullName,
                      avatar,
                      userAvatarColor,
                      isPresent,
                    }),
                  }),
                }),
              }),
            }),
          }),
          todos: todos({
            filter: {
              and: [
                {
                  archived: false,
                  completed: false,
                },
              ],
            },
            sort: {
              dateCreated: 'asc',
            },
            map: ({
              id,
              title,
              completed,
              notesId,
              dueDate,
              archived,
              dateCreated,
              assignee,
            }) => ({
              id,
              title,
              completed,
              notesId,
              dueDate,
              dateCreated,
              archived,
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
          headlines: headlines({
            filter: {
              and: [
                {
                  archived: false,
                },
              ],
            },
            map: ({ id, title, archived, dateCreated, notesId, assignee }) => ({
              id,
              title,
              archived,
              dateCreated,
              notesId,
              assignee: assignee({
                map: ({
                  id,
                  firstName,
                  lastName,
                  avatar,
                  userAvatarColor,
                }) => ({
                  id,
                  firstName,
                  lastName,
                  avatar,
                  userAvatarColor,
                }),
              }),
            }),
          }),
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
            pagination: {
              includeTotalCount: true,
            },
            map: ({
              title,
              notesId,
              completed,
              assignee,
              archived,
              completedTimestamp,
            }) => ({
              title,
              completed,
              notesId,
              assignee: assignee({
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
              archived,
              completedTimestamp,
            }),
          }),
          instancesForTheQuarter: meetingInstances({
            // Get all summaries for the quarter to calculate total issues solved count for the quarter
            // @TODO_BLOOM - https://winterinternational.atlassian.net/browse/TTD-1353
            // We may not get all query results using these two filters because of pagination. Whatever solution is implemented in TTD-1353 should be utilized here
            filter: {
              and: [
                {
                  dateCreated: {
                    gte: currentQuarter.start,
                    lte: currentQuarter.end,
                  },
                },
              ],
            },
            sort: { dateCreated: 'desc' },
            map: ({ dateCreated, issuesSolvedCount }) => ({
              issuesSolvedCount,
              dateCreated,
            }),
          }),
          concludeActions: concludeActions({
            map: ({ feedbackStyle }) => ({
              feedbackStyle,
            }),
          }),
        }),
      }),
    },
    {
      subscriptionId: `MeetingStatsContainer-${props.meetingId}`,
    }
  )

  const meeting = subscription1().data.meeting
  const lastMeetingInstance = meeting?.meetingInstancesForMeetingStats
    ? meeting.meetingInstancesForMeetingStats.nodes[0]
    : null

  const priorToLastMeetingInstance = meeting?.meetingInstancesForMeetingStats
    ? meeting?.meetingInstancesForMeetingStats.nodes[1]
    : null

  const meetingDurationDifferenceFromLastMeetingInMinutes =
    lastMeetingInstance && priorToLastMeetingInstance
      ? Math.round(
          (lastMeetingInstance.meetingDurationInSeconds -
            priorToLastMeetingInstance.meetingDurationInSeconds) /
            60
        )
      : 0

  const todosCompletedPercentageDifferenceFromLastMeeting =
    lastMeetingInstance && priorToLastMeetingInstance
      ? lastMeetingInstance.todosCompletedPercentage -
        priorToLastMeetingInstance.todosCompletedPercentage
      : 0

  const selectedMeetingNotesIds = (
    lastMeetingInstance?.selectedNotes || []
  ).map((id) => ({ id: id }))

  const subscription2 = useSubscription(
    {
      selectedMeetingNotes: selectedMeetingNotesIds.length
        ? queryDefinition({
            def: meetingNode,
            map: ({ notes }) => ({
              notes: notes({
                map: ({ title, id, notesId, dateCreated }) => ({
                  title,
                  id,
                  notesId,
                  dateCreated,
                }),
                filter: {
                  or: selectedMeetingNotesIds,
                },
              }),
            }),
            target: { id: props.meetingId },
            useSubOpts: {
              doNotSuspend: true,
            },
          })
        : null,
    },
    { subscriptionId: 'MeetingStatsContainer_SelectedNotesQuery' }
  )

  const issuesSolvedCountForTheQuarter = useMemo(() => {
    return (meeting.instancesForTheQuarter.nodes || []).reduce(
      (total, current) => total + current.issuesSolvedCount,
      0
    )
  }, [meeting.instancesForTheQuarter.nodes])

  const meetingFeedbackInstances = lastMeetingInstance?.attendeeInstances.nodes
    .filter((el) => el.notesText !== null)
    .map((el) => {
      return {
        id: el.id,
        message: el.notesText,
        attendee: {
          id: el.attendee.id,
          avatar: el.attendee.avatar,
          fullName: el.attendee.fullName,
          firstName: el.attendee.firstName,
          lastName: el.attendee.lastName,
          userAvatarColor: el.attendee.userAvatarColor,
        },
      }
    })

  const selectedMeetingNotes = subscription2().data.selectedMeetingNotes
  const { call: callGetSelectedMeetingNotesText } = useStatefulPromise(
    async () => {
      try {
        if (selectedMeetingNotesIds.length) {
          const notes = await Promise.all(
            (selectedMeetingNotes?.notes.nodes || []).map(async (note) => {
              const noteNodeId = note.id
              const title = note.title
              const dateCreated = note.dateCreated
              const noteById = await getNoteById({ noteId: note.notesId })
              const noteHtml = noteById.html
              const details = noteById.text

              return { details, noteHtml, noteNodeId, dateCreated, title }
            })
          )

          setRecordOfSelectedNotesIdToNotesText(notes)
        } else {
          setRecordOfSelectedNotesIdToNotesText([])
        }
      } catch (e) {
        throwLocallyLogInProd(
          diResolver,
          new Error(
            `Unable to fetch notes text for notes ids in meetingStatsContainer`
          )
        )
      }
    }
  )

  const wrapUpFilterTimestampForIssues = lastMeetingInstance?.meetingStartTime
    ? lastMeetingInstance.meetingStartTime
    : getStartOfDaySecondsSinceEpochUTCForDate({
        secondsSinceEpochUTC: addOrRemoveWeeks({
          secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
          weeks: -1,
        }),
      })

  const subscription3 = useSubscription(
    {
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        target: {
          id: props.meetingId,
        },
        map: ({ recentlySolvedIssues }) => ({
          completedIssues: recentlySolvedIssues({
            filter: {
              and: [
                {
                  completed: true,
                  archived: false,
                  completedTimestamp: {
                    gte: wrapUpFilterTimestampForIssues,
                  },
                },
              ],
            },
            sort: {
              completedTimestamp: 'desc',
            },
            pagination: {
              includeTotalCount: true,
            },
            map: ({
              title,
              notesId,
              completed,
              assignee,
              archived,
              completedTimestamp,
            }) => ({
              title,
              completed,
              notesId,
              assignee: assignee({
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
              archived,
              completedTimestamp,
            }),
          }),
        }),
      }),
    },
    {
      subscriptionId: `MeetingStatsContainer_IssueQuery`,
    }
  )

  const issueSolvedLastMeeting =
    subscription3().data.meeting?.completedIssues.nodes || []

  useEffect(() => {
    callGetSelectedMeetingNotesText()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeetingNotes?.notes.nodes, selectedMeetingNotesIds])

  useEffect(() => {
    if (checkIfEmbeddedDrawerIsAvailable()) {
      return closeOverlazy({ type: 'Drawer' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Component
      className={props.className}
      data={{
        meetingPageName: props.meetingPageName,
        attendeeInstances: lastMeetingInstance?.attendeeInstances.nodes || [],
        averageMeetingRating: lastMeetingInstance?.averageMeetingRating
          ? lastMeetingInstance?.averageMeetingRating.toString()
          : '-',
        priorAverageMeetingRating:
          priorToLastMeetingInstance?.averageMeetingRating
            ? priorToLastMeetingInstance?.averageMeetingRating.toString()
            : '-',
        meetingId: props.meetingId,
        todosCompletedPercentage:
          lastMeetingInstance?.todosCompletedPercentage ?? 0,
        issuesSolvedCount: lastMeetingInstance?.issuesSolvedCount ?? 0,
        meetingDurationInSeconds:
          lastMeetingInstance?.meetingDurationInSeconds ?? 0,
        issuesSolvedCountForTheQuarter: issuesSolvedCountForTheQuarter ?? 0,
        meetingDurationDifferenceFromLastMeetingInMinutes,
        todosCompletedPercentageDifferenceFromLastMeeting,
        todos: meeting.todos.nodes,
        headlines: meeting.headlines.nodes,
        solvedIssues: issueSolvedLastMeeting,
        meetingTitle: meeting.name,
        writtenFeedback: recordOfUserIdToNotesText,
        timezone:
          subscription1().data.currentUser.settings.timezone || guessTimezone(),
        meetingConcludedTime: lastMeetingInstance?.meetingConcludedTime ?? null,
        currentUserSettings: {
          hasViewedFeedbackModalOnce:
            subscription1().data.currentUser.settings
              .hasViewedFeedbackModalOnce,
          doNotShowFeedbackModalAgain:
            subscription1().data.currentUser.settings
              .doNotShowFeedbackModalAgain,
          timezone:
            subscription1().data.currentUser.settings.timezone ||
            guessTimezone(),
        },
        recordOfSelectedNotesIdToNotesText,
        feedbackStyle: meeting.concludeActions.feedbackStyle,
        feedbackInstances: meetingFeedbackInstances,
      }}
      actionHandlers={{
        callGetSelectedMeetingNotesText,
      }}
    />
  )
})
