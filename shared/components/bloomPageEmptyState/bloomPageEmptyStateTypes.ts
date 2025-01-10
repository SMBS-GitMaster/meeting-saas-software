import { EMeetingPageType } from '@mm/core-bloom'

export type BloomPageEmptyStateTooltipTypes =
  | 'quickCreation'
  | 'navPlusBtn'
  | 'pageTitlePlusIcon'
  | 'externalMenuContent'

export type BloomPageEmptyStateTooltip = { text: string; disabled: boolean }
export type BloomPageEmptyStateData = {
  img: Maybe<string>
  title: Maybe<string>
  btnText: string
}

export interface IBloomPageEmptyState {
  pageType: EMeetingPageType
  tooltipsData: Maybe<
    Record<BloomPageEmptyStateTooltipTypes, Maybe<BloomPageEmptyStateTooltip>>
  >
  emptyPageData: BloomPageEmptyStateData
}
