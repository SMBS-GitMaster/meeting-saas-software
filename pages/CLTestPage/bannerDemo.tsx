import React, { useState } from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { Banner, BtnText, Expandable } from '@mm/core-web/ui'

export function BannerDemo() {
  const { t } = useTranslation()
  const [showBanner, setShowBanner] = useState(true)

  const onCancelBannerClick = () => {
    console.log('canceling banner')
    setShowBanner((current) => !current)
  }

  const onClearBtnClick = () => {
    console.log('banner selection cleared')
  }

  const onSubmitBtnClick = () => {
    console.log('banner submitted')
  }

  return (
    <Expandable title='Banners'>
      <div
        css={css`
          margin: 20px;
          width: 870px;
        `}
      >
        {showBanner ? (
          <Banner
            bannerText={t('Select issues to merge')}
            clearBtnText={t('clear selection')}
            submitBtnText={t('Merge')}
            onCancelBannerClick={onCancelBannerClick}
            onClearBtnClick={onClearBtnClick}
            onSubmitBtnClick={onSubmitBtnClick}
          />
        ) : (
          <BtnText
            width={'noPadding'}
            ariaLabel={t('Show banner')}
            intent={'tertiaryTransparent'}
            onClick={onCancelBannerClick}
          >
            Show banner again
          </BtnText>
        )}
        <div
          css={css`
            height: 20px;
          `}
        />
        {showBanner && (
          <Banner
            bannerText={t('Can put anything here')}
            clearBtnText={t('or here')}
            submitBtnText={t('or here')}
            submitDisabled={true}
            onCancelBannerClick={onCancelBannerClick}
            onClearBtnClick={onClearBtnClick}
            onSubmitBtnClick={onSubmitBtnClick}
          />
        )}
      </div>
    </Expandable>
  )
}
