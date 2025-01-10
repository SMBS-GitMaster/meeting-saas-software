import { PermissionCheckResult } from '@mm/core-bloom/permissions'

import { ITooltipProps } from '@mm/core-web/ui'

import {
  ChartButtonDisabledReason,
  getMetricsTableRowState,
} from '../getMetricsTableRowState'

export const getMetricDisabledStateAndTooltipForChartingMetric = (opts: {
  isMetricAlreadyCharted: boolean
  isSharedToMeetingTab: boolean
  canPerformDeleteActionsForMetricTabInMeeting: PermissionCheckResult
  canEditMetricTabInMeeting: PermissionCheckResult
  canCreateMetricsTabsInMeeting: PermissionCheckResult
  stateForRow: ReturnType<typeof getMetricsTableRowState>
  chartButtonDisabledMessageByReason: Record<
    ChartButtonDisabledReason,
    React.ReactNode
  >
}): {
  disabledStateForChartingMetric: boolean
  tooltipForChartingMetric?: ITooltipProps
} => {
  const {
    isMetricAlreadyCharted,
    isSharedToMeetingTab,
    stateForRow,
    canCreateMetricsTabsInMeeting,
    canPerformDeleteActionsForMetricTabInMeeting,
    canEditMetricTabInMeeting,
    chartButtonDisabledMessageByReason,
  } = opts

  const permissionCheckForChartingMetric = isMetricAlreadyCharted
    ? canPerformDeleteActionsForMetricTabInMeeting
    : canEditMetricTabInMeeting

  const disabledStateForChartingMetric =
    !stateForRow.chartButtonEnabled ||
    !canCreateMetricsTabsInMeeting.allowed ||
    (!permissionCheckForChartingMetric.allowed && isSharedToMeetingTab)

  const tooltipForChartingMetric: ITooltipProps | undefined =
    !canCreateMetricsTabsInMeeting.allowed
      ? {
          msg: canCreateMetricsTabsInMeeting.message,
          position: 'right center',
        }
      : !permissionCheckForChartingMetric.allowed && isSharedToMeetingTab
      ? {
          msg: permissionCheckForChartingMetric.message,
          position: 'right center',
        }
      : !stateForRow.chartButtonEnabled
      ? {
          position: 'top center',
          msg: chartButtonDisabledMessageByReason[
            stateForRow.chartButtonDisabledReason
          ],
        }
      : undefined

  return { disabledStateForChartingMetric, tooltipForChartingMetric }
}
