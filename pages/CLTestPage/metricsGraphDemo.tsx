import React, { useState } from 'react'

import { generateRandomNumber } from '@mm/core/mockDataGeneration/generateMockDataUtils'

import {
  TrackedMetricColorIntention,
  UNIT_TYPE_TO_DISPLAY_TEXT,
  UNIT_TYPE_TO_SYMBOL,
} from '@mm/core-bloom'

import {
  BtnText,
  Expandable,
  IMetricData,
  MetricsGraph,
  TextInput,
} from '@mm/core-web/ui'

import { getTrackedMetricColorIntentToColorRecord } from '@mm/bloom-web/metrics/constants'

const colors: Array<TrackedMetricColorIntention> = [
  'COLOR1',
  'COLOR2',
  'COLOR3',
  'COLOR4',
  'COLOR5',
]

const mockMetrics: Array<IMetricData> = [
  {
    id: 'mock-id-1',
    title: 'Sales',
    color: colors[0],
    currentGoal: {
      type: 'singleValue',
      value: '5000',
      valueAsNumber: 5000,
      valueFormatted: '$5,000',
    },
    customGoals: [
      {
        goal: {
          type: 'singleValue',
          value: '8000',
          valueAsNumber: 8000,
          valueFormatted: '$8,000',
        },
        startDate: Math.floor(
          new Date('2023-10-01T00:00:00.000Z').getTime() / 1000
        ),
        endDate: Math.floor(
          new Date('2023-10-20T00:00:00.000Z').getTime() / 1000
        ),
      },
      {
        goal: {
          type: 'minMax',
          minData: {
            min: '3000',
            minAsNumber: 3000,
            minFormatted: '$3,000',
          },
          maxData: {
            max: '20000',
            maxAsNumber: 20000,
            maxFormatted: '$20,000',
          },
        },
        startDate: Math.floor(
          new Date('2023-10-20T00:00:00.000Z').getTime() / 1000
        ),
        endDate: Math.floor(
          new Date('2023-10-30T00:00:00.000Z').getTime() / 1000
        ),
      },
      {
        goal: {
          type: 'minMax',
          minData: {
            min: '4000',
            minAsNumber: 4000,
            minFormatted: '$4,000',
          },
          maxData: {
            max: '25000',
            maxAsNumber: 25000,
            maxFormatted: '$25,000',
          },
        },
        startDate: Math.floor(
          new Date('2023-10-30T00:00:00.000Z').getTime() / 1000
        ),
        endDate: Math.floor(
          new Date('2023-11-07T00:00:00.000Z').getTime() / 1000
        ),
      },
    ],
    scores: [
      {
        timestamp: Math.floor(
          new Date('2023-09-25T00:00:00.000Z').getTime() / 1000
        ),
        value: '-12000',
      },
      {
        timestamp: Math.floor(
          new Date('2023-10-08T00:00:00.000Z').getTime() / 1000
        ),
        value: '12500',
      },
      {
        timestamp: Math.floor(
          new Date('2023-10-16T00:00:00.000Z').getTime() / 1000
        ),
        value: '20000',
      },
      {
        timestamp: Math.floor(
          new Date('2023-10-24T00:00:00.000Z').getTime() / 1000
        ),
        value: '17000',
      },
      {
        timestamp: Math.floor(
          new Date('2023-11-03T00:00:00.000Z').getTime() / 1000
        ),
        value: '15000',
      },
      {
        timestamp: Math.floor(
          new Date('2023-11-09T00:00:00.000Z').getTime() / 1000
        ),
        value: '22500',
      },
      {
        timestamp: Math.floor(
          new Date('2023-11-15T00:00:00.000Z').getTime() / 1000
        ),
        value: '5000',
      },
    ],
  },
]

export const MetricsGraphDemo = () => {
  const [metrics, setMetrics] = useState<Array<IMetricData>>([...mockMetrics])
  const [yAxisPaddingPct, setYAxisPaddingPct] = useState(0)
  const [valueMin, setValueMin] = useState('-12000')
  const [valueMax, setValueMax] = useState('20000')
  const [goal, setGoal] = useState('')

  const updateChart = (action = 'add') => {
    if (action === 'add') {
      const newScores = mockMetrics[0].scores.map((score) => ({
        ...score,
        value: String(generateRandomNumber(Number(valueMin), Number(valueMax))),
      }))

      const metric: IMetricData = {
        id: `mock-id-${metrics.length + 1}`,
        title: `Sales${metrics.length > 1 ? ` (${metrics.length + 1})` : ''}`,
        color: colors[metrics.length],
        currentGoal: goal.length
          ? {
              type: 'singleValue',
              value: goal,
              valueAsNumber: Number(goal),
              valueFormatted: `$${goal}`,
            }
          : null,
        customGoals: [],
        scores: newScores,
      }
      setMetrics((prev) => [...prev, metric])
    } else {
      setMetrics((prev) => {
        prev.pop()
        return [...prev]
      })
    }
  }

  return (
    <Expandable
      title='Metrics Graph'
      css={`
        display: block;
      `}
    >
      <div
        css={`
          margin-top: 1rem;
          margin-bottom: 1rem;
        `}
      >
        <label htmlFor='#padding'>
          Padding{' '}
          <TextInput
            id='padding'
            name='padding'
            value={yAxisPaddingPct.toString()}
            onChange={(value) => setYAxisPaddingPct(parseInt(value || '0'))}
          />
        </label>
        <label htmlFor='#min'>
          Minimum value{' '}
          <TextInput
            id='min'
            name='min'
            value={valueMin}
            onChange={(value) => setValueMin(value)}
          />
        </label>
        <label htmlFor='#min'>
          Maximum value{' '}
          <TextInput
            id='max'
            name='max'
            value={valueMax}
            onChange={(value) => setValueMax(value)}
          />
        </label>
        <label htmlFor='#goal'>
          Goal NOTE: this is only visible when only 1 series is charted{' '}
          <TextInput
            id='goal'
            name='goal'
            value={goal}
            onChange={(value) => setGoal(value)}
          />
        </label>
        <BtnText ariaLabel='Add new series' onClick={() => updateChart()}>
          Add new series
        </BtnText>
        <BtnText
          ariaLabel='Remove series'
          onClick={() => updateChart('remove')}
        >
          Remove series
        </BtnText>
      </div>
      <MetricsGraph
        reverseXAxis={false}
        frequency={'WEEKLY'}
        emptyState='No data to display'
        metrics={metrics}
        yAxisPaddingPct={yAxisPaddingPct}
        units='DOLLAR'
        UNIT_TYPE_TO_DISPLAY_TEXT={UNIT_TYPE_TO_DISPLAY_TEXT}
        UNIT_TYPE_TO_SYMBOL={UNIT_TYPE_TO_SYMBOL}
        getTrackedMetricColorIntentToColorRecord={
          getTrackedMetricColorIntentToColorRecord
        }
      />
    </Expandable>
  )
}
