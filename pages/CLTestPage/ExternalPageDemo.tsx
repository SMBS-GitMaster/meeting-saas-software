import React from 'react'

import { Expandable } from '@mm/core-web/ui'

import { ExternalPageSection } from '@mm/bloom-web/externalPage'

export const ExternalPageDemo = () => {
  return (
    <Expandable title='External Page Section'>
      <ExternalPageSection meetingPageId='mock-meeting-page-id-6' />
    </Expandable>
  )
}
