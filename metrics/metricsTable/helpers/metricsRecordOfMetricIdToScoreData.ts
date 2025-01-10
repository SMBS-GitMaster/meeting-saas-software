import { computed } from 'mobx'

import { type Id } from '@mm/gql'

import { addOrRemoveWeeks, getTimeController } from '@mm/core/date'

import {
  MetricFrequency,
  MetricGoalInfoType,
  MetricRules,
  MetricUnits,
  PermissionCheckResult,
  UserPermissionType,
  WeekStartType,
  getBloomCustomTerms,
  getTextValueFromNumericStringValueForMetricYesNoUnits,
  isMetricCustomGoalWithinDateRange,
} from '@mm/core-bloom'

import { getMetricSpecificPermissions } from '../metricTablePermissions'
import {
  IMetricTableDataItem,
  IMetricTableDataItemCustomGoalData,
  IMetricTableDataItemScoreData,
} from '../metricsTableTypes'
import { type IPersonalMetricTableDataItem } from '../personalMetricsTable/personalMetricsTableTypes'
import { getMetricsTableFormattedHeaderDates } from './metricsTableFormattedHeaderDates'

type TrackedMetricsType = { metric: IMetricTableDataItem }

const isTrackedMetric = (
  metric:
    | IMetricTableDataItem
    | TrackedMetricsType
    | IPersonalMetricTableDataItem
): metric is TrackedMetricsType => {
  return metric ? (metric as TrackedMetricsType).metric !== undefined : false
}

