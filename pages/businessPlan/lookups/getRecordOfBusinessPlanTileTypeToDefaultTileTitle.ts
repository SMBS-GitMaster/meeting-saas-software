import { TBusinessPlanTileType, getBloomCustomTerms } from '@mm/core-bloom'

export const getRecordOfBusinessPlanTileTypeToDefaultTileTitle = (opts: {
  diResolver: IDIResolver
}): Record<TBusinessPlanTileType, string> => {
  const terms = getBloomCustomTerms(opts.diResolver)

  return {
    BHAG: terms.bhag.singular,
    CORE_VALUES: terms.coreValues.plural,
    CORE_FOCUS: terms.focus.singular,
    STRATEGY: terms.marketingStrategy.singular,
    VISION_ONE_YEAR: terms.oneYearGoals.singular,
    VISION_THREE_YEAR: terms.threeYearVision.singular,
    VISION_QUARTERLY: terms.quarterlyGoals.singular,
    ISSUES: terms.longTermIssues.plural,
  }
}
