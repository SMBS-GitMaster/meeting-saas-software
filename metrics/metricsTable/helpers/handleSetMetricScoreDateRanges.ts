import {
  addOrRemoveQuarters,
  addOrRemoveWeeks,
  addOrRemoveYears,
  getEndOfDayForEndOfWeekSecondsSinceEpochUTCForDate,
  getEndOfQuarterSecondsSinceEpochUTCForDate,
  getEndOfYearSecondsSinceEpochUTCForDate,
  getStartOfQuarterSecondsSinceEpochUTCForDate,
  getStartOfWeekSecondsSinceEpochUTCForDate,
  getStartOfYearSecondsSinceEpochUTCForDate,
} from '@mm/core/date'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'

import { MetricFrequency } from '@mm/core-bloom'

export const handleSetMetricScoreDateRanges = (props: {
  direction: 'FORWARD' | 'BACKWARD'
  expandDateRanges: boolean
  frequency: MetricFrequency
  metricsDateRangeStartAndEndTimestamp: { startDate: number; endDate: number }
  handleSetMetricsDateRangeStartAndEndTimestamp: (opts: {
    startDate: number
    endDate: number
  }) => void
}) => {
  const {
    direction,
    expandDateRanges,
    frequency,
    metricsDateRangeStartAndEndTimestamp,
    handleSetMetricsDateRangeStartAndEndTimestamp,
  } = props

  if (direction === 'FORWARD') {
    switch (frequency) {
      case 'WEEKLY': {
        const nextQuarterDate = addOrRemoveQuarters({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.endDate,
          quarters: 1,
        })
        const updatedEndDate = getEndOfQuarterSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: nextQuarterDate,
        })

        const updatedStartDate = getStartOfQuarterSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: updatedEndDate,
        })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          startDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.startDate
            : updatedStartDate,
          endDate: updatedEndDate,
        })
      }
      case 'MONTHLY': {
        const nextYearDate = addOrRemoveYears({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.endDate,
          years: 1,
        })

        const updatedEndDate = getEndOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: nextYearDate,
        })

        const updatedStartDate = getStartOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: nextYearDate,
        })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          startDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.startDate
            : updatedStartDate,
          endDate: updatedEndDate,
        })
      }
      case 'QUARTERLY': {
        // Note: we display 3 years of metric quarterly data at a time.
        const nextThreeYearsDateEnd = addOrRemoveYears({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.endDate,
          years: 3,
        })

        const nextThreeYearsDateStart = addOrRemoveYears({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.startDate,
          years: 3,
        })

        const updatedEndDate = getEndOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: nextThreeYearsDateEnd,
        })

        const updatedStartDate = getStartOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: nextThreeYearsDateStart,
        })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          startDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.startDate
            : updatedStartDate,
          endDate: updatedEndDate,
        })
      }
      case 'DAILY': {
        const nextWeekDate = addOrRemoveWeeks({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.endDate,
          weeks: 1,
        })
        const updatedEndDate =
          getEndOfDayForEndOfWeekSecondsSinceEpochUTCForDate({
            secondsSinceEpochUTC: nextWeekDate,
          })

        const updatedStartDate = getStartOfWeekSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: updatedEndDate,
        })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          startDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.startDate
            : updatedStartDate,
          endDate: updatedEndDate,
        })
      }
      default:
        throw new UnreachableCaseError(frequency as never)
    }
  } else {
    switch (frequency) {
      case 'WEEKLY': {
        const previousQuarterDate = addOrRemoveQuarters({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.startDate,
          quarters: -1,
        })

        const updatedStartDate = getStartOfQuarterSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: previousQuarterDate,
        })

        const updatedEndDate = getEndOfQuarterSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: previousQuarterDate,
        })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          endDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.endDate
            : updatedEndDate,
          startDate: updatedStartDate,
        })
      }
      case 'MONTHLY': {
        const previousYearDate = addOrRemoveYears({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.startDate,
          years: -1,
        })

        const updatedStartDate = getStartOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: previousYearDate,
        })

        const updatedEndDate = getEndOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: previousYearDate,
        })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          endDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.endDate
            : updatedEndDate,
          startDate: updatedStartDate,
        })
      }
      case 'QUARTERLY': {
        // Note: we display 3 years of metric quarterly data at a time.
        const previousThreeYearsDateStart = addOrRemoveYears({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.startDate,
          years: -3,
        })

        const previousThreeYearsDateEnd = addOrRemoveYears({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.endDate,
          years: -3,
        })

        const updatedStartDate = getStartOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: previousThreeYearsDateStart,
        })

        const updatedEndDate = getEndOfYearSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: previousThreeYearsDateEnd,
        })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          endDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.endDate
            : updatedEndDate,
          startDate: updatedStartDate,
        })
      }
      case 'DAILY': {
        const previousWeekDate = addOrRemoveWeeks({
          secondsSinceEpochUTC: metricsDateRangeStartAndEndTimestamp.startDate,
          weeks: -1,
        })

        const updatedStartDate = getStartOfWeekSecondsSinceEpochUTCForDate({
          secondsSinceEpochUTC: previousWeekDate,
        })

        const updatedEndDate =
          getEndOfDayForEndOfWeekSecondsSinceEpochUTCForDate({
            secondsSinceEpochUTC: previousWeekDate,
          })

        return handleSetMetricsDateRangeStartAndEndTimestamp({
          endDate: expandDateRanges
            ? metricsDateRangeStartAndEndTimestamp.endDate
            : updatedEndDate,
          startDate: updatedStartDate,
        })
      }
      default:
        throw new UnreachableCaseError(frequency as never)
    }
  }
}
