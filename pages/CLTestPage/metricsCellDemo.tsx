import React, { useCallback, useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { getMetricNumberFormatted } from '@mm/core-bloom/metrics/computed'

import { useTranslation } from '@mm/core-web/i18n'
import { Expandable } from '@mm/core-web/ui'

import { MetricsCell } from '@mm/bloom-web/metrics/metricsTable/metricsCell'

export function MetricsCellDemo() {
  const { t } = useTranslation()

  //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
  const [overlazyScoreNodeId, setOverlazyScoreNodeId] =
    useState<Maybe<Id>>(null)

  const handleSetOverlazyScoreNodeId = useCallback(
    (nodeId: Maybe<Id>) => {
      return setOverlazyScoreNodeId(nodeId)
    },
    [setOverlazyScoreNodeId]
  )

  return (
    <Expandable title='Metrics Cell'>
      <div
        css={css`
          background-color: #d6d6d6;
          padding-left: 10px;
          display: flex;
        `}
      >
        <div
          css={css`
            flex-direction: row;
          `}
        >
          <h4>Cells with custom goal and no notes: </h4>
          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Off Track </h5>
            <MetricsCell
              scoreNodeId={'123'}
              metricTitle={t('Off track cell with custom goal and no notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '100',
                valueAsNumber: 100,
                valueFormatted: getMetricNumberFormatted({
                  value: '100',
                  units: 'NONE',
                }),
              }}
              metricRule={'EQUAL_TO'}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '90',
                  valueAsNumber: 90,
                  valueFormatted: getMetricNumberFormatted({
                    value: '90',
                    units: 'NONE',
                  }),
                },
                metricRule: 'EQUAL_TO',
              }}
              hasProgressiveTracking={false}
              hasNote={false}
              hasFormula={false}
              metricUnit={'NONE'}
              value={'80'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>On Track </h5>
            <MetricsCell
              scoreNodeId={'123'}
              metricTitle={t('On track cell with custom goal and no notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '100',
                valueAsNumber: 100,
                valueFormatted: getMetricNumberFormatted({
                  value: '100',
                  units: 'PESOS',
                }),
              }}
              metricRule={'GREATER_THAN'}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '90',
                  valueAsNumber: 90,
                  valueFormatted: getMetricNumberFormatted({
                    value: '90',
                    units: 'PESOS',
                  }),
                },
                metricRule: 'LESS_THAN',
              }}
              hasProgressiveTracking={false}
              hasNote={false}
              hasFormula={false}
              metricUnit={'PESOS'}
              value={'80'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Progressive Track </h5>
            <MetricsCell
              scoreNodeId={'123'}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Progressive cell with custom goal and no notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '100',
                valueAsNumber: 100,
                valueFormatted: getMetricNumberFormatted({
                  value: '100',
                  units: 'DOLLAR',
                }),
              }}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '90',
                  valueAsNumber: 90,
                  valueFormatted: getMetricNumberFormatted({
                    value: '90',
                    units: 'DOLLAR',
                  }),
                },
                metricRule: 'LESS_THAN',
              }}
              hasNote={false}
              hasFormula={false}
              hasProgressiveTracking={true}
              metricUnit={'DOLLAR'}
              value={'80'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula Empty </h5>

            <MetricsCell
              scoreNodeId={'123'}
              metricRule={'EQUAL_TO'}
              metricTitle={t(
                'Formula empty cell with custom goal and no notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              hasProgressiveTracking={false}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '100',
                valueAsNumber: 100,
                valueFormatted: getMetricNumberFormatted({
                  value: '100',
                  units: 'YEN',
                }),
              }}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '90',
                  valueAsNumber: 90,
                  valueFormatted: getMetricNumberFormatted({
                    value: '90',
                    units: 'YEN',
                  }),
                },
                metricRule: 'LESS_THAN',
              }}
              hasNote={false}
              hasFormula={true}
              metricUnit={'YEN'}
              value={null}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula On Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              metricRule={'EQUAL_TO'}
              metricTitle={t(
                'Formula on track cell with custom goal and no notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'YEN',
                }),
              }}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '100',
                  valueAsNumber: 100,
                  valueFormatted: getMetricNumberFormatted({
                    value: '100',
                    units: 'YEN',
                  }),
                },
                metricRule: 'GREATER_THAN_NOT_EQUAL',
              }}
              hasNote={false}
              hasFormula={true}
              metricUnit={'YEN'}
              hasProgressiveTracking={false}
              value={'100'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula Off Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              metricRule={'EQUAL_TO'}
              metricTitle={t(
                'Formula off track cell with custom goal and no notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'PERCENT',
                }),
              }}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '100',
                  valueAsNumber: 100,
                  valueFormatted: getMetricNumberFormatted({
                    value: '100',
                    units: 'PERCENT',
                  }),
                },
                metricRule: 'LESS_THAN_OR_EQUAL',
              }}
              hasNote={false}
              hasFormula={true}
              hasProgressiveTracking={false}
              metricUnit={'PERCENT'}
              value={'101'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Empty </h5>

            <MetricsCell
              scoreNodeId={'123'}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Empty cell with custom goal and no notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '100',
                  valueAsNumber: 100,
                  valueFormatted: getMetricNumberFormatted({
                    value: '100',
                    units: 'NONE',
                  }),
                },
                metricRule: 'GREATER_THAN',
              }}
              hasNote={false}
              hasFormula={false}
              hasProgressiveTracking={false}
              metricUnit={'NONE'}
              value={null}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>
        </div>

        <div
          css={css`
            flex-direction: row;
          `}
        >
          <h4>Cells with custom goal and notes: </h4>
          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Off Track </h5>
            <MetricsCell
              scoreNodeId={'123'}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Off track cell with custom goal and notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              customGoal={{
                goal: {
                  minData: {
                    min: '100',
                    minAsNumber: 100,
                    minFormatted: getMetricNumberFormatted({
                      value: '100',
                      units: 'NONE',
                    }),
                  },
                  maxData: {
                    max: '110',
                    maxAsNumber: 110,
                    maxFormatted: getMetricNumberFormatted({
                      value: '110',
                      units: 'NONE',
                    }),
                  },
                  type: 'minMax',
                },
                metricRule: 'BETWEEN',
              }}
              hasNote={true}
              hasProgressiveTracking={false}
              hasFormula={false}
              metricUnit={'NONE'}
              value={'90'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>On Track </h5>
            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'EUROS',
                }),
              }}
              customGoal={{
                goal: {
                  minData: {
                    min: '100',
                    minAsNumber: 100,
                    minFormatted: getMetricNumberFormatted({
                      value: '100',
                      units: 'EUROS',
                    }),
                  },
                  maxData: {
                    max: '110',
                    maxAsNumber: 110,
                    maxFormatted: getMetricNumberFormatted({
                      value: '110',
                      units: 'EUROS',
                    }),
                  },
                  type: 'minMax',
                },
                metricRule: 'BETWEEN',
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t('On track cell with custom goal and notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={true}
              hasFormula={false}
              hasProgressiveTracking={false}
              metricUnit={'EUROS'}
              value={'105'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Progressive Track </h5>
            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              customGoal={{
                goal: {
                  minData: {
                    min: '100',
                    minAsNumber: 100,
                    minFormatted: getMetricNumberFormatted({
                      value: '100',
                      units: 'NONE',
                    }),
                  },
                  maxData: {
                    max: '110',
                    maxAsNumber: 110,
                    maxFormatted: getMetricNumberFormatted({
                      value: '110',
                      units: 'NONE',
                    }),
                  },
                  type: 'minMax',
                },
                metricRule: 'BETWEEN',
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Progressive cell with custom goal and notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={true}
              hasFormula={false}
              metricUnit={'NONE'}
              hasProgressiveTracking={true}
              value={'100'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula Empty </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              customGoal={{
                goal: {
                  minData: {
                    min: '100',
                    minAsNumber: 100,
                    minFormatted: getMetricNumberFormatted({
                      value: '100',
                      units: 'NONE',
                    }),
                  },
                  maxData: {
                    max: '110',
                    maxAsNumber: 110,
                    maxFormatted: getMetricNumberFormatted({
                      value: '110',
                      units: 'NONE',
                    }),
                  },
                  type: 'minMax',
                },
                metricRule: 'BETWEEN',
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Formula empty cell with custom goal and notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={true}
              hasFormula={false}
              hasProgressiveTracking={false}
              metricUnit={'NONE'}
              value={null}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula On Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'PERCENT',
                }),
              }}
              customGoal={{
                goal: {
                  minData: {
                    min: '100',
                    minAsNumber: 100,
                    minFormatted: getMetricNumberFormatted({
                      value: '100',
                      units: 'PERCENT',
                    }),
                  },
                  maxData: {
                    max: '110',
                    maxAsNumber: 110,
                    maxFormatted: getMetricNumberFormatted({
                      value: '110',
                      units: 'PERCENT',
                    }),
                  },
                  type: 'minMax',
                },
                metricRule: 'BETWEEN',
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t(
                'Formula on track cell with custom goal and notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={true}
              hasProgressiveTracking={false}
              hasFormula={false}
              metricUnit={'PERCENT'}
              value={'100'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula Off Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'DOLLAR',
                }),
              }}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '500000',
                  valueAsNumber: 500000,
                  valueFormatted: getMetricNumberFormatted({
                    value: '500000',
                    units: 'DOLLAR',
                  }),
                },
                metricRule: 'GREATER_THAN',
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t(
                'Formula off track cell with custom goal and notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={true}
              hasProgressiveTracking={false}
              hasFormula={false}
              metricUnit={'DOLLAR'}
              value={'500000'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Empty </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              customGoal={{
                goal: {
                  type: 'singleValue',
                  value: '500000',
                  valueAsNumber: 500000,
                  valueFormatted: getMetricNumberFormatted({
                    value: '500000',
                    units: 'NONE',
                  }),
                },
                metricRule: 'EQUAL_TO',
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Formula empty cell with custom goal and notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={true}
              hasProgressiveTracking={false}
              hasFormula={false}
              metricUnit={'NONE'}
              value={null}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>
        </div>
        <div
          css={css`
            flex-direction: row;
            padding-left: 40px;
          `}
        >
          <h4>Cells without custom goal: </h4>
          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Off Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: 'YES',
                valueAsNumber: null,
                valueFormatted: 'yes',
              }}
              customGoal={null}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Off track cell without custom goal, no notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={false}
              hasProgressiveTracking={false}
              hasFormula={false}
              metricUnit={'YESNO'}
              value={'no'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>On Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: 'yes',
                valueAsNumber: null,
                valueFormatted: 'yes',
              }}
              customGoal={null}
              metricRule={'EQUAL_TO'}
              metricTitle={t('On track cell without custom goal, no notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              hasProgressiveTracking={false}
              hasNote={false}
              hasFormula={false}
              metricUnit={'YESNO'}
              value={'YES'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Progressive Track</h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              customGoal={null}
              metricRule={'EQUAL_TO'}
              metricTitle={t('Progressive cell without custom goal, no notes')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={false}
              hasFormula={false}
              hasProgressiveTracking={true}
              metricUnit={'YESNO'}
              value={'100'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula Empty </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t(
                'Formula empty cell without custom goal, no notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={false}
              hasFormula={false}
              hasProgressiveTracking={false}
              metricUnit={'NONE'}
              customGoal={null}
              value={null}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula On Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              metricRule={'LESS_THAN_OR_EQUAL'}
              metricTitle={t(
                'Formula on track cell without custom goal, no notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              customGoal={null}
              name={'fakeName'}
              hasProgressiveTracking={false}
              hasNote={false}
              hasFormula={false}
              metricUnit={'NONE'}
              value={'120'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Formula Off Track </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'PERCENT',
                }),
              }}
              metricRule={'LESS_THAN'}
              metricTitle={t(
                'Formula off track cell without custom goal, no notes'
              )}
              dateRange={'Aug 1 - Aug 31'}
              notesText={null}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={false}
              hasProgressiveTracking={false}
              customGoal={null}
              hasFormula={false}
              metricUnit={'PERCENT'}
              value={'120'}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>

          <div
            css={css`
              padding-bottom: 20px;
            `}
          >
            <h5>Empty </h5>

            <MetricsCell
              scoreNodeId={'123'}
              goal={{
                type: 'singleValue',
                value: '120',
                valueAsNumber: 120,
                valueFormatted: getMetricNumberFormatted({
                  value: '120',
                  units: 'NONE',
                }),
              }}
              metricRule={'EQUAL_TO'}
              metricTitle={t('I am a title')}
              dateRange={'Aug 1 - Aug 31'}
              notesText={t('I am a note')}
              id={'fakeId'}
              name={'fakeName'}
              hasNote={false}
              customGoal={null}
              hasFormula={false}
              hasProgressiveTracking={false}
              metricUnit={'NONE'}
              value={null}
              overlazyScoreNodeId={overlazyScoreNodeId}
              handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
              onChange={(value) => console.log('Metric cell demo value', value)}
            />
          </div>
        </div>
      </div>
    </Expandable>
  )
}