export const getMetricsRecordOfMetricIdToScoreData = (props: {
  metrics: Array<IMetricTableDataItem | TrackedMetricsType>
  metricScoreDateRanges: Array<{
    start: number
    end: number
  }>
  frequency: MetricFrequency
  startOfWeek: WeekStartType
  currentUserId: Id
  currentUserPermissions: Maybe<UserPermissionType>
  preventEditingUnownedMetrics: boolean
  highlightPreviousWeekForMetrics: boolean
  diResolver: IDIResolver
  sortDirection: 'TIMESTAMP_DESC' | 'TIMESTAMP_ASC'
}) => {
  const {
    metrics,
    metricScoreDateRanges,
    frequency,
    startOfWeek,
    currentUserId,
    currentUserPermissions,
    preventEditingUnownedMetrics,
    highlightPreviousWeekForMetrics,
    diResolver,
  } = props
  const terms = getBloomCustomTerms(diResolver)
  const { getSecondsSinceEpochUTC } = getTimeController(diResolver)

  const currentDateTimeValue = getSecondsSinceEpochUTC()

  const metricScoreDateRangesParsed = metricScoreDateRanges.map((dateRange) => {
    const startDate = dateRange.start
    const endDate = dateRange.end

    const previousWeekTimeValue = addOrRemoveWeeks({
      secondsSinceEpochUTC: currentDateTimeValue,
      weeks: -1,
    })

    const alwaysHighlightCurrentDate = frequency !== 'WEEKLY'

    const highlightedWeekIsWithinRange =
      highlightPreviousWeekForMetrics && !alwaysHighlightCurrentDate
        ? previousWeekTimeValue >= startDate && previousWeekTimeValue <= endDate
        : currentDateTimeValue >= startDate && currentDateTimeValue <= endDate

    const formattedDates = getMetricsTableFormattedHeaderDates({
      toString: true,
      frequency,
      startDate,
      endDate,
    })

    return {
      startDate,
      endDate,
      highlightedWeekIsWithinRange,
      formattedDates,
    }
  })

  return metrics.reduce(
    (acc, metricOrTrackedMetricItem) => {
      const metric = isTrackedMetric(metricOrTrackedMetricItem)
        ? metricOrTrackedMetricItem.metric
        : metricOrTrackedMetricItem

      const scoresToProcess = [...metric.scores]

      const dateRangesDataComputed = computed(
        () => {
          return metricScoreDateRangesParsed.map((dateRangeParsed) => {
            const {
              startDate,
              endDate,
              highlightedWeekIsWithinRange,
              formattedDates,
            } = dateRangeParsed

            const metricScoreMatchedToDateRange = scoresToProcess.find(
              (score) =>
                score.isTimestampWithinDateRange({
                  frequency: metric.frequency,
                  startDate,
                  endDate,
                  startOfWeek,
                })
            )

            const indexOfScore = metricScoreMatchedToDateRange
              ? scoresToProcess.indexOf(metricScoreMatchedToDateRange)
              : null

            if (indexOfScore != null && indexOfScore > -1) {
              // delete every score from scoresToProcess up to the score that was found
              // this is to prevent having to traverse the entire scores array for every metric
              scoresToProcess.splice(0, indexOfScore + 1)
            }

            const customGoalData = metric.customGoals.nodes.reduce(
              (acc, customGoal) => {
                const isCustomGoalWithinDateRange =
                  isMetricCustomGoalWithinDateRange({
                    customGoalStartDate: customGoal.startDate,
                    customGoalEndDate: customGoal.endDate,
                    dateRangeStartDate: startDate,
                    dateRangeEndDate: endDate,
                  })

                if (isCustomGoalWithinDateRange) {
                  if (acc === null) {
                    acc = customGoal
                  } else {
                    if (acc.startDate > customGoal.startDate) {
                      acc = customGoal
                    }
                  }
                }

                return acc
              },
              null as Maybe<IMetricTableDataItemCustomGoalData>
            )

            const cellNotesText = metricScoreMatchedToDateRange
              ? metricScoreMatchedToDateRange.notesText
              : null

            const scoreData = metricScoreMatchedToDateRange
              ? {
                  ...metricScoreMatchedToDateRange,
                  value:
                    // v1 prefills scores with an empty string, we want to ensure we don't convert to yes/no unless actual value
                    metric.units === 'YESNO' &&
                    metricScoreMatchedToDateRange.scoreValueRounded
                      ? getTextValueFromNumericStringValueForMetricYesNoUnits({
                          metricUnits: metric.units,
                          value:
                            metricScoreMatchedToDateRange.scoreValueRounded,
                          diResolver,
                        }) || ''
                      : metricScoreMatchedToDateRange.scoreValueRounded,
                }
              : null

            return {
              start: startDate,
              end: endDate,
              scoreData,
              customGoalData,
              highlightedWeekIsWithinRange,
              formattedDates,
              cellNotesText,
            }
          })
        },
        { name: 'getMetricsRecordOfMetricIdToScoreData-dateRangesData' }
      )

      acc[metric.id] = {
        id: metric.id,
        ownerId: metric.assignee.id,
        frequency: metric.frequency,
        units: metric.units,
        title: metric.title,
        goal: metric.goal,
        formula: metric.formula,
        notesId: metric.notesId,
        progressiveData: metric.metricData?.progressiveData || null,
        rule: metric.rule,
        assignee: {
          fullName: metric.assignee.fullName,
        },
        metricDivider: metric.metricDivider,
        permissions: getMetricSpecificPermissions({
          currentUserPermissions,
          isCurrentUserOwner: currentUserId === metric.assignee.id,
          preventEditingUnownedMetrics,
          terms,
        }),
        getDateRangesData: () => dateRangesDataComputed.get(),
      }

      return acc
    },
    {} as Record<
      Id,
      {
        id: Id
        ownerId: Id
        frequency: MetricFrequency
        units: MetricUnits
        title: string
        notesId: Id
        goal: MetricGoalInfoType
        formula: Maybe<string>
        progressiveData: Maybe<{ targetDate: number; sum: string }>
        rule: MetricRules
        assignee: {
          fullName: string
        }
        metricDivider: Maybe<{
          title: string
          height: number
          id: Id
          indexInTable: number
        }>
        permissions: { canEditMetricsInMeeting: PermissionCheckResult }
        getDateRangesData: () => Array<{
          start: number
          end: number
          scoreData: Maybe<IMetricTableDataItemScoreData>
          customGoalData: Maybe<IMetricTableDataItemCustomGoalData>
          highlightedWeekIsWithinRange: boolean
          formattedDates: string | JSX.Element
          cellNotesText: Maybe<string>
        }>
      }
    >
  )
}

