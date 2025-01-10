import { observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { addOrRemoveWeeks, useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'

import { useBloomCustomTerms } from '@mm/core-bloom'

import {
  ChartableMetricUnits,
  METRICS_FREQUENCY_LOOKUP,
  MetricFrequency,
  TrackedMetricColorIntention,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
} from '@mm/core-bloom/metrics'

import { useTranslation } from '@mm/core-web'

import {
  Card,
  Icon,
  Loading,
  Menu,
  SORTABLE_DRAGGED_CLASS,
  TABLE_HOVERED_COLUMN_CLASS,
  TTableRow,
  TableCell,
  TableColumn,
  TableWithStickyColumns,
  Text,
  TextEllipsis,
  useRenderListItem,
  useResizeObserver,
  useSortable,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
  useObservablePreviousValue,
} from '@mm/bloom-web/pages/performance/mobx'
import BloomPageEmptyState from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyState'
import { getEmptyStateDataForMetricTable } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateConstants'

import { useMetricsTabsController } from '../metricsTabs/metricsTabsController'
import { getMetricScoreData } from './helpers'
import { MetricsList } from './metricsList'
import {
  METRIC_DRAGGABLE_ELEMENT_CLASS,
  METRIC_TABLE_BODY_ID,
  METRIC_TABLE_DIVIDER_TYPE,
  METRIC_TABLE_ITEM_ROW_TYPE,
  METRIC_TABLE_ROW_HEIGHT,
  METRIC_TABLE_SCORE_CELL_WIDTH,
  METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN,
} from './metricsTableConstants'
import {
  METRIC_DIVIDER_MENU_BUTTON_CLASS,
  METRIC_DIVIDER_SORT_ICON_CLASS,
  MetricsTableMetadataTableDivider,
  MetricsTableScoreTableDivider,
} from './metricsTableDividers'
import {
  MetricsRowAverage,
  MetricsRowCumulative,
  MetricsRowDraggableHandler,
  MetricsRowGoal,
  MetricsRowOwnerAvatar,
  MetricsRowTitle,
  MetricsTableRowChartButton,
} from './metricsTableMetadataTableRow'
import { MetricsTableScoresTableCell } from './metricsTableScoresTableCell'
import { MetricsTableScoresTableColumnHeader } from './metricsTableScoresTableColumnHeader'
import {
  IMetricTableDataItem,
  IMetricsTableViewProps,
  MetricTableColumnOptions,
  type TMetricsTableResponsiveSize,
} from './metricsTableTypes'
import {
  IMetricsTableHeaderViewRightProps,
  MetricsTableHeaderViewLeft,
  MetricsTableHeaderViewRight,
} from './metricsTableViewHeader'

export const MetricsTableView = observer(function MetricsTableView(
  props: IMetricsTableViewProps
) {
  //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
  const { getData, getActionHandlers } = props
  const { getSecondsSinceEpochUTC } = useTimeController()
  const componentState = useObservable({
    metricsTableScrollParent: null as Maybe<HTMLDivElement>,
    overlazyScoreNodeId: null as Maybe<Id>,
    areColumnsCollapsed: false,
    userHasScrolledHorizontally: false,
    isComponentScroll: false,
  })
  const { onChartMetricClickedFromTable } = useMetricsTabsController()

  const setMetricsTableScrollParent = useAction((el: Maybe<HTMLDivElement>) => {
    componentState.metricsTableScrollParent = el
  })

  const setAreColumnsCollapsed = useAction((areColumnsCollapsed: boolean) => {
    componentState.areColumnsCollapsed = areColumnsCollapsed
  })

  const setOverlazyScoreNodeId = useAction((nodeId: Maybe<Id>) => {
    componentState.overlazyScoreNodeId = nodeId
  })

  const diResolver = useDIResolver()
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const observableResizeState = useResizeObserver(
    componentState.metricsTableScrollParent,
    {
      withChildObserver: true,
      onSizeChange: function scrollToEndOfTableIfNeeded() {
        const scrollParent = componentState.metricsTableScrollParent
        if (scrollParent == null) return

        if (
          !componentState.userHasScrolledHorizontally &&
          !getData().isScoreTableReversed
        ) {
          componentState.isComponentScroll = true
          scrollParent.scrollLeft = scrollParent.scrollWidth
        }
      },
    }
  )

  const onScroll = useAction(() => {
    // This action ensures that we track whether the user caused a scroll event
    // so that we don't override the user's scroll position when the scores table grows
    if (componentState.isComponentScroll) {
      componentState.isComponentScroll = false
      return
    }
    componentState.userHasScrolledHorizontally = true
  })

  useEffect(
    function keepTrackIfUserHasHorizontallScrolled() {
      const scrollParent = componentState.metricsTableScrollParent
      if (scrollParent == null) return

      scrollParent.addEventListener('scroll', onScroll)
      return () => scrollParent.removeEventListener('scroll', onScroll)
    },
    [componentState.metricsTableScrollParent, onScroll]
  )

  const previousTab = useObservablePreviousValue(
    () => props.getData().metricsTableSelectedTab
  )

  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const EMPTYSTATE_DATA = getEmptyStateDataForMetricTable({
    terms,
    metricsTableSelectedTab: props.getData().metricsTableSelectedTab,
  })

  const getResponsiveSize = useComputed(
    (): TMetricsTableResponsiveSize => {
      if (!observableResizeState.ready) return 'UNKNOWN'
      if (observableResizeState.width < 500) return 'XS'
      if (observableResizeState.width < 800) return 'S'
      if (observableResizeState.width < 1000) return 'M'
      return 'L'
    },
    { name: 'metricsTableView_getResponsiveSize()' }
  )

  useEffect(() => {
    getActionHandlers().displayMetricsTabs()
    return () => {
      getActionHandlers().hideMetricsTabs()
    }
  }, [
    getActionHandlers().displayMetricsTabs,
    getActionHandlers().hideMetricsTabs,
  ])

  const getMetricTabsLookupWithTotalCountIncluded: () => Array<{
    text: string
    value: MetricFrequency
  }> = useComputed(
    () => {
      return METRICS_FREQUENCY_LOOKUP.map((tab) => {
        return {
          ...tab,
          text: `${tab.text} (${getData().totalCountData[tab.value]})`,
        }
      })
    },
    { name: 'metricsTableView-getMetricTabsLookupWithTotalCountIncluded' }
  )

  const selectedTabName =
    getMetricTabsLookupWithTotalCountIncluded().find(
      (tab) => tab.value === getData().metricsTableSelectedTab
    )?.text ?? 'WEEKLY'

  const handleSort = useAction(
    (opts: { newIndex: number; sortedItem: HTMLElement | undefined }) => {
      const { newIndex, sortedItem } = opts
      if (!sortedItem) return
      const itemIdSpitByUnderscore = sortedItem.id.split('_')
      const itemId = itemIdSpitByUnderscore[1]
      const itemType = itemIdSpitByUnderscore[0]
      const lengthOfMetricsList = props.getData().metrics.nodes.length

      const newIndexFromIndexInTable = props.getData().metrics.nodes[newIndex]
        .indexInTable
        ? props.getData().metrics.nodes[newIndex].indexInTable
        : lengthOfMetricsList

      const newMetricToAttachDividerToFromIndex =
        props.getData().metrics.nodes[newIndex].id

      if (itemType === METRIC_TABLE_ITEM_ROW_TYPE) {
        return getActionHandlers().handleMetricsTableDragSort({
          newIndex: newIndexFromIndexInTable,
          id: itemId,
          type: 'METRIC',
        })
      }
      if (itemType === METRIC_TABLE_DIVIDER_TYPE) {
        const isLastItemInList = newIndex === lengthOfMetricsList - 1
        if (isLastItemInList) {
          return openOverlazy('Toast', {
            type: 'error',
            text: t(`Failed to drag sort`),
            error: new Error(
              `Failed to drag sort. Dividers cannot be moved to the last row.`
            ),
          })
        } else {
          return getActionHandlers().handleMetricsTableDragSort({
            newIndex: newIndexFromIndexInTable,
            id: itemId,
            type: 'DIVIDER',
            newMetricToAttachToId: newMetricToAttachDividerToFromIndex,
          })
        }
      }
    }
  )

  const { createSortable } = useSortable({
    sorter: (_, newIndex, sortedItem) => {
      return handleSort({ newIndex, sortedItem })
    },
    sortableOptions: {
      handle: `.${METRIC_DRAGGABLE_ELEMENT_CLASS}`,
      disabled:
        !getData().getCurrentUserPermissions()
          .canPerformEditActionsForMetricsInMeeting.allowed,
    },
  })

  const handleToggleCollapseColumns = useAction(() => {
    setAreColumnsCollapsed(!componentState.areColumnsCollapsed)
  })

  const handleUpdateTab = useAction((tab: string) => {
    getActionHandlers().handleSetMetricsTableSelectedTab(tab as MetricFrequency)
  })

  //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
  const handleSetOverlazyScoreNodeId = useAction((nodeId: Maybe<Id>) => {
    return setOverlazyScoreNodeId(nodeId)
  })

  const onTableBodyRef = useAction(
    (element: HTMLTableSectionElement | null) => {
      if (!element) return
      createSortable(element)
      componentState.userHasScrolledHorizontally = false
    }
  )

  const responsiveSize = getResponsiveSize()

  const getMetricsTableHeaderViewRightData: IMetricsTableHeaderViewRightProps['getData'] =
    useComputed(
      () => {
        return {
          ...getData(),
          meetingId: getData().meeting.id,
        }
      },
      {
        name: 'metricsTableView-getMetricsTableHeaderViewRightData',
      }
    )

  const getColumnVisibility = useComputed(
    (): Record<MetricTableColumnOptions, boolean> => {
      const metricTableColumnToIsVisibleSettings =
        getData().metricTableColumnToIsVisibleSettings
      const areColumnsCollapsed = componentState.areColumnsCollapsed

      const hideGraph = getData().pageType === 'WORKSPACE'
      const hideDrag =
        !getData().getCurrentUserPermissions()
          .canPerformEditActionsForMetricsInMeeting.allowed

      if (areColumnsCollapsed) {
        return {
          drag: !hideDrag,
          owner: metricTableColumnToIsVisibleSettings['owner'] ?? true,
          title: true,
          goal: false,
          graph: false,
          cumulative: false,
          average: false,
        }
      } else {
        const hideNonCriticalColumns =
          getResponsiveSize() === 'S' || getResponsiveSize() === 'M'
        return {
          drag: !hideDrag,
          owner: metricTableColumnToIsVisibleSettings['owner'] ?? true,
          title: true,
          goal: hideNonCriticalColumns
            ? false
            : metricTableColumnToIsVisibleSettings['goal'] ?? true,
          graph: hideNonCriticalColumns ? false : !hideGraph,
          cumulative: hideNonCriticalColumns
            ? false
            : metricTableColumnToIsVisibleSettings['cumulative'] ?? true,
          average: hideNonCriticalColumns
            ? false
            : metricTableColumnToIsVisibleSettings['average'] ?? true,
        }
      }
    },
    {
      name: 'MetricsTableView.getColumnVisibility',
    }
  )

  const getTableColumns = useComputed(
    (): Array<TableColumn> => {
      const columnVisibility = getColumnVisibility()
      const scoreHeaders: Array<TableColumn> = getData()
        .getMetricScoreDateRanges()
        .map((range) => {
          const getHighlightedWeekIsWithinRange = () => {
            const startDate = range.start
            const endDate = range.end
            const alwaysHighlightCurrentDate =
              getData().metricsTableSelectedTab !== 'WEEKLY'
            const highlightPreviousWeekForMetrics =
              getData().highlightPreviousWeekForMetrics
            const currentDateTimeValue = getSecondsSinceEpochUTC()

            if (
              highlightPreviousWeekForMetrics &&
              !alwaysHighlightCurrentDate
            ) {
              const previousWeekTimeValue = addOrRemoveWeeks({
                secondsSinceEpochUTC: currentDateTimeValue,
                weeks: -1,
              })
              return (
                previousWeekTimeValue >= startDate &&
                previousWeekTimeValue <= endDate
              )
            } else {
              return (
                currentDateTimeValue >= startDate &&
                currentDateTimeValue <= endDate
              )
            }
          }

          const isHighlightedDateRange = getHighlightedWeekIsWithinRange()

          return {
            key: `score_${range.start}`,
            leftBorder: true,
            width: isHighlightedDateRange
              ? METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN
              : METRIC_TABLE_SCORE_CELL_WIDTH,
            padding: isHighlightedDateRange ? 'left-md' : 'md',
            columnCss: isHighlightedDateRange
              ? css`
                  background-color: ${theme.colors
                    .metricsTableScoreCurrentDateRangeBackgroundColor} !important;
                `
              : undefined,
            content: (
              <MetricsTableScoresTableColumnHeader
                range={range}
                metricsTableSelectedTab={getData().metricsTableSelectedTab}
              />
            ),
          }
        })

      return [
        {
          key: 'drag',
          padding: 'none',
          sticky: true,
          content: null,
          // always show to ensure padding, it's hidden by the prop passed to the row component
          show: true,
        },
        {
          key: 'owner',
          sticky: true,
          padding: 'sm',
          verticalAlign: 'bottom',
          textAlign: 'center',
          content: (
            <Text
              type={'body'}
              weight={'semibold'}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {t('Who')}
            </Text>
          ),
          show: columnVisibility.owner,
        },
        {
          key: 'title',
          sticky: true,
          padding: 'md',
          verticalAlign: 'bottom',
          textAlign: 'left',
          content: (
            <Text
              type={'body'}
              weight={'semibold'}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {terms.metric.singular}
            </Text>
          ),
          show: columnVisibility.title,
        },
        {
          key: 'goal',
          sticky: true,
          padding: 'md',
          verticalAlign: 'bottom',
          textAlign: 'left',
          content: (
            <Text
              type={'body'}
              weight={'semibold'}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {t('Goal')}
            </Text>
          ),
          show: columnVisibility.goal,
        },
        {
          key: 'graph',
          sticky: true,
          padding: 'md',
          content: null,
          show: columnVisibility.graph,
        },
        {
          key: 'sum',
          sticky: true,
          padding: 'md',
          verticalAlign: 'bottom',
          textAlign: 'left',
          leftBorder: true,
          content: (
            <Text
              type={'body'}
              weight={'semibold'}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {t('Sum')}
            </Text>
          ),
          show: columnVisibility.cumulative,
        },
        {
          key: 'avg',
          sticky: true,
          padding: 'md',
          verticalAlign: 'bottom',
          textAlign: 'left',
          leftBorder: true,
          content: (
            <Text
              type={'body'}
              weight={'semibold'}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {t('Avg')}
            </Text>
          ),
          show: columnVisibility.average,
        },
        ...scoreHeaders,
      ]
    },
    {
      name: 'MetricsTableView.getTableColumns',
    }
  )

  const colorsByColorIntention = useMemo(() => {
    const rowBackgroundColor: Record<TrackedMetricColorIntention, string> = {
      COLOR1: theme.colors.metricsTableRowBackgroundColor1,
      COLOR2: theme.colors.metricsTableRowBackgroundColor2,
      COLOR3: theme.colors.metricsTableRowBackgroundColor3,
      COLOR4: theme.colors.metricsTableRowBackgroundColor4,
      COLOR5: theme.colors.metricsTableRowBackgroundColor5,
    }

    const rowBackgroundColorHover: Record<TrackedMetricColorIntention, string> =
      {
        COLOR1: theme.colors.metricsTableRowBackgroundColorHover1,
        COLOR2: theme.colors.metricsTableRowBackgroundColorHover2,
        COLOR3: theme.colors.metricsTableRowBackgroundColorHover3,
        COLOR4: theme.colors.metricsTableRowBackgroundColorHover4,
        COLOR5: theme.colors.metricsTableRowBackgroundColorHover5,
      }

    return {
      rowBackgroundColor,
      rowBackgroundColorHover,
    }
  }, [theme])

  const renderTableRow = useRenderListItem<
    IMetricTableDataItem,
    Array<TTableRow>
  >((metric) => {
    const rows: Array<TTableRow> = []

    if (metric.metricDivider) {
      rows.push({
        id: `${METRIC_TABLE_DIVIDER_TYPE}_${metric.metricDivider.id}_${metric.id}`,
        rowClassName: METRIC_DRAGGABLE_ELEMENT_CLASS,
        rowKey: metric.metricDivider.id,
        isDivider: true,
        stickySideDivider: (
          <MetricsTableMetadataTableDivider
            getAreColumnsCollapsed={() => componentState.areColumnsCollapsed}
            getColumnVisibility={getColumnVisibility}
            divider={metric.metricDivider}
            getData={getData}
            handleDeleteMetricDivider={
              getActionHandlers().handleDeleteMetricDivider
            }
            handleEditMetricDivider={
              getActionHandlers().handleEditMetricDivider
            }
          />
        ),
        nonStickySideDivider: (
          <MetricsTableScoreTableDivider
            height={metric.metricDivider.height}
            getData={getData}
          />
        ),
        stickyRowCss: css`
          background-color: ${(props) =>
            props.theme.colors.metricsTableDividerBackgroundColorDefault};

          .${METRIC_DIVIDER_SORT_ICON_CLASS},
            .${METRIC_DIVIDER_MENU_BUTTON_CLASS} {
            visibility: hidden;
          }

          &.${TABLE_HOVERED_COLUMN_CLASS}:not(.${SORTABLE_DRAGGED_CLASS}) {
            background-color: ${(props) =>
              props.theme.colors.metricsTableDividerBackgroundColorHover};
            .${METRIC_DIVIDER_SORT_ICON_CLASS},
              .${METRIC_DIVIDER_MENU_BUTTON_CLASS} {
              visibility: visible;
            }
          }
        `,
        nonStickyRowCss: css`
          > td {
            background-color: ${(props) =>
              props.theme.colors.metricsTableDividerBackgroundColorDefault};
          }
          &.${TABLE_HOVERED_COLUMN_CLASS} {
            > td {
              background-color: ${(props) =>
                props.theme.colors.metricsTableDividerBackgroundColorHover};
            }
          }
        `,
      })
    }

    const getGoalText = () =>
      isSingleValueMetricGoal(metric.goal)
        ? metric.goal.valueFormatted
        : isMinMaxMetricGoal(metric.goal)
          ? `${metric.goal.minData.minFormatted} - ${metric.goal.maxData.maxFormatted}`
          : t('N/A')

    const handleClickMetricTitle = () => {
      openOverlazy('EditMetricDrawer', {
        meetingId: getData().meeting.id,
        metricId: metric.id,
      })
    }

    const onChartButtonClick = () =>
      onChartMetricClickedFromTable({
        metric: metric as {
          id: Id
          units: ChartableMetricUnits
          title: string
          frequency: MetricFrequency
        },
        userId: getData().currentUser.id,
        terms,
      })

    const trackedColor = getData().trackedMetrics.find(
      (trackedMetric) => trackedMetric.metric.id === metric.id
    )?.color

    const scoreDataForMetric = getMetricScoreData({
      metric,
      metricScoreDateRanges: getData().getMetricScoreDateRanges(),
      frequency: getData().metricsTableSelectedTab,
      startOfWeek: getData().weekStart,
      currentUserId: getData().currentUser.id,
      preventEditingUnownedMetrics: getData().preventEditingUnownedMetrics,
      currentUserPermissions: getData().currentUserPermissions,
      highlightPreviousWeekForMetrics:
        getData().highlightPreviousWeekForMetrics,
      diResolver: diResolver,
    })

    const scoreCells: Array<TableCell> = scoreDataForMetric
      .getDateRangesData()
      .map((rangeData, index) => {
        const isHighlightedRange = rangeData.highlightedWeekIsWithinRange
        return {
          key: `score_table_item_${metric.id}_${rangeData.start}`,
          padding: isHighlightedRange ? 'left-md' : 'md',
          content: (
            <MetricsTableScoresTableCell
              key={`score_table_item_${metric.id}_${rangeData.start}`}
              metric={scoreDataForMetric}
              canEditMetricsInMeeting={
                scoreDataForMetric.permissions.canEditMetricsInMeeting
              }
              getCurrentUserPermissions={getData().getCurrentUserPermissions}
              index={index}
              weekStart={getData().weekStart}
              meetingId={getData().meeting.id}
              isLoading={getData().isLoading}
              rangeData={rangeData}
              overlazyScoreNodeId={componentState.overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              handleUpdateMetricScore={
                getActionHandlers().handleUpdateMetricScore
              }
            />
          ),
        }
      })

    rows.push({
      id: `${METRIC_TABLE_ITEM_ROW_TYPE}_${metric.id}`,
      rowKey: metric.id,
      cells: [
        {
          key: 'drag',
          sticky: true,
          padding: 'none',
          content: (
            <MetricsRowDraggableHandler
              metric={metric}
              hide={!getColumnVisibility().drag}
            />
          ),
          // always show to ensure padding, it's hidden by the prop passed to the component
          show: true,
        },
        {
          key: 'owner',
          sticky: true,
          padding: 'sm',
          content: <MetricsRowOwnerAvatar metric={metric} />,
          show: getColumnVisibility().owner,
        },
        {
          key: 'title',
          sticky: true,
          padding: 'md',
          content: (
            <MetricsRowTitle
              metric={metric}
              onClick={handleClickMetricTitle}
              getResponsiveSize={getResponsiveSize}
              getColumnsAreCollapsed={() => componentState.areColumnsCollapsed}
              displayGoalInTooltip={!getColumnVisibility().goal}
              getGoalText={getGoalText}
            />
          ),
          show: getColumnVisibility().title,
        },
        {
          key: 'goal',
          sticky: true,
          padding: 'md',
          content: <MetricsRowGoal metric={metric} getGoalText={getGoalText} />,
          show: getColumnVisibility().goal,
        },
        {
          key: 'graph',
          sticky: true,
          padding: 'md',
          content: (
            <MetricsTableRowChartButton
              metric={metric}
              onClick={onChartButtonClick}
              trackedColor={trackedColor}
              getActiveTab={getData().getActiveTab}
              getCurrentUser={() => getData().currentUser}
              getCurrentUserPermissions={getData().getCurrentUserPermissions}
            />
          ),
          show: getColumnVisibility().graph,
        },
        {
          key: 'sum',
          sticky: true,
          padding: 'md',
          leftBorder: true,
          content: <MetricsRowCumulative metric={metric} />,
          show: getColumnVisibility().cumulative,
        },
        {
          key: 'avg',
          sticky: true,
          padding: 'md',
          leftBorder: true,
          content: <MetricsRowAverage metric={metric} />,
          show: getColumnVisibility().average,
        },
        ...scoreCells,
      ],
      stickyRowCss: css`
        ${trackedColor &&
        css`
          background-color: ${colorsByColorIntention.rowBackgroundColor[
            trackedColor
          ]};
        `}
        .${METRIC_DRAGGABLE_ELEMENT_CLASS} {
          visibility: hidden;
        }
        &.${TABLE_HOVERED_COLUMN_CLASS} {
          ${trackedColor
            ? css`
                background-color: ${colorsByColorIntention
                  .rowBackgroundColorHover[trackedColor]};
              `
            : css`
                background-color: ${theme.colors.metricsTableRowHoverColor};
              `}

          .${METRIC_DRAGGABLE_ELEMENT_CLASS} {
            visibility: visible;
          }
        }
      `,
      nonStickyRowCss: css`
        background-color: ${(props) =>
          props.theme.colors.metricsTableScoreBgColor};
        &.${TABLE_HOVERED_COLUMN_CLASS} {
          background-color: ${(props) =>
            props.theme.colors.metricsTableScoreHoverColor};
        }
      `,
    })

    return rows
  })

  return (
    <Card
      className={props.className}
      css={css`
        ${getData().pageType === 'WORKSPACE' &&
        css`
          height: 100%;
        `}
      `}
    >
      <Card.Header
        renderLeft={<MetricsTableHeaderViewLeft getData={getData} />}
        renderRight={
          getResponsiveSize() !== 'UNKNOWN' && (
            <MetricsTableHeaderViewRight
              getData={getMetricsTableHeaderViewRightData}
              responsiveSize={getResponsiveSize()}
              handleCreateMetricDivider={
                getActionHandlers().handleCreateMetricDivider
              }
              isExpandedOnWorkspacePage={
                props.getData().isExpandedOnWorkspacePage
              }
              handleSwitchMetricsTableSortByValue={
                getActionHandlers().handleSwitchMetricsTableSortByValue
              }
              handleUpdateMetricTableColumnToIsVisibleSettings={
                getActionHandlers()
                  .handleUpdateMetricTableColumnToIsVisibleSettings
              }
              onDeleteTile={getActionHandlers().onDeleteTile}
            />
          )
        }
        css={css`
          padding: 0;
          border-bottom: ${(props) => props.theme.sizes.smallSolidBorder}
            ${(props) => props.theme.colors.cardBorderColor};
        `}
      >
        {getResponsiveSize() !== 'XS' ? (
          <Card.Tabs
            active={getData().metricsTableSelectedTab}
            tabs={getMetricTabsLookupWithTotalCountIncluded()}
            onChange={handleUpdateTab}
          />
        ) : (
          <Menu
            content={(close) => (
              <>
                {getMetricTabsLookupWithTotalCountIncluded().map((tab) => {
                  return (
                    <Menu.Item
                      key={tab.value}
                      onClick={(e) => {
                        close(e)
                        handleUpdateTab(tab.value)
                      }}
                    >
                      <Text type={'body'}>{tab.text}</Text>
                    </Menu.Item>
                  )
                })}
              </>
            )}
          >
            <span
              css={css`
                border-bottom: ${({ theme }) =>
                  `${theme.sizes.smallSolidBorder} ${theme.colors.cardActiveTabBorderColor}`};
                display: flex;
                margin-left: ${(props) => props.theme.sizes.spacing16};
                margin-right: ${(props) => props.theme.sizes.spacing16};
                margin-top: ${(props) => props.theme.sizes.spacing10};
                width: fit-content;
              `}
            >
              <TextEllipsis type='body' weight='semibold' lineLimit={1}>
                {selectedTabName}
              </TextEllipsis>
              <Icon iconName='chevronDownIcon' iconSize='md2' />
            </span>
          </Menu>
        )}
      </Card.Header>
      <Card.Body
        ref={setMetricsTableScrollParent}
        css={css`
          overflow: auto;
          display: inline-flex;
          padding: 0;
        `}
      >
        {responsiveSize !== 'UNKNOWN' && responsiveSize !== 'XS' && (
          <TableWithStickyColumns
            getColumns={getTableColumns}
            items={getData().metrics.nodes}
            renderRow={renderTableRow}
            headerHeight={METRIC_TABLE_ROW_HEIGHT}
            rowHeight={METRIC_TABLE_ROW_HEIGHT}
            isCollapsed={componentState.areColumnsCollapsed}
            onToggleCollapse={handleToggleCollapseColumns}
            bodyId={METRIC_TABLE_BODY_ID}
            resetWhen={() =>
              previousTab.value !== props.getData().metricsTableSelectedTab
            }
            waitUntil={() => !props.getData().isLoading}
            tableBodyRef={onTableBodyRef}
          />
        )}

        {getResponsiveSize() === 'XS' && (
          <MetricsList
            getData={getData}
            overlazyScoreNodeId={componentState.overlazyScoreNodeId}
            handleUpdateMetricScore={
              getActionHandlers().handleUpdateMetricScore
            }
            handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
          />
        )}
        <BloomPageEmptyState
          show={!props.getData().isLoading && !getData().metrics.nodes.length}
          showBtn={
            getData().metricsTableSelectedTab === 'WEEKLY' &&
            getData().pageType !== 'WORKSPACE'
          }
          emptyState={EMPTYSTATE_DATA}
          fillParentContainer={getData().pageType === 'WORKSPACE'}
        />
        {props.getData().isLoading && (
          <Loading
            size='small'
            css={css`
              padding: ${(props) => props.theme.sizes.spacing32};
            `}
          />
        )}
      </Card.Body>
    </Card>
  )
})
