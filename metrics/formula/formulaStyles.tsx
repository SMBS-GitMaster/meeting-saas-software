import styled, { css } from 'styled-components'

import { toREM } from '@mm/core-web/ui/responsive'

interface ICommonStyledSelectInputProps {
  width?: string
  isDisabled: boolean
  isOpen: boolean
  error: boolean
  showPlaceholder: boolean
  showSearchIcon: boolean
}

export const StyledWrapperForFormulas = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  width: 100%;
  min-height: ${toREM(40)};
  height: ${toREM(40)};

  ${({ isOpen }) =>
    isOpen &&
    css`
      min-height: ${toREM(40)};
      height: auto;
    `}

  &:hover,
  &:focus {
    outline: 0;
    min-height: ${toREM(40)};
    height: auto;
  }
`

export const StyledCustomBadgeTextContainerForFormulas = styled.div<{
  isMetricBadge: boolean
}>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  max-width: ${toREM(271)};
  height: ${(props) => props.theme.sizes.spacing28};
  margin: ${(props) => props.theme.sizes.spacing4} !important;
  padding: ${(props) => props.theme.sizes.spacing6}
    ${(props) => props.theme.sizes.spacing8};
  border-radius: ${(props) => props.theme.sizes.br1};
  background-color: ${(props) =>
    props.isMetricBadge
      ? props.theme.colors.dropdownRowBackgroundHover
      : props.theme.colors.formulaExpressionBadgeColor};
`

export const StyledFormulaInputWrapper = styled.div<
  ICommonStyledSelectInputProps
>`
  display: inline-block;
  background-color: ${(props) => props.theme.colors.textFieldBackgroundDefault};
  border: ${(props) => props.theme.sizes.smallSolidBorder}
    ${(props) => props.theme.colors.textFieldBorderStrokeDefault};
  padding: 0 ${(props) => props.theme.sizes.spacing16};
  border-radius: ${(props) => props.theme.sizes.br1};
  position: relative;
  overflow: hidden;
  min-height: ${toREM(40)};
  width: ${(props) => (props.width ? props.width : `100%`)};

  &:hover {
    border: ${(props) => props.theme.sizes.smallSolidBorder}
      ${(props) => props.theme.colors.textFieldBorderStrokeHover};
    overflow: hidden;
    min-height: ${toREM(40)};
    text-overflow: unset;
    white-space: normal;
  }

  &:focus {
    border: ${(props) => props.theme.sizes.smallSolidBorder}
      ${(props) => props.theme.colors.textFieldBorderStrokeFocused};
    outline: 0;
    min-height: ${toREM(40)};
    overflow: hidden;
    text-overflow: unset;
    white-space: normal;
  }

  ${(props) =>
    props.isOpen &&
    css`
      border: ${(props) => props.theme.sizes.smallSolidBorder}
        ${(props) => props.theme.colors.textFieldBorderStrokeFocused};
      outline: 0;
      height: unset;
      min-height: ${toREM(40)};
      overflow: hidden;
      text-overflow: unset;
      white-space: normal;
    `}

  ${(props) =>
    props.isDisabled &&
    css`
      color: ${props.theme.colors.textPrimaryDisabled};
      background-color: ${props.theme.colors.textFieldBackgroundDisabled};
      overflow: hidden;
      height: ${toREM(40)};

      &:hover {
        border-color: ${props.theme.colors.textFieldBorderStrokeDefault};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: ${toREM(40)};
        margin: 0;
      }

      &:focus {
        border-color: ${props.theme.colors.textFieldBorderStrokeDefault};
        outline: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        height: ${toREM(40)};
        white-space: nowrap;
        margin: 0;
      }
    `}

  ${(props) =>
    props.error &&
    css`
      border-color: ${props.theme.colors.textFieldBorderErrorDefault};

      &:hover {
        border-color: ${props.theme.colors.textFieldBorderErrorHover};
      }

      &:focus {
        border-color: ${props.theme.colors.textFieldBorderErrorFocused};
      }
    `}

 

  .contentEditable {
    ${(props) =>
      css`
        height: ${toREM(20)};
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        outline: none;
        min-width: 20%;
        margin: ${(props) => props.theme.sizes.spacing8} 0;

        ${props.isOpen &&
        css`
          outline: 0;
          height: unset;
          min-height: ${toREM(20)};
          overflow: hidden;
          text-overflow: unset;
          white-space: normal;
        `}

        &:hover,
        &:focus,
        &:focus-visible {
          border: none !important;
        }

        ${props.showPlaceholder &&
        css`
          color: ${props.theme.colors.inputTextFieldTextColor} !important;
        `}

        :empty:before {
          content: attr(placeholder);
          color: ${props.theme.colors.inputTextFieldTextColor};
        }
      `}
  }
`
