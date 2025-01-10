import { observer } from 'mobx-react'
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu'
import { css } from 'styled-components'

import { type Id, useComputed } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'
import { usePreviousValue } from '@mm/core/ui/hooks'
import { uuid } from '@mm/core/utils'

import {
  UserPermissionType,
  getMetricNumberWithRemovedCommas,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
} from '@mm/core-bloom'
import { getMetricScoreTimestamp } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Clickable,
  FastList,
  HorizontalScrollLeftArrow,
  HorizontalScrollRightArrow,
  Text,
  TextEllipsis,
  toREM,
  usePreventBodyScroll,
  useRenderListItem,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useObservable,
  useObservablePreviousValue,
} from '@mm/bloom-web/pages/performance/mobx'

import {
  getMetricScoreData,
  getMetricsListShortDateRanges,
  getMetricsScoreValueFormattingValidationRule,
  getMetricsScoreValueMaxNumberValidationRule,
} from '../helpers'
import { MetricsCell } from '../metricsCell'
import { type IMetricListDateRange } from '../metricsList'
import { IMetricsTableViewData } from '../metricsTableTypes'
import {
  type IPersonalMetricTableDataItem,
  type IPersonalMetricTableMeetingItem,
  type IPersonalMetricsTableViewActions,
  type IPersonalMetricsTableViewData,
  type IPersonalMetricsTableViewProps,
} from './personalMetricsTableTypes'

