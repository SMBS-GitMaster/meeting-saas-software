import styled, { css } from 'styled-components'

import { toREM } from '@mm/core-web/ui'

export const StyledAccordionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.sizes.spacing8};
  padding: ${({ theme }) => `${theme.sizes.spacing4} 0`};
`

export const StyledAccordionBody = styled.div<{
  collapse: boolean
}>`
  ${(props) =>
    !props.collapse &&
    css`
      display: none;
    `}
`

export const StyledListItem = styled.li`
  padding-bottom: ${(props) => props.theme.sizes.spacing4};
  display: flex;
  align-items: center;
  position: relative;

  ::before {
    content: '';
    border: ${(props) =>
      `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.bulletPointBorderColor}`};
    background-color: ${(props) =>
      props.theme.colors.bulletPointBackgroundColor};
    border-radius: ${(props) => props.theme.sizes.br1};
    display: inline-block;
    width: ${toREM(6)};
    height: ${toREM(6)};
    margin-right: ${toREM(4)};
    margin-bottom: ${toREM(1)};
    vertical-align: middle;
  }

  &:not(:last-child):after {
    display: block;
    position: absolute;
    content: '';
    top: ${toREM(12)};
    left: ${toREM(2)};
    height: ${toREM(16)};
    border-left: ${(props) =>
      `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.bulletPointBorderColor}`};
  }

  &:last-child {
    padding-bottom: 0;
  }
`

export const StyledSentFromItem = styled(StyledListItem)`
  &:last-child {
    padding-bottom: 0;
    color: ${({ theme }) => theme.colors.issueHistoryLastEventBg};
  }
`

export const StyledListTimeLineItem = styled(StyledListItem)<{
  showTimelineString: boolean
  isLastItem: boolean
}>`
  ${(props) =>
    props.showTimelineString &&
    !props.isLastItem &&
    css`
      ::after {
        display: block;
        position: absolute;
        content: '';
        top: ${toREM(12)};
        left: ${toREM(2)};
        height: ${toREM(16)};
        border-left: ${(props) => props.theme.sizes.smallSolidBorder}
          ${(props) => props.theme.colors.bulletPointBorderColor};
      }
    `}
`

export const StyledUl = styled.ul`
  list-style: none;
  padding-inline-start: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
`
