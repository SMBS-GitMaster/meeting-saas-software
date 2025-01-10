import React from 'react'

import { Expandable, Pill, Text } from '@mm/core-web/ui'

export function PillDemo() {
  return (
    <Expandable title='Pills'>
      <>
        <Text type='body'>Primary Intent</Text>
        <br />
        <Pill intent='primary' />
        <br />
        <Text type='body'>Success Intent</Text>
        <br />
        <Pill intent='success' />
        <br />
        <Text type='body'>Warning Intent</Text>
        <br />
        <Pill intent='warning' />
      </>
    </Expandable>
  )
}
