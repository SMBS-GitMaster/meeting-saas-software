import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { Id } from '@mm/gql'

import { BtnIcon, BtnText, toREM } from '@mm/core-web/ui'

import {
  HORIZONTAL_SEAT_MARGIN,
  VERTICAL_SEAT_MARGIN_FROM_SUPERVISOR_TO_TOP_OF_HORIZONTAL_LINE,
  VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS,
} from '../consts'

export const StyledOrgChartControlBtnIcon = styled(BtnIcon)`
  color: ${(props) =>
    props.disabled
      ? props.theme.colors.buttonTextDisabled
      : props.theme.colors.buttonPrimaryTextAll};
  display: inline-flex;
  background-color: ${({ theme }) => theme.colors.orgChartControlBackground};
  border: none;
  border-radius: 0%;
  height: ${toREM(32)};

  &:hover,
  &:focus {
    outline: none;
    border: none;
    background-color: ${({ theme }) =>
      theme.colors.orgChartControlHoverBackground};
  }
`

export const StyledOrgChartControlBtnText = styled(BtnText)`
  color: ${(props) =>
    props.disabled
      ? props.theme.colors.buttonTextDisabled
      : props.theme.colors.buttonPrimaryTextAll};
  display: inline-flex;
  background-color: ${({ theme }) => theme.colors.orgChartControlBackground};
  border: none;
  border-radius: 0%;
  height: ${toREM(32)};

  &:hover,
  &:focus {
    outline: none;
    border: none;
    background-color: ${({ theme }) =>
      theme.colors.orgChartControlHoverBackground};
  }
`

export const DirectReportGroup = observer(function DirectReportGroup(props: {
  children: React.ReactNode
  hide: boolean
  className?: string
}) {
  return (
    <div
      className={props.className}
      css={css`
        position: relative;
        display: inline-flex;
        opacity: ${props.hide ? 0 : 1};
        pointer-events: ${props.hide ? 'none' : 'inherit'};
      `}
    >
      {/* vertical line that descends to direct report from the manager */}
      <div
        css={css`
          background: ${({ theme }) => theme.colors.orgChartLineColor};
          position: absolute;
          height: ${VERTICAL_SEAT_MARGIN_FROM_SUPERVISOR_TO_TOP_OF_HORIZONTAL_LINE}em;
          width: 1px;
          top: 0;
          left: 50%;
          transform: translate(
            -50%,
            calc(
              -100% - ${VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS}em
            )
          );
        `}
      />
      {props.children}
    </div>
  )
})

export const OrgChartGroup = observer(function OrgChartGroup(props: {
  parentSeatId: Id
  children: React.ReactNode
  isLeftEdgeGroup: boolean
  isRightEdgeGroup: boolean
  horizontalLine: boolean
  className?: string
}) {
  const { isLeftEdgeGroup, isRightEdgeGroup } = props
  return (
    <div
      id={`group-${props.parentSeatId}`}
      className={props.className}
      css={css`
        position: relative;
      `}
    >
      {/* horizontal line that is above a group of direct reports */}
      {props.horizontalLine && (
        <div
          id={`group-horizontal-line-${props.parentSeatId}`}
          css={css`
            background: ${({ theme }) => theme.colors.orgChartLineColor};
            position: absolute;
            width: ${isLeftEdgeGroup
              ? '50%'
              : isRightEdgeGroup
                ? `${`calc(50% + ${HORIZONTAL_SEAT_MARGIN / 2}em)`}`
                : '100%'};
            height: 1px;
            top: -${VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS}em;
            left: ${isLeftEdgeGroup ? '50%' : '0'};
          `}
        />
      )}

      {props.children}
    </div>
  )
})
