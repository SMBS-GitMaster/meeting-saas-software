import React from 'react'

import { CheckInSectionContainer } from './checkInSectionContainer'
import { CheckInSectionView } from './checkInSectionView'

export * from './checkInSectionView'
export * from './checkInSectionTypes'

export function CheckInSection(props: {
  meetingPageId: string
  meetingPageName: string
  className?: string
}) {
  return (
    <CheckInSectionContainer {...props}>
      {CheckInSectionView}
    </CheckInSectionContainer>
  )
}
