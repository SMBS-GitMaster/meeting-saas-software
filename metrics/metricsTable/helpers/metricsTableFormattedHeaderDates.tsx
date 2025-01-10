import React from 'react'

import { getDateFromSecondsSinceEpochUTC } from '@mm/core/date'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { i18n } from '@mm/core/i18n'

import { MetricFrequency } from '@mm/core-bloom'

export function getMetricsTableFormattedHeaderDates(props: {
  frequency: MetricFrequency
  startDate: number
  endDate: number
  toString: true
}): string
export function getMetricsTableFormattedHeaderDates(props: {
  frequency: MetricFrequency
  startDate: number
  endDate: number
  toString: false
}): JSX.Element
export function getMetricsTableFormattedHeaderDates(props: {
  frequency: MetricFrequency
  startDate: number
  endDate: number
  toString: boolean
}) {
  const {
    frequency,
    startDate: startDateTimestamp,
    endDate: endDateTimestamp,
    toString,
  } = props

  const startDate = getDateFromSecondsSinceEpochUTC({
    secondsSinceEpochUTC: startDateTimestamp,
  })

  const endDate = getDateFromSecondsSinceEpochUTC({
    secondsSinceEpochUTC: endDateTimestamp,
  })

  switch (frequency) {
    case 'QUARTERLY': {
      const formattedQuarter = `${i18n.t('Q')}${startDate.quarter}`
      const formattedYear = `${startDate.year}`

      return toString ? (
        `${formattedQuarter} - ${formattedYear}`
      ) : (
        <>
          {formattedQuarter} <br /> {formattedYear}
        </>
      )
    }
    case 'MONTHLY': {
      const formattedMonth = `${startDate.monthShort}`
      const formattedYear = `${startDate.year}`

      return toString ? (
        `${formattedMonth} - ${formattedYear}`
      ) : (
        <>
          {formattedMonth} <br /> {formattedYear}
        </>
      )
    }
    case 'WEEKLY': {
      const formattedStartDate = `${startDate.day} ${startDate.monthShort}`
      const formattedEndDate = `${endDate.day} ${endDate.monthShort}`

      return toString ? (
        `${formattedStartDate} - ${formattedEndDate}`
      ) : (
        <>
          {formattedStartDate} <br /> {formattedEndDate}
        </>
      )
    }
    case 'DAILY': {
      const formattedMonthShort = `${startDate.monthShort}`
      const formattedDay = `${startDate.day}`

      return toString ? (
        `${formattedMonthShort} ${formattedDay}`
      ) : (
        <>
          {formattedMonthShort} <br /> {formattedDay}
        </>
      )
    }
    default:
      throw new UnreachableCaseError(frequency as never)
  }
}

export const getMetricsListShortDateRanges = (props: {
  frequency: MetricFrequency
  startDate: number
  endDate: number
}) => {
  const startDate = getDateFromSecondsSinceEpochUTC({
    secondsSinceEpochUTC: props.startDate,
  })
  const endDate = getDateFromSecondsSinceEpochUTC({
    secondsSinceEpochUTC: props.endDate,
  })

  switch (props.frequency) {
    case 'QUARTERLY':
      return `${i18n.t('Q')}${startDate.quarter} ${startDate.toFormat('yy')}`

    case 'MONTHLY':
      return `${startDate.toFormat('MM')}/${startDate.toFormat('yy')}`

    case 'WEEKLY':
      const formattedStartDate = `${startDate.toFormat('M/d')}`
      const formattedEndDate = `${endDate.toFormat('M/d')}`
      return `${formattedStartDate}-${formattedEndDate}`

    case 'DAILY':
      return `${startDate.monthShort} ${startDate.day}`

    default:
      throw new UnreachableCaseError(props.frequency as never)
  }
}
