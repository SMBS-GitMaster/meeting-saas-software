import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Icon, Text, toREM } from '@mm/core-web/ui'

import { useAction } from '@mm/bloom-web/pages/performance/mobx'

import {
  VERTICAL_SEAT_MARGIN_FROM_SUPERVISOR_TO_TOP_OF_HORIZONTAL_LINE,
  VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS,
} from '../consts'
import { HierarchicalOrgChartSeat } from '../types'

export const DirectReportButtons = observer(
  function DirectReportButtons(props: {
    seat: HierarchicalOrgChartSeat
    toggleExpandDirectReports: () => void
    directReportsAreExpanded: boolean
    onAddDirectReportClick: () => void
    numberOfDirectReports: number
    className?: string
  }) {
    // prevents the org chart from being dragged accidentally when clicking on the buttons
    const onMouseDown = useAction((e: React.MouseEvent) => {
      e.stopPropagation()
    })

    return (
      <div
        className={props.className}
        css={css`
          position: absolute;
          top: calc(
            100% -
              ${VERTICAL_SEAT_MARGIN_FROM_SUPERVISOR_TO_TOP_OF_HORIZONTAL_LINE +
              VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS}em
          );
          box-sizing: border-box;
          height: ${toREM(32)};
          left: 50%;
          transform: translate(-50%, ${({ theme }) => theme.sizes.spacing8});
          z-index: 1;
          background-color: ${({ theme }) =>
            theme.colors.orgChartControlBackground};
          border: none;
          box-shadow: ${({ theme }) => theme.sizes.bs1};
          border-radius: ${({ theme }) => theme.sizes.br1};
          overflow: hidden;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
        `}
      >
        {props.seat.permissions.canCreateDirectReport.allowed && (
          <button
            type='button'
            css={buttonCss}
            onClick={props.onAddDirectReportClick}
            onMouseDown={onMouseDown}
          >
            <Icon iconName='plusCircleSolid' />
          </button>
        )}

        {props.seat.directReports?.length ? (
          <button
            type='button'
            css={buttonCss}
            onClick={props.toggleExpandDirectReports}
            onMouseDown={onMouseDown}
          >
            <Text
              css={css`
                margin-right: ${({ theme }) => theme.sizes.spacing8};
              `}
            >
              {props.numberOfDirectReports}
            </Text>

            <Icon
              iconName={
                props.directReportsAreExpanded
                  ? 'chevronUpIcon'
                  : 'chevronDownIcon'
              }
            />
          </button>
        ) : null}
      </div>
    )
  }
)

const buttonCss = css`
  cursor: pointer;
  height: 100%;
  padding: 0 ${({ theme }) => theme.sizes.spacing8};
  background-color: ${({ theme }) => theme.colors.orgChartControlBackground};
  border: none;
  display: flex;
  align-items: center;

  &:hover,
  &:active,
  &:focus {
    outline: none;
    border: none;
    background-color: ${({ theme }) =>
      theme.colors.orgChartControlHoverBackground};
  }
`
