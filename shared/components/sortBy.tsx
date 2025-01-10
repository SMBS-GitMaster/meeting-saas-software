import React from 'react'
import styled, { FlattenSimpleInterpolation, css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { ITooltipProps, Icon, Menu, Text, useTheme } from '@mm/core-web/ui'

interface ISortByOpt {
  text: string
  value: string
}

interface ISortBy {
  sortingOptions: Array<ISortByOpt>
  selected?: string | null
  className?: string
  selectedCss?: FlattenSimpleInterpolation
  labelCss?: FlattenSimpleInterpolation
  showOnlyIcon?: boolean
  onChange?: (newSelect: any) => any
  hideItem?: (sortOption: ISortByOpt) => boolean
  disableItem?: (sortOption: ISortByOpt) => boolean
  tooltipItem?: (sortOption: ISortByOpt) => ITooltipProps | undefined
}

export const SortBy = (props: ISortBy) => {
  const theme = useTheme()
  const { t } = useTranslation()

  const showOnlyIcon = props.showOnlyIcon || false

  const handleChange =
    (
      newSelect: string,
      closeFunc: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    ) =>
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      closeFunc(e)
      if (props.onChange) props.onChange(newSelect)
    }

  const getValidateOption = (
    valName: keyof typeof props,
    optData: ISortByOpt
  ) => {
    const prop = props[valName]
    if (prop != null && typeof prop === 'function') {
      return prop(optData)
    } else {
      return undefined
    }
  }

  const renderSortOptions = (
    closeFunc: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  ) =>
    props.sortingOptions.map((opt) => {
      if (props.hideItem && props.hideItem(opt)) {
        return null
      }

      return (
        <SortByOption
          key={opt.value}
          onClick={handleChange(opt.value, closeFunc)}
          disabled={getValidateOption('disableItem', opt)}
          tooltip={getValidateOption('tooltipItem', opt)}
        >
          <Text type={'body'}>{opt.text}</Text>
          {props.selected === opt.value && (
            <>
              <span
                css={css`
                  width: ${(props) => props.theme.sizes.spacing8};
                `}
              />
              <Icon iconName={'checkIcon'} iconSize={'sm'} />
            </>
          )}
        </SortByOption>
      )
    })

  if (showOnlyIcon) {
    return (
      <Menu content={renderSortOptions}>
        <SortBySelectedOption css={props.selectedCss}>
          <Icon iconName='sortIcon' iconSize='lg' />
        </SortBySelectedOption>
      </Menu>
    )
  } else {
    return (
      <SortByWrapper className={props.className}>
        <Icon iconName='sortIcon' iconSize='lg' />
        <SortByLabel
          css={props.labelCss}
          type='body'
          weight='semibold'
          color={{ color: theme.colors.meetingSectionSortByTextColor }}
        >
          {t('Sort by:')}
        </SortByLabel>
        <Menu content={renderSortOptions}>
          <SortBySelectedOption css={props.selectedCss}>
            <Text type='body'>
              {
                props.sortingOptions.find((opt) => opt.value === props.selected)
                  ?.text
              }
            </Text>
            <Icon iconName='chevronDownIcon' iconSize='lg' />
          </SortBySelectedOption>
        </Menu>
      </SortByWrapper>
    )
  }
}

const SortByLabel = styled(Text)`
  margin-right: ${(prop) => prop.theme.sizes.spacing8};
  white-space: nowrap;
`

const SortByWrapper = styled.div`
  align-items: center;
  display: flex;
`

const SortBySelectedOption = styled.span`
  align-items: center;
  cursor: pointer;
  display: flex;
  margin-right: ${(prop) => prop.theme.sizes.spacing8};
  white-space: nowrap;
`

export const SortByOption = styled(Menu.Item)`
  span:first-of-type {
    align-items: center;
    justify-content: start;
  }
`
