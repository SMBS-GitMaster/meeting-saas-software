import React from 'react'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { TruncateTextBanner } from '@mm/core-web/ui'

import {
  IContextAwareBannerProps,
  getContextAwareNodeTypes,
} from '../contextAware'

export const ContextAwareBanner = (props: IContextAwareBannerProps) => {
  const { t } = useTranslation()
  const terms = useBloomCustomTerms()
  const contextAwareNodeTypes = getContextAwareNodeTypes(terms)

  if (!props.fromNodeType || !props.fromNodeTitle) return null

  return (
    <TruncateTextBanner lines={2} customXPadding={props.customXPadding}>
      {t('From')} <strong>{contextAwareNodeTypes[props.fromNodeType]}</strong>:{' '}
      {props.fromNodeTitle}
    </TruncateTextBanner>
  )
}
