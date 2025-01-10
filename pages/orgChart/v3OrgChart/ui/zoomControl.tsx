import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { Text, toREM } from '@mm/core-web/ui'

import { StyledOrgChartControlBtnIcon } from './styledComponents'

export const ZoomControl = observer(function ZoomControl(props: {
  currentScale: number
  onIncreaseScale: () => void
  onDecreaseScale: () => void
  maxScale: number
  minScale: number
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div
      className={props.className}
      css={css`
        display: inline-flex;
        box-shadow: ${({ theme }) => theme.sizes.bs2};
        border-radius: ${({ theme }) => theme.sizes.br3};
        overflow: hidden;
      `}
    >
      <StyledOrgChartControlBtnIcon
        iconProps={{
          iconName: 'minusIcon',
        }}
        disabled={props.currentScale === props.minScale}
        ariaLabel={t('Zoom out')}
        tag='button'
        css={css`
          /* important prevents the border from disappearing when the button is hovered */
          border-right: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartControlDivider} !important;
        `}
        onClick={props.onDecreaseScale}
      />
      <div
        css={css`
          background-color: ${({ theme }) =>
            theme.colors.orgChartControlBackground};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 0 ${({ theme }) => theme.sizes.spacing16};
          width: ${toREM(120)};
          border-right: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartControlDivider};
        `}
      >
        <Text weight='semibold'>
          {t('{{zoomPercent}}% Zoom', {
            zoomPercent: Math.round(props.currentScale * 100),
          })}
        </Text>
      </div>
      <StyledOrgChartControlBtnIcon
        iconProps={{
          iconName: 'plusIcon',
        }}
        ariaLabel={t('Expand direct reports one level')}
        tag='button'
        disabled={props.currentScale === props.maxScale}
        css={css`
          border-right: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartControlDivider} !important;
        `}
        onClick={props.onIncreaseScale}
      />
    </div>
  )
})
