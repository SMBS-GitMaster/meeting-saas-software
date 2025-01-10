import type { Id } from '@mm/gql'

import { type UserAvatarColorType } from '@mm/core-bloom'

export interface IUserProfileTileContainerProps {
  workspaceTileId: Id
  userId: Maybe<Id>
  className?: string
  children: (props: IUserProfileTileViewProps) => JSX.Element
}

export interface IUserProfileTileViewProps {
  className?: string
  getData: () => IUserProfileTileViewData
  getActions: () => IUserProfileTileViewActions
}

export interface IUserProfileTileViewData {
  workspaceTileId: Id
  isExpandedInWorkspace: boolean
  isCurrentUser: boolean
  user: {
    firstName: string
    lastName: string
    profilePictureUrl: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }
}

export interface IUserProfileTileViewActions {
  onDeleteTile: () => Promise<void>
}
