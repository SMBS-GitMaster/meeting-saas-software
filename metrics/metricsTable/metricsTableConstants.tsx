import { ValidSortForNode } from '@mm/gql'

import { i18n } from '@mm/core/i18n'

import {
  MetricDividerSizes,
  MetricFrequency,
  MetricTableScoreSortType,
} from '@mm/core-bloom'

import { BloomMetricScoreNode } from '@mm/core-bloom/metrics/metricScoreNode'

import {
  IMetricsTableViewData,
  MetricTableColumnOptions,
} from './metricsTableTypes'

export const METRIC_TABLE_BODY_ID = 'metric_table_body'
export const METRIC_DRAGGABLE_ELEMENT_CLASS = 'metric_draggable_item'
export const METRIC_TABLE_ITEM_ROW_TYPE = 'metricTableItemRow' // this has to not contain an underscore due to sortable slicing
export const METRIC_TABLE_DIVIDER_TYPE = 'metricTableDivider' // this has to not contain an underscore due to sortable slicing

export const METRIC_TABLE_COLUMNS: Array<MetricTableColumnOptions> = [
  'drag',
  'owner',
  'title',
  'goal',
  'graph',
  'cumulative',
  'average',
]

export const METRIC_TABLE_SORT_SCORE_BY_VALUE: Record<
  MetricTableScoreSortType,
  ValidSortForNode<BloomMetricScoreNode>
> = {
  TIMESTAMP_ASC: { timestamp: 'asc' },
  TIMESTAMP_DESC: { timestamp: 'desc' },
}

export const METRIC_TABLE_FILTER_BY_TAB: Record<
  MetricFrequency,
  Record<string, Record<string, MetricFrequency>>
> = {
  WEEKLY: { frequency: { eq: 'WEEKLY' } },
  MONTHLY: { frequency: { eq: 'MONTHLY' } },
  QUARTERLY: { frequency: { eq: 'QUARTERLY' } },
  DAILY: { frequency: { eq: 'DAILY' } },
}

export const RECORD_OF_METRIC_FREQUENCY_TO_RANGE_BUTTON_TOOLTIP_TEXT: Record<
  MetricFrequency,
  string
> = {
  WEEKLY: i18n.t('Scroll in one quarter increments'),
  MONTHLY: i18n.t('Scroll in one year increments'),
  QUARTERLY: i18n.t('Scroll in three year increments'),
  DAILY: i18n.t('Scroll in one week increments'),
}

export const RecordOfColumnMenuNameToDisplayValue: Record<
  keyof IMetricsTableViewData['metricTableColumnToIsVisibleSettings'],
  string
> = {
  owner: i18n.t('Owner'),
  goal: i18n.t('Goal'),
  cumulative: i18n.t('Cumulative sum'),
  average: i18n.t('Average'),
}

export const METRIC_TABLE_SCORE_CELL_WIDTH = 88
export const METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN = 168
export const METRIC_PROGRESSIVE_BAR_WIDTH = 76
export const METRIC_TABLE_ROW_HEIGHT = 48

export const DEFAULT_METRIC_DIVIDER_SIZE: MetricDividerSizes = 'SMALL'

export const RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT: Record<
  MetricDividerSizes,
  number
> = {
  SMALL: 8,
  MEDIUM: 16,
  LARGE: 24,
}

export const RECORD_OF_METRIC_DIVIDER_HEIGHT_TO_SIZE: Record<
  number,
  MetricDividerSizes
> = {
  8: 'SMALL',
  16: 'MEDIUM',
  24: 'LARGE',
}

export const DIVIDER_HEIGHT_TO_ICON_OFFSET: Record<MetricDividerSizes, number> =
  {
    SMALL: 8,
    MEDIUM: 4,
    LARGE: 1,
  }
