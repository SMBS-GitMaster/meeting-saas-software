import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  getDateFromSecondsSinceEpochUTC,
  getMinutesAndSecondsFromSecondDiff,
} from '@mm/core/date'
import { useTimeController } from '@mm/core/date/timeController'

import { TextEllipsis, toREM, useTheme } from '@mm/core-web/ui'
import { Text } from '@mm/core-web/ui/components/text'

interface IAgendaCardMeetingTimerProps {
  meetingTimeInMinutes: number
  isPaused: boolean
  isCollapsedView: boolean
  meetingStartTime: number | undefined
  expectedMeetingDuration: number
  className?: string
}

export const AgendaCardMeetingTimer = observer(function AgendaCardMeetingTimer(
  props: IAgendaCardMeetingTimerProps
) {
  const theme = useTheme()
  const { getTime } = useTimeController()

  const currentTime = getTime()

  const meetingStartedTime = getDateFromSecondsSinceEpochUTC({
    secondsSinceEpochUTC: props.meetingStartTime || 0,
  })

  const meetingElapsedTime = getMinutesAndSecondsFromSecondDiff({
    startSeconds: currentTime,
    endSeconds: meetingStartedTime.toSeconds(),
  })

  const isMeetingRunningLate =
    props.expectedMeetingDuration < props.meetingTimeInMinutes

  return (
    <>
      {props.isCollapsedView ? (
        <div
          css={css`
            display: flex;
            flex-flow: row wrap;
            max-width: ${toREM(80)};
            width: ${toREM(80)};
            align-content: center;
            padding-left: ${(props) => props.theme.sizes.spacing8};
          `}
        >
          <TextEllipsis
            type='h1'
            weight='normal'
            tooltipProps={{ position: 'top center' }}
            css={css`
              word-break: break-all;

              ${isMeetingRunningLate &&
              css`
                color: ${theme.colors.agendaMeetingTimerRunningLong};
              `};
            `}
            lineLimit={1}
          >
            {meetingElapsedTime}
          </TextEllipsis>
        </div>
      ) : (
        <Text
          className={props.className}
          type={'large'}
          weight='normal'
          css={css`
            ${isMeetingRunningLate &&
            css`
              color: ${theme.colors.agendaMeetingTimerRunningLong};
            `}
          `}
        >
          {meetingElapsedTime}
        </Text>
      )}
    </>
  )
})
