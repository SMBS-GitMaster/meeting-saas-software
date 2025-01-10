import { observer } from 'mobx-react'
import React from 'react'

import EditGoalDrawerContainer from './editGoalDrawerContainer'
import { IEditGoalDrawerProps } from './editGoalDrawerTypes'
import EditGoalDrawerView from './editGoalDrawerView'

export const EditGoalDrawer = observer(function EditGoalDrawer(
  props: IEditGoalDrawerProps
) {
  return (
    <EditGoalDrawerContainer goalId={props.goalId} meetingId={props.meetingId}>
      {EditGoalDrawerView}
    </EditGoalDrawerContainer>
  )
})
