import React from 'react'

import { i18n } from '@mm/core/i18n'
import { getMMErrorLogger } from '@mm/core/logging'

import { getBloomCustomTerms } from '@mm/core-bloom'

import { getOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { OVERLAZY_DRAWERS } from './overlazyComponents'
import { getRecordOfOverlazyDrawerIdToDrawerTitle } from './overlazyConstants'
import {
  ICloseOverlazyDrawerOpts,
  ICloseOverlazyModalOpts,
  ICloseOverlazyStickyDrawerOpts,
  ICloseTabOpts,
  IOverlazyContext,
} from './overlazyTypes'

interface IOverlazyErrorBoundaryProps {
  diResolver: IDIResolver
  children: React.ReactNode
  closeOverlazyProps:
    | (ICloseOverlazyDrawerOpts & { drawerId: keyof typeof OVERLAZY_DRAWERS })
    | ICloseOverlazyStickyDrawerOpts
    | ICloseTabOpts
    | ICloseOverlazyModalOpts
  reopenOverlazyProps: Parameters<IOverlazyContext['openOverlazy']>
}

export default class OverlazyErrorBoundary extends React.PureComponent<IOverlazyErrorBoundaryProps> {
  private diResolver: IDIResolver
  private closeOverlazyProps: IOverlazyErrorBoundaryProps['closeOverlazyProps']

  state = {
    error: null,
    errorInfo: null,
  }

  constructor(props: IOverlazyErrorBoundaryProps) {
    super(props)
    this.diResolver = props.diResolver
    this.closeOverlazyProps = props.closeOverlazyProps
  }

  static getDerivedStateFromError(error: any, errorInfo: any) {
    // Update state so the next render will show the fallback UI.
    return { error, errorInfo }
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    })

    getOverlazyController(this.diResolver).closeOverlazy(
      this.closeOverlazyProps
    )

    const terms = getBloomCustomTerms(this.diResolver)

    if (this.closeOverlazyProps.type === 'Drawer') {
      // we only log the error here if type is drawer, since error toasts log their own errors.
      const currentlyOpenOverlazy = this.closeOverlazyProps
      getMMErrorLogger(this.diResolver).logError(error, errorInfo)
      setTimeout(() => {
        if ('drawerId' in currentlyOpenOverlazy) {
          getOverlazyController(this.diResolver).openOverlazy('ErrorDrawer', {
            title:
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                currentlyOpenOverlazy.drawerId
              ],
            retry: () => {
              // if it's a network error from useSubscription, retry that request
              error?.retry?.()

              // close error drawer
              getOverlazyController(this.diResolver).closeOverlazy({
                type: 'Drawer',
              })
              // and open the previously opened drawer
              getOverlazyController(this.diResolver).openOverlazy(
                ...this.props.reopenOverlazyProps
              )
            },
          })
        }
      }, 0)
    } else {
      getOverlazyController(this.diResolver).openOverlazy('Toast', {
        type: 'error',
        text: i18n.t(`Something went wrong!`),
        error,
        errorInfo,
      })
    }
  }

  render() {
    if (this.state.error) {
      // We handle the error and close the open overlazy in componentDidCatch, so just return null here.
      return null
    }

    return this.props.children
  }
}
