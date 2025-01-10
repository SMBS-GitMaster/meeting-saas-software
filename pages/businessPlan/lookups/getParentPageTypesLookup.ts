import {
  TBusinessPlanParentPageType,
  getBloomCustomTerms,
} from '@mm/core-bloom'

export const getParentPageTypesLookup = (
  diResolver: IDIResolver
): Array<{
  value: TBusinessPlanParentPageType
  text: string
}> => {
  const terms = getBloomCustomTerms(diResolver)

  return [
    { value: 'FF', text: terms.futureFocus.singular },
    { value: 'STF', text: terms.shortTermFocus.singular },
  ]
}
