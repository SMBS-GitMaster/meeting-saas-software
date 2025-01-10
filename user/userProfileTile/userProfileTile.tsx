import { observer } from 'mobx-react'
import React from 'react'

import type { Id } from '@mm/gql'

import { UserProfileTileContainer } from './userProfileTileContainer'
import { UserProfileTileView } from './userProfileTileView'

interface IUserProfileTileProps {
  workspaceTileId: Id
  userId: Maybe<Id>
  className?: string
}

export const UserProfileTile = observer(function UserProfileTile(
  props: IUserProfileTileProps
) {
  return (
    <UserProfileTileContainer
      workspaceTileId={props.workspaceTileId}
      userId={props.userId}
      className={props.className}
    >
      {UserProfileTileView}
    </UserProfileTileContainer>
  )
})
