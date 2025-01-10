import { action, makeAutoObservable } from 'mobx'

import { createDIHook } from '@mm/core/di/resolver'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { getMMErrorLogger } from '@mm/core/logging'
import { uuid } from '@mm/core/utils'

import {
  IToastProps,
  getDrawerController,
  getModalsController,
  getStickyDrawerController,
} from '@mm/core-web/ui'

import { getOnlineOfflineStatusListeners } from '@mm/bloom-web/shared/listeners/onlineStatusListeners'

import { OVERLAZY_COMPONENTS } from './overlazyComponents'
import {
  IActiveOverlazyComponent,
  ICloseOverlazyModalOpts,
  IOverlazyContext,
  IRenderedOverlazyToast,
} from './overlazyTypes'

const TOAST_HIDE_ANIMATION_TIMEOUT = 300
const TOAST_DEFAULT_HIDE_DELAY = 10000

class OverlazyController {
  private diResolver: IDIResolver

  activeDrawer: Maybe<IActiveOverlazyComponent> = null

  activeStickyDrawer: Maybe<IActiveOverlazyComponent> = null

  activeModals: Partial<
    Record<
      IActiveOverlazyComponent['component'],
      IActiveOverlazyComponent['props']
    >
  > = {}

  activeTabs: Partial<
    Record<
      IActiveOverlazyComponent['component'],
      IActiveOverlazyComponent['props']
    >
  > = {}

  activeToasts: IRenderedOverlazyToast[] = []

  constructor(diResolver: IDIResolver) {
    this.diResolver = diResolver
    makeAutoObservable(this)
  }

  public openOverlazy: IOverlazyContext['openOverlazy'] = (
    component,
    componentProps
  ) => {
    const componentToOpen = OVERLAZY_COMPONENTS[component]
    const componentToOpenType = (componentToOpen as any).type

    switch (componentToOpenType) {
      case 'Drawer':
        return this.openDrawer({ component, props: componentProps })
      case 'StickyDrawer':
        return this.openStickyDrawer({ component, props: componentProps })
      case 'Modal':
        return this.openModal({ component, props: componentProps })
      case 'Tab':
        return this.openTab({ component, props: componentProps })
      case 'Toast':
        return this.openToast(componentProps as IToastProps)
      default:
        throw new Error(
          `Unknown or missing overlazy component type provided to openOverlazy: ${componentToOpenType}`
        )
    }
  }

  public closeOverlazy: IOverlazyContext['closeOverlazy'] = (opts) => {
    switch (opts.type) {
      case 'Drawer':
        this.closeDrawer()
        break
      case 'StickyDrawer':
        this.closeStickyDrawer()
        break
      case 'Modal':
        this.closeModal(opts.name)
        break
      case 'Tab':
        this.closeTab(opts.name)
        break
      case 'Toast':
        this.closeToast(opts.id)
        break
    }
  }

  // @TODO: https://winterinternational.atlassian.net/browse/TTD-1388
  public updateOverlazyProps: IOverlazyContext['updateOverlazyProps'] = (
    component,
    componentProps
  ) => {
    const componentToUpdate = OVERLAZY_COMPONENTS[component]
    const componentToUpdateType = (componentToUpdate as any).type

    switch (componentToUpdateType) {
      case 'Drawer':
        if (this.activeDrawer && this.activeDrawer.component === component) {
          const updatedProps = {
            ...(this.activeDrawer.props as any),
            ...componentProps,
          }
          this.activeDrawer.props = updatedProps
        }
        break
      case 'StickyDrawer':
        if (
          this.activeStickyDrawer &&
          this.activeStickyDrawer.component === component
        ) {
          const updatedProps = {
            ...(this.activeStickyDrawer.props as any),
            ...componentProps,
          }
          this.activeStickyDrawer.props = updatedProps
        }
        break
      case 'Modal':
        if (this.activeModals[component]) {
          const updatedProps = {
            ...(this.activeModals[component] as any),
            ...componentProps,
          }
          this.activeModals[component] = updatedProps
        }
        break
      case 'Tab':
        if (this.activeTabs[component]) {
          const updatedProps = {
            ...(this.activeTabs[component] as any),
            ...componentProps,
          }
          this.activeTabs[component] = updatedProps
        }
        this.openTab({ component, props: componentProps })
        break
      default:
        throw new Error(
          `Unknown, un-supported or missing overlazy component type provided to updateOverlazyProps: ${componentToUpdateType}`
        )
    }
  }

