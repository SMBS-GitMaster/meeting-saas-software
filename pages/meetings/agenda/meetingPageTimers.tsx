import { type Id } from '@mm/gql'

import { useTimeController } from '@mm/core/date'

import {
  IOngoingMeetingCurrentPageDisplayTimers,
  IOngoingMeetingCurrentPageTimers,
} from '@mm/core-bloom'

export interface IGetMeetingCurrentPageTimersOpts {
  meetingIsPaused: boolean
  currentPage: Maybe<{
    id: Id
    expectedDurationS: string | number
    timer: {
      timeLastPaused: Maybe<number>
      timeLastStarted: number
      timePreviouslySpentS: Maybe<number>
      timeSpentPausedS: number
    }
  }>
  scheduledMeetingDuration: number
}

export function useGetMeetingCurrentPageTimers(
  opts: IGetMeetingCurrentPageTimersOpts
): Maybe<IOngoingMeetingCurrentPageTimers> {
  const { getTime } = useTimeController()

  const { currentPage, meetingIsPaused } = opts

  const currentTime = getTime()

  if (currentPage == null) {
    return null
  }

  function getTimeSpentOnPageS() {
    if (!currentPage || !currentPage.timer.timeLastStarted) {
      return 0
    }

    if (meetingIsPaused) {
      const timeLastPaused = currentPage.timer.timeLastPaused || currentTime
      return Math.max(
        Math.floor(
          (timeLastPaused - currentPage.timer.timeLastStarted) / 1000 +
            (currentPage.timer.timePreviouslySpentS || 0) -
            currentPage.timer.timeSpentPausedS
        ),
        0
      )
    } else {
      return Math.floor(
        currentTime -
          currentPage.timer.timeLastStarted +
          (currentPage.timer.timePreviouslySpentS || 0) -
          currentPage.timer.timeSpentPausedS
      )
    }
  }

  const expectedDurationS = Number(currentPage.expectedDurationS)
  const timeSpentOnPageS = getTimeSpentOnPageS()

  const remainingS = expectedDurationS - timeSpentOnPageS

  const percentageOfTimeUsed = Math.min(
    Math.max((100 * timeSpentOnPageS) / expectedDurationS, 0),
    100
  )

  return {
    isOvertime: timeSpentOnPageS > expectedDurationS,
    elapsedS: timeSpentOnPageS,
    remainingS: remainingS,
    remainingPercentageOfExpectedTime: 100 - percentageOfTimeUsed,
    overtimeS: timeSpentOnPageS - expectedDurationS,
  }
}

function getLeadingZero(num: number) {
  const str = String(num < 0 ? num * -1 : num)
  return str.length === 1 ? `0${str}` : str
}

export function getCurrentPageDisplayTimer(opts: {
  currentPageTimers: Maybe<IOngoingMeetingCurrentPageTimers>
}): IOngoingMeetingCurrentPageDisplayTimers {
  const { currentPageTimers } = opts

  const isOvertime = currentPageTimers?.isOvertime
  const prefix = isOvertime ? '-' : ''
  const durationInSeconds = isOvertime
    ? currentPageTimers?.overtimeS
    : currentPageTimers?.remainingS

  const durationS = durationInSeconds || 0
  const durationM = Math.floor(durationS / 60)
  const durationH = Math.floor(durationM / 60)
  let time = ''
  const secondsFormat = getLeadingZero(durationS)
  const negate = durationM < 0 ? durationM * -1 : durationM

  const elapsedSecOnCurrentPage = currentPageTimers?.elapsedS || 0
  const elapsedMin =
    elapsedSecOnCurrentPage < 60 ? 0 : Math.floor(elapsedSecOnCurrentPage / 60)

  // Fix issue of preview having 00:00 due to 60 minutes in durationM is 0
  if (negate === 60) {
    time = `${getLeadingZero(durationM)}:${secondsFormat}`
  } else if (negate > 90) {
    time = `${getLeadingZero(durationH)}:${getLeadingZero(
      durationM
    )}:${secondsFormat}`
  } else {
    time = `${getLeadingZero(durationM)}:${secondsFormat}`
  }

  return {
    time: `${prefix}${time}`,
    moreThan90: negate > 90,
    elapsedMin: elapsedMin,
  }
}
