import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { RolesTileContainer } from './rolesTileContainer'
import { RolesTileView } from './rolesTileView'

interface IRolesTileProps {
  workspaceTileId: Id
  userId: Maybe<Id>
  onHandleUpdateTileHeight: (opts: { tileId: Id; height: number }) => void
}

export const RolesTile = observer(function RolesTile(props: IRolesTileProps) {
  return (
    <RolesTileContainer
      workspaceTileId={props.workspaceTileId}
      userId={props.userId}
      onHandleUpdateTileHeight={props.onHandleUpdateTileHeight}
    >
      {RolesTileView}
    </RolesTileContainer>
  )
})
