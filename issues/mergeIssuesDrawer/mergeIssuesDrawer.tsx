import { observer } from 'mobx-react'
import React from 'react'

import { MergeIssuesDrawerContainer } from './mergeIssuesDrawerContainer'
import { IMergeIssuesDrawerProps } from './mergeIssuesDrawerTypes'
import { MergeIssuesDrawerView } from './mergeIssuesDrawerView'

export const MergeIssuesDrawer = observer(function MergeIssuesDrawer(
  props: IMergeIssuesDrawerProps
) {
  return (
    <MergeIssuesDrawerContainer
      issues={props.issues}
      meetingId={props.meetingId}
    >
      {MergeIssuesDrawerView}
    </MergeIssuesDrawerContainer>
  )
})
