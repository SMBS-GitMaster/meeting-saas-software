import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { useBrowserEnvironment } from '@mm/core-web/envs'

import { BloomHeader } from '../layout/header/bloomHeader'

export default function DocumentsPage() {
  const { v1Url } = useBrowserEnvironment()
  const { t } = useTranslation()

  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={t('Documents')}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <iframe
        src={`${v1Url}Documents/listing?noheading=true`}
        title={t('Documents')}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
        `}
      />
    </>
  )
}
