import { i18n } from '@mm/core/i18n'

import {
  TBusinessPlanListItemType,
  TBusinessPlanTileType,
  getBloomCustomTerms,
} from '@mm/core-bloom'

export const getTextTitleForListItems = (opts: {
  diResolver: IDIResolver
  listItemType: TBusinessPlanListItemType
  tileType: TBusinessPlanTileType
  isFirstItem?: boolean
}) => {
  const { diResolver, listItemType, tileType, isFirstItem } = opts

  const terms = getBloomCustomTerms(diResolver)

  if (
    tileType === 'VISION_ONE_YEAR' ||
    tileType === 'VISION_THREE_YEAR' ||
    tileType === 'VISION_QUARTERLY'
  ) {
    if (listItemType === 'DATE') {
      return i18n.t('Future date')
    } else {
      return terms.measurables.singular
    }
  } else if (tileType === 'CORE_FOCUS') {
    return isFirstItem ? i18n.t('Purpose') : terms.niche.singular
  } else {
    return i18n.t('Title')
  }
}
