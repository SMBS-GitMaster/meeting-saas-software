import React from 'react'

import { Id } from '@mm/gql'

import { PersonalGoalsListContainer } from './personalGoalsListContainer'
import { PersonalGoalsListView } from './personalGoalsListView'

interface IPersonalGoalsListProps {
  workspaceTileId: Id
  className?: string
  userId?: Id
}

export function PersonalGoalsList(props: IPersonalGoalsListProps) {
  return (
    <PersonalGoalsListContainer
      workspaceTileId={props.workspaceTileId}
      className={props.className}
      userId={props.userId}
    >
      {PersonalGoalsListView}
    </PersonalGoalsListContainer>
  )
}
