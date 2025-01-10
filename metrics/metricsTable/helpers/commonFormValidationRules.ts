import { validateBasedOnParentFormsOtherFieldValues } from '@mm/core/forms'
import { i18n } from '@mm/core/i18n'

import {
  METRIC_GOAL_AND_SCORE_LESS_THAN_MAX_NUMBER,
  MetricUnits,
  getMetricNumberWithRemovedCommas,
} from '@mm/core-bloom'

export const getMetricsScoreValueFormattingValidationRule = <
  TCurrentValue extends Maybe<string>,
  TParentValues extends Record<string, any>,
>(props: {
  units: MetricUnits
}) =>
  validateBasedOnParentFormsOtherFieldValues<TCurrentValue, TParentValues>({
    determineValidation: (opts: { currentValue: any }) => {
      const units = props.units

      if (opts.currentValue)
        if (units === 'YESNO') {
          const currentValueLowercase = opts.currentValue.toLowerCase()
          return (
            currentValueLowercase === 'yes' || currentValueLowercase === 'no'
          )
        } else {
          return new RegExp(
            /^[-]?((\d{1,3}(,\d{3})*|\d+)?(\.\d*)?|\.\d+)$/
          ).test(opts.currentValue)
        }
      else {
        return true
      }
    },
    determineErrorMessage: () => {
      const units = props.units

      if (units === 'YESNO') {
        return i18n.t('Please enter only yes/no values')
      } else {
        return i18n.t('Please enter only numeric values')
      }
    },
    determineIsRequired: (opts: { currentValue: any }) => {
      if (opts.currentValue) {
        return true
      } else {
        return false
      }
    },
  })

export const getMetricsScoreValueMaxNumberValidationRule = <
  TCurrentValue extends Maybe<string>,
  TParentValues extends Record<string, any>,
>(props: {
  units: MetricUnits
}) =>
  validateBasedOnParentFormsOtherFieldValues<TCurrentValue, TParentValues>({
    determineValidation: (opts: { currentValue: any }) => {
      const units = props.units

      if (opts.currentValue)
        if (units === 'YESNO') {
          const currentValueLowercase = opts.currentValue.toLowerCase()
          return (
            currentValueLowercase === 'yes' || currentValueLowercase === 'no'
          )
        } else {
          const valueAsNumber = parseFloat(
            getMetricNumberWithRemovedCommas(opts.currentValue)
          )

          if (isNaN(valueAsNumber)) {
            return true
          } else {
            return valueAsNumber < METRIC_GOAL_AND_SCORE_LESS_THAN_MAX_NUMBER
          }
        }
      else {
        return true
      }
    },
    determineErrorMessage: () => {
      const units = props.units

      if (units === 'YESNO') {
        return i18n.t('Please enter only yes/no values')
      } else {
        return i18n.t('Please enter a smaller number')
      }
    },
    determineIsRequired: (opts: { currentValue: any }) => {
      if (opts.currentValue) {
        return true
      } else {
        return false
      }
    },
  })
