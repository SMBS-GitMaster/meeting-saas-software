import styled from 'styled-components'

import { toREM } from '@mm/core-web/ui'

export const StyledSideNavUL = styled.ul`
  box-sizing: border-box;
  margin: 0 ${(props) => props.theme.sizes.spacing16} 0
    ${(props) => props.theme.sizes.spacing36};
  padding: 0;

  > button:last-of-type {
    margin-bottom: 0;
  }
`

export const StyledSideNavLI = styled.button<{ isBulletedList: boolean }>`
  cursor: pointer;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  border: 0;
  border-radius: ${(props) => props.theme.sizes.br1};
  background: none;
  min-height: ${toREM(24)};
  margin-bottom: ${(props) => props.theme.sizes.spacing4};
  padding: ${(props) =>
    `0 ${props.theme.sizes.spacing6} 0 ${props.theme.sizes.spacing16}`};
  color: ${(props) => props.theme.colors.sideNavBarTextColorDefault};

  &::before {
    content: ${(props) => props.isBulletedList && '•'};
    margin-right: ${(props) => props.theme.sizes.spacing8};
  }

  &:hover {
    background: ${(props) => props.theme.colors.sideNavBarBackgroundHover};
  }

  &:focus {
    background: ${(props) => props.theme.colors.sideNavBarBackgroundHover};
  }
`

export const StyledSeeAllButtonWrapper = styled.div`
  margin-left: ${(props) => props.theme.sizes.spacing36};
  margin-right: ${(props) => props.theme.sizes.spacing16};
`

export const StyledSeeAllButton = styled.button<{ onClick: () => void }>`
  cursor: pointer;
  background: none;
  border: 0;
  width: 100%;
  box-sizing: border-box;
  height: ${toREM(24)};
  border-radius: ${(props) => props.theme.sizes.br1};
  margin-bottom: ${(props) => props.theme.sizes.spacing4};
  padding: ${(props) =>
    `0 ${props.theme.sizes.spacing6} 0 ${props.theme.sizes.spacing16}`};
  text-align: left;

  &:focus {
    background-color: ${(props) =>
      props.theme.colors.sideNavBarBackgroundHover};

    > * {
      color: ${(props) => props.theme.colors.sideNavBarTextColorSecondaryHover};
    }
  }

  &:hover {
    background-color: ${(props) =>
      props.theme.colors.sideNavBarBackgroundHover};

    > * {
      color: ${(props) => props.theme.colors.sideNavBarTextColorSecondaryHover};
    }
  }
`