export const PersonalMetricsList = observer(function PersonalMetricsList(
  props: IPersonalMetricsTableViewProps & {
    handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
  }
) {
  const componentState = useObservable({
    dateRanges: [] as Array<IMetricListDateRange>,
    selectedDateRange: null as Maybe<IMetricListDateRange>,
    metricsListRef: null as Maybe<HTMLDivElement>,
    leftArrowRef: null as Maybe<HTMLDivElement>,
    rightArrowRef: null as Maybe<HTMLDivElement>,
  })

  const { disableScroll, enableScroll } = usePreventBodyScroll()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { width, ready: metricsListDimensionsReady } = useResizeObserver(
    componentState.metricsListRef
  )
  const {
    width: leftArrowWidth,
    ready: leftArrowDimensionsReady,
    loadingUI: metricsListDimenionsLoadingUI,
  } = useResizeObserver(componentState.leftArrowRef)
  const { width: rightArrowWidth, ready: rightArrowDimensionsReady } =
    useResizeObserver(componentState.rightArrowRef)

  const previousTab = useObservablePreviousValue(
    () => props.data().selectedFrequencyTab
  )

  const horizontalScrollArrowWidth =
    leftArrowDimensionsReady && rightArrowDimensionsReady
      ? leftArrowWidth + rightArrowWidth + 12
      : 0
  const dateCellWidth = metricsListDimensionsReady
    ? `${(width - horizontalScrollArrowWidth) / 3}px`
    : `0px`

  const metricScoreDateRanges = props.data().getMetricScoreDateRanges()

  const setDateRanges = useAction((ranges: IMetricListDateRange[]) => {
    componentState.dateRanges = ranges
  })

  const setSelectedDateRange = useAction(
    (range: Maybe<IMetricListDateRange>) => {
      componentState.selectedDateRange = range
    }
  )

  const setMetricsListRef = useAction((el: Maybe<HTMLDivElement>) => {
    componentState.metricsListRef = el
  })

  const setLeftArrowRef = useAction((el: Maybe<HTMLDivElement>) => {
    componentState.leftArrowRef = el
  })

  const setRightArrowRef = useAction((el: Maybe<HTMLDivElement>) => {
    componentState.rightArrowRef = el
  })

  const isDateRangeSelected = (id: string) => {
    if (componentState.selectedDateRange) {
      return componentState.selectedDateRange.id === id
    }
    return false
  }

  const onDateItemClicked = (clickedDateRangeId: string) => {
    const selectedDateRange = componentState.dateRanges.find((dateRange) => {
      return clickedDateRangeId === dateRange.id
    })

    if (selectedDateRange !== undefined) {
      setSelectedDateRange(selectedDateRange)
    }
  }

  useEffect(() => {
    const dateRangesWithId = metricScoreDateRanges.map((dateRange) => {
      return {
        ...dateRange,
        id: uuid(),
      }
    })
    setDateRanges(dateRangesWithId)
  }, [metricScoreDateRanges])

  useEffect(() => {
    if (componentState.dateRanges.length !== 0) {
      const today = getSecondsSinceEpochUTC()
      const dateRangeToSelect = componentState.dateRanges.find((dateRange) => {
        return today >= dateRange.start && today <= dateRange.end
      })
      if (dateRangeToSelect) {
        setSelectedDateRange(dateRangeToSelect)
      } else {
        setSelectedDateRange(componentState.dateRanges[0])
      }
    }
  }, [componentState.dateRanges, setSelectedDateRange, getSecondsSinceEpochUTC])

  const renderListItem = useRenderListItem<IPersonalMetricTableMeetingItem>(
    (meetingWithMetrics) => {
      if (componentState.selectedDateRange === null) return null
      return (
        <div key={meetingWithMetrics.meetingId}>
          <Text
            css={css`
              background-color: ${meetingWithMetrics.meetingColor};
              border-radius: ${toREM(4)};
              margin-bottom: ${toREM(16)};
              margin-top: ${toREM(8)};
              padding: ${toREM(2)} ${toREM(6)};
            `}
          >
            {meetingWithMetrics.meetingName}
          </Text>
          {meetingWithMetrics.metrics.map((metric) => {
            return componentState.selectedDateRange ? (
              <PersonalMetricsListItem
                key={`${meetingWithMetrics.meetingId}-${metric.id}`}
                isLoading={props.data().isLoading}
                currentUserId={props.data().currentUserId}
                meetingId={meetingWithMetrics.meetingId}
                metric={metric}
                userPermissions={meetingWithMetrics.permissionsForMeeting}
                selectedFrequencyTab={props.data().selectedFrequencyTab}
                selectedDateRange={componentState.selectedDateRange}
                getMetricScoreDateRanges={props.data().getMetricScoreDateRanges}
                handleUpdateMetricScore={
                  props.actions().handleUpdateMetricScore
                }
                handleSetOverlazyScoreNodeId={
                  props.handleSetOverlazyScoreNodeId
                }
              />
            ) : null
          })}
        </div>
      )
    }
  )

  return (
    <div
      ref={setMetricsListRef}
      css={css`
        display: flex;
        flex-direction: column;
        width: 100%;
      `}
    >
      <div
        onMouseEnter={disableScroll}
        onMouseLeave={enableScroll}
        css={css`
          background-color: ${({ theme }) => theme.colors.cardBackgroundColor};
          padding-top: ${({ theme }) => theme.sizes.spacing4};
          position: sticky;
          top: 0;
          z-index: 1;

          .react-horizontal-scrolling-menu--inner-wrapper {
            align-items: center;
          }

          .react-horizontal-scrolling-menu--scroll-container::-webkit-scrollbar {
            display: none;
          }

          .react-horizontal-scrolling-menu--scroll-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          button {
            margin-top: 0;
          }
        `}
      >
        {metricsListDimenionsLoadingUI}
        <ScrollMenu
          LeftArrow={
            <div ref={setLeftArrowRef}>
              <HorizontalScrollLeftArrow
                css={css`
                  align-items: center;
                  border-radius: 50%;
                  display: flex;
                  height: ${({ theme }) => theme.sizes.spacing16};
                  justify-content: flex-start;
                  margin-bottom: 0;
                  margin-left: ${({ theme }) => theme.sizes.spacing4};
                  margin-right: ${({ theme }) => theme.sizes.spacing4};
                  margin-top: 0;
                  width: ${({ theme }) => theme.sizes.spacing16};
                `}
              />
            </div>
          }
          RightArrow={
            <div ref={setRightArrowRef}>
              <HorizontalScrollRightArrow
                css={css`
                  align-items: center;
                  border-radius: 50%;
                  display: flex;
                  height: ${({ theme }) => theme.sizes.spacing16};
                  justify-content: flex-end;
                  margin-bottom: 0;
                  margin-left: ${({ theme }) => theme.sizes.spacing4};
                  margin-right: ${({ theme }) => theme.sizes.spacing4};
                  margin-top: 0;
                  width: ${({ theme }) => theme.sizes.spacing16};
                `}
              />
            </div>
          }
        >
          {metricsListDimensionsReady
            ? componentState.dateRanges.map((dateRange) => {
                return (
                  <MetricsListDateItem
                    key={dateRange.id}
                    itemId={dateRange.id}
                    dateRange={dateRange}
                    metricsTableSelectedTab={props.data().selectedFrequencyTab}
                    width={width}
                    isSelected={isDateRangeSelected(dateRange.id)}
                    dateItemClicked={() => onDateItemClicked(dateRange.id)}
                    css={css`
                      margin-left: ${toREM(2)};
                      margin-right: ${toREM(2)};
                      width: ${dateCellWidth};
                    `}
                  />
                )
              })
            : []}
        </ScrollMenu>
      </div>
      <div
        css={css`
          padding: ${({ theme }) => theme.sizes.spacing8};
        `}
      >
        {componentState.selectedDateRange && (
          <FastList
            resetWhen={() =>
              previousTab.value !== props.data().selectedFrequencyTab
            }
            waitUntil={() => !props.data().isLoading}
            items={props.data().meetingMetrics}
            memoizedRenderListItem={renderListItem}
          />
        )}
      </div>
    </div>
  )
})

