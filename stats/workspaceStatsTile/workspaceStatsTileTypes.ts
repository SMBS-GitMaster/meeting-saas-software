import { type Id } from '@mm/gql'

import type {
  TWorkspaceStatsTileSelectedDateRangeFilter,
  TWorkspaceStatsTileSelectedNodeFilter,
  TWorkspaceType,
} from '@mm/core-bloom'

export interface IWorkspaceStatsTileProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  workspaceType: TWorkspaceType
  className?: string
}

export interface IWorkspaceStatsTileContainerProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  workspaceType: TWorkspaceType
  className?: string
  children: (props: IWorkspaceStatsTileViewProps) => JSX.Element
}

export interface IWorkspaceStatsTileViewProps {
  data: () => IWorkspaceStatsTileData
  actions: () => IWorkspaceStatsTileActions
}

export interface IWorkspaceStatsTileData {
  workspaceTileId: Maybe<Id>
  workspaceType: TWorkspaceType
  meeting: {
    name: string
  }
  statsData: IWorkspaceStatsTileStatsData
  statsTileSettings: {
    getSelectedNodes: () => Array<TWorkspaceStatsTileSelectedNodeFilter>
    getSelectedDateRange: () => TWorkspaceStatsTileSelectedDateRangeFilter
  }
  className?: string
}

export interface IWorkspaceStatsTileActions {
  onAddStatsNodeFilter: (
    node: TWorkspaceStatsTileSelectedNodeFilter
  ) => Promise<void>
  onRemoveStatsNodeFilter: (
    node: TWorkspaceStatsTileSelectedNodeFilter
  ) => Promise<void>
  onSetDateRange: (
    dateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  ) => Promise<void>
  onDeleteTile: () => Promise<void>
}

export interface IWorkspaceStatsTileStatsData {
  goals?: number[]
  issues?: number[]
  milestones?: number[]
  todos?: number[]
  dateRangeLabels: string[]
}

export interface IWorkspaceStatsTileNodeFilterLookupItem {
  text: string
  isEnabled: boolean
}
