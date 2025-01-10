import { action, makeObservable, observable } from 'mobx'

import { createDIHook } from '@mm/core/di/resolver'

class SideNavController {
  sideNavExpanded = true

  constructor() {
    makeObservable(this, {
      sideNavExpanded: observable,
      openSideNav: action,
      closeSideNav: action,
    })
  }
  public openSideNav = () => {
    this.sideNavExpanded = true
  }

  public closeSideNav = () => {
    this.sideNavExpanded = false
  }
}

export const diName = 'bloom-web/pages/layout/sideNav/sideNavController'

export const getSideNavController = (diResolver: IDIResolver) =>
  diResolver.getOrCreate(diName, () => new SideNavController())

export const useSideNavController = createDIHook(diName, getSideNavController)
