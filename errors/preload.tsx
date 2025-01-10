import React from 'react'

import { getPreloadPortalState } from '@mm/core-web/loadStrategies/preloadPortal'
import { SomethingWentWrongError, Toast } from '@mm/core-web/ui'

// We need to preload some components so they are available when asynchronously requested by the app
export function preloadSomethingWentWrongError(diResolver: IDIResolver) {
  getPreloadPortalState(diResolver).preload(
    <SomethingWentWrongError onRetry={() => null} addGoHomeOption={false} />
  )
}

export function preloadWarningToast(diResolver: IDIResolver) {
  const warmupToast = (
    <Toast
      type='warning'
      text='mock'
      key={'preload-warning-toast-for-online-status-listener'}
    />
  )
  getPreloadPortalState(diResolver).preload(warmupToast)
}
