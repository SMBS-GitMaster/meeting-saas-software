import { observer } from 'mobx-react'
import React, { useMemo } from 'react'

import { type Id } from '@mm/gql'

import { PermissionCheckResult, WeekStartType } from '@mm/core-bloom'

import {
  METRIC_TABLE_SCORE_CELL_WIDTH,
  METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN,
} from './metricsTableConstants'
import { MetricsTableScoresTableCell } from './metricsTableScoresTableCell'
import { StyledTableItemWrapper } from './metricsTableStyles'
import {
  IMetricTableDataItemCustomGoalData,
  IMetricTableDataItemScoreData,
  IMetricTableScoreData,
  IMetricsTableViewActionHandlers,
} from './metricsTableTypes'

export const MetricsTableScoresTableItemForm = observer(
  (props: {
    metric: IMetricTableScoreData
    meetingId: Id
    index: number
    isLoading: boolean
    canEditMetricsInMeeting: PermissionCheckResult
    getCurrentUserPermissions: () => {
      canCreateTodosInMeeting: PermissionCheckResult
      canCreateIssuesInMeeting: PermissionCheckResult
    }
    rangeData: {
      start: number
      end: number
      scoreData: Maybe<IMetricTableDataItemScoreData>
      customGoalData: Maybe<IMetricTableDataItemCustomGoalData>
      highlightedWeekIsWithinRange: boolean
      formattedDates: string | JSX.Element
      cellNotesText: Maybe<string>
    }
    weekStart: WeekStartType
    //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
    overlazyScoreNodeId: Maybe<Id>
    idForRenderingHighlightedWeekInFrame?: string
    handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
    handleUpdateMetricScore: IMetricsTableViewActionHandlers['handleUpdateMetricScore']
  }) => {
    const { rangeData, idForRenderingHighlightedWeekInFrame } = props

    const wrapperWidth = useMemo(() => {
      return rangeData.highlightedWeekIsWithinRange
        ? METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN
        : METRIC_TABLE_SCORE_CELL_WIDTH
    }, [rangeData.highlightedWeekIsWithinRange])

    const wrapperPadding = useMemo(() => {
      return rangeData.highlightedWeekIsWithinRange ? 'none' : 'sm'
    }, [rangeData.highlightedWeekIsWithinRange])

    return (
      <StyledTableItemWrapper
        id={idForRenderingHighlightedWeekInFrame}
        showColumn={true}
        width={wrapperWidth}
        showLeftBorder={false}
        padding={wrapperPadding}
        centerVertically={true}
      >
        <MetricsTableScoresTableCell {...props} />
      </StyledTableItemWrapper>
    )
  }
)
