import { Id } from '@mm/gql'

import {
  validateBasedOnFormFieldArrayFormValuesAndParentFormValues,
  validateBasedOnParentFormsOtherFieldValues,
} from '@mm/core/forms'
import { i18n } from '@mm/core/i18n'

import {
  METRIC_GOAL_AND_SCORE_LESS_THAN_MAX_NUMBER,
  getMetricNumberWithRemovedCommas,
} from '@mm/core-bloom'

export const getMetricsProgressiveTrackingTargetDateValidationRule = <
  TCurrentValue extends Maybe<number>,
  TParentValues extends Record<string, any>,
>() =>
  validateBasedOnParentFormsOtherFieldValues<TCurrentValue, TParentValues>({
    determineValidation: (opts) => {
      const progressiveTrackingFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.progressiveTracking]

      if (progressiveTrackingFieldValue) {
        return opts.currentValue !== null
      } else {
        return true
      }
    },
    determineErrorMessage: (opts) => {
      const progressiveTrackingFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.progressiveTracking]

      if (progressiveTrackingFieldValue) {
        return i18n.t('This field is required')
      } else {
        return i18n.t('This field is not required')
      }
    },
    determineIsRequired: (opts) => {
      const progressiveTrackingFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.progressiveTracking]

      if (progressiveTrackingFieldValue) {
        return true
      } else {
        return false
      }
    },
  })

export const getMetricsParentFormSingleGoalFormattingValidationRule = <
  TCurrentValue extends Maybe<string>,
  TParentValues extends Record<string, any>,
>() =>
  validateBasedOnParentFormsOtherFieldValues<TCurrentValue, TParentValues>({
    determineValidation: (opts) => {
      const unitsFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.units]
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (!unitsFieldValue || !ruleFieldValue) {
        console.error(
          `Error on form validation for getParentFormGoalFormattingValidationRule, no field value found for units`
        )
      }

      if (ruleFieldValue !== 'BETWEEN') {
        if (unitsFieldValue === 'YESNO') {
          return opts.currentValue === 'YES' || opts.currentValue === 'NO'
        } else {
          if (!opts.currentValue) return false
          return new RegExp(
            /^[-]?((\d{1,3}(,\d{3})*|\d+)?(\.\d*)?|\.\d+)$/
          ).test(opts.currentValue)
        }
      } else {
        return true
      }
    },
    determineErrorMessage: (opts) => {
      const unitsFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.units]
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (ruleFieldValue !== 'BETWEEN') {
        if (unitsFieldValue === 'YESNO') {
          return i18n.t('Please enter only yes/no values')
        } else {
          return i18n.t('Please enter only numeric values')
        }
      } else {
        return ''
      }
    },
    determineIsRequired: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (!ruleFieldValue) {
        console.error(
          `Error on form validation for getParentFormGoalFormattingValidationRule, no field value found for rule`
        )
      }

      if (ruleFieldValue === 'BETWEEN') {
        return false
      } else {
        return true
      }
    },
  })

export const getMetricsParentFormSingleGoalMaxNumberValidationRule = <
  TCurrentValue extends Maybe<string>,
  TParentValues extends Record<string, any>,
>() =>
  validateBasedOnParentFormsOtherFieldValues<TCurrentValue, TParentValues>({
    determineValidation: (opts) => {
      const unitsFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.units]
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (!unitsFieldValue || !ruleFieldValue) {
        console.error(
          `Error on form validation for getMetricsParentFormSingleGoalMaxNumberValidationRule, no field value found for units`
        )
      }

      if (ruleFieldValue !== 'BETWEEN') {
        if (unitsFieldValue === 'YESNO') {
          return opts.currentValue === 'YES' || opts.currentValue === 'NO'
        } else {
          if (!opts.currentValue) return true
          const valueAsNumber = parseFloat(
            getMetricNumberWithRemovedCommas(opts.currentValue)
          )

          if (isNaN(valueAsNumber)) {
            return true
          } else {
            return valueAsNumber < METRIC_GOAL_AND_SCORE_LESS_THAN_MAX_NUMBER
          }
        }
      } else {
        return true
      }
    },
    determineErrorMessage: (opts) => {
      const unitsFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.units]
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (ruleFieldValue !== 'BETWEEN') {
        if (unitsFieldValue === 'YESNO') {
          return i18n.t('Please enter only yes/no values')
        } else {
          return i18n.t('Please enter a smaller number')
        }
      } else {
        return ''
      }
    },
    determineIsRequired: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (!ruleFieldValue) {
        console.error(
          `Error on form validation for getMetricsParentFormSingleGoalMaxNumberValidationRule, no field value found for rule`
        )
      }

      if (ruleFieldValue === 'BETWEEN') {
        return false
      } else {
        return true
      }
    },
  })

