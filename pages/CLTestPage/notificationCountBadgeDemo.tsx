import React from 'react'

import { Expandable, NotificationCountBadge, Text } from '@mm/core-web/ui'

export function NotificationCountBadgeDemo() {
  return (
    <Expandable title='Notification Badges'>
      <>
        <Text type='h1'>Notification count badge</Text>
        Single digits <NotificationCountBadge count={2} />
        <br />
        Double digits <NotificationCountBadge count={42} />
        <br />
        Triple digits <NotificationCountBadge count={420} />
      </>
    </Expandable>
  )
}
