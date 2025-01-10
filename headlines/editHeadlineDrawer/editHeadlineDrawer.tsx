import { observer } from 'mobx-react'
import React from 'react'

import EditHeadlineDrawerContainer from './editHeadlineDrawerContainer'
import { IEditHeadlineDrawerProps } from './editHeadlineDrawerTypes'
import EditHeadlineDrawerView from './editHeadlineDrawerView'

export const EditHeadlineDrawer = observer(function EditHeadlineDrawer(
  props: IEditHeadlineDrawerProps
) {
  return (
    <EditHeadlineDrawerContainer
      headlineId={props.headlineId}
      meetingId={props.meetingId}
    >
      {EditHeadlineDrawerView}
    </EditHeadlineDrawerContainer>
  )
})
