import { type Id } from '@mm/gql'

export interface IRolesTileContainerProps {
  workspaceTileId: Id
  userId: Maybe<Id>
  children: (props: IRolesTileViewProps) => JSX.Element
  onHandleUpdateTileHeight: (opts: { tileId: Id; height: number }) => void
}

export interface IRolesTileViewProps {
  data: () => IRolesTileData
  actions: () => IRolesTileActions
}

export interface IRolesTileData {
  isLoading: boolean
  workspaceTileId: Id
  isViewingCurrentUser: boolean
  isExpandedInWorkspace: boolean
  isRolesListExpanded: boolean
  getPositionRolesData: () => Array<IPositionRolesDatum>
}

export interface IRolesTileActions {
  onDeleteTile: () => Promise<void>
  onHandleTileExpand: () => void
}

export interface IPositionRolesDatum {
  positionTitle: string
  roles: Array<string>
}
