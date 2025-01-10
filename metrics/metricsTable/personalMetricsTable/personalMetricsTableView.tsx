import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { addOrRemoveWeeks, useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'

import {
  METRICS_FREQUENCY_LOOKUP,
  type MetricFrequency,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  Card,
  Icon,
  Loading,
  Menu,
  TABLE_HOVERED_COLUMN_CLASS,
  TTableRow,
  TableCell,
  TableColumn,
  TableWithStickyColumns,
  Text,
  TextEllipsis,
  toREM,
  useRenderListItem,
  useResizeObserver,
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

import { getMetricScoreData } from '../helpers'
import {
  METRIC_TABLE_BODY_ID,
  METRIC_TABLE_DIVIDER_TYPE,
  METRIC_TABLE_ITEM_ROW_TYPE,
  METRIC_TABLE_ROW_HEIGHT,
  METRIC_TABLE_SCORE_CELL_WIDTH,
  METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN,
} from '../metricsTableConstants'
import {
  MetricsRowAverage,
  MetricsRowCumulative,
  MetricsRowGoal,
  MetricsRowTitle,
} from '../metricsTableMetadataTableRow'
import { MetricsTableScoresTableCell } from '../metricsTableScoresTableCell'
import { MetricsTableScoresTableColumnHeader } from '../metricsTableScoresTableColumnHeader'
import {
  type MetricTableColumnOptions,
  type TMetricsTableResponsiveSize,
} from '../metricsTableTypes'
import { PersonalMetricsList } from './personalMetricsList'
import {
  PersonalMetricsTableHeaderLeft,
  PersonalMetricsTableHeaderRight,
} from './personalMetricsTableHeader'
import {
  type IPersonalMetricTableMeetingItem,
  type IPersonalMetricsTableViewProps,
} from './personalMetricsTableTypes'

export const PersonalMetricsTableView = observer(
  function PersonalMetricsTableView(props: IPersonalMetricsTableViewProps) {
    const componentState = useObservable<{
      areColumnsCollapsed: boolean
      metricsTableScrollParent: Maybe<HTMLDivElement>
      userHasScrolledHorizontally: boolean
      isComponentScroll: boolean
      overlazyScoreNodeId: Maybe<Id>
    }>({
      areColumnsCollapsed: false,
      metricsTableScrollParent: null,
      userHasScrolledHorizontally: false,
      isComponentScroll: false,
      overlazyScoreNodeId: null,
    })

    const diResolver = useDIResolver()
    const theme = useTheme()
    const terms = useBloomCustomTerms()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { openOverlazy } = useOverlazyController()
    const { t } = useTranslation()

    const observableResizeState = useResizeObserver(
      componentState.metricsTableScrollParent,
      {
        withChildObserver: true,
        onSizeChange: function scrollToEndOfTableIfNeeded() {
          const scrollParent = componentState.metricsTableScrollParent
          if (scrollParent == null) return

          if (!componentState.userHasScrolledHorizontally) {
            componentState.isComponentScroll = true
            scrollParent.scrollLeft = scrollParent.scrollWidth
          }
        },
      }
    )

    const getResponsiveSize = useComputed(
      (): TMetricsTableResponsiveSize => {
        if (!observableResizeState.ready) return 'UNKNOWN'
        if (observableResizeState.width < 500) return 'XS'
        if (observableResizeState.width < 800) return 'S'
        if (observableResizeState.width < 1000) return 'M'
        return 'L'
      },
      { name: 'personalMetricsTableView-getResponsiveSize' }
    )

    const previousSelectedFrequencyTab = useObservablePreviousValue(
      () => props.data().selectedFrequencyTab
    )

    const getMetricTabsLookupWithTotalCountIncluded: () => Array<{
      text: string
      value: MetricFrequency
    }> = useComputed(
      () => {
        return METRICS_FREQUENCY_LOOKUP.map((tab) => {
          return {
            text: `${tab.text} (${props.data().metricTotalCountByFrequency[tab.value]})`,
            value: tab.value,
          }
        })
      },
      { name: 'metricsTableView-getMetricTabsLookupWithTotalCountIncluded' }
    )

    const getColumnVisibility = useComputed(
      (): Record<MetricTableColumnOptions, boolean> => {
        const columnDisplayValues = props.data().columnDisplayValues
        const areColumnsCollapsed = componentState.areColumnsCollapsed

        if (areColumnsCollapsed) {
          return {
            drag: false,
            owner: false,
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
            drag: false,
            owner: false,
            title: true,
            goal: hideNonCriticalColumns ? false : columnDisplayValues['goal'],
            graph: false,
            cumulative: hideNonCriticalColumns
              ? false
              : columnDisplayValues['cumulative'],
            average: hideNonCriticalColumns
              ? false
              : columnDisplayValues['average'],
          }
        }
      },
      {
        name: 'PersonalMetricsTableView-getColumnVisibility',
      }
    )

    const getColumnSpan = useComputed(
      () => {
        return Object.keys(getColumnVisibility() || []).filter(
          (columnOption) => {
            // drag column is always rendered
            // returning true here ensures that the drag column is always counted
            // otherwise the divider within metadata table will not span the correct number of columns
            if (columnOption === 'drag') return true

            return getColumnVisibility()[
              columnOption as MetricTableColumnOptions
            ]
          }
        ).length
      },
      {
        name: 'PersonalMetricsTableView.getColumnSpan',
      }
    )

    const getTableColumns = useComputed(
      (): Array<TableColumn> => {
        const columnVisibility = getColumnVisibility()
        const scoreHeaders: Array<TableColumn> = props
          .data()
          .getMetricScoreDateRanges()
          .map((range) => {
            const getHighlightedWeekIsWithinRange = () => {
              const startDate = range.start
              const endDate = range.end
              const alwaysHighlightCurrentDate =
                props.data().selectedFrequencyTab !== 'WEEKLY'
              const currentDateTimeValue = getSecondsSinceEpochUTC()

              if (!alwaysHighlightCurrentDate) {
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
              padding: 'md',
              columnCss: isHighlightedDateRange
                ? css`
                    background-color: ${theme.colors
                      .metricsTableScoreCurrentDateRangeBackgroundColor} !important;
                  `
                : undefined,
              content: (
                <MetricsTableScoresTableColumnHeader
                  range={range}
                  metricsTableSelectedTab={props.data().selectedFrequencyTab}
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

    const renderTableRow = useRenderListItem<
      IPersonalMetricTableMeetingItem,
      Array<TTableRow>
    >((meetingWithMetrics) => {
      const rows: Array<TTableRow> = []

      const nonStickyMeetingDivider = props
        .data()
        .getMetricScoreDateRanges()
        .map((date) => {
          return (
            <td
              key={`DIVIDER_${date.start}`}
              css={css`
                border-bottom: 0.0625rem solid rgb(231, 234, 235);
                height: ${toREM(48)};
                line-height: 0;
                padding: 0;
                position: relative;
                width: ${toREM(48)};
              `}
            />
          )
        })

      rows.push({
        id: `${METRIC_TABLE_DIVIDER_TYPE}_${meetingWithMetrics.meetingId}_STICKY`,
        rowKey: `${METRIC_TABLE_DIVIDER_TYPE}_${meetingWithMetrics.meetingId}_STICKY`,
        isDivider: true,
        stickySideDivider: (
          <td
            colSpan={componentState.areColumnsCollapsed ? 7 : getColumnSpan()}
            css={css`
              position: relative;
              padding: 0 ${toREM(8)};
              line-height: 0;
              height: ${toREM(48)};
              border-bottom: ${(props) =>
                `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.tableBorderColor}`};
            `}
          >
            <TextEllipsis
              lineLimit={1}
              css={css`
                background-color: ${meetingWithMetrics.meetingColor};
                border-radius: ${toREM(4)};
                padding: ${toREM(2)} ${toREM(6)};
              `}
            >
              {meetingWithMetrics.meetingName}
            </TextEllipsis>
          </td>
        ),
        nonStickySideDivider: nonStickyMeetingDivider,
        stickyRowCss: css`
          border-bottom: ${(props) =>
            `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.cardBorderColor}`};
        `,
        nonStickyRowCss: css`
          > td {
            background-color: ${(props) =>
              props.theme.colors.metricsTableScoreBgColor};
          }
        `,
      })

      meetingWithMetrics.metrics.forEach((metric) => {
        const getGoalText = () =>
          isSingleValueMetricGoal(metric.goal)
            ? metric.goal.valueFormatted
            : isMinMaxMetricGoal(metric.goal)
              ? `${metric.goal.minData.minFormatted} - ${metric.goal.maxData.maxFormatted}`
              : t('N/A')

        const handleClickMetricTitle = () => {
          openOverlazy('EditMetricDrawer', {
            meetingId:
              meetingWithMetrics.meetingId === 'PERSONAL'
                ? null
                : meetingWithMetrics.meetingId,
            metricId: metric.id,
          })
        }
        const scoreDataForMetric = getMetricScoreData({
          metric,
          metricScoreDateRanges: props.data().getMetricScoreDateRanges(),
          frequency: props.data().selectedFrequencyTab,
          startOfWeek: 'Sunday',
          currentUserId: props.data().currentUserId,
          preventEditingUnownedMetrics: false,
          currentUserPermissions: meetingWithMetrics.permissionsForMeeting,
          highlightPreviousWeekForMetrics: false,
          diResolver: diResolver,
        })

        const scoreCells: Array<TableCell> = scoreDataForMetric
          .getDateRangesData()
          .map((rangeData, index) => {
            return {
              key: `score_table_item_${metric.id}_${rangeData.start}`,
              padding: 'md',
              content: (
                <MetricsTableScoresTableCell
                  key={`score_table_item_${metric.id}_${rangeData.start}`}
                  metric={scoreDataForMetric}
                  canEditMetricsInMeeting={
                    scoreDataForMetric.permissions.canEditMetricsInMeeting
                  }
                  getCurrentUserPermissions={() => ({
                    canCreateIssuesInMeeting: {
                      allowed: false,
                      message:
                        'THIS SHOULD NOT SHOW. CONTEXT AWARE BUTTONS SHOULD NOT BE VISIBLE ON PERSONAL METRICS',
                    },
                    canCreateTodosInMeeting: {
                      allowed: false,
                      message:
                        'THIS SHOULD NOT SHOW. CONTEXT AWARE BUTTONS SHOULD NOT BE VISIBLE ON PERSONAL METRICS',
                    },
                  })}
                  index={index}
                  weekStart={'Sunday'}
                  meetingId={meetingWithMetrics.meetingId}
                  isLoading={props.data().isLoading}
                  rangeData={rangeData}
                  overlazyScoreNodeId={null}
                  hideContextAwareCreateButtons={true}
                  handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
                  handleUpdateMetricScore={
                    props.actions().handleUpdateMetricScore
                  }
                />
              ),
            }
          })

        rows.push({
          id: `${METRIC_TABLE_ITEM_ROW_TYPE}_${meetingWithMetrics.meetingId}_${metric.id}`,
          rowKey: `${meetingWithMetrics.meetingId}_${metric.id}`,
          cells: [
            {
              key: 'drag',
              sticky: true,
              padding: 'none',
              content: <div />,
              // always show to ensure padding, it's hidden by the prop passed to the component
              show: true,
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
                  getColumnsAreCollapsed={() =>
                    componentState.areColumnsCollapsed
                  }
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
              content: (
                <MetricsRowGoal metric={metric} getGoalText={getGoalText} />
              ),
              show: getColumnVisibility().goal,
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
            &.${TABLE_HOVERED_COLUMN_CLASS} {
              background-color: ${theme.colors.metricsTableRowHoverColor};
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
      })

      return rows
    })

    const setMetricsTableScrollParent = useAction(
      (el: Maybe<HTMLDivElement>) => {
        componentState.metricsTableScrollParent = el
      }
    )

    const onTableBodyRef = useAction(
      (element: HTMLTableSectionElement | null) => {
        if (!element) return
        componentState.userHasScrolledHorizontally = false
      }
    )

    const handleToggleCollapseColumns = useAction(() => {
      componentState.areColumnsCollapsed = !componentState.areColumnsCollapsed
    })

    //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
    const handleSetOverlazyScoreNodeId = useAction((nodeId: Maybe<Id>) => {
      return setOverlazyScoreNodeId(nodeId)
    })

    const setOverlazyScoreNodeId = useAction((nodeId: Maybe<Id>) => {
      componentState.overlazyScoreNodeId = nodeId
    })

    return (
      <Card
        className={props.className}
        css={css`
          height: 100%;
        `}
      >
        <Card.Header
          renderLeft={
            <PersonalMetricsTableHeaderLeft
              selecedFrequencyTab={props.data().selectedFrequencyTab}
              isCurrentUser={props.data().isCurrentUser}
            />
          }
          renderRight={
            getResponsiveSize() !== 'UNKNOWN' && (
              <PersonalMetricsTableHeaderRight
                workspaceTileId={props.data().workspaceTileId}
                columnDisplayValues={props.data().columnDisplayValues}
                responsiveSize={getResponsiveSize}
                isCumulativeSumColumnDisabled={false}
                isAverageColumnDisabled={false}
                hideOptionsKebab={!props.data().isCurrentUser}
                onDeleteTile={props.actions().onDeleteTile}
                onSetColumnDisplay={props.actions().onSetColumnDisplay}
              />
            )
          }
          css={css`
            border-bottom: ${(props) =>
              `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.cardBorderColor}`};
            padding: 0;
          `}
        >
          {getResponsiveSize() !== 'XS' ? (
            <Card.Tabs
              active={props.data().selectedFrequencyTab}
              tabs={getMetricTabsLookupWithTotalCountIncluded()}
              onChange={(newTab) =>
                props
                  .actions()
                  .onSetMetricFrequencyTab(newTab as MetricFrequency)
              }
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
                          props.actions().onSetMetricFrequencyTab(tab.value)
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
                  {getMetricTabsLookupWithTotalCountIncluded().find(
                    (tab) => tab.value === props.data().selectedFrequencyTab
                  )?.text ?? 'WEEKLY'}
                </TextEllipsis>
                <Icon iconName='chevronDownIcon' iconSize='md2' />
              </span>
            </Menu>
          )}
        </Card.Header>
        <Card.Body
          ref={setMetricsTableScrollParent}
          css={css`
            display: inline-flex;
            overflow: auto;
            padding: 0;
          `}
        >
          {getResponsiveSize() !== 'UNKNOWN' &&
            getResponsiveSize() !== 'XS' && (
              <TableWithStickyColumns
                bodyId={METRIC_TABLE_BODY_ID}
                tableBodyRef={onTableBodyRef}
                items={props.data().meetingMetrics}
                getColumns={getTableColumns}
                renderRow={renderTableRow}
                headerHeight={METRIC_TABLE_ROW_HEIGHT}
                rowHeight={METRIC_TABLE_ROW_HEIGHT}
                isCollapsed={componentState.areColumnsCollapsed}
                onToggleCollapse={handleToggleCollapseColumns}
                resetWhen={() =>
                  previousSelectedFrequencyTab.value !==
                  props.data().selectedFrequencyTab
                }
                waitUntil={() => !props.data().isLoading}
              />
            )}
          {getResponsiveSize() === 'XS' && (
            <PersonalMetricsList
              data={props.data}
              actions={props.actions}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
            />
          )}
          <BloomPageEmptyState
            show={
              !props.data().isLoading &&
              props.data().metricTotalCountByFrequency[
                props.data().selectedFrequencyTab
              ] === 0
            }
            showBtn={false}
            emptyState={getEmptyStateDataForMetricTable({
              terms,
              metricsTableSelectedTab: props.data().selectedFrequencyTab,
            })}
            fillParentContainer={true}
          />
          {props.data().isLoading && (
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
  }
)