interface IMetricsListDateItemProps {
  itemId: string
  isSelected: boolean
  dateRange: IMetricListDateRange
  metricsTableSelectedTab: IMetricsTableViewData['metricsTableSelectedTab']
  width: number
  className?: string
  dateItemClicked: () => void
}

const MetricsListDateItem = observer(function MetricsListDateItem(
  props: IMetricsListDateItemProps
) {
  const previousWidth = usePreviousValue(props.width)
  const visibility = useContext(VisibilityContext)

  const formattedDateRange = getMetricsListShortDateRanges({
    frequency: props.metricsTableSelectedTab,
    startDate: props.dateRange.start,
    endDate: props.dateRange.end,
  })

  useEffect(() => {
    if (
      props.isSelected &&
      visibility.initComplete &&
      previousWidth !== props.width
    ) {
      const dateEleToScrollTo = visibility.getItemElementById(props.itemId)
      if (dateEleToScrollTo) {
        visibility.scrollToItem(dateEleToScrollTo, 'smooth', 'center')
      }
    }
  }, [props.isSelected, props.width, props.itemId, visibility, previousWidth])

  return (
    <Clickable
      id={props.itemId}
      clicked={() => {
        props.dateItemClicked()
      }}
    >
      <div
        className={props.className}
        css={css`
          border-radius: ${toREM(4)};
          display: flex;
          flex-direction: column;
          padding: ${toREM(8)} ${toREM(4)};
          text-align: center;

          ${props.isSelected
            ? css`
                background-color: ${({ theme }) =>
                  theme.colors.metricsListDateRangeItemSelectedBackgroundColor};
              `
            : css`
                background-color: ${({ theme }) =>
                  theme.colors
                    .metricsListDateRangeItemUnselectedBackgroundColor};
                border: ${({ theme }) =>
                  `${toREM(1)} solid ${theme.colors.cardBorderColor}`};
              `}
        `}
      >
        <TextEllipsis
          lineLimit={1}
          type='small'
          weight='semibold'
          wordBreak={true}
          css={css`
            ${props.isSelected
              ? css`
                  color: ${({ theme }) =>
                    theme.colors.metricsListDateRangeItemSelectedTextColor};
                `
              : css`
                  color: ${({ theme }) =>
                    theme.colors.metricsListDateRangeItemUnselectedTextColor};
                `}
          `}
        >
          {formattedDateRange}
        </TextEllipsis>
      </div>
    </Clickable>
  )
})

