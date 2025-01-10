import { observer } from 'mobx-react'
import React from 'react'

import { Id } from '@mm/gql'

import { MeetingStats } from '../../../meetingStats'

interface IMeetingStatsSectionProps {
  meetingId: Id
  meetingPageName: string
}

export const MeetingStatsSection = observer(function MeetingStatsSection(
  props: IMeetingStatsSectionProps
) {
  return <MeetingStats {...props} />
})
