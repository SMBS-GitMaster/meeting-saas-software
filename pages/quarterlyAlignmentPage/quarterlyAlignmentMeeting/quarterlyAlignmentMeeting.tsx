import { observer } from 'mobx-react'
import React from 'react'

import { QuarterlyAlignmentMeetingContainer } from './quarterlyAlignmentMeetingContainer'
import { QuarterlyAlignmentMeetingView } from './quarterlyAlignmentMeetingView'

export const QuarterlyAlignmentMeeting = observer(
  function QuarterlyAlignmentMeeting() {
    return (
      <QuarterlyAlignmentMeetingContainer>
        {QuarterlyAlignmentMeetingView}
      </QuarterlyAlignmentMeetingContainer>
    )
  }
)
