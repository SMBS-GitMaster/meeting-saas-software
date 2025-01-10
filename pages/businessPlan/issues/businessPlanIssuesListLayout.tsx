import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { Id } from '@mm/gql'

import { EBusinessPlanIssueListColumnSize } from '../businessPlanTypes'

export const BusinessPlanIssueListLayout = observer(
  function BusinessPlanIssueListLayout(props: {
    isPdfPreview: boolean
    issuesToDisplay: Array<{ id: Id }>
    issueListColumnSize: EBusinessPlanIssueListColumnSize
    renderEmptyGridCellsIssues: boolean
    children: React.ReactNode
    className?: string
  }) {
    const {
      isPdfPreview,
      issuesToDisplay,
      issueListColumnSize,
      renderEmptyGridCellsIssues,
      children,
    } = props

    return (
      <div
        className={props.className}
        css={css`
          height: 100%;
        `}
      >
        <StyledIssueList
          issueListColumnSize={issueListColumnSize}
          isEmptyState={issuesToDisplay.length === 0}
          isPdfPreview={isPdfPreview}
          css={css`
            height: 100%;
          `}
        >
          {children}
          {renderEmptyGridCellsIssues &&
            new Array(2).fill('').map((_, index) => {
              return (
                <div
                  key={index}
                  css={css`
                    height: 100%;
                  `}
                />
              )
            })}
        </StyledIssueList>
      </div>
    )
  }
)

const StyledIssueList = styled.div<{
  issueListColumnSize: number
  isEmptyState: boolean
  isPdfPreview: boolean
}>`
  display: ${(props) => (props.isEmptyState ? '' : 'grid')};
  grid-template-columns: ${(props) =>
    `repeat(${props.issueListColumnSize}, 1fr)`};
  grid-template-rows: 1fr;
  padding-bottom: ${(prop) => prop.theme.sizes.spacing12};
  padding-top: ${(prop) => prop.theme.sizes.spacing8};

  ${(props) =>
    props.isPdfPreview &&
    css`
      padding: 0;
    `}

  ${(props) => {
    switch (props.issueListColumnSize) {
      case EBusinessPlanIssueListColumnSize.One:
        return ''
      case EBusinessPlanIssueListColumnSize.Two:
        return css`
          > div:nth-child(2n) {
            border-left: ${(prop) =>
              `${props.theme.sizes.smallSolidBorder} ${prop.theme.colors.issueListColumnBorderColor}`};
          }
        `
      case EBusinessPlanIssueListColumnSize.Three:
        return css`
          > div:nth-child(3n) {
            border-left: ${(prop) =>
              `${props.theme.sizes.smallSolidBorder} ${prop.theme.colors.issueListColumnBorderColor}`};
          }

          > div:nth-child(3n - 1) {
            border-left: ${(prop) =>
              `${props.theme.sizes.smallSolidBorder} ${prop.theme.colors.issueListColumnBorderColor}`};
          }
        `
      case EBusinessPlanIssueListColumnSize.Four:
        return css`
          > div:nth-child(4n) {
            border-left: ${(prop) =>
              `${props.theme.sizes.smallSolidBorder} ${prop.theme.colors.issueListColumnBorderColor}`};
          }

          > div:nth-child(4n - 1) {
            border-left: ${(prop) =>
              `${props.theme.sizes.smallSolidBorder} ${prop.theme.colors.issueListColumnBorderColor}`};
          }

          > div:nth-child(4n - 2) {
            border-left: ${(prop) =>
              `${props.theme.sizes.smallSolidBorder} ${prop.theme.colors.issueListColumnBorderColor}`};
          }
        `
    }
  }}
`
