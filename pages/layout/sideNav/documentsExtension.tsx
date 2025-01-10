import React from 'react'

import { useTranslation } from '@mm/core-web/i18n'
import { Text, useTheme } from '@mm/core-web/ui'

import { StyledSideNavLI, StyledSideNavUL } from './containers'

export const DocumentsExtension = () => {
  const theme = useTheme()
  const { t } = useTranslation()
  // @TODO_BLOOM - https://winterinternational.atlassian.net/browse/TTD-1381
  return (
    <StyledSideNavUL>
      <StyledSideNavLI isBulletedList={false}>
        <Text
          type={'body'}
          color={{ color: theme.colors.sideNavBarTextColorDefault }}
        >
          {t('Repository')}
        </Text>
      </StyledSideNavLI>
    </StyledSideNavUL>
  )
}
