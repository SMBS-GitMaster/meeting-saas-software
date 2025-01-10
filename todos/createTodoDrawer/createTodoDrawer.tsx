import { observer } from 'mobx-react'
import React from 'react'

import { CreateTodoDrawerContainer } from './createTodoDrawerContainer'
import { ICreateTodoDrawerProps } from './createTodoDrawerTypes'
import { CreateTodoDrawerView } from './createTodoDrawerView'

export const CreateTodoDrawer = observer(function CreateTodoDrawer(
  props: ICreateTodoDrawerProps
) {
  return (
    <CreateTodoDrawerContainer
      context={props.context}
      isUniversalAdd={props.isUniversalAdd}
      meetingId={props.meetingId}
    >
      {CreateTodoDrawerView}
    </CreateTodoDrawerContainer>
  )
})
