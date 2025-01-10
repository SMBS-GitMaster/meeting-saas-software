import React from 'react'

import { Id } from '@mm/gql'

import { MeetingStatsContainer } from './meetingStatsContainer'
import { MeetingStatsView } from './meetingStatsView'

export * from './meetingStatsView'
export * from './meetingStatsTypes'

interface IMeetingStatsProps {
  meetingId: Id
  meetingPageName: string
  className?: string
}

export const MeetingStats = (props: IMeetingStatsProps) => {
  return (
    <MeetingStatsContainer {...props}>{MeetingStatsView}</MeetingStatsContainer>
  )
}
