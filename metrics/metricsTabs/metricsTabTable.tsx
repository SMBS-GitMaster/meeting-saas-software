import React, { useCallback, useEffect, useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { useDocument } from '@mm/core/ssr'

import {
  MetricFrequency,
  MetricGoalInfoType,
  MetricRules,
  MetricUnits,
  PermissionCheckResult,
  TrackedMetricColorIntention,
  WeekStartType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText } from '@mm/core-web/ui'

import {
  IMetricTableDataItem,
  IMetricTableDataItemCustomGoalData,
  IMetricTableDataItemScoreData,
  IMetricsTableViewActionHandlers,
} from '../metricsTable/metricsTableTypes'
import { MetricTabTableScoreRow } from './metricTabTableScoreRow'
import {
  StyledMetadataTabTableWrapper,
  StyledMetricsScoreTabTable,
  StyledMetricsTabTable,
  StyledMetricsTabTableWrapper,
  StyledScoresTabTableWrapper,
} from './metricTabTableStyles'
import { MetricTabTableMetadataRow } from './metricsTabTableMetadataRow'

export const MetricsTabTable = (props: {
  isLoading: boolean
  tabId: Id
  trackedMetrics: Array<{
    id: Id
    color: TrackedMetricColorIntention
    metric: IMetricTableDataItem
  }>
  getCurrentUserPermissions: () => {
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canPerformDeleteActionsForMetricTabInMeeting: PermissionCheckResult
  }
  getRecordOfMetricIdToMetricScoreData: () => Record<
    Id,
    {
      id: Id
      ownerId: Id
      frequency: MetricFrequency
      units: MetricUnits
      title: string
      goal: MetricGoalInfoType
      formula: Maybe<string>
      notesId: Id
      progressiveData: Maybe<{ targetDate: number; sum: string }>
      rule: MetricRules
      permissions: { canEditMetricsInMeeting: PermissionCheckResult }
      metricDivider: Maybe<{
        id: Id
        title: string
        height: number
        indexInTable: number
      }>
      getDateRangesData: () => Array<{
        start: number
        end: number
        scoreData: Maybe<IMetricTableDataItemScoreData>
        customGoalData: Maybe<IMetricTableDataItemCustomGoalData>
        highlightedWeekIsWithinRange: boolean
        formattedDates: string | JSX.Element
        cellNotesText: Maybe<string>
      }>
      assignee: {
        fullName: string
      }
    }
  >
  weekStart: WeekStartType
  meetingId: Id
  handleUpdateMetricScore: IMetricsTableViewActionHandlers['handleUpdateMetricScore']
  onHandleDeleteMetricFromGraph: (trackedMetricId: Id) => void
  handleClearAllMetricsFromChart: () => void
}) => {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const document = useDocument()
  const {
    isLoading,
    tabId,
    weekStart,
    getCurrentUserPermissions,
    trackedMetrics,
    meetingId,
    getRecordOfMetricIdToMetricScoreData,
    handleUpdateMetricScore,
    onHandleDeleteMetricFromGraph,
    handleClearAllMetricsFromChart,
  } = props

  //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
  const [overlazyScoreNodeId, setOverlazyScoreNodeId] =
    useState<Maybe<Id>>(null)

  const { canPerformDeleteActionsForMetricTabInMeeting } =
    getCurrentUserPermissions()

  const handleSetOverlazyScoreNodeId = useCallback(
    (nodeId: Maybe<Id>) => {
      return setOverlazyScoreNodeId(nodeId)
    },
    [setOverlazyScoreNodeId]
  )

  useEffect(() => {
    const highlightedWeekItem = document.getElementById(
      `metricChartPopupHighlightedWeekItem`
    )
    const parentScoresTable = document.getElementById(
      `metricChartPopupExpandedScoresTable`
    )

    if (highlightedWeekItem && parentScoresTable) {
      const locationOfHighlightedWeekLeft =
        highlightedWeekItem.getBoundingClientRect().left
      const locationOfParentScoresTableLeft =
        parentScoresTable.getBoundingClientRect().left

      const offsetForScroll =
        locationOfHighlightedWeekLeft - locationOfParentScoresTableLeft

      if (locationOfHighlightedWeekLeft && parentScoresTable) {
        const newOffsetForScroll =
          offsetForScroll + parentScoresTable.scrollLeft

        parentScoresTable.scrollLeft = newOffsetForScroll
      }
    } else return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId])

  return (
    <StyledMetricsTabTableWrapper
      css={css`
        ${trackedMetrics.length > 1 &&
        css`
          padding-bottom: ${(props) => props.theme.sizes.spacing8};
        `}
      `}
    >
      <div
        css={css`
          display: inline-flex;
          justify-content: flex-start;
        `}
      >
        <StyledMetadataTabTableWrapper>
          <StyledMetricsTabTable>
            <tbody>
              {trackedMetrics.map((trackedMetric) => {
                return (
                  <MetricTabTableMetadataRow
                    key={trackedMetric.id}
                    trackedMetric={trackedMetric}
                    meetingId={meetingId}
                    getCurrentUserPermissions={getCurrentUserPermissions}
                    onHandleDeleteMetricFromGraph={
                      onHandleDeleteMetricFromGraph
                    }
                  />
                )
              })}
            </tbody>
          </StyledMetricsTabTable>
        </StyledMetadataTabTableWrapper>
        <StyledScoresTabTableWrapper id={`metricChartPopupExpandedScoresTable`}>
          <StyledMetricsScoreTabTable>
            <tbody>
              {trackedMetrics.map((trackedMetric) => {
                const metric =
                  getRecordOfMetricIdToMetricScoreData()[
                    trackedMetric.metric.id
                  ]

                return (
                  <MetricTabTableScoreRow
                    key={metric.id}
                    metric={metric}
                    getCurrentUserPermissions={getCurrentUserPermissions}
                    weekStart={weekStart}
                    isLoading={isLoading}
                    meetingId={meetingId}
                    //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
                    overlazyScoreNodeId={overlazyScoreNodeId}
                    handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
                    handleUpdateMetricScore={handleUpdateMetricScore}
                  />
                )
              })}
            </tbody>
          </StyledMetricsScoreTabTable>
        </StyledScoresTabTableWrapper>
      </div>
      {trackedMetrics.length > 1 && (
        <div
          css={css`
            display: flex;
          `}
        >
          <BtnText
            intent='tertiaryTransparent'
            width='fitted'
            disabled={!canPerformDeleteActionsForMetricTabInMeeting.allowed}
            tooltip={
              !canPerformDeleteActionsForMetricTabInMeeting.allowed
                ? {
                    msg: canPerformDeleteActionsForMetricTabInMeeting.message,
                    position: 'right center',
                  }
                : undefined
            }
            ariaLabel={t('Clear all {{metrics}} from chart', {
              metrics: terms.metric.lowercasePlural,
            })}
            css={css`
              padding: ${(props) => props.theme.sizes.spacing8} 0 0 0;
            `}
            onClick={handleClearAllMetricsFromChart}
          >
            {t('Clear all')}
          </BtnText>
        </div>
      )}
    </StyledMetricsTabTableWrapper>
  )
}
