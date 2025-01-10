import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { BtnText, Text, toREM } from '@mm/core-web/ui'

import { useBloomPageEmptyStateController } from './bloomPageEmptyStateController'
import { IBloomPageEmptyState } from './bloomPageEmptyStateTypes'

interface IBloomPageEmptyStateProps {
  show: boolean
  showBtn?: boolean
  title?: string
  emptyState?: IBloomPageEmptyState
  fillParentContainer?: boolean
  className?: string
}

export const BloomPageEmptyState = observer(function BloomPageEmptyState(
  props: IBloomPageEmptyStateProps
) {
  const emptyPageController = useBloomPageEmptyStateController()

  const pageData = props.emptyState
    ? props.emptyState
    : emptyPageController.pageData

  const handleShowOnHover = (show: boolean) => () =>
    emptyPageController.handleShowAllHoverState(show)

  const handleShowOnClick = (show: boolean) => () =>
    emptyPageController.handleShowAllTooltips(show)

  if (!pageData || !props.show) return <React.Fragment></React.Fragment>

  return (
    <StyledBloomPageEmptyStateContainer
      className={props.className}
      css={css`
        ${props.fillParentContainer &&
        css`
          height: 100%;
          justify-content: center;
        `}
      `}
    >
      {pageData.emptyPageData.img && (
        <StyledBloomPageEmptyStateImg src={pageData.emptyPageData.img} />
      )}
      {(props.title || pageData.emptyPageData.title) && (
        <Text
          css={css`
            line-height: ${(props) => props.theme.sizes.spacing20};
            margin-bottom: ${props.showBtn
              ? css`
                  ${(props) => props.theme.sizes.spacing24}
                `
              : '0'};
            color: ${(props) => props.theme.colors.pageEmptyStateTitle};
          `}
          weight='semibold'
        >
          {props.title || pageData.emptyPageData.title}
        </Text>
      )}
      {props.showBtn && (
        <BtnText
          intent='secondary'
          ariaLabel={'button'}
          onBlur={handleShowOnClick(false)}
          onHoverOut={handleShowOnHover(false)}
          onHover={handleShowOnHover(true)}
          onClick={handleShowOnClick(true)}
          css={css`
            padding: ${(props) =>
              `${props.theme.sizes.spacing10} ${props.theme.sizes.spacing16}`};

            &:hover,
            &:active,
            &:focus {
              border-color: ${(props) =>
                props.theme.colors.buttonSecondaryBorderDefault};
              color: ${(props) =>
                props.theme.colors.buttonSecondaryTextDefault};
            }
          `}
        >
          {pageData.emptyPageData.btnText}
        </BtnText>
      )}
    </StyledBloomPageEmptyStateContainer>
  )
})

const StyledBloomPageEmptyStateContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.cardBackgroundColor};
  display: flex;
  flex-direction: column;
  height: auto;
  padding-bottom: ${(props) => props.theme.sizes.spacing32};
  width: 100%;
`
const StyledBloomPageEmptyStateImg = styled.img`
  height: ${toREM(200)};
  object-fit: contain;
  object-position: center;
  width: ${toREM(200)};
`

export default BloomPageEmptyState
