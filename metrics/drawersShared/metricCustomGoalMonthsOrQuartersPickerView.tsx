import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { OnFieldChange } from '@mm/core/forms'

import { useTranslation } from '@mm/core-web/i18n'
import {
  GridItem,
  IFormControlProps,
  ITooltipProps,
  SelectInputSingleSelection,
  recordOfTooltipStateToTooltip,
  useTheme,
} from '@mm/core-web/ui'

import { IEditMetricFormValues } from '../editMetricDrawer/editMetricDrawerTypes'

interface IMetricCustomGoalMonthsOrQuartersPickerViewProps {
  startDateName: keyof IEditMetricFormValues['customGoals'][number]
  endDateName: keyof IEditMetricFormValues['customGoals'][number]
  startDateValue: Maybe<number>
  endDateValue: Maybe<number>
  startDateLookup: Array<{
    text: string
    value: number
  }>
  endDateLookup: Array<{
    text: string
    value: number
  }>
  startDateScrollToItemValue: number
  endDateScrollToItemValue: number
  largeGridItemSize: number
  isDrawerExpanded: boolean
  startDateFormControl?: Omit<IFormControlProps, 'error' | 'labelFor'>
  endDateFormControl?: Omit<IFormControlProps, 'error' | 'labelFor'>
  onFieldChange: OnFieldChange<IEditMetricFormValues['customGoals'][number]>
  customGoalDatesToDisable?: Array<{ startDate: number; endDate: number }>
}

export const MetricCustomGoalMonthsOrQuartersPickerView: React.FC<IMetricCustomGoalMonthsOrQuartersPickerViewProps> =
  observer(
    ({
      startDateName,
      endDateName,
      startDateValue,
      endDateValue,
      startDateLookup,
      endDateLookup,
      startDateFormControl,
      endDateFormControl,
      startDateScrollToItemValue,
      endDateScrollToItemValue,
      customGoalDatesToDisable,
      isDrawerExpanded,
      largeGridItemSize,
      onFieldChange,
    }) => {
      const { t } = useTranslation()
      const theme = useTheme()

      const getMetricsLookupWithCustomDatesDisabled = (opts: {
        type: 'START' | 'END'
        lookup: Array<{
          text: string
          value: number
        }>
      }): Array<{
        disabled: boolean
        tooltip: ITooltipProps | undefined
        text: string
        value: number
      }> => {
        const { type, lookup } = opts
        const metricsLookup = (lookup || []).map((item) => {
          const isDisabledDueToCustomGoal = (
            customGoalDatesToDisable || []
          ).some((date) => {
            return item.value >= date.startDate && item.value <= date.endDate
          })

          const isDisabledDueToOverlappingCustomGoal = (
            customGoalDatesToDisable || []
          ).some((date) => {
            if (type === 'START') {
              if (!endDateValue) {
                return false
              }

              return item.value < date.startDate && endDateValue > date.endDate
            } else {
              if (!startDateValue) {
                return false
              }

              return (
                startDateValue < date.startDate && item.value > date.endDate
              )
            }
          })

          const dateModeForTooltipState = getDateModeForTooltipState({
            isDisabledDueToOverlappingCustomGoal,
          })

          const tooltipProps =
            recordOfTooltipStateToTooltip[dateModeForTooltipState]

          return {
            ...item,
            disabled:
              isDisabledDueToCustomGoal || isDisabledDueToOverlappingCustomGoal,
            tooltip:
              isDisabledDueToCustomGoal || isDisabledDueToOverlappingCustomGoal
                ? tooltipProps
                : undefined,
          }
        })

        return metricsLookup
      }

      const metricsStartDateLookupWithCustomDatesDisabled =
        getMetricsLookupWithCustomDatesDisabled({
          lookup: startDateLookup,
          type: 'START',
        })

      const metricsEndDateLookupWithCustomDatesDisabled =
        getMetricsLookupWithCustomDatesDisabled({
          lookup: endDateLookup,
          type: 'END',
        })

      const onHandleStartDateChange = (value: number) => {
        onFieldChange(startDateName, value)
        if (value && endDateValue && value > endDateValue) {
          onFieldChange(endDateName, null)
        }
      }

      const onHandleEndDateChange = (value: number) => {
        onFieldChange(endDateName, value)
        if (startDateValue && value && value < startDateValue) {
          onFieldChange(startDateName, null)
        }
      }

      return (
        <div
          css={css`
            position: relative;
            display: flex;
            flex-flow: wrap;
            width: 100%;
          `}
        >
          <GridItem
            rowSpacing={theme.sizes.spacing24}
            m={!isDrawerExpanded ? 12 : undefined}
            l={largeGridItemSize}
          >
            <SelectInputSingleSelection
              id={'customGoalStartDateId'}
              name={startDateName}
              options={metricsStartDateLookupWithCustomDatesDisabled}
              placeholder={t('Choose a start date')}
              unknownItemText={t('Unknown date')}
              formControl={startDateFormControl}
              onChange={onHandleStartDateChange}
              width={'100%'}
              scrollToItemOnOpen={{
                itemValue: startDateScrollToItemValue,
              }}
              disableOptionOnSelect={false}
            />
          </GridItem>
          <GridItem
            rowSpacing={theme.sizes.spacing24}
            m={!isDrawerExpanded ? 12 : undefined}
            l={largeGridItemSize}
          >
            <SelectInputSingleSelection
              id={'customGoalEndDateId'}
              name={endDateName}
              options={metricsEndDateLookupWithCustomDatesDisabled}
              placeholder={t('Choose an end date')}
              unknownItemText={t('Unknown date')}
              formControl={endDateFormControl}
              onChange={onHandleEndDateChange}
              scrollToItemOnOpen={{
                itemValue: endDateScrollToItemValue,
              }}
              width={'100%'}
              disableOptionOnSelect={false}
            />
          </GridItem>
        </div>
      )
    }
  )

const getDateModeForTooltipState = (opts: {
  isDisabledDueToOverlappingCustomGoal: boolean
}) => {
  const { isDisabledDueToOverlappingCustomGoal } = opts

  if (isDisabledDueToOverlappingCustomGoal) {
    return 'OVERLAPPING_CUSTOM_DATE_MODE'
  } else {
    return 'CUSTOM_DATE_MODE'
  }
}
