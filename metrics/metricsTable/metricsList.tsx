import { observer } from 'mobx-react'
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu'
import { css } from 'styled-components'

import { type Id, useComputed } from '@mm/gql'

import { getYearFromDate, useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'
import { usePreviousValue } from '@mm/core/ui/hooks'
import { uuid } from '@mm/core/utils'

import {
  getMetricNumberWithRemovedCommas,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
  useBloomCustomTerms,
} from '@mm/core-bloom'
import { WeekStartType, getMetricScoreTimestamp } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Clickable,
  FastList,
  HorizontalScrollLeftArrow,
  HorizontalScrollRightArrow,
  Icon,
  Menu,
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
  getContextAwareIssueText,
  getContextAwareTodoText,
} from '@mm/bloom-web/shared'

import {
  getMetricScoreData,
  getMetricsListShortDateRanges,
  getMetricsScoreValueFormattingValidationRule,
  getMetricsScoreValueMaxNumberValidationRule,
  getMetricsTableFormattedHeaderDates,
} from './helpers'
import { MetricsCell } from './metricsCell'
import {
  DEFAULT_METRIC_DIVIDER_SIZE,
  RECORD_OF_METRIC_DIVIDER_HEIGHT_TO_SIZE,
  RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT,
} from './metricsTableConstants'
import {
  IMetricTableDataItem,
  IMetricsTableViewActionHandlers,
  IMetricsTableViewData,
} from './metricsTableTypes'

export interface IMetricListDateRange {
  id: string
  start: number
  end: number
}

interface IMetricsListProps {
  getData: () => {
    currentUser: IMetricsTableViewData['currentUser']
    currentUserPermissions: IMetricsTableViewData['currentUserPermissions']
    isLoading: boolean
    metrics: IMetricsTableViewData['metrics']
    meeting: IMetricsTableViewData['meeting']
    metricsTableSelectedTab: IMetricsTableViewData['metricsTableSelectedTab']
    getMetricScoreDateRanges: IMetricsTableViewData['getMetricScoreDateRanges']
    highlightPreviousWeekForMetrics: IMetricsTableViewData['highlightPreviousWeekForMetrics']
    getCurrentUserPermissions: IMetricsTableViewData['getCurrentUserPermissions']
    preventEditingUnownedMetrics: IMetricsTableViewData['preventEditingUnownedMetrics']
    weekStart: WeekStartType
  }
  overlazyScoreNodeId: Maybe<Id>
  handleUpdateMetricScore: IMetricsTableViewActionHandlers['handleUpdateMetricScore']
  handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
}

export const MetricsList = observer(function MetricsList(
  props: IMetricsListProps
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
    () => props.getData().metricsTableSelectedTab
  )

  const horizontalScrollArrowWidth =
    leftArrowDimensionsReady && rightArrowDimensionsReady
      ? leftArrowWidth + rightArrowWidth + 12
      : 0
  const dateCellWidth = metricsListDimensionsReady
    ? `${(width - horizontalScrollArrowWidth) / 3}px`
    : `0px`

  const metricScoreDateRanges = props.getData().getMetricScoreDateRanges()

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

  const renderListItem = useRenderListItem<IMetricTableDataItem>((metric) => {
    if (!componentState.selectedDateRange) return null

    return (
      <MetricsListItem
        key={metric.id}
        getData={props.getData}
        metric={metric}
        overlazyScoreNodeId={props.overlazyScoreNodeId}
        selectedDateRange={componentState.selectedDateRange}
        handleUpdateMetricScore={props.handleUpdateMetricScore}
        handleSetOverlazyScoreNodeId={props.handleSetOverlazyScoreNodeId}
      />
    )
  })

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
          position: sticky;
          top: 0;
          padding-top: ${({ theme }) => theme.sizes.spacing4};
          background-color: ${({ theme }) => theme.colors.cardBackgroundColor};
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
                    metricsTableSelectedTab={
                      props.getData().metricsTableSelectedTab
                    }
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
              previousTab.value !== props.getData().metricsTableSelectedTab
            }
            waitUntil={() => !props.getData().isLoading}
            items={props.getData().metrics.nodes}
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

interface IMetricsListItemProps {
  getData: () => {
    currentUser: IMetricsTableViewData['currentUser']
    currentUserPermissions: IMetricsTableViewData['currentUserPermissions']
    isLoading: boolean
    meeting: IMetricsTableViewData['meeting']
    getCurrentUserPermissions: IMetricsTableViewData['getCurrentUserPermissions']
    getMetricScoreDateRanges: IMetricsTableViewData['getMetricScoreDateRanges']
    highlightPreviousWeekForMetrics: IMetricsTableViewData['highlightPreviousWeekForMetrics']
    metricsTableSelectedTab: IMetricsTableViewData['metricsTableSelectedTab']
    preventEditingUnownedMetrics: IMetricsTableViewData['preventEditingUnownedMetrics']
    weekStart: WeekStartType
  }
  metric: IMetricTableDataItem
  overlazyScoreNodeId: Maybe<Id>
  selectedDateRange: IMetricListDateRange
  handleUpdateMetricScore: IMetricsTableViewActionHandlers['handleUpdateMetricScore']
  handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
}

