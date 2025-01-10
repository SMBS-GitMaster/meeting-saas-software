import type { Id, NodesCollection } from '@mm/gql'

export interface ICoreValuesContainerProps {
  workspaceTileId: Id
  displayTileWorkspaceOptions?: boolean
  expandableTileOptions?: {
    expandedHeight: number
    collapsedHeight: number
    isInitiallyExpanded: boolean
    onHandleUpdateTileHeight: (opts: { tileId: Id; height: number }) => void
  }
  className?: string
  children: (props: ICoreValuesViewProps) => JSX.Element
}

export interface ICoreValuesViewProps {
  data: () => ICoreValuesViewData
  actions: () => ICoreValuesViewActions
  className?: string
}

export interface ICoreValuesViewData {
  displayTileWorkspaceOptions: boolean
  getMainOrgCoreValues: () => Maybe<ICoreValuesData>
  isExpandableTile: boolean
  isExpandedOnWorkspacePage: boolean
  isLoading: boolean
  pageState: {
    isTileExpanded: boolean
  }
  workspaceTileId: Id
}

export interface ICoreValuesViewActions {
  onDeleteTile: () => Promise<void>
  onHandleToggleIsTileExpanded: () => void
}

export interface ICoreValuesData {
  listItems: NodesCollection<{
    TItemType: {
      id: Id
      text: Maybe<string>
      sortOrder: number
    }
    TIncludeTotalCount: false
  }>
}
