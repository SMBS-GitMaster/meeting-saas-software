import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { PersonalMetricsTableContainer } from './personalMetricsTableContainer'
import { PersonalMetricsTableView } from './personalMetricsTableView'

interface IPersonalMetricsTableProps {
  workspaceTileId: Id
  userId: Maybe<Id>
  className?: string
}

export const PersonalMetricsTable = observer(function PersonalMetricsTable(
  props: IPersonalMetricsTableProps
) {
  return (
    <PersonalMetricsTableContainer
      workspaceTileId={props.workspaceTileId}
      userId={props.userId}
      className={props.className}
    >
      {PersonalMetricsTableView}
    </PersonalMetricsTableContainer>
  )
})