const MetricsListItem = observer(function MetricsListItem(
  props: IMetricsListItemProps
) {
  const diResolver = useDIResolver()
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const { metric, getData, handleUpdateMetricScore } = props

  const { canCreateIssuesInMeeting, canCreateTodosInMeeting } =
    getData().getCurrentUserPermissions()

  const getScoreDataForMetric = useComputed(
    () => {
      return getMetricScoreData({
        metric: metric,
        metricScoreDateRanges: getData().getMetricScoreDateRanges(),
        frequency: getData().metricsTableSelectedTab,
        startOfWeek: getData().weekStart,
        currentUserId: getData().currentUser.id,
        preventEditingUnownedMetrics: getData().preventEditingUnownedMetrics,
        currentUserPermissions: getData().currentUserPermissions,
        highlightPreviousWeekForMetrics:
          getData().highlightPreviousWeekForMetrics,
        diResolver,
      })
    },
    {
      name: `metricsTableScoresTableItem-getScoreDataForMetric-${props.metric.id}`,
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
    if (getData().isLoading) {
      return null
    }
    return {
      score: scoreForCurrentDateRange?.scoreData?.value ?? '',
    }
  }, [getData().isLoading, scoreForCurrentDateRange])

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
          frequency: metric.frequency,
          dateRangeStartDate: scoreForCurrentDateRange.start,
          weekStart: getData().weekStart,
        })
        const metricId = metric.id
        const scoreId = scoreForCurrentDateRange.scoreData?.id ?? undefined

        // Note: we allow negative numbers and decimals, but if the BE mutation just sends - || . || -. without a number attached(like -1), the BE mutation will error out.
        if (value === '-' || value === '-.' || value === '.') {
          return
        }

        handleUpdateMetricScore({
          value,
          timestamp,
          metricId,
          scoreId,
          metricUnits: metric.units,
        })
      }
    },
    [
      scoreForCurrentDateRange,
      metric.id,
      metric.frequency,
      metric.units,
      getData().weekStart,
      handleUpdateMetricScore,
    ]
  )

  const onCreatedTodoClick = useCallback(() => {
    const formattedDates = getMetricsTableFormattedHeaderDates({
      toString: true,
      frequency: metric.frequency,
      startDate: props.selectedDateRange.start,
      endDate: props.selectedDateRange.end,
    })

    openOverlazy('CreateTodoDrawer', {
      meetingId: getData().meeting.id,
      context: {
        type: 'Metric',
        title: metric.title,
        ownerId: metric.assignee.id,
        ownerFullName: metric.assignee.fullName,
        units: metric.units,
        rule: metric.rule,
        goal: metric.goal,
        notesId: metric.notesId,
        metricScoreData: {
          metricFrequency: metric.frequency,
          formattedScoreValue:
            scoreForCurrentDateRange?.scoreData?.scoreValueRounded ?? null,
          cellNotes: scoreForCurrentDateRange?.cellNotesText ?? null,
          dateRange: formattedDates,
          year: getYearFromDate({
            secondsSinceEpochUTC: props.selectedDateRange.end,
          }),
        },
      },
    })
  }, [
    getData().meeting.id,
    metric.title,
    metric.notesId,
    metric.assignee.id,
    metric.assignee.fullName,
    metric.units,
    metric.goal,
    metric.frequency,
    metric.rule,
    scoreForCurrentDateRange?.scoreData?.scoreValueRounded,
    scoreForCurrentDateRange?.cellNotesText,
    props.selectedDateRange.start,
    props.selectedDateRange.end,
    openOverlazy,
  ])

  const onCreateIssueClick = useCallback(() => {
    const formattedDates = getMetricsTableFormattedHeaderDates({
      toString: true,
      frequency: metric.frequency,
      startDate: props.selectedDateRange.start,
      endDate: props.selectedDateRange.end,
    })

    openOverlazy('CreateIssueDrawer', {
      meetingId: getData().meeting.id,
      context: {
        type: 'Metric',
        title: metric.title,
        ownerId: metric.assignee.id,
        ownerFullName: metric.assignee.fullName,
        units: metric.units,
        rule: metric.rule,
        goal: metric.goal,
        notesId: metric.notesId,
        metricScoreData: {
          metricFrequency: metric.frequency,
          formattedScoreValue:
            scoreForCurrentDateRange?.scoreData?.scoreValueRounded ?? null,
          cellNotes: scoreForCurrentDateRange?.cellNotesText ?? null,
          dateRange: formattedDates,
          year: getYearFromDate({
            secondsSinceEpochUTC: props.selectedDateRange.end,
          }),
        },
      },
      initialItemValues: {
        title: metric.title,
      },
    })
  }, [
    metric.title,
    metric.notesId,
    metric.assignee.id,
    metric.assignee.fullName,
    metric.units,
    metric.goal,
    metric.frequency,
    metric.rule,
    scoreForCurrentDateRange?.scoreData?.scoreValueRounded,
    scoreForCurrentDateRange?.cellNotesText,
    props.selectedDateRange.start,
    props.selectedDateRange.end,
    getData().meeting.id,
    openOverlazy,
  ])

  if (!scoreForCurrentDateRange) {
    return null
  }

  return (
    <>
      {metric.metricDivider && (
        <MetricsListDivider metricDivider={metric.metricDivider} />
      )}
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
                meetingId: getData().meeting.id,
                metricId: metric.id,
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
                    {metric.title}
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
              {metric.title}
            </TextEllipsis>
          </Clickable>
        </div>
        <div
          css={css`
            align-items: center;
            display: flex;
          `}
        >
          <EditForm
            isLoading={getData().isLoading}
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
                    id={`score_${metric.id}`}
                    name={fieldNames.score}
                    metricTitle={metric.title}
                    scoreNodeId={scoreForCurrentDateRange.scoreData?.id ?? null}
                    dateRange={scoreForCurrentDateRange.formattedDates}
                    notesText={scoreForCurrentDateRange.cellNotesText}
                    goal={metric.goal}
                    metricRule={metric.rule}
                    customGoal={customGoal}
                    hasNote={!!scoreForCurrentDateRange.cellNotesText}
                    hasFormula={!!metric.formula}
                    hasProgressiveTracking={
                      !!metric.metricData?.progressiveData
                    }
                    metricUnit={metric.units}
                    //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
                    overlazyScoreNodeId={props.overlazyScoreNodeId}
                    handleSetOverlazyScoreNodeId={
                      props.handleSetOverlazyScoreNodeId
                    }
                  />
                </>
              )
            }}
          </EditForm>
          <Menu
            content={(close) => (
              <>
                <Menu.Item
                  disabled={!canCreateIssuesInMeeting.allowed}
                  tooltip={
                    !canCreateIssuesInMeeting.allowed
                      ? {
                          msg: canCreateIssuesInMeeting.message,
                          position: 'top left',
                        }
                      : undefined
                  }
                  onClick={(e) => {
                    onCreateIssueClick()
                    close(e)
                  }}
                >
                  <Text type={'body'}>{getContextAwareIssueText(terms)}</Text>
                </Menu.Item>
                <Menu.Item
                  disabled={!canCreateTodosInMeeting.allowed}
                  tooltip={
                    !canCreateTodosInMeeting.allowed
                      ? {
                          msg: canCreateTodosInMeeting.message,
                          position: 'top left',
                        }
                      : undefined
                  }
                  onClick={(e) => {
                    onCreatedTodoClick()
                    close(e)
                  }}
                >
                  <Text type={'body'}>{getContextAwareTodoText(terms)}</Text>
                </Menu.Item>
              </>
            )}
          >
            <span>
              <Clickable clicked={() => null}>
                <Icon iconName='moreVerticalIcon' iconSize='lg' />
              </Clickable>
            </span>
          </Menu>
        </div>
      </div>
    </>
  )
})

