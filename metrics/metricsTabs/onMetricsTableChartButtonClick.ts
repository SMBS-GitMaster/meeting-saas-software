import { type Id, NodesCollection } from '@mm/gql'

import { ChartableMetricUnits } from '@mm/core-bloom'

export function onMetricsTableChartButtonClick<
  TClickedMetricData extends { id: Id; units: ChartableMetricUnits },
  TTabData extends
    | {
        id: Id
        units: ChartableMetricUnits
        trackedMetrics: NodesCollection<{
          TItemType: {
            id: Id
          }
          TIncludeTotalCount: true
        }>
      }
    | { newTab: true }
>(opts: {
  metricClicked: TClickedMetricData
  activeTab: Maybe<TTabData>
  userId: Id
}) {
  if (opts.activeTab) {
    if ('newTab' in opts.activeTab && opts.activeTab.newTab) {
      return {
        addToExistingTab: opts.activeTab,
      }
    } else {
      const canBeAddedToActiveTabResult = metricCanBeAddedToTabByUser({
        tab: opts.activeTab,
        metric: opts.metricClicked,
        userId: opts.userId,
      })
      if (canBeAddedToActiveTabResult.canBeAdded) {
        return {
          addToExistingTab: opts.activeTab,
        }
      }
    }
  }

  return {
    newTab: true,
  }
}

type MetricCannoBeAddedToTabByUserReason =
  | 'UNIT_TYPE_MISMATCH'
  | 'MAX_METRICS_TRACKED'

export function metricCanBeAddedToTabByUser<
  TTabData extends
    | {
        id: Id
        units: ChartableMetricUnits
        trackedMetrics: NodesCollection<{
          TItemType: {
            id: Id
          }
          TIncludeTotalCount: true
        }>
      }
    | { newTab: true },
  TMetricData extends { id: Id; units: ChartableMetricUnits }
>(opts: {
  tab: TTabData
  metric: TMetricData
  userId: Id
}):
  | { canBeAdded: true }
  | { canBeAdded: false; reason: MetricCannoBeAddedToTabByUserReason } {
  if ('newTab' in opts.tab) {
    return { canBeAdded: true }
  }

  if (opts.tab.units !== opts.metric.units) {
    return { canBeAdded: false, reason: 'UNIT_TYPE_MISMATCH' }
  }

  if (opts.tab.trackedMetrics.totalCount >= 5) {
    return { canBeAdded: false, reason: 'MAX_METRICS_TRACKED' }
  }

  return { canBeAdded: true }
}
