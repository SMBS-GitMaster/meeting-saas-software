import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { Icon } from '@mm/core-web/ui'

import { StyledOrgChartControlBtnText } from './styledComponents'

export const CreateOrgChartSeatButton = observer(
  function CreateOrgChartSeatButton(props: { onClick: () => void }) {
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
          ariaLabel={t('Add seat')}
        >
          <Icon
            iconName='plusIcon'
            css={css`
              margin-right: ${({ theme }) => theme.sizes.spacing8};
            `}
          />
          {t('Add seat')}
        </StyledOrgChartControlBtnText>
      </div>
    )
  }
)
