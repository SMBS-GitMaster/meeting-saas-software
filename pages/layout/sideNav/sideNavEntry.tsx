import React from 'react'
import styled, { css } from 'styled-components'

import { useNavigation } from '@mm/core-web/router'
import { Text, toREM, useTheme } from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

interface ISideNavEntryProps {
  expanded: boolean
  image: React.ReactNode // the image or icon rendered on the left
  text: string // the main text that identifies this entry
  useTextEllipsis?: boolean // if true, text will be ellipsed with a tooltip if needed
  showTooltip?: boolean
  tooltipMsg?: string
  subEntry?: boolean // if true, overall height is restricted to 44px, if falsey, height is 48px;
  actionable?: React.ReactNode // actionable goes to the right of the text
  extension?: React.ReactNode // extension goes underneath, used to render lists of workspaces and meetings, and the tools dropdown
  href?: string
  textColor?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export function SideNavEntry(props: ISideNavEntryProps) {
  const theme = useTheme()
  const { navigate } = useNavigation()

  return (
    <StyledSideNavEntry>
      <div
        css={css`
          display: flex;
          flex-flow: row nowrap;
          width: 100%;

          &:focus {
            background-color: ${(props) =>
              props.theme.colors.sideNavBarBackgroundHover};
          }

          &:hover {
            background-color: ${(props) =>
              props.theme.colors.sideNavBarBackgroundHover};
          }
        `}
      >
        <StyledSideNavEntryButton
          as={'button'}
          subEntry={props.subEntry}
          onClick={(e) => {
            props.onClick && props.onClick(e)
            props.href && navigate(props.href)
          }}
        >
          <StyledSideNavEntryImageContainer>
            {props.image}
          </StyledSideNavEntryImageContainer>
          {props.expanded && (
            <StyledSideNavEntryTextContainer>
              {props.useTextEllipsis ? (
                <TextEllipsis
                  lineLimit={1}
                  type='h4'
                  color={{
                    color:
                      props.textColor ??
                      theme.colors.sideNavBarTextColorDefault,
                  }}
                  weight={'semibold'}
                  css={css`
                    font-weight: 550;
                  `}
                  alwaysShowTooltipOnMouseOver={props.showTooltip ?? undefined}
                  tooltipProps={{
                    position: 'top left',
                  }}
                  overrideChildrenTooltipMsg={props.tooltipMsg ?? undefined}
                >
                  {props.text}
                </TextEllipsis>
              ) : (
                <Text
                  type='h4'
                  color={{
                    color:
                      props.textColor ??
                      theme.colors.sideNavBarTextColorDefault,
                  }}
                  weight={'semibold'}
                  css={css`
                    font-weight: 550;
                  `}
                >
                  {props.text}
                </Text>
              )}
            </StyledSideNavEntryTextContainer>
          )}
        </StyledSideNavEntryButton>
        {props.actionable && props.expanded && (
          <StyledSideNavEntryActionableContainer>
            {props.actionable}
          </StyledSideNavEntryActionableContainer>
        )}
      </div>
      {props.extension && props.expanded && (
        <StyledSideNavExtensionContainer>
          {props.extension}
        </StyledSideNavExtensionContainer>
      )}
    </StyledSideNavEntry>
  )
}

const StyledSideNavEntry = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  min-height: ${toREM(24)};
  box-sizing: content-box;
  justify-content: space-between;

  transition: height 3s linear;
`
const StyledSideNavEntryButton = styled.button<{
  subEntry?: boolean
  href?: string
}>`
  cursor: pointer;
  display: flex;
  width: 100%;
  background: none;
  border: 0;
  align-items: center;
  height: ${(props) => (props.subEntry ? toREM(24) : toREM(28))};
  padding: ${(props) =>
    `${props.theme.sizes.spacing8} ${props.theme.sizes.spacing12}`};
  margin: ${toREM(2)} 0;
`
const StyledSideNavEntryImageContainer = styled.div``
const StyledSideNavEntryTextContainer = styled.div`
  flex-grow: 1;
  text-align: left;
  padding-left: ${(props) => props.theme.sizes.spacing8};
`
const StyledSideNavEntryActionableContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${toREM(24)};
  margin-right: ${(props) => props.theme.sizes.spacing12};
`

const StyledSideNavExtensionContainer = styled.div`
  width: 100%;
  padding-bottom: ${(props) => props.theme.sizes.spacing20};
`
