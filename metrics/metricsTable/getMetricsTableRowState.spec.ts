import { getFakeNodesCollection } from '@mm/core/mm-gql'

import { getMetricsTableRowState } from './getMetricsTableRowState'

test('if there are no tabs, enable chart button', () => {
  const result = getMetricsTableRowState({
    metric: {
      id: 'metricId',
      units: 'DOLLAR',
    },
    activeTab: null,
    userId: 'userId',
  })

  expect(result.chartButtonEnabled).toBe(true)
})

test('if the metric is of YESNO type, disable button', () => {
  const result = getMetricsTableRowState({
    metric: {
      id: 'metricId',
      units: 'YESNO',
    },
    activeTab: null,
    userId: 'userId',
  })

  expect(result.chartButtonEnabled).toBe(false)
  if (result.chartButtonEnabled === false) {
    expect(result.chartButtonDisabledReason).toBe('YES_NO_METRIC')
  }
})

describe('if there is an active tab', () => {
  test('if the active tab is not of a matching type, disable button', () => {
    const result = getMetricsTableRowState({
      metric: {
        id: 'metricId',
        units: 'DOLLAR',
      },
      activeTab: {
        id: 'tabId',
        creator: { id: 'userId' },
        units: 'PERCENT',
        trackedMetrics: getFakeNodesCollection([]),
      },
      userId: 'userId',
    })

    expect(result.chartButtonEnabled).toBe(false)
    if (result.chartButtonEnabled === false) {
      expect(result.chartButtonDisabledReason).toBe('UNIT_TYPE_MISMATCH')
    }
  })

  test('if the active tab is of a matching type, but is full, disable button', () => {
    const result = getMetricsTableRowState({
      metric: {
        id: 'metricId',
        units: 'DOLLAR',
      },
      activeTab: {
        id: 'tabId',
        creator: { id: 'userId' },
        units: 'DOLLAR',
        trackedMetrics: getFakeNodesCollection([
          { id: 'metricId1' },
          { id: 'metricId2' },
          { id: 'metricId3' },
          { id: 'metricId4' },
          { id: 'metricId5' },
        ]),
      },
      userId: 'userId',
    })

    expect(result.chartButtonEnabled).toBe(false)
    if (result.chartButtonEnabled === false) {
      expect(result.chartButtonDisabledReason).toBe('MAX_METRICS_TRACKED')
    }
  })

  test('if the active tab is of a matching type, not full, enable button', () => {
    const result = getMetricsTableRowState({
      metric: {
        id: 'metricId',
        units: 'DOLLAR',
      },
      activeTab: {
        id: 'tabId',
        creator: { id: 'userId' },
        units: 'DOLLAR',
        trackedMetrics: getFakeNodesCollection([]),
      },
      userId: 'userId',
    })

    expect(result.chartButtonEnabled).toBe(true)
  })
})

describe('if there is no active tab', () => {
  test('enable chart button', () => {
    const result = getMetricsTableRowState({
      metric: {
        id: 'metricId',
        units: 'DOLLAR',
      },
      activeTab: null,
      userId: 'userId',
    })

    expect(result.chartButtonEnabled).toBe(true)
  })
})
