import { observer } from 'mobx-react'
import React from 'react'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import {
  addOrRemoveDays,
  addOrRemoveWeeks,
  getStartOfDaySecondsSinceEpochUTCForDate,
  useTimeController,
} from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomIssuesMutations,
  useBloomMeetingMutations,
  useBloomMeetingNode,
  useBloomNoteMutations,
} from '@mm/core-bloom'

import { ESendTo } from '@mm/core-bloom/meetings/mutations/concludeMeeting'
import { useBloomTodoMutations } from '@mm/core-bloom/todos/mutations'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useAction, useComputed } from '../pages/performance/mobx'
import { getWrapUpPagePermissions } from './wrapUpPermissions'
import { IWrapUpActionHandlers, IWrapUpContainerProps } from './wrapUpTypes'

export const WrapUpContainer = observer(function WrapUpContainer(
  props: IWrapUpContainerProps
) {
  const terms = useBloomCustomTerms()
  const {
    concludeMeeting,
    editMeeting,
    editMeetingConcludeActions,
    editMeetingInstanceAttendee,
    editMeetingInstance,
  } = useBloomMeetingMutations()
  const { createNote } = useBloomNoteMutations()
  const { createTodo, editTodo } = useBloomTodoMutations()
  const { editIssue } = useBloomIssuesMutations()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const subscription1 = useSubscription(
    {
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        target: {
          id: props.meetingId,
        },
        map: ({ currentMeetingInstance }) => ({
          currentMeetingInstance: currentMeetingInstance({
            map: ({ meetingStartTime }) => ({
              meetingStartTime,
            }),
          }),
        }),
      }),
    },
    {
      subscriptionId: `WrapupContainer-query1-${props.meetingId}`,
    }
  )

  const currentMeetingInstanceFromSubscription1 =
    subscription1().data.meeting.currentMeetingInstance
  const wrapUpFilterTimestampForIssuesAndTodos =
    currentMeetingInstanceFromSubscription1?.meetingStartTime
      ? currentMeetingInstanceFromSubscription1.meetingStartTime
      : getStartOfDaySecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: addOrRemoveWeeks({
            secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
            weeks: -1,
          }),
        })

  const subscription2 = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({
          id,
          avatar,
          firstName,
          lastName,
          fullName,
          userAvatarColor,
        }) => ({
          id,
          avatar,
          firstName,
          lastName,
          fullName,
          userAvatarColor,
        }),
      }),
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        target: {
          id: props.meetingId,
        },
        map: ({
          todosActives,
          recentlySolvedIssues,
          attendeesLookup,
          notes,
          currentMeetingAttendee,
          concludeActions,
          currentMeetingInstance,
        }) => ({
          notes: notes({
            map: ({ title, dateCreated }) => ({
              title,
              dateCreated,
            }),
            sort: { dateCreated: 'desc' },
          }),
          attendees: attendeesLookup({
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
          issuesForWrapUp: recentlySolvedIssues({
            filter: {
              and: [
                {
                  completed: true,
                  archived: false,
                  completedTimestamp: {
                    gte: wrapUpFilterTimestampForIssuesAndTodos,
                  },
                },
              ],
            },
            sort: {
              completedTimestamp: 'desc',
            },
            map: ({
              title,
              completed,
              completedTimestamp,
              archived,
              assignee,
              notesId,
            }) => ({
              title,
              completed,
              completedTimestamp,
              archived,
              notesId,
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
          todos: todosActives({
            filter: {
              and: [
                {
                  archived: false,
                  dateCreated: {
                    gte: wrapUpFilterTimestampForIssuesAndTodos,
                  },
                },
              ],
            },
            sort: {
              dateCreated: 'asc',
            },
            map: ({
              title,
              archived,
              completed,
              dueDate,
              dateCreated,
              notesId,
              assignee,
            }) => ({
              title,
              completed,
              dueDate,
              archived,
              dateCreated,
              notesId,
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
          currentMeetingAttendee: currentMeetingAttendee({
            map: ({ permissions }) => ({
              permissions: permissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
          }),
          concludeActions: concludeActions({
            map: ({
              includeMeetingNotesInEmailSummary,
              archiveCompletedTodos,
              archiveHeadlines,
              sendEmailSummaryTo,
              feedbackStyle,
              displayMeetingRatings,
            }) => ({
              includeMeetingNotesInEmailSummary,
              archiveCompletedTodos,
              archiveHeadlines,
              sendEmailSummaryTo,
              feedbackStyle,
              displayMeetingRatings,
            }),
          }),
          currentMeetingInstance: currentMeetingInstance({
            map: ({
              meetingStartTime,
              leaderId,
              selectedNotes,
              attendeeInstances,
            }) => ({
              meetingStartTime,
              leaderId,
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
                    }) => ({
                      id,
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
      }),
    },
    {
      subscriptionId: `WrapupContainer-query2-${props.meetingId}`,
    }
  )

  const getCurrentUserPermissions = useComputed(
    () => {
      return getWrapUpPagePermissions(
        subscription2().data.meeting.currentMeetingAttendee.permissions
      )
    },
    { name: 'wrapUpContainer-getCurrentUserPermissions' }
  )

  const getQuickAddMeetingAttendeesLookup = useComputed(
    () => {
      return (subscription2().data.meeting.attendees.nodes || []).map(
        (attendee) => {
          return {
            value: attendee.id,
            metadata: {
              firstName: attendee.firstName,
              lastName: attendee.lastName,
              fullName: attendee.fullName,
              avatar: attendee.avatar,
              userAvatarColor: attendee.userAvatarColor,
            },
          }
        }
      )
    },
    { name: 'wrapUpContainer-getQuickAddMeetingAttendeesLookup' }
  )

  const getMeetingPageName = useComputed(
    () => {
      return props.getPageToDisplayData()?.pageName || terms.wrapUp.singular
    },
    { name: 'wrapUpContainer-getMeetingPageName' }
  )

  const onQuickAddTodoEnter: IWrapUpActionHandlers['onQuickAddTodoEnter'] =
    useAction(async (todo) => {
      try {
        const notesId = await createNote({
          notes: '',
        })

        await createTodo({
          meetingRecurrenceId: subscription2().data.meeting.id,
          assigneeId: todo.assigneeId,
          title: todo.title,
          dueDate: addOrRemoveDays({
            secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
            days: 7,
          }),
          notesId,
          context: null,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error creating {{todo}}`, {
            todo: terms.todo.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
      }
    })

  const onUpdateTodo: IWrapUpActionHandlers['onUpdateTodo'] = useAction(
    async (values) => {
      try {
        if (values.id) {
          await editTodo({
            todoId: values.id,
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
    }
  )

  const onTodoClicked: IWrapUpActionHandlers['onTodoClicked'] = useAction(
    (opts) => {
      openOverlazy('EditTodoDrawer', {
        todoId: opts.todoId,
        meetingId: subscription2().data.meeting.id,
      })
    }
  )

  const onCreateContextAwareTodoFromIssue: IWrapUpActionHandlers['onCreateContextAwareTodoFromIssue'] =
    useAction((opts) => {
      openOverlazy('CreateTodoDrawer', {
        meetingId: subscription2().data.meeting.id,
        context: opts,
      })
    })

  const onCreateContextAwareIssueFromTodo: IWrapUpActionHandlers['onCreateContextAwareIssueFromTodo'] =
    useAction((opts) => {
      openOverlazy('CreateIssueDrawer', {
        context: opts,
        meetingId: subscription2().data.meeting.id,
        initialItemValues: {
          title: opts.title,
        },
      })
    })

  const onConclude: IWrapUpActionHandlers['onConclude'] = useAction(
    async (value) => {
      props.onConclude()
      const selectedNoteIds = value.meetingNotes
        .filter((note) => note.selected === true && note.id)
        .map((note) => note.id)
      try {
        await concludeMeeting({
          displayMeetingRatings: false,
          meetingId: subscription2().data.meeting.id,
          endTime: getSecondsSinceEpochUTC(),
          archiveCompletedTodos: value.archiveCompletedTodos,
          archiveHeadlines: value.archiveHeadlines,
          sendEmailSummaryTo:
            value.sendEmailSummaryTo === 'ALL_ATTENDEES'
              ? ESendTo.ALL_ATTENDEES
              : value.sendEmailSummaryTo === 'ALL_ATTENDEES_RATED_MEETING'
                ? ESendTo.ALL_ATTENDEES_RATED_MEETING
                : ESendTo.NONE,
          includeMeetingNotesInEmailSummary:
            value.includeMeetingNotesInEmailSummary,
          selectedNotes: selectedNoteIds,
          feedbackStyle:
            subscription2().data.meeting.concludeActions.feedbackStyle,
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t('Meeting concluded successfully.'),
          undoClicked: () =>
            console.log(
              '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
            ),
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to conclude meeting'),
          error: new UserActionError(e),
        })
      }
    }
  )

  const onCreateNotes: IWrapUpActionHandlers['onCreateNotes'] = useAction(
    async (opts) => {
      return createNote(opts)
    }
  )

  const onMeetingInstanceAttendeeUpdated: IWrapUpActionHandlers['onMeetingInstanceAttendeeUpdated'] =
    useAction(async (opts) => {
      const currentMeetingInstanceId =
        subscription1().data.meeting.currentMeetingInstance?.id

      if (currentMeetingInstanceId) {
        try {
          await editMeetingInstanceAttendee({
            meetingInstanceId: currentMeetingInstanceId,
            userId: opts.userId,
            rating: opts.rating,
            notesText: opts.notesText,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error updating attendee`),
            error: new UserActionError(error),
          })
        }
      }
    })

  const onUpdateSelectedMeetingNotes = useAction(
    async (opts: {
      meetingInstanceId: Id
      meetingNotes: Array<{
        id: Id
        title: string
        selected: boolean
      }>
    }) => {
      const { meetingInstanceId, meetingNotes } = opts

      const selectedNotes = meetingNotes
        .filter((note) => note.selected)
        .map((note) => note.id)

      await editMeetingInstance({ meetingInstanceId, selectedNotes })
    }
  )

  const onUpdateWrapUpVotingActions: IWrapUpActionHandlers['onUpdateWrapUpVotingActions'] =
    useAction(async (opts) => {
      try {
        await editMeetingConcludeActions({
          meetingId: subscription2().data.meeting.id,
          concludeActions: {
            feedbackStyle: opts.feedbackStyle,
            displayMeetingRatings: opts.displayMeetingRatings,
          },
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error updating meeting`),
          error: new UserActionError(error),
        })
      }
    })

  const onUpdateWrapUpMeetingValues: IWrapUpActionHandlers['onUpdateWrapUpMeetingValues'] =
    useAction(async (opts) => {
      try {
        const currentMeetingInstanceId =
          subscription1().data.meeting.currentMeetingInstance?.id

        const shouldIncludeMeetingNotes =
          opts.includeMeetingNotesInEmailSummary ||
          subscription2().data.meeting.concludeActions
            .includeMeetingNotesInEmailSummary

        if (
          opts.meetingNotes &&
          currentMeetingInstanceId &&
          shouldIncludeMeetingNotes
        ) {
          await onUpdateSelectedMeetingNotes({
            meetingInstanceId: currentMeetingInstanceId,
            meetingNotes: opts.meetingNotes,
          })
        } else if (
          opts.includeMeetingNotesInEmailSummary === false &&
          currentMeetingInstanceId
        ) {
          await onUpdateSelectedMeetingNotes({
            meetingInstanceId: currentMeetingInstanceId,
            meetingNotes: [],
          })
        }

        await editMeeting({
          meetingId: subscription2().data.meeting.id,
          concludeActions: {
            includeMeetingNotesInEmailSummary:
              opts.includeMeetingNotesInEmailSummary,
            archiveCompletedTodos: opts.archiveCompletedTodos,
            archiveHeadlines: opts.archiveHeadlines,
            sendEmailSummaryTo: opts.sendEmailSummaryTo,
          },
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error updating meeting feedback`),
          error: new UserActionError(error),
        })
      }
    })

  const onUpdateIssue: IWrapUpActionHandlers['onUpdateIssue'] = useAction(
    async ({ issueId, value }) => {
      try {
        await editIssue({
          id: issueId,
          completed: value,
          completedTimestamp: value ? getSecondsSinceEpochUTC() : null,
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t(`Issue {{status}}`, {
            status: value ? 'solved' : 'unsolved',
          }),
          undoClicked: () => {
            // @TODO_BLOOM https://winterinternational.atlassian.net/browse/TTD-1491
          },
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error {{status}} this {{issue}}`, {
            status: value ? 'solving' : 'unsolving',
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    }
  )

  const getTodosData = useComputed(
    () => {
      return subscription2().data.meeting.todos.nodes
    },
    { name: 'wrapUpContainer-getTodosData' }
  )

  const getIssuesData = useComputed(
    () => {
      return subscription2().data.meeting.issuesForWrapUp.nodes
    },
    { name: 'wrapUpContainer-getIssuesData' }
  )

  const getMeetingNotes = useComputed(
    () => {
      return subscription2().data.meeting.notes.nodes.map((note) => ({
        id: note.id,
        title: note.title,
        selected: (
          subscription2().data.meeting.currentMeetingInstance?.selectedNotes ||
          []
        ).includes(note.id),
      }))
    },
    { name: 'wrapUpContainer-getMeetingNotes' }
  )

  const getData = useComputed(
    () => {
      return {
        getMeetingPageName,
        currentUser: subscription2().data.currentUser,
        getCurrentUserPermissions,
        isCurrentUserMeetingLeader:
          subscription2().data.meeting.currentMeetingInstance?.leaderId ===
          subscription2().data.currentUser.id,
        getIssuesData,
        getTodosData,
        getQuickAddMeetingAttendeesLookup,
        meetingInstanceAttendees:
          subscription2().data.meeting.currentMeetingInstance?.attendeeInstances
            .nodes ?? [],
        archiveCompletedTodos:
          subscription2().data.meeting.concludeActions.archiveCompletedTodos,
        archiveHeadlines:
          subscription2().data.meeting.concludeActions.archiveHeadlines,
        includeMeetingNotesInEmailSummary:
          subscription2().data.meeting.concludeActions
            .includeMeetingNotesInEmailSummary,
        getMeetingNotes,
        sendEmailSummaryTo:
          subscription2().data.meeting.concludeActions.sendEmailSummaryTo,
        isLoading: subscription2().querying,
        displayMeetingRatings:
          subscription2().data.meeting.concludeActions.displayMeetingRatings,
        feedbackStyle:
          subscription2().data.meeting.concludeActions.feedbackStyle,
      }
    },
    { name: 'wrapUpContainer-getData' }
  )

  const getActions = useComputed(
    () => {
      return {
        onCreateNotes,
        onQuickAddTodoEnter,
        onCreateContextAwareTodoFromIssue,
        onCreateContextAwareIssueFromTodo,
        onUpdateTodo,
        onTodoClicked,
        onConclude,
        onMeetingInstanceAttendeeUpdated,
        onUpdateWrapUpMeetingValues,
        onUpdateWrapUpVotingActions,
        onUpdateIssue,
      }
    },
    { name: 'wrapUpContainer-getActions' }
  )

  const Component = props.children
  return (
    <Component
      className={props.className}
      getData={getData}
      getActions={getActions}
    />
  )
})
