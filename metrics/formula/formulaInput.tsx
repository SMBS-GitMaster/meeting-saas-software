import { useCombobox, useMultipleSelection } from 'downshift'
import { observer } from 'mobx-react'
import React, { useCallback, useMemo, useState } from 'react'
import { css } from 'styled-components'

import { type Id, NodesCollection } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import {
  FormContext,
  FormFieldArrayContext,
  RecordOfFieldTypeToFormValue,
  getFieldStateFromPropsOrContext,
  verifyFormContextMatchesField,
} from '@mm/core/forms'

import { UserAvatarColorType, useBloomCustomTerms } from '@mm/core-bloom'

import { MetricFrequency } from '@mm/core-bloom/metrics'

import { useTranslation } from '@mm/core-web/i18n'
import { Clickable, Icon } from '@mm/core-web/ui'
import { BtnText } from '@mm/core-web/ui/components/buttons'
import { InfiniteScroller } from '@mm/core-web/ui/components/infiniteScroll'
import { CustomContentEditable } from '@mm/core-web/ui/components/inputs/customContentEditable'
import {
  StyledCustomBadgeText,
  StyledLi,
  StyledUl,
} from '@mm/core-web/ui/components/inputs/inputStyles'
import { Text } from '@mm/core-web/ui/components/text'
import { ITooltipProps, Tooltip } from '@mm/core-web/ui/components/tooltip'
import { UserAvatar } from '@mm/core-web/ui/components/userAvatar'
import { useCustomPopper } from '@mm/core-web/ui/hooks/useCustomPopper'
import { toREM } from '@mm/core-web/ui/responsive'
import { useTheme } from '@mm/core-web/ui/theme/mmThemeContext'

import { formulaOperatorsLookup } from './constants'
import { FormulaOffsetMenu } from './formulaOffsetMenu'
import {
  StyledCustomBadgeTextContainerForFormulas,
  StyledFormulaInputWrapper,
  StyledWrapperForFormulas,
} from './formulaStyles'
import { EFormulaBadgeType } from './formulaTypes'

const type = 'FormulaInput'
type FieldValue = RecordOfFieldTypeToFormValue[typeof type]

type CommoneSelectionBadgeOptionProperties = {
  text: string
  value: Id
  disabled?: boolean
  tooltip?: ITooltipProps
}

type MetricOption = CommoneSelectionBadgeOptionProperties & {
  type: EFormulaBadgeType.Metric
  ownerMetaData: {
    avatar: Maybe<string>
    firstName: string
    lastName: string
    userAvatarColor: UserAvatarColorType
  }
  offset?: number
}

type FormulaOption = CommoneSelectionBadgeOptionProperties & {
  type: EFormulaBadgeType.Formula
  explination?: string
}

type NumberOption = CommoneSelectionBadgeOptionProperties & {
  type: EFormulaBadgeType.Number
}

type BadgeOption = MetricOption | FormulaOption | NumberOption

type FormulaTab = 'OPERATORS' | 'METRICS'

// NOTE FOR DEVS: contentEditable's value cannot be paired with a useState, see this issue:
// https://github.com/lovasoa/react-contenteditable/issues/161

type FormulaInputProps = {
  id: Id
  name: string
  options: Array<BadgeOption>
  optionsNodesCollection: NodesCollection<{
    TItemType: any
    TIncludeTotalCount: false
  }>
  offsetFrequency: MetricFrequency
  value?: Maybe<FieldValue>
  placeholder?: string
  disabled?: boolean
  tooltip?: ITooltipProps
  width?: string
  error?: string
  onChange?: (value: FieldValue | null) => void
  onBlur?: (event: Maybe<React.SyntheticEvent>) => void
  onFocus?: (event: Maybe<React.SyntheticEvent>) => void
} & IBaseComponentProps

