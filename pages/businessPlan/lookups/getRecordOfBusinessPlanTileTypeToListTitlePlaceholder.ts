import { i18n } from '@mm/core/i18n'

import {
  BloomCustomTerms,
  EBusinessPlanListCollectionListType,
  TBusinessPlanTileType,
  getBloomCustomTerms,
} from '@mm/core-bloom'

const getVisionThreeYearListCollectionTitlePlaceholder = (opts: {
  listType: EBusinessPlanListCollectionListType
  terms: BloomCustomTerms
}) => {
  const { listType, terms } = opts

  return listType === EBusinessPlanListCollectionListType.TitledList
    ? terms.measurables.plural
    : i18n.t('What does it look like?')
}

const getGoalsListCollectionTitlePlaceholder = (opts: {
  listType: EBusinessPlanListCollectionListType
  terms: BloomCustomTerms
}) => {
  const { listType, terms } = opts

  return listType === EBusinessPlanListCollectionListType.TitledList
    ? terms.measurables.plural
    : terms.quarterlyGoals.plural
}

const getVisionOneYearListCollectionTitlePlaceholder = (opts: {
  listType: EBusinessPlanListCollectionListType
  terms: BloomCustomTerms
}) => {
  const { listType, terms } = opts

  return listType === EBusinessPlanListCollectionListType.TitledList
    ? terms.measurables.plural
    : i18n.t('{{goals}} for the year', { goals: terms.goal.plural })
}

export const getBusinessPlanListCollectionTitlePlaceholder = (opts: {
  tileType: TBusinessPlanTileType
  listType: EBusinessPlanListCollectionListType
  diResolver: IDIResolver
}) => {
  const { diResolver, tileType, listType } = opts

  const terms = getBloomCustomTerms(diResolver)

  const RECORD_OF_TILE_TYPE_TO_PLACEHOLDER = {
    BHAG: terms.targetMarket.singular,
    CORE_VALUES: terms.targetMarket.singular,
    CORE_FOCUS: terms.targetMarket.singular,
    STRATEGY: terms.differentiators.plural,
    VISION_THREE_YEAR: getVisionThreeYearListCollectionTitlePlaceholder({
      terms,
      listType,
    }),
    VISION_ONE_YEAR: getVisionOneYearListCollectionTitlePlaceholder({
      terms,
      listType,
    }),
    VISION_QUARTERLY: getGoalsListCollectionTitlePlaceholder({
      terms,
      listType,
    }),
    ISSUES: terms.longTermIssues.plural,
  }

  return RECORD_OF_TILE_TYPE_TO_PLACEHOLDER[tileType]
}
