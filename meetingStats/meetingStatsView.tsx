import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { getShortDateDisplay } from '@mm/core/date'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Card, toREM } from '@mm/core-web/ui'

import { useOverlazyController } from '../bloomProvider/overlazy/overlazyController'
import { MeetingStatsAttendee } from './meetingStatsAttendee'
import { MeetingStatsCompleteSummary } from './meetingStatsCompleteSummary'
import { MeetingStatsFeedback } from './meetingStatsFeedback'
import { MeetingStatsStatistics } from './meetingStatsStatistics'
import {
  IMeetingStatsToDoCompleteSummaryData,
  IMeetingStatsToDoData,
  IMeetingStatsViewProps,
} from './meetingStatsTypes'

export const MeetingStatsView = function MeetingStatsView(
  props: IMeetingStatsViewProps
) {
  const { t } = useTranslation()
  const { openOverlazy } = useOverlazyController()

  const [showCompleteSummary, setShowCompleteSummary] = useState<boolean>(false)

  useEffect(() => {
    !props.data.currentUserSettings.doNotShowFeedbackModalAgain &&
      openOverlazy('FeedbackModal', { meetingId: props.data.meetingId })
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  return (
    <Card>
      <Card.Header
        css={css`
          margin-left: ${({ theme }) => theme.sizes.spacing24};
        `}
        renderLeft={
          <Card.Title>
            {props.data.meetingConcludedTime
              ? getShortDateDisplay({
                  secondsSinceEpochUTC: props.data.meetingConcludedTime,
                  userTimezone: 'utc',
                })
              : ''}{' '}
            {t('Meeting Statistics')}
          </Card.Title>
        }
      ></Card.Header>
      <Card.Body
        css={css`
          padding-top: ${(props) => props.theme.sizes.spacing24};
        `}
      >
        <div>
          <MeetingStatsStatistics
            issuesSolvedCount={props.data.issuesSolvedCount}
            meetingDurationInSeconds={props.data.meetingDurationInSeconds}
            todosCompletedPercentage={props.data.todosCompletedPercentage}
            issuesSolvedCountForTheQuarter={
              props.data.issuesSolvedCountForTheQuarter
            }
            meetingDurationDifferenceFromLastMeetingInMinutes={
              props.data.meetingDurationDifferenceFromLastMeetingInMinutes
            }
            todosCompletedPercentageDifferenceFromLastMeeting={
              props.data.todosCompletedPercentageDifferenceFromLastMeeting
            }
          />

          <MeetingStatsAttendee
            attendeesInstances={props.data.attendeeInstances}
            averageMeetingRating={props.data.averageMeetingRating}
          />
          {props.data.feedbackStyle === 'INDIVIDUAL' && (
            <MeetingStatsFeedback
              feedbackInstances={props.data.feedbackInstances}
            />
          )}
          <div
            css={css`
              padding-top: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            <BtnText
              onClick={() => {
                setShowCompleteSummary(!showCompleteSummary)
              }}
              iconProps={{
                iconName: showCompleteSummary
                  ? 'chevronDownIcon'
                  : 'chevronRightIcon',
                iconSize: 'lg',
              }}
              intent='tertiaryTransparent'
              width='noPadding'
              ariaLabel={t('See complete summary')}
              css={css`
                margin-left: ${(props) => props.theme.sizes.spacing16};
                padding-bottom: ${toREM(34)};
              `}
            >
              <StyledSpan>{t('See complete summary')}</StyledSpan>
            </BtnText>
            <MeetingStatsCompleteSummary
              data={props.data}
              showCompleteSummary={showCompleteSummary}
              headlines={props.data.headlines}
              todos={transformTodoList(props.data.todos)}
              solvedIssues={props.data.solvedIssues}
              recordOfSelectedNotesIdToNotesText={
                props.data.recordOfSelectedNotesIdToNotesText
              }
              timezone={props.data.timezone}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

function transformTodoList(list: Array<IMeetingStatsToDoData>) {
  const transformedArray: IMeetingStatsToDoCompleteSummaryData[] = []
  const assigneeMap = new Map()

  Object.values(list).forEach((item) => {
    const assigneeKey = `${item.assignee.firstName} ${item.assignee.lastName}`

    if (!assigneeMap.has(assigneeKey)) {
      assigneeMap.set(assigneeKey, {
        messages: [],
        assignee: { ...item.assignee },
      })
    }

    assigneeMap.get(assigneeKey).messages.push({
      dueDate: item.dueDate,
      title: item.title,
    })
  })

  assigneeMap.forEach((assignee) => {
    transformedArray.push(assignee as IMeetingStatsToDoCompleteSummaryData)
  })

  return transformedArray
}

const StyledSpan = styled.span`
  font-size: ${toREM(18)};
`
