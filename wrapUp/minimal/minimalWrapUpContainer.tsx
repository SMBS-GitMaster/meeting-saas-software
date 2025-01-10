import { observer } from 'mobx-react'
import React from 'react'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomMeetingMutations,
  useBloomMeetingNode,
} from '@mm/core-bloom'

import { ESendTo } from '@mm/core-bloom/meetings/mutations/concludeMeeting'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useAction, useComputed } from '../../pages/performance/mobx'
import { getWrapUpPagePermissions } from '../wrapUpPermissions'
import { IWrapUpActionHandlers } from '../wrapUpTypes'
import { IMinimalWrapUpContainerProps } from './minimalWrapUpTypes'

export const MinimalWrapUpContainer = observer(function MinimalWrapUpContainer(
  props: IMinimalWrapUpContainerProps
) {
  const { concludeMeeting, editMeeting, editMeetingInstance } =
    useBloomMeetingMutations()

  const { getSecondsSinceEpochUTC } = useTimeController()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const subscription = useSubscription(
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
              sendEmailSummaryTo,
              feedbackStyle,
              displayMeetingRatings,
            }) => ({
              includeMeetingNotesInEmailSummary,
              sendEmailSummaryTo,
              feedbackStyle,
              displayMeetingRatings,
            }),
          }),
          currentMeetingInstance: currentMeetingInstance({
            map: ({ meetingStartTime, leaderId, selectedNotes }) => ({
              meetingStartTime,
              leaderId,
              selectedNotes,
            }),
          }),
        }),
      }),
    },
    {
      subscriptionId: `MinimalWrapupContainer-${props.meetingId}`,
    }
  )

  const getCurrentUserPermissions = useComputed(
    () => {
      return getWrapUpPagePermissions(
        subscription().data.meeting.currentMeetingAttendee.permissions
      )
    },
    { name: 'MinimalWrapUpContainer-getCurrentUserPermissions' }
  )

  const onConclude: IWrapUpActionHandlers['onConclude'] = useAction(
    async (value) => {
      props.onConclude()
      const selectedNoteIds = value.meetingNotes
        .filter((note) => note.selected === true && note.id)
        .map((note) => note.id)
      try {
        await concludeMeeting({
          displayMeetingRatings: false,
          meetingId: subscription().data.meeting.id,
          endTime: getSecondsSinceEpochUTC(),
          archiveCompletedTodos: false,
          archiveHeadlines: false,
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
            subscription().data.meeting.concludeActions.feedbackStyle,
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

  const onUpdateWrapUpMeetingValues: IWrapUpActionHandlers['onUpdateWrapUpMeetingValues'] =
    useAction(async (opts) => {
      try {
        const currentMeetingInstanceId =
          subscription().data.meeting.currentMeetingInstance?.id

        const shouldIncludeMeetingNotes =
          opts.includeMeetingNotesInEmailSummary ||
          subscription().data.meeting.concludeActions
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
          meetingId: subscription().data.meeting.id,
          concludeActions: {
            includeMeetingNotesInEmailSummary:
              opts.includeMeetingNotesInEmailSummary,
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

  const getMeetingNotes = useComputed(
    () => {
      return subscription().data.meeting.notes.nodes.map((note) => ({
        id: note.id,
        title: note.title,
        selected: (
          subscription().data.meeting.currentMeetingInstance?.selectedNotes ||
          []
        ).includes(note.id),
      }))
    },
    { name: 'MinimalWrapUpContainer-getMeetingNotes' }
  )

  const getData = useComputed(
    () => {
      return {
        currentUser: subscription().data.currentUser,
        getCurrentUserPermissions,
        isCurrentUserMeetingLeader:
          subscription().data.meeting.currentMeetingInstance?.leaderId ===
          subscription().data.currentUser.id,
        includeMeetingNotesInEmailSummary:
          subscription().data.meeting.concludeActions
            .includeMeetingNotesInEmailSummary,
        getMeetingNotes,
        sendEmailSummaryTo:
          subscription().data.meeting.concludeActions.sendEmailSummaryTo,
        isLoading: subscription().querying,
        displayMeetingRatings:
          subscription().data.meeting.concludeActions.displayMeetingRatings,
        feedbackStyle:
          subscription().data.meeting.concludeActions.feedbackStyle,
      }
    },
    { name: 'MinimalWrapUpContainer-getData' }
  )

  const getActions = useComputed(
    () => {
      return {
        onConclude,
        onUpdateWrapUpMeetingValues,
      }
    },
    { name: 'MinimalWrapUpContainer-getActions' }
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
