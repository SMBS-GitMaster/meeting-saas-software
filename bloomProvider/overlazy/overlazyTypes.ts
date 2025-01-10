import { ComponentProps } from 'react'

import { IToastProps } from '@mm/core-web/ui/components/toast/toastTypes'

import type {
  OVERLAZY_COMPONENTS,
  OVERLAZY_MODALS,
  OVERLAZY_TABS,
} from './overlazyComponents'

export type TOverlazyComponentType =
  | 'Drawer'
  | 'StickyDrawer'
  | 'Modal'
  | 'Toast'
  | 'Tab'

export type TOverylazyComponent = keyof typeof OVERLAZY_COMPONENTS

export interface IOverlazyContext {
  openOverlazy: <TComponent extends TOverylazyComponent>(
    component: TComponent,
    props: ComponentProps<(typeof OVERLAZY_COMPONENTS)[TComponent]>
    // returns an id for toasts specifically, so they can be dismissed programmatically
  ) => { id: string } | void
  closeOverlazy: (
    opts:
      | ICloseOverlazyDrawerOpts
      | ICloseOverlazyStickyDrawerOpts
      | ICloseTabOpts
      | ICloseOverlazyModalOpts
      | ICloseToastOpts
  ) => void
  updateOverlazyProps: <TComponent extends TOverylazyComponent>(
    component: TComponent,
    props: Partial<ComponentProps<(typeof OVERLAZY_COMPONENTS)[TComponent]>>
  ) => void
}

export interface ICloseOverlazyDrawerOpts {
  type: 'Drawer'
}

export interface ICloseOverlazyModalOpts {
  type: 'Modal'
  name: keyof typeof OVERLAZY_MODALS
}

export interface ICloseTabOpts {
  type: 'Tab'
  name: keyof typeof OVERLAZY_TABS
}

export interface ICloseOverlazyStickyDrawerOpts {
  type: 'StickyDrawer'
}

export interface ICloseToastOpts {
  type: 'Toast'
  id: string
}

export type IRenderedOverlazyToast = IToastProps & {
  id: string
  timeoutId: Maybe<NodeJS.Timeout>
  visible: boolean
}

export interface IActiveOverlazyComponent {
  component: TOverylazyComponent
  props: ComponentProps<(typeof OVERLAZY_COMPONENTS)[TOverylazyComponent]>
}
