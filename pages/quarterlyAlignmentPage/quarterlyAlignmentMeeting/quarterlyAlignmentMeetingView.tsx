import { observer } from 'mobx-react'
import React from 'react'

import { type IQuarterlyAlignmentMeetingViewProps } from './quarterlyAlignmentMeetingTypes'

export const QuarterlyAlignmentMeetingView = observer(
  function QuarterlyAlignmentMeetingView(
    props: IQuarterlyAlignmentMeetingViewProps
  ) {
    return <div>{props.data().mockPropString}</div>
  }
)
