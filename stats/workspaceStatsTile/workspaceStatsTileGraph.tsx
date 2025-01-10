import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import highchartsMore from 'highcharts/highcharts-more'
import highchartsAccessibility from 'highcharts/modules/accessibility'
import Stock from 'highcharts/modules/stock'
import { observer } from 'mobx-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { css } from 'styled-components'

import {
  TWorkspaceStatsTileSelectedDateRangeFilter,
  TWorkspaceStatsTileSelectedNodeFilter,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { Text, toREM, useResizeObserver, useTheme } from '@mm/core-web/ui'

import {
  GRAPH_MARKER_BASE_SETTINGS,
  getGraphBaseSettings,
} from './workspaceStatsTileConstants'
import WorkspaceStatsTileEmptySVG from './workspaceStatsTileEmptySVG.svg'
import { IWorkspaceStatsTileStatsData } from './workspaceStatsTileTypes'

Stock(Highcharts)
highchartsAccessibility(Highcharts)
highchartsMore(Highcharts)

interface IWorkspaceStatsTileGraphProps {
  statsData: IWorkspaceStatsTileStatsData
  graphHeight: Maybe<number>
  getSelectedDateRange: () => TWorkspaceStatsTileSelectedDateRangeFilter
  getSelectedNodes: () => Array<TWorkspaceStatsTileSelectedNodeFilter>
}

export const WorkspaceStatsTileGraph = observer(
  function WorkspaceStatsTileGraph(props: IWorkspaceStatsTileGraphProps) {
    const [graphEl, setGraphEl] = useState<Maybe<HTMLDivElement>>(null)

    const graphComponentRef = useRef<HighchartsReact.RefObject>(null)

    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { t } = useTranslation()
    const { width } = useResizeObserver(graphEl)

    const chartRef = graphComponentRef.current

    const baseGraphSettings = getGraphBaseSettings({
      selectedDateRange: props.getSelectedDateRange(),
      dateRangeLabels: props.statsData.dateRangeLabels,
      theme,
      graphHeight: props.graphHeight,
      terms,
    })

    const nodeFilterToGraphSeriesMap: Record<
      TWorkspaceStatsTileSelectedNodeFilter,
      any
    > = {
      GOALS: {
        name: terms.goal.plural,
        data: props.statsData.goals || [],
        marker: GRAPH_MARKER_BASE_SETTINGS,
        color: theme.colors.workspaceStatsTileGoalsNodeFilterIconColor,
      },
      ISSUES: {
        name: terms.issue.plural,
        data: props.statsData.issues || [],
        marker: GRAPH_MARKER_BASE_SETTINGS,
        color: theme.colors.workspaceStatsTileIssuesNodeFilterIconColor,
      },
      MILESTONES: {
        name: terms.milestone.plural,
        data: props.statsData.milestones || [],
        marker: GRAPH_MARKER_BASE_SETTINGS,
        color: theme.colors.workspaceStatsTileMilestonesNodeFilterIconColor,
      },
      TODOS: {
        name: terms.todo.plural,
        data: props.statsData.todos || [],
        marker: GRAPH_MARKER_BASE_SETTINGS,
        color: theme.colors.workspaceStatsTileTodosNodeFilterIconColor,
      },
    }

    const visibleSeries = props.getSelectedNodes().map((sn) => {
      return nodeFilterToGraphSeriesMap[sn]
    })

    const isEmptyState = visibleSeries.length === 0

    const chartOptions = useMemo(() => {
      return {
        ...baseGraphSettings,
        series: visibleSeries,
      }
    }, [baseGraphSettings, visibleSeries])

    useEffect(() => {
      chartRef?.chart?.reflow()
    }, [width, props.graphHeight, chartRef])

    if (isEmptyState) {
      return (
        <div
          css={css`
            align-items: center;
            background-color: ${({ theme }) =>
              theme.colors.cardBackgroundColor};
            display: flex;
            flex-direction: column;
            height: auto;
            padding-bottom: ${(props) => props.theme.sizes.spacing32};
            width: 100%;
          `}
        >
          <img
            src={WorkspaceStatsTileEmptySVG}
            alt={t('Empty stats tile image')}
            css={css`
              height: ${toREM(180)};
              object-fit: contain;
              object-position: center;
              width: ${toREM(180)};
            `}
          />
          <Text
            weight='semibold'
            css={css`
              color: ${(props) => props.theme.colors.pageEmptyStateTitle};
              line-height: ${(props) => props.theme.sizes.spacing20};
            `}
          >
            {t('You have no active stats')}
          </Text>
        </div>
      )
    }

    return (
      <div
        ref={setGraphEl}
        css={css`
          width: 100%;
        `}
      >
        <HighchartsReact
          ref={graphComponentRef}
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>
    )
  }
)
