import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { StyledOrgChartControlBtnText } from './styledComponents'

export const FitScreenButton = observer(function FitScreenButton(props: {
  onClick: () => void
  className?: string
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
      className={props.className}
    >
      <StyledOrgChartControlBtnText
        onClick={props.onClick}
        ariaLabel={t('Fit screen')}
      >
        {t('Fit screen')}
      </StyledOrgChartControlBtnText>
    </div>
  )
})