  public closeToast = (toastId: string) => {
    const toastToDismiss = this.activeToasts.find((t) => t.id === toastId)
    if (toastToDismiss) {
      toastToDismiss.onToastDismissed && toastToDismiss.onToastDismissed()
      toastToDismiss.timeoutId && clearTimeout(toastToDismiss.timeoutId)
      setTimeout(
        action(`OverlazyController.closeToast`, () => {
          this.activeToasts = this.activeToasts.filter((t) => t.id !== toastId)
        }),
        TOAST_HIDE_ANIMATION_TIMEOUT
      )

      toastToDismiss.visible = false
    }
  }

  private openDrawer = (drawer: IActiveOverlazyComponent) => {
    this.activeDrawer = drawer
    getDrawerController(this.diResolver).openDrawer(drawer.component)
  }

  private closeDrawer = () => {
    this.activeDrawer = null
    getDrawerController(this.diResolver).closeDrawer()
  }

  private openStickyDrawer = (stickyDrawer: IActiveOverlazyComponent) => {
    this.activeStickyDrawer = stickyDrawer
    getStickyDrawerController(this.diResolver).openStickyDrawer(
      stickyDrawer.component
    )
  }

  private closeStickyDrawer = () => {
    this.activeStickyDrawer = null
    getStickyDrawerController(this.diResolver).closeStickyDrawer()
  }

  private openModal = (modal: IActiveOverlazyComponent) => {
    this.activeModals[modal.component] = modal.props
    getModalsController(this.diResolver).openModal(modal.component)
  }

  private closeModal = (modalName: ICloseOverlazyModalOpts['name']) => {
    delete this.activeModals[modalName]
    getModalsController(this.diResolver).closeModal(modalName)
  }

  private openTab = (tab: IActiveOverlazyComponent) => {
    this.activeTabs[tab.component] = tab.props
  }

  private closeTab = (name: IActiveOverlazyComponent['component']) => {
    delete this.activeTabs[name]
  }

  private openToast = (toastProps: IToastProps) => {
    if (
      // if the error is due to user being offline, show the offline warning toast instead
      toastProps.type === 'error' &&
      toastProps.error instanceof UserActionError
    ) {
      const onlineOfflineStatusListeners = getOnlineOfflineStatusListeners(
        this.diResolver
      )
      if (onlineOfflineStatusListeners.userIsOffline) {
        getOnlineOfflineStatusListeners(
          this.diResolver
        ).displayOfflineWarningToastWhenUserAttemptsToSaveWhileOffline()
        return
      }
    }

    if (toastProps.type === 'error') {
      getMMErrorLogger(this.diResolver).logError(toastProps.error, {
        message: toastProps.text,
      })
    }

    const newToastId = uuid()

    const timeoutId = toastProps.doNotAutoClose
      ? null
      : setTimeout(() => {
          this.closeToast(newToastId)
        }, TOAST_DEFAULT_HIDE_DELAY)

    this.activeToasts.push({
      ...toastProps,
      id: newToastId,
      timeoutId,
      visible: true,
    })

    if (this.activeToasts.length > 3) {
      // discard any toasts that are not the last 3 pushed
      const toastsToDiscard = this.activeToasts.slice(0, -3)
      toastsToDiscard.forEach((toast) => {
        this.closeToast(toast.id)
      })
    }

    return { id: newToastId }
  }
}

const DI_NAME = 'bloom-web/bloomProvider/overlazy/overlazyController'

export const getOverlazyController = (diResolver: IDIResolver) => {
  return diResolver.getOrCreate<OverlazyController>(
    DI_NAME,
    () => new OverlazyController(diResolver)
  )
}

export const useOverlazyController = createDIHook(
  DI_NAME,
  getOverlazyController
)
