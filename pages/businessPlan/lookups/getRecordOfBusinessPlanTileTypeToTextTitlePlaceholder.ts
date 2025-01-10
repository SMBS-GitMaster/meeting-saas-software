import { TBusinessPlanTileType, getBloomCustomTerms } from '@mm/core-bloom'

export const getRecordOfBusinessPlanTileTypeToTextTitlePlaceholder = (opts: {
  diResolver: IDIResolver
}): Record<TBusinessPlanTileType, Array<string>> => {
  const { diResolver } = opts

  const terms = getBloomCustomTerms(diResolver)

  return {
    BHAG: [terms.targetMarket.singular],
    CORE_VALUES: [terms.targetMarket.singular],
    CORE_FOCUS: [terms.targetMarket.singular],
    STRATEGY: [
      terms.targetMarket.singular,
      terms.targetMarket.singular,
      terms.provenProcess.singular,
      terms.guarantee.singular,
    ],
    VISION_ONE_YEAR: [terms.measurables.plural],
    VISION_THREE_YEAR: [terms.measurables.plural],
    VISION_QUARTERLY: [terms.measurables.plural],
    ISSUES: [terms.measurables.plural],
  }
}
