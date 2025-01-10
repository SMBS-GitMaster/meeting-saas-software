import { type Id, NodesCollection } from '@mm/gql'

import { UnreachableCaseError } from '@mm/core/exceptions/switch'

import {
  ChartableMetricUnits,
  MetricUnits,
} from '@mm/core-bloom/metrics/metricTypes'

import { metricCanBeAddedToTabByUser } from '../metricsTabs/onMetricsTableChartButtonClick'

export type ChartButtonDisabledReason =
  | 'YES_NO_METRIC'
  | 'MAX_METRICS_TRACKED'
  | 'UNIT_TYPE_MISMATCH'

export function getMetricsTableRowState<
  TMetricData extends { id: Id; units: MetricUnits },
  TTabData extends {
    id: Id
    units: ChartableMetricUnits
    creator: { id: Id }
    trackedMetrics: NodesCollection<{
      TItemType: {
        id: Id
      }
      TIncludeTotalCount: true
    }>
  },
>(opts: {
  metric: TMetricData
  activeTab: Maybe<TTabData | { newTab: true }>
  userId: Id
}):
  | { chartButtonEnabled: true }
  | {
      chartButtonEnabled: false
      chartButtonDisabledReason: ChartButtonDisabledReason
    } {
  const metric = opts.metric
  if (metric.units === 'YESNO') {
    return {
      chartButtonEnabled: false,
      chartButtonDisabledReason: 'YES_NO_METRIC',
    }
  }

  if (opts.activeTab) {
    const canBeAddedToActiveTabResult = metricCanBeAddedToTabByUser({
      tab: opts.activeTab,
      metric: metric as TMetricData & { units: ChartableMetricUnits },
      userId: opts.userId,
    })

    if (canBeAddedToActiveTabResult.canBeAdded) {
      return { chartButtonEnabled: true }
    } else {
      if (canBeAddedToActiveTabResult.reason === 'MAX_METRICS_TRACKED') {
        return {
          chartButtonEnabled: false,
          chartButtonDisabledReason: 'MAX_METRICS_TRACKED',
        }
      } else if (canBeAddedToActiveTabResult.reason === 'UNIT_TYPE_MISMATCH') {
        return {
          chartButtonEnabled: false,
          chartButtonDisabledReason: 'UNIT_TYPE_MISMATCH',
        }
      } else {
        throw new UnreachableCaseError(canBeAddedToActiveTabResult.reason)
      }
    }
  } else {
    return { chartButtonEnabled: true }
  }
}
