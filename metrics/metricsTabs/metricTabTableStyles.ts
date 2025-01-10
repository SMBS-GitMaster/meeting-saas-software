import styled, { css } from 'styled-components'

import { toREM } from '@mm/core-web/ui'

export const StyledMetadataTabTableRow = styled.tr`
  box-sizing: border-box;
  height: ${toREM(48)};
  width: 100%;
  border-bottom: ${(props) => props.theme.sizes.smallSolidBorder}
    ${(props) => props.theme.colors.tableBorderColor};
  background-color: ${(props) =>
    props.theme.colors.metricChartTableMetadatarowBackgroundColor};
`

export const StyledMetricsTabTableWrapper = styled.div`
  padding: ${(props) => props.theme.sizes.spacing24}
    ${(props) => props.theme.sizes.spacing32};
  background-color: ${(props) =>
    props.theme.colors.metricChartTableBackgroundColor};
  display: inline-flex;
  flex-direction: column;
  width: 100%;
`

export const StyledMetadataTabTableWrapper = styled.div`
  position: relative;
  height: 100%;
  width: 45%;
  z-index: 1;
  background-color: ${(props) =>
    props.theme.colors.metricChartTableMetadatarowBackgroundColor};
  box-shadow: ${(props) => props.theme.sizes.bs5};
  padding-bottom: ${(props) => props.theme.sizes.spacing10};
`

export const StyledScoresTabTableWrapper = styled.div`
  overflow-x: scroll;
  display: inline-flex;
  padding: 0;
  width: 55%;

  ::-webkit-scrollbar {
    width: ${(props) => props.theme.sizes.spacing16};
  }

  ::-webkit-scrollbar-track {
    border-radius: 0 ${(props) => props.theme.sizes.br1}
      ${(props) => props.theme.sizes.br1} 0;
  }

  ::-webkit-scrollbar-track-piece {
    background-color: ${(props) =>
      props.theme.colors.metricsTableScrollBackgroundColor};
  }

  ::-webkit-scrollbar-thumb:hover,
  ::-webkit-scrollbar-thumb:focus {
    background-color: ${(props) =>
      props.theme.colors.metricsTableScrollHandleColor};
  }
`

export const StyledMetricsTabTable = styled.table`
  position: relative;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
`

export const StyledMetricsScoreTabTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  border-left: ${(props) => props.theme.sizes.smallSolidBorder}
    ${(props) => props.theme.colors.tableBorderColor};
`

type TableItemPaddingType = 'none' | 'xs' | 'sm' | 'md'

export const StyledMetadataTabTableItemWrapper = styled.td<{
  width: number
  padding: TableItemPaddingType
  centerVertically?: boolean
  centerHorizontally?: boolean
  showLeftBorder?: boolean
}>`
  position: relative;
  vertical-align: ${(props) => (props.centerVertically ? `middle` : `bottom`)};
  text-align: ${(props) => (props.centerHorizontally ? `center` : `left`)};
  width: ${(props) => toREM(props.width)};
  max-width: ${(props) => toREM(props.width)};
  height: ${toREM(48)};
  max-height: ${toREM(48)};
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

export const StyledMetricTabTableScoreRow = styled.tr`
  box-sizing: border-box;
  height: ${toREM(48)};
  width: 100%;
  background-color: ${(props) => props.theme.colors.metricsTableScoreBgColor};
`
