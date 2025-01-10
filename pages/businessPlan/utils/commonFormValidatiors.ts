import { Id } from '@mm/gql'

import { validateBasedOnFormFieldArrayFormValuesAndParentFormValues } from '@mm/core/forms'
import { i18n } from '@mm/core/i18n'

export const getBusinessPlanListCollectionTitledListDateFieldValidator = <
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

      const listItemTypeValueName = generateFieldName({
        id: idForFieldArrayEntry,
        propName: fieldArrayPropNames.listItemType,
      })

      const listItemTypeFieldValue = formFieldArrayValues[listItemTypeValueName]

      if (listItemTypeFieldValue === 'DATE') {
        if (!currentValue) return false

        return true
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

      const listItemTypeValueName = generateFieldName({
        id: idForFieldArrayEntry,
        propName: fieldArrayPropNames.listItemType,
      })

      const listItemTypeFieldValue = formFieldArrayValues[listItemTypeValueName]

      if (listItemTypeFieldValue === 'DATE') {
        return i18n.t('Please enter a valid date')
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

      const listItemTypeValueName = generateFieldName({
        id: idForFieldArrayEntry,
        propName: fieldArrayPropNames.listItemType,
      })

      const listItemTypeFieldValue = formFieldArrayValues[listItemTypeValueName]

      if (listItemTypeFieldValue === 'DATE') {
        return true
      } else {
        return false
      }
    },
  })

export const getBusinessPlanListCollectionTitledListTextFieldValidator = <
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

      const listItemTypeValueName = generateFieldName({
        id: idForFieldArrayEntry,
        propName: fieldArrayPropNames.listItemType,
      })

      const listItemTypeFieldValue = formFieldArrayValues[listItemTypeValueName]

      if (
        listItemTypeFieldValue === 'TITLED_TEXT' ||
        listItemTypeFieldValue === 'TEXT'
      ) {
        if (currentValue == null) return false

        return true
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

      const listItemTypeValueName = generateFieldName({
        id: idForFieldArrayEntry,
        propName: fieldArrayPropNames.listItemType,
      })

      const listItemTypeFieldValue = formFieldArrayValues[listItemTypeValueName]

      if (
        listItemTypeFieldValue === 'TITLED_TEXT' ||
        listItemTypeFieldValue === 'TEXT'
      ) {
        return i18n.t('This field is required')
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

      const listItemTypeValueName = generateFieldName({
        id: idForFieldArrayEntry,
        propName: fieldArrayPropNames.listItemType,
      })

      const listItemTypeFieldValue = formFieldArrayValues[listItemTypeValueName]

      if (
        listItemTypeFieldValue === 'TITLED_TEXT' ||
        listItemTypeFieldValue === 'TEXT'
      ) {
        return true
      } else {
        return false
      }
    },
  })
