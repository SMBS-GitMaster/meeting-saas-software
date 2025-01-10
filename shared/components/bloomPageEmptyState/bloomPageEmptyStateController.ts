import { action, makeObservable, observable } from 'mobx'

import { createDIHook } from '@mm/core/di/resolver'

import { EMeetingPageType, getBloomCustomTerms } from '@mm/core-bloom'

import { getEmptyStateData } from './bloomPageEmptyStateConstants'
import { IBloomPageEmptyState } from './bloomPageEmptyStateTypes'

class BloomPageEmptyStateController {
  showTooltips: boolean | undefined = false
  showHoverState: boolean | undefined = false
  pageData: Maybe<IBloomPageEmptyState> = null

  private diResolver: IDIResolver

  constructor(diResolver: IDIResolver) {
    this.diResolver = diResolver
    makeObservable(this, {
      showTooltips: observable,
      showHoverState: observable,
      pageData: observable,
      handleShowAllTooltips: action,
      handleShowAllHoverState: action,
      onChangePage: action,
    })
  }

  public onChangePage = (pageType: EMeetingPageType) => {
    const EMPTYSTATE_DATA = getEmptyStateData(
      getBloomCustomTerms(this.diResolver)
    )

    if (
      (!EMPTYSTATE_DATA[pageType] && !!this.pageData) ||
      !!EMPTYSTATE_DATA[pageType]
    ) {
      this.showTooltips = false
      this.showHoverState = false
      this.pageData = EMPTYSTATE_DATA[pageType]
    }
  }

  public handleShowAllTooltips = (isOpen: boolean) => {
    this.showTooltips = isOpen
  }
  public handleShowAllHoverState = (isOpen: boolean) => {
    this.showHoverState = isOpen
  }
}

export const diName =
  'bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateController'

export const getEmptyStateController = (diResolver: IDIResolver) =>
  diResolver.getOrCreate(
    diName,
    () => new BloomPageEmptyStateController(diResolver)
  )

export const useBloomPageEmptyStateController = createDIHook(
  diName,
  getEmptyStateController
)
