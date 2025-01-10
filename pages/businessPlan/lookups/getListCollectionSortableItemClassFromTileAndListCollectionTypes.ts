import { Id } from '@mm/gql'

import { TBusinessPlanTileType } from '@mm/core-bloom'

const BUSINESS_PLAN_CORE_VAUES_SORTABLE =
  'business_plan_core_values_sortable_item'

export const RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_CLASS_NAME: Record<
  TBusinessPlanTileType,
  string | ((listCollectionId: Id) => string)
> = {
  BHAG: '',
  CORE_VALUES: BUSINESS_PLAN_CORE_VAUES_SORTABLE,
  CORE_FOCUS: (listCollectionId) => {
    return `business_plan_core_focus_${listCollectionId}_sortable_item`
  },
  STRATEGY: (listCollectionId) => {
    return `business_plan_strategy_${listCollectionId}_sortable_item`
  },
  VISION_ONE_YEAR: (listCollectionId) => {
    return `business_plan_vision_one_year_${listCollectionId}_sortable_item`
  },
  VISION_THREE_YEAR: (listCollectionId) => {
    return `business_plan_vision_three_year_${listCollectionId}_sortable_item`
  },
  VISION_QUARTERLY: (listCollectionId) => {
    return `business_plan_vision_quarterly_${listCollectionId}_sortable_item`
  },
  ISSUES: (listCollectionId) => {
    return `business_plan_issues_${listCollectionId}_sortable_item`
  },
}

export const getListCollectionSortableClassNameFromTileAndListCollectionTypes =
  (opts: { tileType: TBusinessPlanTileType; listCollectionId: Id }) => {
    const { tileType, listCollectionId } = opts

    const sortableIdOrFn =
      RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_CLASS_NAME[tileType]

    if (typeof sortableIdOrFn === 'function') {
      return sortableIdOrFn(listCollectionId)
    }

    return sortableIdOrFn
  }
