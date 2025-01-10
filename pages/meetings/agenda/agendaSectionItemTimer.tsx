import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTimeController } from '@mm/core/date/timeController'

import { IOngoingMeetingPageTimers } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { TextEllipsis, useTheme } from '@mm/core-web/ui'

interface IAgendaSectionItemTimerProps {
  currentPageTimeInfo: Maybe<IOngoingMeetingPageTimers>
  currentPageExpectedDurationS: Maybe<number>
  className?: string
}

export const AgendaSectionItemTimer = observer(function AgendaSectionItemTimer(
  props: IAgendaSectionItemTimerProps
) {
  const theme = useTheme()
  const { t } = useTranslation()
  const { getTime } = useTimeController()

  const currentTime = getTime()

  const { currentPageTimeInfo, currentPageExpectedDurationS } = props

  if (!currentPageTimeInfo || !currentPageExpectedDurationS) {
    return null
  }

  // `currentTime` falls slightly behind currentPageTimeInfo.timeLastStarted
  // so sometimes this returns a negative number
  // which is why we use `Math.max` to prevent that
  const timeSpentOnPageM = Math.max(
    Math.floor(
      (currentTime -
        currentPageTimeInfo.timeLastStarted +
        (currentPageTimeInfo.timePreviouslySpentS || 0)) /
        60
    ),
    0
  )
  const remainingM =
    Math.floor(currentPageExpectedDurationS / 60) - timeSpentOnPageM
  const isOvertime = remainingM < 1
  const hideOvertime = remainingM < -99
  const remainingMWithAPlus = remainingM.toString().replace('-', '+')

  return (
    <>
      <TextEllipsis
        lineLimit={1}
        className={props.className}
        type={'body'}
        weight='semibold'
        css={css`
          ${isOvertime &&
          css`
            color: ${theme.colors.agendaMeetingTimerRunningLong};
          `}
        `}
      >
        {hideOvertime ? t('+') : `${remainingMWithAPlus}${t('m')}`}
      </TextEllipsis>
    </>
  )
})
