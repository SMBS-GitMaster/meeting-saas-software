import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Text } from '@mm/core-web/ui'

import brokenLinkImg from './assets/brokenLink.svg'

interface IExternalPageBrokenLinkProps extends IBaseComponentProps {
  alt: string
}

export const ExternalPageBrokenLink = observer(function ExternalPageBrokenLink(
  props: IExternalPageBrokenLinkProps
) {
  return (
    <div
      css={css`
        align-items: center;
        display: flex;
        flex-direction: column;
        margin-top: ${({ theme }) => theme.sizes.spacing40};
      `}
    >
      <Text
        css={css`
          text-align: center;
          margin-bottom: ${({ theme }) => theme.sizes.spacing24};
        `}
        display='block'
        type='h1'
      >
        {props.children}
      </Text>
      <img src={brokenLinkImg} alt={props.alt} />
    </div>
  )
})
