import { type GridStackWidget } from 'gridstack'

import { type Id } from '@mm/gql'

import { type TWorkspaceTileType } from '@mm/core-bloom'

import { IQuarterlytAlignmentPageData } from '../quarterlyAlignmentPageTypes'

export interface IQuarterlyAlignmentWorkspaceContainerProps {
  data: () => IQuarterlytAlignmentPageData
  children: (props: IQuarterlyAlignmentWorkspaceViewProps) => JSX.Element
}

export interface IQuarterlyAlignmentWorkspaceViewProps {
  data: () => IQuarterlyAlignmentWorkspaceData
  actions: () => IQuarterlyAlignmentWorkspaceActions
}

export interface IQuarterlyAlignmentWorkspaceData {
  alignmentUser: Maybe<{
    id: Id
  }>
  meetingId: Id
  tiles: () => Array<IQuarterlyAlignmentWorkspaceTile>
  pageState: {
    currentTab: TQuarterlyAlignmentWorkspaceTabType
  }
}

export interface IQuarterlyAlignmentWorkspaceActions {
  onHandleSetCurrentTab: (newTab: TQuarterlyAlignmentWorkspaceTabType) => void
}

export interface IQuarterlyAlignmentWorkspaceGridOpts {
  data: () => IQuarterlyAlignmentWorkspaceData
}

export interface IQuarterlyAlignmentWorkspaceTile {
  // Gridstack needs a unique id for each tile.
  id: Id
  tileType: TWorkspaceTileType
  gridstackWidgetOpts: GridStackWidget
}

export type TQuarterlyAlignmentWorkspaceTabType =
  | 'PRIORITIES'
  | 'R&R'
  | 'CULTURE'
