import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import {
  getTextStyles,
  userAvatarBRRemSizeByProp,
  userAvatarREMSizeByProp,
} from '@mm/core-web/ui'

export const OpenAvatarAndBadge = observer(function OpenAvatarAndBadge() {
  const { t } = useTranslation()
  return (
    <>
      <div
        css={css`
          width: ${userAvatarREMSizeByProp['s']};
          height: ${userAvatarREMSizeByProp['s']};
          border-radius: ${userAvatarBRRemSizeByProp['s']};
          background: ${({ theme }) =>
            theme.colors.orgChartSeatEmptyAvatarColor};
          margin-right: ${({ theme }) => theme.sizes.spacing8};
        `}
      />
      <div
        css={css`
          border-radius: ${({ theme }) => theme.sizes.br1};
          padding: 0 ${({ theme }) => theme.sizes.spacing4};
          background-color: ${({ theme }) =>
            theme.colors.orgChartSeatOpenBadgeBackground};

          ${getTextStyles({
            type: 'body',
            weight: 'semibold',
          })};
        `}
      >
        {t('Open')}
      </div>
    </>
  )
})