// @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-991
export const FormulaInput: React.FC<FormulaInputProps> = observer(
  ({
    width,
    placeholder,
    value,
    options,
    optionsNodesCollection,
    offsetFrequency,
    id,
    tooltip: tooltipProps,
    disabled: isDisabled = false,
    name,
    error,
    onBlur,
    onFocus,
    onChange,
    className,
  }) => {
    const [searchValue, setSearchValue] = useState<string>('')
    const [activeTab, setActiveTab] = useState<FormulaTab>('OPERATORS')
    const diResolver = useDIResolver()
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const theme = useTheme()
    const ariaLabel = name
    const isMetricMode = activeTab === 'METRICS'

    const formContext = React.useContext(FormContext)
    const formFieldArrayContext = React.useContext(FormFieldArrayContext)
    const context = formFieldArrayContext || formContext

    const referenceElement = React.useRef<Maybe<HTMLDivElement>>(null)
    const popperElement = React.useRef<Maybe<HTMLLIElement>>(null)
    const deleteKeyCount = React.useRef<number>(0)
    const isOpenRef = React.useRef<boolean>(false)
    const contentEditableRef = React.useRef<Maybe<HTMLElement>>(null)
    const lastInputType = React.useRef<Maybe<string>>(null)

    const { fieldValue, fieldErrorMessage, disabled, tooltip } =
      getFieldStateFromPropsOrContext<FieldValue>({
        context,
        isDisabled,
        name,
        tooltipProps: tooltipProps || null,
        value: value || null,
        error: error || null,
        required: null,
      })

    verifyFormContextMatchesField({ name, fieldValue, context, type })

    const convertedInitialValueToBadgeOptions: Array<BadgeOption> =
      useMemo(() => {
        if (!fieldValue) {
          return []
        }

        const valueSplitAtBrackets: Array<string> =
          fieldValue.split(/(\[.*?\])/g)

        return (valueSplitAtBrackets || [])
          .filter((value) => value.length)
          .flatMap((value) => {
            if (value.includes('[') && value.includes(']')) {
              const valueSplitByOffset = value.split(/(\(.*?\))/g)

              const offset = valueSplitByOffset
                .find((item) => item.includes('(') && item.includes(')'))
                ?.replace('(', '')
                .replace(')', '')

              const metricId = valueSplitByOffset
                .find((item) => item.includes('['))
                ?.replace('[', '')

              const metricOption = options.find(
                (item) =>
                  item.value === metricId &&
                  item.type === EFormulaBadgeType.Metric
              ) as MetricOption

              if (!metricOption) {
                throwLocallyLogInProd(
                  diResolver,
                  new Error(
                    `Unknown selectedItem in formulaInput: Metric with id ${metricId} not found`
                  )
                )

                console.error(
                  `Unknown selectedItem in formulaInput: Metric with id ${metricId} not found`
                )
              }

              return {
                type: EFormulaBadgeType.Metric,
                text:
                  metricOption?.text ||
                  t('Unknown {{metric}}', {
                    metric: terms.metric.lowercaseSingular,
                  }),
                value: metricId || '',
                offset: parseInt(offset || '0'),
                ownerMetaData: {
                  avatar: metricOption?.ownerMetaData.avatar || null,
                  firstName: metricOption?.ownerMetaData.firstName,
                  lastName: metricOption?.ownerMetaData.lastName,
                  userAvatarColor: metricOption?.ownerMetaData.userAvatarColor,
                },
              }
            } else {
              const valuesSplitByNumbers =
                value.match(/[\d\.\d{0,2}]+|[^\d\.\d{0,2}]+/gi) || []

              return valuesSplitByNumbers.flatMap((value) => {
                if (new RegExp(/^(?:\d*\.\d{1,2}|\d+)$/).test(value)) {
                  return {
                    type: EFormulaBadgeType.Number,
                    text: value,
                    value,
                  }
                } else {
                  const valueSplitByFormulas =
                    value.match(
                      /\+|-|\*|\/|\^|~|%|[()]|E\+|E-|DIV|SQRT|FLOOR|CEIL|ABS|ROUNDK|ROUND|PI|EULER|EXP|LN|LOG|SIN[H]|COS[H]|TAN[H]|SIN|COS|TAN|COT|ARCSIN|ARCCOS|ARCTAN[2]|ARCTAN|ARCCOT|RAD|DEG|EEX/gi
                    ) || []

                  return valueSplitByFormulas.map((item) => {
                    const formulaMatchedToValues = formulaOperatorsLookup.find(
                      (formula) => {
                        return formula.value === item
                      }
                    )

                    if (!formulaMatchedToValues) {
                      throwLocallyLogInProd(
                        diResolver,
                        new Error(
                          `Unknown formula in metric formulaInput: ${item}`
                        )
                      )
                      console.error(
                        `Unknown formula in metric formulaInput: ${item}`
                      )
                    }
                    return {
                      type: EFormulaBadgeType.Formula,
                      text: item,
                      value: formulaMatchedToValues?.value || item,
                    } as BadgeOption
                  })
                }
              })
            }
          })
      }, [fieldValue, options, t, diResolver, terms])

    const convertBadgeOptionsToStringValue = (
      badgeOptions: Array<BadgeOption> | null
    ) => {
      if (!badgeOptions) {
        return null
      }

      return badgeOptions
        .map((option) => {
          if (option.type === EFormulaBadgeType.Metric) {
            return `[${option.value}(${option.offset || 0})]`
          } else {
            return option.value
          }
        })
        .join('')
    }

    const handleChange = useCallback(
      (changes: { selectedItems?: Array<BadgeOption> }) => {
        const formattedValues = convertBadgeOptionsToStringValue(
          changes.selectedItems || null
        )

        if (onChange) {
          onChange(formattedValues)
        } else if (context) {
          return context.onFieldChange(name, formattedValues)
        } else {
          throw new Error(`No onChange provided for this input`)
        }
      },
      [onChange, context, name]
    )

    const {
      getSelectedItemProps,
      getDropdownProps,
      addSelectedItem,
      selectedItems,
    } = useMultipleSelection({
      initialSelectedItems:
        convertedInitialValueToBadgeOptions as Array<BadgeOption>,
      selectedItems: convertedInitialValueToBadgeOptions as Array<BadgeOption>,
      onSelectedItemsChange: handleChange,
      stateReducer: (_, actionChanges) => {
        const { changes, type } = actionChanges
        switch (type) {
          case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
            handleChange(changes)
            return changes
          default:
            return changes
        }
      },
    })

    const filteredItems: Array<BadgeOption> = useMemo(() => {
      return searchValue != null && searchValue !== ''
        ? ((isMetricMode
            ? options
            : (formulaOperatorsLookup as Array<{ text: string }>)
          ).filter((option) => {
            return option.text.toLowerCase().includes(searchValue.toLowerCase())
          }) as Array<BadgeOption>)
        : isMetricMode
          ? options
          : formulaOperatorsLookup
    }, [searchValue, isMetricMode, options])

    const {
      isOpen,
      getToggleButtonProps,
      getMenuProps,
      getInputProps,
      getComboboxProps,
      getItemProps,
    } = useCombobox({
      inputValue: searchValue,
      items: filteredItems as Array<BadgeOption>,
      stateReducer: (_, actionChanges) => {
        const { changes, type } = actionChanges

        switch (type) {
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            if (changes.selectedItem) {
              handleChange({
                selectedItems: [...selectedItems, changes.selectedItem],
              })
            }
            return {
              ...changes,
              isOpen: true,
            }

          default:
            return changes
        }
      },
      onStateChange: ({ type, selectedItem }) => {
        switch (type) {
          case useCombobox.stateChangeTypes.ToggleButtonClick:
            break
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
          case useCombobox.stateChangeTypes.InputBlur:
            if (selectedItem) {
              setSearchValue('')
            }
            break
          default:
            break
        }
      },
    })

    React.useEffect(() => {
      isOpenRef.current = !!isOpen
    }, [isOpen])

    const { styles, attributes, update } = useCustomPopper(
      referenceElement.current,
      popperElement.current,
      isOpen
    )

    const handleBlur = (event: Maybe<React.SyntheticEvent>) => {
      onBlur && onBlur(event)
      context && context.onSetIsTouchedByFieldName(name)
    }

    const handleFocus = (event: Maybe<React.SyntheticEvent>) => {
      onFocus && onFocus(event)
      context && context.onSetIsFocusedByFieldName(name)
    }

    const onTabChange = React.useCallback(
      (newTab: FormulaTab) => {
        setActiveTab(newTab)
      },
      [setActiveTab]
    )

    const updateOffset = useCallback(
      (opts: { offset: number; badgeValue: Id; index: number }) => {
        const { offset, badgeValue, index } = opts
        const updatedSelectedItems = selectedItems.map((item, i) => {
          if (item.value === badgeValue && index === i) {
            return {
              ...item,
              offset,
            }
          }
          return item
        })

        handleChange({ selectedItems: updatedSelectedItems })
      },
      [handleChange, selectedItems]
    )

    const dropdownProps = getDropdownProps(
      {
        onBlur: handleBlur,
        onFocus: handleFocus,
      },
      // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1099
      { suppressRefError: true }
    )

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      lastInputType.current = e.key
      if (
        e.key &&
        e.currentTarget.innerText.length === 0 &&
        (e.key === 'Backspace' || e.key === 'Delete')
      ) {
        if (deleteKeyCount.current < 1 && isOpenRef.current) {
          deleteKeyCount.current = deleteKeyCount.current + 1
        } else {
          dropdownProps.onKeyDown(e)
          deleteKeyCount.current = 0
        }
      }
    }

    const inputProps = getInputProps(
      {
        ...dropdownProps,
        onKeyDown,
        ref: contentEditableRef,
      }, // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1099
      { suppressRefError: true }
    )

    const handleEditableChange = useCallback(
      (event: any) => {
        const pressedEnter =
          event.nativeEvent.inputType === 'insertParagraph' ||
          lastInputType.current === 'Enter'
        if (pressedEnter) {
          event.target.value = searchValue
        }
        if (
          pressedEnter &&
          event.target.value &&
          new RegExp(/^(?:\d*\.\d{1,2}|\d+)$/).test(event.target.value)
        ) {
          const newNumericValue = {
            type: EFormulaBadgeType.Number,
            text: event.target.value,
            value: event.target.value,
          } as BadgeOption

          addSelectedItem(newNumericValue)
          event.target.value = ''
          setSearchValue('')
          return inputProps.onChange(event)
        } else {
          setSearchValue(event.target.value || '')
          inputProps.onChange(event)
        }
      },
      [inputProps, addSelectedItem, searchValue]
    )

    if (
      inputProps &&
      inputProps.value &&
      isMetricMode &&
      new RegExp(/^(?:\d*\.\d{1,2}|\d+)$/).test(inputProps.value)
    ) {
      const newNumericValue = {
        type: EFormulaBadgeType.Number,
        text: inputProps.value,
        value: inputProps.value,
      } as BadgeOption
      filteredItems.unshift(newNumericValue)
    }

    const renderSelectedOption = React.useCallback(
      function renderSelectedOption(option: BadgeOption) {
        return (
          <StyledCustomBadgeText contentEditable={false} theme={theme}>
            <Text
              type={'body'}
              ellipsis={{ widthPercentage: 100 }}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {option.text}
              {option.type === EFormulaBadgeType.Metric &&
                `(${option.offset ?? 0})`}
            </Text>
          </StyledCustomBadgeText>
        )
      },
      [theme]
    )

    const { ref, ...rest } = getToggleButtonProps()
    const formContent = React.useMemo(
      () => (
        <StyledWrapperForFormulas isOpen={isOpen}>
          {selectedItems.map((selectedItem, index) => {
            return (
              <span
                key={`selected-item-${index}`}
                {...getSelectedItemProps({ selectedItem, index })}
                css={css`
                  outline: 0;
                `}
              >
                <StyledCustomBadgeTextContainerForFormulas
                  id={`customBadge-${index}-${id}`}
                  isMetricBadge={
                    selectedItem.type !== EFormulaBadgeType.Formula
                  }
                  theme={theme}
                >
                  {renderSelectedOption(selectedItem as BadgeOption)}
                  {selectedItem.type === EFormulaBadgeType.Metric && (
                    <FormulaOffsetMenu
                      currentOffset={selectedItem.offset || 0}
                      offsetFrequency={offsetFrequency}
                      handleOffsetSelection={(value) =>
                        updateOffset({
                          offset: value,
                          badgeValue: selectedItem.value,
                          index,
                        })
                      }
                    />
                  )}
                </StyledCustomBadgeTextContainerForFormulas>
              </span>
            )
          })}
          {(inputProps && inputProps.value) ||
          (selectedItems && selectedItems.length === 0) ? null : (
            <div
              css={css`
                display: inline-block;
                margin: ${(props) =>
                  `${props.theme.sizes.spacing8} ${props.theme.sizes.spacing4}`};
              `}
            >
              <BtnText
                intent='tertiary'
                width='noPadding'
                ariaLabel={t('Add')}
                disabled={disabled}
                ref={ref}
                {...rest}
                css={css`
                  width: ${toREM(43)};
                `}
              >
                <div
                  css={css`
                    display: inline-flex;
                    align-items: center;
                  `}
                >
                  <Icon
                    iconSize={'sm'}
                    iconName={'plusIcon'}
                    iconColor={{ color: theme.colors.formulaAddAnItemBtnColor }}
                    css={css`
                      margin-right: ${(props) => props.theme.sizes.spacing4};
                    `}
                  />
                  <Text
                    weight='semibold'
                    type='body'
                    color={{ color: theme.colors.formulaAddAnItemBtnColor }}
                  >
                    {t('Add')}
                  </Text>
                </div>
              </BtnText>
            </div>
          )}
          <CustomContentEditable
            id={inputProps.id}
            className='contentEditable'
            ref={contentEditableRef}
            placeholder={placeholder || ''}
            html={searchValue}
            disabled={disabled}
            type='body'
            onChange={handleEditableChange}
            onBlur={inputProps.onBlur}
            onFocus={inputProps.onFocus}
            onKeyDown={inputProps.onKeyDown}
            ariaLabel={ariaLabel}
          />
        </StyledWrapperForFormulas>
      ),
      [
        id,
        isOpen,
        selectedItems,
        getSelectedItemProps,
        renderSelectedOption,
        offsetFrequency,
        updateOffset,
        disabled,
        inputProps,
        ref,
        rest,
        t,
        theme,
        ariaLabel,
        placeholder,
        handleEditableChange,
        searchValue,
      ]
    )

    const renderListOption = useCallback(
      (option: BadgeOption) => {
        return (
          <>
            {option.type === EFormulaBadgeType.Formula ? (
              <div
                css={css`
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                `}
              >
                <Text
                  type={'body'}
                  weight={'semibold'}
                  color={{ color: theme.colors.formulaOperatorOptionColor }}
                >
                  {option.text}
                </Text>
                {option.explination && (
                  <Text
                    type={'body'}
                    fontStyle={'italic'}
                    css={css`
                      padding-right: ${(props) => props.theme.sizes.spacing16};
                    `}
                  >
                    {option.explination}
                  </Text>
                )}
              </div>
            ) : (
              <span
                css={css`
                  display: inline-flex;
                  align-items: center;
                  width: 100%;
                `}
              >
                {option.type === EFormulaBadgeType.Metric && (
                  <UserAvatar
                    adornments={{ tooltip: true }}
                    firstName={option.ownerMetaData.firstName}
                    lastName={option.ownerMetaData.lastName}
                    avatarUrl={option.ownerMetaData.avatar}
                    userAvatarColor={option.ownerMetaData.userAvatarColor}
                    size={'s'}
                    css={css`
                      margin-right: ${(props) => props.theme.sizes.spacing8};
                    `}
                  />
                )}
                <Text
                  type={'body'}
                  ellipsis={{
                    widthPercentage: 90,
                    removeOnHoverFocus: false,
                  }}
                  color={{ color: theme.colors.bodyTextDefault }}
                >
                  {option.text}
                </Text>
              </span>
            )}
          </>
        )
      },
      [theme.colors.formulaOperatorOptionColor, theme.colors.bodyTextDefault]
    )

    const SectionHeader = useCallback(
      (props: { key: string; text: string }) => {
        const { key, text } = props
        return (
          <Text
            key={key}
            type={'body'}
            weight={'semibold'}
            color={{ color: theme.colors.bodyTextDefault }}
            css={css`
              padding: ${toREM(10)} ${(props) => props.theme.sizes.spacing16};
            `}
          >
            {text}
          </Text>
        )
      },
      [theme]
    )

    const listItems = useMemo(() => {
      return filteredItems.reduce(
        (acc, item, index) => {
          const isDisabled = item.disabled

          const listItem = (
            <StyledLi
              key={`${item.value}${index}`}
              {...getItemProps({
                item,
                index,
                disabled: isDisabled,
              })}
              isDisabled={isDisabled}
              isSelected={false}
              // this prevents the component from re-rendering and being glitchy, do not remove or rely on highlightedIndex
              onMouseMove={() => {
                return null
              }}
            >
              {renderListOption(item as BadgeOption)}
            </StyledLi>
          )

          if (item.type === EFormulaBadgeType.Formula) {
            acc.formulas.push(listItem)
          } else if (item.type === EFormulaBadgeType.Metric) {
            if (acc.metrics.length === 0) {
              acc.metrics.push(
                <SectionHeader
                  key={`${name}_metricOptions_${index}`}
                  text={terms.metric.plural}
                />
              )
            }
            acc.metrics.push(listItem)
          } else if (item.type === EFormulaBadgeType.Number) {
            if (acc.numbers.length === 0) {
              acc.numbers.push(
                <SectionHeader
                  key={`${name}_numberOptions_${index}`}
                  text={t('Numbers')}
                />
              )
            }
            acc.numbers.push(listItem)
          } else {
            console.error(`Unexpected item in formula input options: ${item}`)
          }

          return acc
        },
        {
          numbers: [],
          formulas: [],
          metrics: [],
        } as {
          numbers: Array<JSX.Element>
          formulas: Array<JSX.Element>
          metrics: Array<JSX.Element>
        }
      )
    }, [
      filteredItems,
      getItemProps,
      renderListOption,
      t,
      name,
      SectionHeader,
      terms,
    ])

    React.useEffect(() => {
      if (update) update()
    }, [listItems, update])

    const menuProps = getMenuProps()

    const input = (
      <div
        css={css`
          position: relative;
          width: 100%;
        `}
        ref={referenceElement}
      >
        <StyledFormulaInputWrapper
          name={name}
          className={className}
          isDisabled={disabled}
          width={width}
          isOpen={isOpen}
          error={!!fieldErrorMessage}
          showPlaceholder={
            !inputProps?.value && selectedItems && selectedItems.length === 0
          }
          showSearchIcon={false}
          {...getComboboxProps()}
        >
          {formContent}
        </StyledFormulaInputWrapper>
        <StyledUl
          {...attributes.popper}
          {...menuProps}
          width={width}
          id={`formulaInputInfiniteScroll-${name}`}
          ref={(popperEl: HTMLLIElement) => {
            popperElement.current = popperEl
            menuProps.ref(popperEl)
          }}
          style={styles.popper}
          // this prevents the component from re-rendering and being glitchy
          onMouseLeave={() => {
            return null
          }}
        >
          <InfiniteScroller
            nodesCollection={optionsNodesCollection}
            scrollParentId={`formulaInputInfiniteScroll-${name}`}
            loadingDisplay={
              <>
                {isOpen && listItems.metrics.length ? (
                  <Text
                    type={'body'}
                    weight={'semibold'}
                    css={css`
                      padding: ${theme.sizes.spacing6} 0 0
                        ${theme.sizes.spacing12};
                    `}
                  >
                    {t('Loading more results...')}
                  </Text>
                ) : null}
              </>
            }
          >
            {() => (
              <>
                {isOpen && (
                  <div
                    css={css`
                      height: ${toREM(40)};
                      padding: ${(props) =>
                        `${props.theme.sizes.spacing10} ${props.theme.sizes.spacing16}`};
                      border-bottom: ${(props) =>
                        `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.menuBorderColor}`};
                      display: flex;
                    `}
                  >
                    <Clickable
                      clicked={() => onTabChange('OPERATORS')}
                      css={css`
                        margin-right: ${(props) => props.theme.sizes.spacing40};
                      `}
                    >
                      <Text
                        type={'body'}
                        weight={'semibold'}
                        color={
                          activeTab === 'OPERATORS'
                            ? { color: theme.colors.bodyTextDefault }
                            : { color: theme.colors.formulaUnselectedTabColor }
                        }
                        css={css`
                          padding-bottom: ${(props) =>
                            props.theme.sizes.spacing8};

                          ${activeTab === 'OPERATORS' &&
                          css`
                            border-bottom: ${(props) =>
                                props.theme.sizes.smallSolidBorder}
                              ${(props) =>
                                props.theme.colors
                                  .formulaTabOptionSelectedColor};
                          `}
                        `}
                      >
                        {t('Operators')}
                      </Text>
                    </Clickable>
                    <Clickable clicked={() => onTabChange('METRICS')}>
                      <Text
                        color={
                          activeTab === 'METRICS'
                            ? { color: theme.colors.bodyTextDefault }
                            : { color: theme.colors.formulaUnselectedTabColor }
                        }
                        type={'body'}
                        weight={'semibold'}
                        css={css`
                          padding-bottom: ${(props) =>
                            props.theme.sizes.spacing8};

                          ${activeTab === 'METRICS' &&
                          css`
                            border-bottom: ${(props) =>
                                props.theme.sizes.smallSolidBorder}
                              ${(props) =>
                                props.theme.colors
                                  .formulaTabOptionSelectedColor};
                          `}
                        `}
                      >
                        {t('{{metric}}/number', {
                          metric: terms.metric.singular,
                        })}
                      </Text>
                    </Clickable>
                  </div>
                )}
                {isOpen
                  ? isMetricMode
                    ? listItems.numbers.length
                      ? [...listItems.numbers, ...listItems.metrics]
                      : listItems.metrics
                    : listItems.formulas
                  : null}
              </>
            )}
          </InfiniteScroller>
        </StyledUl>
      </div>
    )

    const inputTooltip = tooltip ? (
      <Tooltip {...tooltip}>{input}</Tooltip>
    ) : (
      input
    )

    return inputTooltip
  }
)