export const getMetricsParentFormMinMaxGoalMaxNumberValidationRule = <
  TCurrentValue extends Maybe<string>,
  TParentValues extends Record<string, any>,
>() =>
  validateBasedOnParentFormsOtherFieldValues<TCurrentValue, TParentValues>({
    determineValidation: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (!ruleFieldValue) {
        console.error(
          `Error on form validation for getMetricsParentFormMinMaxGoalMaxNumberValidationRule, no field value found for rule`
        )
      }
      if (ruleFieldValue === 'BETWEEN') {
        if (!opts.currentValue) return true
        const valueAsNumber = parseFloat(
          getMetricNumberWithRemovedCommas(opts.currentValue)
        )

        if (isNaN(valueAsNumber)) {
          return true
        } else {
          return valueAsNumber < METRIC_GOAL_AND_SCORE_LESS_THAN_MAX_NUMBER
        }
      } else {
        return true
      }
    },
    determineErrorMessage: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (ruleFieldValue === 'BETWEEN') {
        return i18n.t('Please enter a smaller number')
      } else {
        return i18n.t('')
      }
    },
    determineIsRequired: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (ruleFieldValue === 'BETWEEN') {
        return true
      } else {
        return false
      }
    },
  })

export const getMetricsParentFormMinMaxGoalFormattingValidationRule = <
  TCurrentValue extends Maybe<string>,
  TParentValues extends Record<string, any>,
>() =>
  validateBasedOnParentFormsOtherFieldValues<TCurrentValue, TParentValues>({
    determineValidation: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (!ruleFieldValue) {
        console.error(
          `Error on form validation for getMetricsParentFormMinMaxGoalFormattingValidationRule, no field value found for rule`
        )
      }

      if (ruleFieldValue === 'BETWEEN') {
        if (!opts.currentValue) return false
        return new RegExp(/^[-]?((\d{1,3}(,\d{3})*|\d+)?(\.\d*)?|\.\d+)$/).test(
          opts.currentValue
        )
      } else {
        return true
      }
    },
    determineErrorMessage: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (ruleFieldValue === 'BETWEEN') {
        return i18n.t('Please enter only numeric values')
      } else {
        return i18n.t('')
      }
    },
    determineIsRequired: (opts) => {
      const ruleFieldValue =
        opts.parentFormValues[opts.parentFormFieldNames.rule]

      if (ruleFieldValue === 'BETWEEN') {
        return true
      } else {
        return false
      }
    },
  })

export const getMetricsFormFieldArrayCustomGoalsSingleGoalFormattingValidationRule =
  <
    TFormFieldArrayValidationOpts extends {
      parentFormValues: Record<string, any>
      arrayFieldName: keyof TFormFieldArrayValidationOpts['parentFormValues']
      arrayEntry: { id: Id } & Record<string, any>
    },
    TFormFieldArrayPropName extends
      keyof TFormFieldArrayValidationOpts['arrayEntry'],
  >() =>
    validateBasedOnFormFieldArrayFormValuesAndParentFormValues<
      TFormFieldArrayValidationOpts,
      TFormFieldArrayPropName
    >({
      determineValidation: (opts) => {
        const unitsFieldValue =
          opts.parentFormValues[opts.parentFormFieldNames.units]

        const ruleValueName = opts.generateFieldName({
          id: opts.idForFieldArrayEntry,
          propName: opts.fieldArrayPropNames.rule,
        })

        const ruleFieldValue = opts.formFieldArrayValues[ruleValueName]

        if (!unitsFieldValue) {
          console.error(
            `Error on form validation for getMetricsFormFieldArrayCustomGoalsSingleGoalFormattingValidationRule, no field value found for units`
          )
        }

        if (ruleFieldValue !== 'BETWEEN') {
          if (!opts.currentValue) return false
          if (unitsFieldValue === 'YESNO') {
            return opts.currentValue === 'YES' || opts.currentValue === 'NO'
          } else {
            return new RegExp(
              /^[-]?((\d{1,3}(,\d{3})*|\d+)?(\.\d*)?|\.\d+)$/
            ).test(opts.currentValue)
          }
        } else {
          return true
        }
      },
      determineErrorMessage: (opts) => {
        const unitsFieldValue =
          opts.parentFormValues[opts.parentFormFieldNames.units]

        if (unitsFieldValue === 'YESNO') {
          return i18n.t('Please enter only yes/no values')
        } else {
          return i18n.t('Please enter only numeric values')
        }
      },
      determineIsRequired: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          return false
        } else {
          return true
        }
      },
    })

