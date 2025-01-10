import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { css } from 'styled-components'

import { useAction, useObservable } from '@mm/gql'

import { useTranslation } from '@mm/core-web'

import {
  Text,
  Tooltip,
  getTextStyles,
  toREM,
  usePrevious,
} from '@mm/core-web/ui'

import {
  StyledOrgChartControlBtnIcon,
  StyledOrgChartControlBtnText,
} from './styledComponents'

export const ViewDepthControl = observer(function ViewDepthControl(props: {
  currentLevel: number
  maxLevel: number
  onLevelChange: (level: number) => void
  onCollapseAll: () => void
  onExpandAll: () => void
}) {
  const { t } = useTranslation()

  const componentState = useObservable({
    depthFieldIsEmpty: false,
    tempInvalidValue: null as number | null,
  })

  const previousLevel = usePrevious(props.currentLevel)

  const onInputChange = useAction((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      componentState.depthFieldIsEmpty = true
      return
    }

    componentState.depthFieldIsEmpty = false

    // ignore anything that's not a number
    if (!/^\d+$/.test(e.target.value)) return

    const newLevel = parseInt(e.target.value, 10)

    if (newLevel < 1 || newLevel > props.maxLevel) {
      componentState.tempInvalidValue = newLevel
      return
    }

    componentState.tempInvalidValue = null
    props.onLevelChange(parseInt(e.target.value, 10))
  })

  const { depthFieldIsEmpty, tempInvalidValue } = componentState
  useEffect(
    // the user clears the level field
    // then changes it via one of the buttons
    // this ensures the level is displayed
    action(function displayLevelWhenItChanges() {
      if (
        (depthFieldIsEmpty || tempInvalidValue) &&
        props.currentLevel !== previousLevel
      ) {
        componentState.depthFieldIsEmpty = false
        componentState.tempInvalidValue = null
      }
    }),
    [depthFieldIsEmpty, tempInvalidValue, props.currentLevel, previousLevel]
  )

  return (
    <div
      css={css`
        display: inline-flex;
        box-shadow: ${({ theme }) => theme.sizes.bs2};
        border-radius: ${({ theme }) => theme.sizes.br3};
        overflow: hidden;
      `}
    >
      <StyledOrgChartControlBtnText
        iconProps={{
          iconName: 'doubleChevronUpIcon',
        }}
        disabled={props.currentLevel === 1}
        ariaLabel={t('Collapse all direct reports')}
        css={css`
          /* important prevents the border from disappearing when the button is hovered */
          border-right: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartControlDivider} !important;

          padding: ${({ theme }) => theme.sizes.spacing16};
        `}
        onClick={props.onCollapseAll}
      >
        {t('Collapse all')}
      </StyledOrgChartControlBtnText>
      <StyledOrgChartControlBtnIcon
        iconProps={{
          iconName: 'chevronUpIcon',
        }}
        ariaLabel={t('Collapse direct reports one level')}
        tag='button'
        css={css`
          border-right: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartControlDivider} !important;
        `}
        disabled={props.currentLevel === 1}
        onClick={() => props.onLevelChange(props.currentLevel - 1)}
      />
      <div
        css={css`
          background-color: ${({ theme }) =>
            theme.colors.orgChartControlBackground};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 ${({ theme }) => theme.sizes.spacing16};
          border-right: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartControlDivider};
        `}
      >
        <Tooltip
          isOpen={componentState.tempInvalidValue != null}
          msg={
            componentState.tempInvalidValue != null
              ? t('Enter a number between 1 and {{maxLevel}}', {
                  maxLevel: props.maxLevel,
                })
              : undefined
          }
        >
          <input
            maxLength={2}
            css={css`
              ${getTextStyles({ type: 'body', weight: 'semibold' })};
              max-width: ${toREM(32)};
              border: ${({ theme }) => theme.sizes.smallSolidBorder} ${css`
                  ${({ theme }) =>
                    componentState.tempInvalidValue != null
                      ? theme.colors.orgChartControlInputErrorBorderColor
                      : 'transparent'}`};
              display: inline-block;
              border-radius: ${({ theme }) => theme.sizes.br2};
              padding: 0 ${({ theme }) => theme.sizes.spacing8};
              background-color: ${({ theme }) =>
                theme.colors.orgChartControlInputBackground};
              margin: 0;
              margin-right: ${({ theme }) => theme.sizes.spacing8};
              text-align: center;
              outline: none;
            `}
            value={
              componentState.depthFieldIsEmpty
                ? ''
                : componentState.tempInvalidValue ?? props.currentLevel
            }
            onChange={onInputChange}
          />
        </Tooltip>
        <Text weight='semibold'>{t('Levels')}</Text>
      </div>
      <StyledOrgChartControlBtnIcon
        iconProps={{
          iconName: 'chevronDownIcon',
        }}
        ariaLabel={t('Expand direct reports one level')}
        tag='button'
        disabled={props.currentLevel === props.maxLevel}
        css={css`
          border-right: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartControlDivider} !important;
        `}
        onClick={() => props.onLevelChange(props.currentLevel + 1)}
      />
      <StyledOrgChartControlBtnText
        iconProps={{
          iconName: 'doubleChevronDownIcon',
          position: 'right',
        }}
        css={css`
          padding: ${({ theme }) => theme.sizes.spacing16};
        `}
        disabled={props.currentLevel === props.maxLevel}
        ariaLabel={t('Expand all direct reports')}
        onClick={props.onExpandAll}
      >
        {t('Expand all')}
      </StyledOrgChartControlBtnText>
    </div>
  )
})