export const getMetricScoreData = (props: {
  metric:
    | IMetricTableDataItem
    | TrackedMetricsType
    | IPersonalMetricTableDataItem
  metricScoreDateRanges: Array<{
    start: number
    end: number
  }>
  frequency: MetricFrequency
  startOfWeek: WeekStartType
  currentUserId: Id
  currentUserPermissions: Maybe<UserPermissionType>
  preventEditingUnownedMetrics: boolean
  highlightPreviousWeekForMetrics: boolean
  diResolver: IDIResolver
}) => {
  const {
    metric: metricData,
    metricScoreDateRanges,
    frequency,
    startOfWeek,
    currentUserId,
    currentUserPermissions,
    preventEditingUnownedMetrics,
    highlightPreviousWeekForMetrics,
    diResolver,
  } = props
  const terms = getBloomCustomTerms(diResolver)
  const { getSecondsSinceEpochUTC } = getTimeController(diResolver)

  const currentDateTimeValue = getSecondsSinceEpochUTC()

  const metric = isTrackedMetric(metricData) ? metricData.metric : metricData

  const metricDivder = 'metricDivider' in metric ? metric.metricDivider : null

  const metricScoreDateRangesParsed = metricScoreDateRanges.map((dateRange) => {
    const startDate = dateRange.start
    const endDate = dateRange.end

    const previousWeekTimeValue = addOrRemoveWeeks({
      secondsSinceEpochUTC: currentDateTimeValue,
      weeks: -1,
    })

    const alwaysHighlightCurrentDate = frequency !== 'WEEKLY'

    const highlightedWeekIsWithinRange =
      highlightPreviousWeekForMetrics && !alwaysHighlightCurrentDate
        ? previousWeekTimeValue >= startDate && previousWeekTimeValue <= endDate
        : currentDateTimeValue >= startDate && currentDateTimeValue <= endDate

    const formattedDates = getMetricsTableFormattedHeaderDates({
      toString: true,
      frequency,
      startDate,
      endDate,
    })

    return {
      startDate,
      endDate,
      highlightedWeekIsWithinRange,
      formattedDates,
    }
  })

  const dateRangesDataComputed = computed(
    () => {
      const scoresToProcess = [...metric.scores]

      return metricScoreDateRangesParsed.map((dateRangeParsed) => {
        const {
          startDate,
          endDate,
          highlightedWeekIsWithinRange,
          formattedDates,
        } = dateRangeParsed

        const metricScoreMatchedToDateRange = scoresToProcess.find((score) =>
          score.isTimestampWithinDateRange({
            frequency: metric.frequency,
            startDate,
            endDate,
            startOfWeek,
          })
        )

        const indexOfScore = metricScoreMatchedToDateRange
          ? scoresToProcess.indexOf(metricScoreMatchedToDateRange)
          : null

        if (indexOfScore != null && indexOfScore > -1) {
          // delete every score from scoresToProcess up to the score that was found
          // this is to prevent having to traverse the entire scores array for every metric
          scoresToProcess.splice(0, indexOfScore + 1)
        }

        const customGoalData = metric.customGoals.nodes.reduce(
          (acc, customGoal) => {
            const isCustomGoalWithinDateRange =
              isMetricCustomGoalWithinDateRange({
                customGoalStartDate: customGoal.startDate,
                customGoalEndDate: customGoal.endDate,
                dateRangeStartDate: startDate,
                dateRangeEndDate: endDate,
              })

            if (isCustomGoalWithinDateRange) {
              if (acc === null) {
                acc = customGoal
              } else {
                if (acc.startDate > customGoal.startDate) {
                  acc = customGoal
                }
              }
            }

            return acc
          },
          null as Maybe<IMetricTableDataItemCustomGoalData>
        )

        const cellNotesText = metricScoreMatchedToDateRange
          ? metricScoreMatchedToDateRange.notesText
          : null

        const scoreData = metricScoreMatchedToDateRange
          ? {
              ...metricScoreMatchedToDateRange,
              value:
                // v1 prefills scores with an empty string, we want to ensure we don't convert to yes/no unless actual value
                metric.units === 'YESNO' &&
                metricScoreMatchedToDateRange.scoreValueRounded
                  ? getTextValueFromNumericStringValueForMetricYesNoUnits({
                      metricUnits: metric.units,
                      value: metricScoreMatchedToDateRange.scoreValueRounded,
                      diResolver,
                    }) || ''
                  : metricScoreMatchedToDateRange.scoreValueRounded,
            }
          : null

        return {
          id: `${metric.id}.${startDate}.${endDate}` as Id,
          start: startDate,
          end: endDate,
          scoreData,
          customGoalData,
          highlightedWeekIsWithinRange,
          formattedDates,
          cellNotesText,
        }
      })
    },
    { name: 'getMetricScoreData-dateRangesData' }
  )

  const scoreData = {
    id: metric.id,
    ownerId: metric.assignee.id,
    frequency: metric.frequency,
    units: metric.units,
    title: metric.title,
    goal: metric.goal,
    formula: metric.formula,
    notesId: metric.notesId,
    progressiveData: metric.metricData?.progressiveData || null,
    rule: metric.rule,
    assignee: {
      fullName: metric.assignee.fullName,
    },
    metricDivider: metricDivder as Maybe<{
      title: string
      height: number
      id: Id
      indexInTable: number
    }>,
    permissions: getMetricSpecificPermissions({
      currentUserPermissions,
      isCurrentUserOwner: currentUserId === metric.assignee.id,
      preventEditingUnownedMetrics,
      terms,
    }),
    getDateRangesData: () => dateRangesDataComputed.get(),
  }

  return scoreData
}
