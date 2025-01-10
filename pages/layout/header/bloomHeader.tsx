import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { Id } from '@mm/gql'

import { useDocument } from '@mm/core/ssr'

import { useBloomCustomTerms } from '@mm/core-bloom'

import {
  BtnIcon,
  GridContainer,
  GridItem,
  Icon,
  Menu,
  Text,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { BloomPageEmptyStateTooltipProvider } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateTooltipProvider'

import { HEADER_HEIGHT, MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID } from '../consts'

export const BloomHeader = observer(
  React.forwardRef(function BloomHeader(
    props: {
      defaultPropsForDrawers: {
        meetingId: Maybe<Id>
      }
      title: Maybe<string> | JSX.Element
      alwaysShowBoxShadow?: boolean
      middleSection?: JSX.Element
      rightSection?: JSX.Element
      subHeader?: { content: JSX.Element; adjustedTopNavTotalHeight: number }
      titleAdornment?: JSX.Element
      universalAddClassName?: string
      className?: string
    },
    ref?: React.ForwardedRef<HTMLDivElement>
  ) {
    const [showBoxShadow, setShowBoxShadow] = useState<boolean>(
      props.alwaysShowBoxShadow || false
    )

    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const document = useDocument()
    const { openOverlazy } = useOverlazyController()

    const bodyElementForScroll = document.getElementById(
      MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID
    )

    const detectScrollPosition = useCallback(() => {
      if (
        bodyElementForScroll &&
        bodyElementForScroll.scrollTop > 0 &&
        !showBoxShadow
      ) {
        setShowBoxShadow(true)
      } else if (bodyElementForScroll && bodyElementForScroll.scrollTop === 0) {
        setShowBoxShadow(false)
      }
    }, [bodyElementForScroll, showBoxShadow, setShowBoxShadow])

    useEffect(() => {
      if (props.alwaysShowBoxShadow) return

      bodyElementForScroll &&
        bodyElementForScroll.addEventListener('scroll', detectScrollPosition)

      return () => {
        bodyElementForScroll &&
          bodyElementForScroll.removeEventListener(
            'scroll',
            detectScrollPosition
          )
      }
    }, [bodyElementForScroll, detectScrollPosition, props.alwaysShowBoxShadow])

    return (
      <BloomHeaderContainer
        className={props.className}
        ref={ref}
        showBoxShadow={showBoxShadow}
        css={
          props.subHeader
            ? css`
                flex-flow: column nowrap;
                justify-content: flex-start;
                height: ${props.subHeader.adjustedTopNavTotalHeight}px;
                min-height: ${props.subHeader.adjustedTopNavTotalHeight}px;
              `
            : undefined
        }
      >
        <GridContainer
          columns={12}
          css={css`
            width: 100%;
            margin-left: 0;
            padding-left: ${theme.sizes.spacing16};

            ${props.subHeader &&
            css`
              height: ${HEADER_HEIGHT}px;
              margin: 0;
              padding-right: ${theme.sizes.spacing16};
            `}
          `}
        >
          <GridItem
            className={'bloomHeader_title_class'}
            m={4}
            rowSpacing={theme.sizes.spacing8}
          >
            <StyledPageNameContainer
              css={css`
                background-color: ${theme.colors.topNavBackground};
              `}
            >
              {props.titleAdornment}
              {typeof props.title === 'string' || props.title === null ? (
                <TextEllipsis
                  id={'topNavMeetingText'}
                  type={'h2'}
                  color={{ color: theme.colors.bodyTextDefault }}
                  weight={'semibold'}
                  lineLimit={1}
                  tooltipProps={{ position: 'bottom left' }}
                >
                  {props.title}
                </TextEllipsis>
              ) : (
                <>{props.title}</>
              )}
            </StyledPageNameContainer>
          </GridItem>

          {props.middleSection ? (
            <GridItem m={4}>{props.middleSection}</GridItem>
          ) : null}

          <GridItem
            m={props.middleSection ? 4 : 8}
            rowSpacing={theme.sizes.spacing8}
          >
            <StyledRightSectionContainer>
              <StyledMenuSpacer width={toREM(10)} />
              {props.rightSection}
              <StyledMenuSpacer width={toREM(18)} />
              <BloomPageEmptyStateTooltipProvider emptyStateId='navPlusBtn'>
                {(tooltipProps) => (
                  <Menu
                    margin={theme.sizes.spacing16}
                    minWidthRems={12}
                    position={'bottom right'}
                    content={(close) => (
                      <>
                        <Menu.Item
                          isUniversalAdd={true}
                          onClick={(e) => {
                            openOverlazy('CreateHeadlineDrawer', {
                              meetingId: props.defaultPropsForDrawers.meetingId,
                              isUniversalAdd: true,
                            })
                            close(e)
                          }}
                        >
                          <div
                            css={css`
                              display: inline-flex;
                              align-items: center;
                              justify-content: space-between;
                              width: 100%;
                            `}
                          >
                            <Text type={'h4'} weight={'semibold'}>
                              {terms.headline.singular}
                            </Text>{' '}
                            <Icon
                              iconSize={'lg'}
                              iconName={'headlineIcon'}
                              iconColor={{
                                color: theme.colors.textFieldCaptionDefault,
                              }}
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item
                          isUniversalAdd={true}
                          onClick={(e) => {
                            openOverlazy('CreateIssueDrawer', {
                              meetingId: props.defaultPropsForDrawers.meetingId,
                              isUniversalAdd: true,
                            })
                            close(e)
                          }}
                        >
                          <div
                            css={css`
                              display: inline-flex;
                              align-items: center;
                              justify-content: space-between;
                              width: 100%;
                            `}
                          >
                            <Text type={'h4'} weight={'semibold'}>
                              {terms.issue.singular}
                            </Text>{' '}
                            <Icon
                              iconSize={'lg'}
                              iconName={'issuesIcon'}
                              iconColor={{
                                color: theme.colors.textFieldCaptionDefault,
                              }}
                            />
                          </div>
                        </Menu.Item>
                        <Menu.Item
                          isUniversalAdd={true}
                          onClick={(e) => {
                            openOverlazy('CreateTodoDrawer', {
                              meetingId: props.defaultPropsForDrawers.meetingId,
                              isUniversalAdd: true,
                            })
                            close(e)
                          }}
                        >
                          <div
                            css={css`
                              display: inline-flex;
                              align-items: center;
                              justify-content: space-between;
                              width: 100%;
                            `}
                          >
                            <Text type={'h4'} weight={'semibold'}>
                              {terms.todo.singular}
                            </Text>{' '}
                            <Icon
                              iconSize={'lg'}
                              iconName={'toDoCompleteIcon'}
                              iconColor={{
                                color: theme.colors.textFieldCaptionDefault,
                              }}
                            />
                          </div>
                        </Menu.Item>
                      </>
                    )}
                  >
                    <BtnIcon
                      className={props.universalAddClassName}
                      intent='primary'
                      size='md'
                      iconProps={{
                        iconName: 'universalAddIcon',
                        iconSize: 'md2',
                      }}
                      onClick={() => null}
                      ariaLabel={'show menu'}
                      tooltip={tooltipProps}
                      isHover={tooltipProps?.isHover}
                      rounded={true}
                      tag={'span'}
                    />
                  </Menu>
                )}
              </BloomPageEmptyStateTooltipProvider>
            </StyledRightSectionContainer>
          </GridItem>
        </GridContainer>
        {props.subHeader && (
          <GridContainer
            columns={12}
            css={css`
              width: 100%;
              margin: 0;
              padding-left: ${theme.sizes.spacing16};
              flex-shrink: 0;
            `}
          >
            <GridItem
              m={12}
              withoutXPadding={true}
              rowSpacing={theme.sizes.spacing16}
            >
              {props.subHeader.content}
            </GridItem>
          </GridContainer>
        )}
      </BloomHeaderContainer>
    )
  })
)

const StyledMenuSpacer = styled.div<{ width: string }>`
  width: ${(props) => props.width};
  flex-shrink: 0;
`

const BloomHeaderContainer = styled.div<{
  showBoxShadow: boolean
}>`
  position: sticky;
  width: 100%;
  z-index: ${(props) => props.theme.zIndices.topNav};
  top: 0;
  padding: 0;
  height: ${HEADER_HEIGHT}px;
  min-height: ${HEADER_HEIGHT}px;
  background-color: ${(props) => props.theme.colors.topNavBackground};
  display: flex;
  justify-content: center;
  align-items: center;

  ${(props) =>
    props.showBoxShadow &&
    css`
      box-shadow: ${(props) => props.theme.sizes.bs1};
    `};
`

const StyledPageNameContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
`

const StyledRightSectionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
`
