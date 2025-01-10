import React from 'react'

import { type Id } from '@mm/gql'

import { PermissionCheckResult, WeekStartType } from '@mm/core-bloom'

import { MetricsTableScoresTableItemForm } from '../metricsTable/metricsTableScoresTableItemForm'
import {
  IMetricTableScoreData,
  IMetricsTableViewActionHandlers,
} from '../metricsTable/metricsTableTypes'
import { StyledMetricTabTableScoreRow } from './metricTabTableStyles'

export const MetricTabTableScoreRow = (props: {
  getCurrentUserPermissions: () => {
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
  }
  metric: IMetricTableScoreData
  isLoading: boolean
  meetingId: Id
  weekStart: WeekStartType
  //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
  overlazyScoreNodeId: Maybe<Id>
  handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
  handleUpdateMetricScore: IMetricsTableViewActionHandlers['handleUpdateMetricScore']
}) => {
  const {
    metric,
    isLoading,
    weekStart,
    getCurrentUserPermissions,
    meetingId,
    overlazyScoreNodeId,
    handleSetOverlazyScoreNodeId,
    handleUpdateMetricScore,
  } = props

  return (
    <StyledMetricTabTableScoreRow>
      {metric.getDateRangesData().map((rangeData, index) => {
        const idForRenderingHighlightedWeekInFrame =
          rangeData.highlightedWeekIsWithinRange
            ? `metricChartPopupHighlightedWeekItem`
            : undefined

        return (
          <MetricsTableScoresTableItemForm
            idForRenderingHighlightedWeekInFrame={
              idForRenderingHighlightedWeekInFrame
            }
            key={`score_tab_table_item_${metric.id}_${index}`}
            metric={metric}
            index={index}
            canEditMetricsInMeeting={metric.permissions.canEditMetricsInMeeting}
            getCurrentUserPermissions={getCurrentUserPermissions}
            weekStart={weekStart}
            meetingId={meetingId}
            isLoading={isLoading}
            rangeData={rangeData}
            //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
            overlazyScoreNodeId={overlazyScoreNodeId}
            handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
            handleUpdateMetricScore={handleUpdateMetricScore}
          />
        )
      })}
    </StyledMetricTabTableScoreRow>
  )
}