export const getMetricsFormFieldArrayCustomGoalsSingleGoalMaxNumberValidationRule =
  <
    TFormFieldArrayValidationOpts extends {
      parentFormValues: Record<string, any>
      arrayFieldName: keyof TFormFieldArrayValidationOpts['parentFormValues']
      arrayEntry: { id: Id } & Record<string, any>
    },
    TFormFieldArrayPropName extends
      keyof TFormFieldArrayValidationOpts['arrayEntry'],
  >() =>
    validateBasedOnFormFieldArrayFormValuesAndParentFormValues<
      TFormFieldArrayValidationOpts,
      TFormFieldArrayPropName
    >({
      determineValidation: (opts) => {
        const unitsFieldValue =
          opts.parentFormValues[opts.parentFormFieldNames.units]
        const ruleValueName = opts.generateFieldName({
          id: opts.idForFieldArrayEntry,
          propName: opts.fieldArrayPropNames.rule,
        })

        const ruleFieldValue = opts.formFieldArrayValues[ruleValueName]

        if (!unitsFieldValue) {
          console.error(
            `Error on form validation for getMetricsFormFieldArrayCustomGoalsSingleGoalMaxNumberValidationRule, no field value found for units`
          )
        }

        if (ruleFieldValue !== 'BETWEEN') {
          if (!opts.currentValue) return true
          if (unitsFieldValue === 'YESNO') {
            return opts.currentValue === 'YES' || opts.currentValue === 'NO'
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
        } else {
          return true
        }
      },
      determineErrorMessage: (opts) => {
        const unitsFieldValue =
          opts.parentFormValues[opts.parentFormFieldNames.units]

        if (unitsFieldValue === 'YESNO') {
          return i18n.t('Please enter only yes/no values')
        } else {
          return i18n.t('Please enter a smaller number')
        }
      },
      determineIsRequired: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          return false
        } else {
          return true
        }
      },
    })

export const getMetricsFormFieldArrayCustomGoalsMinMaxGoalMaxNumberValidationRule =
  <
    TFormFieldArrayValidationOpts extends {
      parentFormValues: Record<string, any>
      arrayFieldName: keyof TFormFieldArrayValidationOpts['parentFormValues']
      arrayEntry: { id: Id } & Record<string, any>
    },
    TFormFieldArrayPropName extends
      keyof TFormFieldArrayValidationOpts['arrayEntry'],
  >() =>
    validateBasedOnFormFieldArrayFormValuesAndParentFormValues<
      TFormFieldArrayValidationOpts,
      TFormFieldArrayPropName
    >({
      determineValidation: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          currentValue,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          if (!currentValue) return true

          const valueAsNumber = parseFloat(
            getMetricNumberWithRemovedCommas(currentValue)
          )

          if (isNaN(valueAsNumber)) {
            return true
          } else {
            return valueAsNumber < METRIC_GOAL_AND_SCORE_LESS_THAN_MAX_NUMBER
          }
        } else {
          return true
        }
      },
      determineErrorMessage: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          return i18n.t('Please enter a smaller number')
        } else {
          return i18n.t('')
        }
      },
      determineIsRequired: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          return true
        } else {
          return false
        }
      },
    })

export const getMetricsFormFieldArrayCustomGoalsMinMaxGoalFormattingValidationRule =
  <
    TFormFieldArrayValidationOpts extends {
      parentFormValues: Record<string, any>
      arrayFieldName: keyof TFormFieldArrayValidationOpts['parentFormValues']
      arrayEntry: { id: Id } & Record<string, any>
    },
    TFormFieldArrayPropName extends
      keyof TFormFieldArrayValidationOpts['arrayEntry'],
  >() =>
    validateBasedOnFormFieldArrayFormValuesAndParentFormValues<
      TFormFieldArrayValidationOpts,
      TFormFieldArrayPropName
    >({
      determineValidation: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          currentValue,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          if (!currentValue) return false

          return new RegExp(
            /^[-]?((\d{1,3}(,\d{3})*|\d+)?(\.\d*)?|\.\d+)$/
          ).test(currentValue)
        } else {
          return true
        }
      },
      determineErrorMessage: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          return i18n.t('Please enter only numeric values')
        } else {
          return i18n.t('')
        }
      },
      determineIsRequired: (opts) => {
        const {
          formFieldArrayValues,
          idForFieldArrayEntry,
          fieldArrayPropNames,
          generateFieldName,
        } = opts

        const ruleValueName = generateFieldName({
          id: idForFieldArrayEntry,
          propName: fieldArrayPropNames.rule,
        })

        const ruleFieldValue = formFieldArrayValues[ruleValueName]

        if (ruleFieldValue === 'BETWEEN') {
          return true
        } else {
          return false
        }
      },
    })
