import { type Id } from '@mm/gql'

import { getFakeNodesCollection } from '@mm/core/mm-gql'

import { onMetricsTableChartButtonClick } from './onMetricsTableChartButtonClick'

test('if there are no tabs, create a new tab', () => {
  const result = onMetricsTableChartButtonClick({
    metricClicked: {
      id: 'metricId',
      units: 'DOLLAR',
    },
    activeTab: null,
    userId: 'userId',
  })

  expect(result.newTab).toBe(true)
})

describe('if there is an active tab', () => {
  test('if the active tab is of a matching type, not full, add to that tab', () => {
    const existingTab = {
      id: 'tabId',
      creator: { id: 'userId' },
      units: 'DOLLAR' as const,
      trackedMetrics: getFakeNodesCollection<true, { id: Id }>([]),
    }

    const result = onMetricsTableChartButtonClick({
      metricClicked: {
        id: 'metricId',
        units: 'DOLLAR',
      },
      activeTab: existingTab,
      userId: 'userId',
    })

    expect(result.addToExistingTab).toBe(existingTab)
  })

  test('if that tab is empty, add the metric to that empty tab', () => {
    const result = onMetricsTableChartButtonClick({
      metricClicked: {
        id: 'metricId',
        units: 'DOLLAR',
      },
      activeTab: { newTab: true },
      userId: 'userId',
    })

    expect(result).toEqual({
      addToExistingTab: { newTab: true },
    })
  })
})

describe('if there is no active tab', () => {
  test('create a new tab', () => {
    const result = onMetricsTableChartButtonClick({
      metricClicked: {
        id: 'metricId',
        units: 'DOLLAR',
      },
      activeTab: null,
      userId: 'userId',
    })

    expect(result.newTab).toBe(true)
  })
})
