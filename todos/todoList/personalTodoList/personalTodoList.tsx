import { observer } from 'mobx-react'
import React from 'react'

import type { Id } from '@mm/gql'

import { PersonalTodoListContainer } from './personalTodoListContainer'
import { PersonalTodoListView } from './personalTodoListView'

interface IPersonalTodoListProps {
  workspaceTileId: Id
  className?: string
}

export const PersonalTodoList = observer(function PersonalTodoList(
  props: IPersonalTodoListProps
) {
  return (
    <PersonalTodoListContainer
      workspaceTileId={props.workspaceTileId}
      className={props.className}
    >
      {PersonalTodoListView}
    </PersonalTodoListContainer>
  )
})
