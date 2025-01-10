import { observer } from 'mobx-react'
import React from 'react'

import { useTranslation } from '@mm/core-web'

import { BloomHeader } from '@mm/bloom-web/pages/layout/header/bloomHeader'

export const DirectReportsHeader = observer(function DirectReportsHeader() {
  const { t } = useTranslation()

  return (
    <BloomHeader
      title={t('Direct reports')}
      defaultPropsForDrawers={{ meetingId: null }}
    />
  )
})
