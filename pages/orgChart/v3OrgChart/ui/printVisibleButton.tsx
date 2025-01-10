import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { StyledOrgChartControlBtnText } from './styledComponents'

export const PrintVisibleButton = observer(function PrintVisibleButton(props: {
  onClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <div
      css={css`
        display: inline-flex;
        box-shadow: ${({ theme }) => theme.sizes.bs2};
        border-radius: ${({ theme }) => theme.sizes.br3};
        overflow: hidden;
      `}
    >
      <StyledOrgChartControlBtnText
        onClick={props.onClick}
        ariaLabel={t('Print visible')}
      >
        {t('Print visible')}
      </StyledOrgChartControlBtnText>
    </div>
  )
})
