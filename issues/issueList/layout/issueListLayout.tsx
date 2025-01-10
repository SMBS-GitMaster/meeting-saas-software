import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { Id } from '@mm/gql'

import {
  EMeetingPageType,
  TBloomPageType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { Card } from '@mm/core-web/ui'

import BloomPageEmptyState from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyState'
import { getEmptyStateData } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateConstants'

import { EIssueListColumnSize } from '../issueListTypes'

export const IssueListLayout = observer(function IssueListLayout(props: {
  className?: string
  issuesToDisplay: Array<{ id: Id }>
  issueListColumnSize: EIssueListColumnSize
  showEmptyStateButton: boolean
  emptyStateText: string
  renderEmptyGridCellsIssues: boolean
  pageType: TBloomPageType
  children: React.ReactNode
}) {
  const {
    issuesToDisplay,
    issueListColumnSize,
    showEmptyStateButton,
    emptyStateText,
    renderEmptyGridCellsIssues,
    children,
  } = props

  const terms = useBloomCustomTerms()
  const EMPTYSTATE_DATA = getEmptyStateData(terms)

  return (
    <div
      className={props.className}
      css={css`
        ${issuesToDisplay.length === 0
          ? css`
              height: 100%;
            `
          : css`
              height: auto !important;
              overflow-y: auto;
            `}
      `}
    >
      <IssueListCardBody
        issueListColumnSize={issueListColumnSize}
        isEmptyState={issuesToDisplay.length === 0}
        css={css`
          ${issuesToDisplay.length === 0 &&
          css`
            height: 100%;
          `}
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
        <BloomPageEmptyState
          show={issuesToDisplay.length === 0}
          showBtn={showEmptyStateButton && props.pageType !== 'WORKSPACE'}
          title={emptyStateText}
          emptyState={
            props.pageType === 'WORKSPACE'
              ? EMPTYSTATE_DATA[EMeetingPageType.Issues] || undefined
              : undefined
          }
          fillParentContainer={props.pageType === 'WORKSPACE'}
        />
      </IssueListCardBody>
    </div>
  )
})

const IssueListCardBody = styled(Card.Body)<{
  issueListColumnSize: number
  isEmptyState: boolean
}>`
  display: ${(props) => (props.isEmptyState ? '' : 'grid')};
  grid-template-columns: ${(props) =>
    `repeat(${props.issueListColumnSize}, 1fr)`};
  grid-template-rows: 1fr;
  padding-bottom: ${(prop) => prop.theme.sizes.spacing12};
  padding-top: ${(prop) => prop.theme.sizes.spacing8};

  ${(props) => {
    switch (props.issueListColumnSize) {
      case EIssueListColumnSize.One:
        return ''
      case EIssueListColumnSize.Two:
        return css`
          > div:nth-child(2n) {
            border-left: ${(prop) =>
              `${props.theme.sizes.smallSolidBorder} ${prop.theme.colors.issueListColumnBorderColor}`};
          }
        `
      case EIssueListColumnSize.Three:
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
      case EIssueListColumnSize.Four:
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