const MetricsListDivider = observer(function MetricsListDivider(props: {
  metricDivider: {
    id: Id
    title: string
    height: number
    indexInTable: number
  }
}) {
  const theme = useTheme()

  const {
    metricDivider: { title, height },
  } = props

  const dividerHeightIntention =
    RECORD_OF_METRIC_DIVIDER_HEIGHT_TO_SIZE[height] ??
    DEFAULT_METRIC_DIVIDER_SIZE
  const renderTitleWithinDivider = title && dividerHeightIntention !== 'SMALL'

  return (
    <div
      css={css`
        align-items: center;
        border: ${({ theme }) =>
          `${theme.sizes.smallSolidBorder} ${theme.colors.cardBorderColor}`};
        border-radius: ${({ theme }) => theme.sizes.br1};
        display: flex;
        justify-content: space-between;
        margin-bottom: ${({ theme }) => theme.sizes.spacing8};
        padding-left: ${({ theme }) => theme.sizes.spacing8};
        padding-right: 0;
        height: ${toREM(
          RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT[dividerHeightIntention]
        )};
        background-color: ${(props) =>
          props.theme.colors.metricsTableDividerBackgroundColorDefault};
      `}
    >
      {renderTitleWithinDivider && (
        <TextEllipsis
          type={'caption'}
          lineLimit={1}
          weight={'semibold'}
          color={{ color: theme.colors.metricsTableDividerTextColorDefault }}
          css={css`
            padding-top: ${({ theme }) => theme.sizes.spacing4};
            cursor: default !important;
          `}
        >
          {title.toUpperCase()}
        </TextEllipsis>
      )}
    </div>
  )
})
