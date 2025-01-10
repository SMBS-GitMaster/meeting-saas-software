import styled, { css } from 'styled-components'

import { toREM } from '@mm/core-web/ui'

import { METRIC_PROGRESSIVE_BAR_WIDTH } from './metricsTableConstants'

type TableItemPaddingType = 'none' | 'xs' | 'sm' | 'md'

export const StyledTableItemWrapper = styled.td<{
  showColumn: boolean
  padding: TableItemPaddingType
  width?: number
  centerVertically?: boolean
  centerHorizontally?: boolean
  showLeftBorder?: boolean
}>`
  ${(props) =>
    !props.showColumn &&
    css`
      display: none;
    `}

  position: relative;
  vertical-align: ${(props) => (props.centerVertically ? `middle` : `bottom`)};
  text-align: ${(props) => (props.centerHorizontally ? `center` : `left`)};
  height: ${toREM(48)};
  max-height: ${toREM(48)};
  ${(props) => (props.width ? `width: ${toREM(props.width)};` : '')}
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 0;
  padding-right: ${(props) =>
    props.padding === 'xs'
      ? props.theme.sizes.spacing4
      : props.padding === 'sm'
        ? props.theme.sizes.spacing8
        : props.padding === 'md'
          ? props.theme.sizes.spacing16
          : 0};

  ${(props) =>
    props.showLeftBorder &&
    css`
      border-left: ${props.theme.sizes.smallSolidBorder}
        ${props.theme.colors.tableBorderColor};
      padding-left: ${props.theme.sizes.spacing8};
    `}
`

export const StyledMetricGoalProgressiveBar = styled.div<{
  metricProgressiveBarWidth: number
}>`
  height: ${toREM(4)};
  min-width: ${toREM(METRIC_PROGRESSIVE_BAR_WIDTH)};
  width: ${toREM(METRIC_PROGRESSIVE_BAR_WIDTH)};
  border-radius: ${(props) => props.theme.sizes.br6};
  background-color: ${(props) =>
    props.theme.colors.metricsTableProgressiveBarBackgroundColor};

  &::before {
    display: inline-block;
    content: '';
    background-color: ${(props) =>
      props.theme.colors.metricsTableProgressiveBarColor};
    height: ${toREM(4)};
    width: ${(props) => toREM(props.metricProgressiveBarWidth)};
    margin-bottom: ${(props) => props.theme.sizes.spacing12};
    border-radius: ${(props) => props.theme.sizes.br6};
  }
`
