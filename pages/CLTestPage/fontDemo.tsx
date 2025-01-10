import React from 'react'

import { Expandable, Text } from '@mm/core-web/ui'

export const FontDemo = () => {
  return (
    <Expandable title='Fonts'>
      <>
        <Text type='h1' display='block'>
          FONTS
        </Text>
        <Text type='h1' display='block'>
          H1 text
        </Text>
        <Text type='h2' display='block'>
          H2 text
        </Text>
        <Text type='h3' display='block'>
          H3 text
        </Text>
        <Text type='h4' display='block'>
          H4 text
        </Text>
        <Text type='body' display='block'>
          Body text
        </Text>
        <Text type='small' display='block'>
          Small text
        </Text>
        <Text type='caption' display='block'>
          Caption text
        </Text>
        <Text type='badge' display='block'>
          Badge text
        </Text>
        <Text type='body' color={{ intent: 'warning' }}>
          Warning Intent
        </Text>
      </>
    </Expandable>
  )
}