interface IPersonalMetricsListItemProps {
  isLoading: boolean
  currentUserId: Id
  meetingId: Maybe<Id>
  metric: IPersonalMetricTableDataItem
  userPermissions: UserPermissionType
  selectedFrequencyTab: IPersonalMetricsTableViewData['selectedFrequencyTab']
  selectedDateRange: IMetricListDateRange
  getMetricScoreDateRanges: IPersonalMetricsTableViewData['getMetricScoreDateRanges']
  handleUpdateMetricScore: IPersonalMetricsTableViewActions['handleUpdateMetricScore']
  handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
}

const PersonalMetricsListItem = observer(function PersonalMetricsListItem(
  props: IPersonalMetricsListItemProps
) {
  const diResolver = useDIResolver()
  const theme = useTheme()
  const { openOverlazy } = useOverlazyController()
  const { t } = useTranslation()

  const getScoreDataForMetric = useComputed(
    () => {
      return getMetricScoreData({
        metric: props.metric,
        metricScoreDateRanges: props.getMetricScoreDateRanges(),
        frequency: props.selectedFrequencyTab,
        startOfWeek: 'Sunday',
        currentUserId: props.currentUserId,
        preventEditingUnownedMetrics: false,
        currentUserPermissions: props.userPermissions,
        highlightPreviousWeekForMetrics: false,
        diResolver,
      })
    },
    {
      name: `personalMetricsList-getScoreDataForMetric-${props.metric.id}`,
    }
  )

  const canEditMetricsInMeeting =
    getScoreDataForMetric().permissions.canEditMetricsInMeeting

  const scoreForCurrentDateRange = getScoreDataForMetric()
    .getDateRangesData()
    .find((dateRangeData) => {
      return (
        dateRangeData.start === props.selectedDateRange.start &&
        dateRangeData.end === props.selectedDateRange.end
      )
    })

  const scoreFormValue = useMemo(() => {
    if (props.isLoading) {
      return null
    }
    return {
      score: scoreForCurrentDateRange?.scoreData?.value ?? '',
    }
  }, [props.isLoading, scoreForCurrentDateRange])

  const customGoal = scoreForCurrentDateRange?.customGoalData
    ? {
        goal: scoreForCurrentDateRange.customGoalData.goal(props.metric.units),
        metricRule: scoreForCurrentDateRange.customGoalData.rule,
      }
    : null

  const goalText = useMemo(() => {
    return isSingleValueMetricGoal(props.metric.goal)
      ? props.metric.goal.valueFormatted
      : isMinMaxMetricGoal(props.metric.goal)
        ? `${props.metric.goal.minData.minFormatted} - ${props.metric.goal.maxData.maxFormatted}`
        : t('N/A')
  }, [props.metric.goal, t])

  const formValidation = useMemo(() => {
    return {
      score: formValidators.string({
        additionalRules: [
          getMetricsScoreValueFormattingValidationRule({
            units: props.metric.units,
          }),
          getMetricsScoreValueMaxNumberValidationRule({
            units: props.metric.units,
          }),
        ],
        optional: true,
      }),
    } satisfies GetParentFormValidation<{ score: string }>
  }, [
    props.metric.units,
    t,
    getMetricsScoreValueFormattingValidationRule,
    getMetricsScoreValueMaxNumberValidationRule,
  ])

  const onSubmit = useCallback(
    async (values: { score: string }) => {
      if (scoreForCurrentDateRange) {
        const value = values.score
          ? getMetricNumberWithRemovedCommas(values.score)
          : null
        const timestamp = getMetricScoreTimestamp({
          frequency: props.metric.frequency,
          dateRangeStartDate: scoreForCurrentDateRange.start,
          weekStart: 'Sunday',
        })
        const metricId = props.metric.id
        const scoreId = scoreForCurrentDateRange.scoreData?.id ?? undefined

        // Note: we allow negative numbers and decimals, but if the BE mutation just sends - || . || -. without a number attached(like -1), the BE mutation will error out.
        if (value === '-' || value === '-.' || value === '.') {
          return
        }

        props.handleUpdateMetricScore({
          value,
          timestamp,
          metricId,
          scoreId,
          metricUnits: props.metric.units,
        })
      }
    },
    [
      scoreForCurrentDateRange,
      props.metric.id,
      props.metric.frequency,
      props.metric.units,
      props.handleUpdateMetricScore,
    ]
  )

  if (!scoreForCurrentDateRange) {
    return null
  }

  return (
    <>
      <div
        css={css`
          align-items: center;
          border: ${({ theme }) =>
            `${toREM(1)} solid ${theme.colors.cardBorderColor}`};
          border-radius: ${({ theme }) => theme.sizes.br1};
          display: flex;
          justify-content: space-between;
          margin-bottom: ${({ theme }) => theme.sizes.spacing8};
          padding-bottom: ${({ theme }) => theme.sizes.spacing8};
          padding-left: ${({ theme }) => theme.sizes.spacing8};
          padding-right: 0;
          padding-top: ${({ theme }) => theme.sizes.spacing8};
        `}
      >
        <div
          css={css`
            margin-right: ${({ theme }) => theme.sizes.spacing20};
          `}
        >
          <Clickable
            clicked={() => {
              openOverlazy('EditMetricDrawer', {
                meetingId: props.meetingId,
                metricId: props.metric.id,
              })
            }}
          >
            <TextEllipsis
              lineLimit={2}
              wordBreak={true}
              alwaysShowTooltipOnMouseOver={true}
              overrideChildrenTooltipMsg={
                <>
                  <Text
                    type={'body'}
                    weight={'semibold'}
                    wordBreak={true}
                    color={{ color: theme.colors.tooltipLightFontColor }}
                  >
                    {props.metric.title}
                  </Text>
                  <br />
                  <Text
                    type={'body'}
                    weight={'normal'}
                    wordBreak={true}
                    color={{ color: theme.colors.tooltipLightFontColor }}
                  >
                    {`${t('Goal: ')} ${goalText}`}
                  </Text>
                </>
              }
              css={css`
                text-align: left;
              `}
            >
              {props.metric.title}
            </TextEllipsis>
          </Clickable>
        </div>
        <div
          css={css`
            align-items: center;
            display: flex;
            margin-right: ${toREM(12)};
          `}
        >
          <EditForm
            isLoading={props.isLoading}
            disabled={!canEditMetricsInMeeting.allowed}
            disabledTooltip={
              !canEditMetricsInMeeting.allowed
                ? {
                    msg: canEditMetricsInMeeting.message,
                    position: 'top center',
                  }
                : undefined
            }
            values={scoreFormValue as { score: string }}
            validation={formValidation}
            sendDiffs={false}
            onSubmit={async (values) => {
              if (values.score != null) {
                onSubmit(values as { score: string })
              }
            }}
          >
            {({ fieldNames }) => {
              return (
                <>
                  <MetricsCell
                    id={`score_${props.metric.id}`}
                    name={fieldNames.score}
                    metricTitle={props.metric.title}
                    scoreNodeId={scoreForCurrentDateRange.scoreData?.id ?? null}
                    dateRange={scoreForCurrentDateRange.formattedDates}
                    notesText={scoreForCurrentDateRange.cellNotesText}
                    goal={props.metric.goal}
                    metricRule={props.metric.rule}
                    customGoal={customGoal}
                    hasNote={!!scoreForCurrentDateRange.cellNotesText}
                    hasFormula={!!props.metric.formula}
                    hasProgressiveTracking={
                      !!props.metric.metricData?.progressiveData
                    }
                    metricUnit={props.metric.units}
                    //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
                    overlazyScoreNodeId={null}
                    handleSetOverlazyScoreNodeId={
                      props.handleSetOverlazyScoreNodeId
                    }
                  />
                </>
              )
            }}
          </EditForm>
        </div>
      </div>
    </>
  )
})
