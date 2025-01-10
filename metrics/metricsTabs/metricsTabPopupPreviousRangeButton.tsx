import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import {
  MetricFrequency,
  getMetricTableDateRangeButtonText,
} from '@mm/core-bloom'

import { Icon, Text, toREM } from '@mm/core-web/ui'

export const MetricsTabPopupPreviousRangeButton = (props: {
  isChartReversed: boolean
  isLoading: boolean
  currentRangeTimestamp: number
  frequency: MetricFrequency
  direction: 'FORWARD' | 'BACKWARD'
  handleUpdateMetricChartDateRanges: (props: {
    direction: 'FORWARD' | 'BACKWARD'
    frequency: MetricFrequency
  }) => void
}) => {
  const {
    isLoading,
    isChartReversed,
    currentRangeTimestamp,
    frequency,
    direction,
    handleUpdateMetricChartDateRanges,
  } = props

  const directionToUpdate = useMemo(() => {
    return isChartReversed && direction === 'FORWARD'
      ? 'BACKWARD'
      : isChartReversed && direction === 'BACKWARD'
      ? 'FORWARD'
      : direction
  }, [isChartReversed, direction])

  const rangeText = useMemo(() => {
    return getMetricTableDateRangeButtonText({
      frequency,
      currentRangeTimestamp,
      direction: directionToUpdate,
    })
  }, [frequency, currentRangeTimestamp, directionToUpdate])

  const onUpdateMetricsScoreDateRanges = useCallback(() => {
    handleUpdateMetricChartDateRanges({
      direction: directionToUpdate,
      frequency,
    })
  }, [handleUpdateMetricChartDateRanges, directionToUpdate, frequency])

  return (
    <StyledMetricPopupPreviousRangeButton
      type={'button'}
      onClick={onUpdateMetricsScoreDateRanges}
    >
      <Icon
        iconName={
          isLoading
            ? 'loadingIcon'
            : direction === 'FORWARD'
            ? 'chevronRightIcon'
            : 'chevronLeftIcon'
        }
        iconSize={'lg'}
      />

      {rangeText && (
        <Text type={'body'} weight={'semibold'}>
          {rangeText}
        </Text>
      )}
    </StyledMetricPopupPreviousRangeButton>
  )
}

const StyledMetricPopupPreviousRangeButton = styled.button`
  border: none;
  width: ${toREM(32)};
  background-color: ${(props) =>
    props.theme.colors.metricChartPreviousRangeButtonBackgroundColor};
  color: ${(props) =>
    props.theme.colors.metricChartPreviousRangeButtonTextColor};
  margin-bottom: ${toREM(32)};
  margin-top: ${toREM(8)};
  cursor: pointer;
`
