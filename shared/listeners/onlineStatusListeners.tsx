import React from 'react'
import { css } from 'styled-components'

import { UnreachableCaseError } from '@mm/gql/exceptions'

import { createDIHook } from '@mm/core/di/resolver'
import { getWindow } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web'

import { Text, useTheme } from '@mm/core-web/ui'

import { getOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { preloadWarningToast } from '@mm/bloom-web/errors/preload'

const DELAY_UNTIL_MODAL_APPEARS_AFTER_OFFLINE_S = 10

class OnlineOfflineStatusListeners {
  diResolver: IDIResolver

  userIsOffline: boolean
  displayFirstWarningTimeoutId: NodeJS.Timeout | null = null
  currentOfflineWarningToastId: string | null = null
  currentToastIsSecondWarning = false

  constructor(opts: { diResolver: IDIResolver }) {
    this.diResolver = opts.diResolver
    preloadWarningToast(this.diResolver)

    const window = getWindow(this.diResolver)

    this.userIsOffline = !window.navigator.onLine
    window.addEventListener('online', this.onUserOnline)
    window.addEventListener('offline', this.onUserOffline)
  }

  closeOfflineWarningToastIfAnyOpen = () => {
    if (this.currentOfflineWarningToastId) {
      getOverlazyController(this.diResolver).closeOverlazy({
        type: 'Toast',
        id: this.currentOfflineWarningToastId,
      })
      this.currentOfflineWarningToastId = null
      this.currentToastIsSecondWarning = false
    }
  }

  displayFirstOfflineWarningToast = () => {
    // don't do anything if we're already showing an offline related warning
    // prevents the first warning from being shown after the 10 s timeout
    // if the user had previously tried to save something and gotten the error about being offline
    if (this.currentOfflineWarningToastId != null) return

    const overlazy = getOverlazyController(this.diResolver).openOverlazy(
      'Toast',
      {
        type: 'warning',
        text: <FirstWarningToastMessage />,
        doNotAutoClose: true,
        onToastDismissed: () => {
          if (this.currentToastIsSecondWarning) return
          this.currentOfflineWarningToastId = null
        },
      }
    )

    if (overlazy) {
      this.currentOfflineWarningToastId = overlazy.id
      this.currentToastIsSecondWarning = false
    } else {
      throw new UnreachableCaseError(overlazy as never)
    }
  }

  displayOfflineWarningToastWhenUserAttemptsToSaveWhileOffline = () => {
    if (this.currentToastIsSecondWarning) return

    this.closeOfflineWarningToastIfAnyOpen()

    const overlazy = getOverlazyController(this.diResolver).openOverlazy(
      'Toast',
      {
        type: 'warning',
        text: <ToastMessageWhenUserAttemptsToSaveWhileOffline />,
        doNotAutoClose: true,
        onToastDismissed: () => {
          if (!this.currentToastIsSecondWarning) return
          this.currentOfflineWarningToastId = null
          this.currentToastIsSecondWarning = false
        },
      }
    )

    if (overlazy) {
      this.currentOfflineWarningToastId = overlazy.id
      this.currentToastIsSecondWarning = true
    } else {
      throw new UnreachableCaseError(overlazy as never)
    }
  }

  onUserOnline = () => {
    this.userIsOffline = false
    this.closeOfflineWarningToastIfAnyOpen()

    if (this.displayFirstWarningTimeoutId) {
      clearTimeout(this.displayFirstWarningTimeoutId)
      this.displayFirstWarningTimeoutId = null
    }
  }

  onUserOffline = () => {
    this.userIsOffline = true
    this.displayFirstWarningTimeoutId = setTimeout(
      this.displayFirstOfflineWarningToast,
      DELAY_UNTIL_MODAL_APPEARS_AFTER_OFFLINE_S * 1000
    )
  }
}

const DI_NAME = 'bloom-web/shared/listeners/onlineOfflineStatusListeners'

export const getOnlineOfflineStatusListeners = (diResolver: IDIResolver) => {
  return diResolver.getOrCreate(
    DI_NAME,
    () => new OnlineOfflineStatusListeners({ diResolver })
  )
}

export const useOnlineOfflineStatusListeners = createDIHook(
  DI_NAME,
  getOnlineOfflineStatusListeners
)

function TwoTierWarningToastMessage(props: { title: string; text: string }) {
  const { sizes } = useTheme()
  const { t } = useTranslation()

  return (
    <div>
      <Text
        type='h4'
        css={css`
          padding-top: ${sizes.spacing8};
          padding-bottom: ${sizes.spacing8};
        `}
      >
        {t(props.title)}
      </Text>
      <Text
        css={css`
          padding-bottom: ${sizes.spacing8};
        `}
      >
        {t(props.text)}
      </Text>
    </div>
  )
}

function FirstWarningToastMessage() {
  const { t } = useTranslation()

  return (
    <TwoTierWarningToastMessage
      title={t(`Uh oh! Connection trouble?`)}
      text={t(
        `There's a temporary issue with your internet connection or our servers. During this time, you can still view your information, but new items and edits will not save.`
      )}
    />
  )
}

function ToastMessageWhenUserAttemptsToSaveWhileOffline() {
  const { t } = useTranslation()

  return (
    <TwoTierWarningToastMessage
      title={t(`Looks like your changes haven't saved.`)}
      text={t(
        `It might be a temporary issue on your end or with our servers. Try refreshing the page - that should fix it!`
      )}
    />
  )
}
