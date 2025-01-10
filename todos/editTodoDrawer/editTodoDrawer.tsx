import { observer } from 'mobx-react'
import React from 'react'

import { EditTodoDrawerContainer } from './editTodoDrawerContainer'
import { IEditTodoDrawerProps } from './editTodoDrawerTypes'
import { EditTodoDrawerView } from './editTodoDrawerView'

export const EditTodoDrawer = observer(function EditTodoDrawer(
  props: IEditTodoDrawerProps
) {
  return (
    <EditTodoDrawerContainer
      todoId={props.todoId}
      meetingId={props.meetingId}
      hideContextAwareButtons={props.hideContextAwareButtons}
    >
      {EditTodoDrawerView}
    </EditTodoDrawerContainer>
  )
})
