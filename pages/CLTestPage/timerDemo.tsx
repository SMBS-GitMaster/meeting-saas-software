import React from 'react'
import { css } from 'styled-components'

import { Text, Timer } from '@mm/core-web/ui'

export function TimerDemo() {
  return (
    <div
      css={css`
        padding: 20px;
      `}
    >
      <Text type='h1' display='block'>
        Timer Demo
      </Text>
      <Timer />
      <br />
    </div>
  )
}
