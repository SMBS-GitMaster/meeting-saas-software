import React from 'react'
import { css } from 'styled-components'

import { Badge, Expandable } from '@mm/core-web/ui'

export function BadgeDemo() {
  return (
    <Expandable title='Badges'>
      <Badge
        css={css`
          margin-right: 8px;
        `}
        text='NEW'
        intent='primary'
      />
      <Badge
        css={css`
          margin-right: 8px;
        `}
        text='OLD'
        intent='primary'
      />
      <Badge text='CATEGORY' intent='primary' />
    </Expandable>
  )
}
