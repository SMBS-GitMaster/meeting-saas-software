import { observer } from 'mobx-react'
import React from 'react'

import CreateGoalDrawerContainer from './createGoalDrawerContainer'
import { ICreateGoalDrawerProps } from './createGoalDrawerTypes'
import CreateGoalDrawerView from './createGoalDrawerView'

export const CreateGoalDrawer = observer(function CreateGoalDrawer(
  props: ICreateGoalDrawerProps
) {
  return (
    <CreateGoalDrawerContainer
      meetingId={props.meetingId}
      initialItemValues={props.initialItemValues}
    >
      {CreateGoalDrawerView}
    </CreateGoalDrawerContainer>
  )
})
