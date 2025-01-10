import { GridStackWidget } from 'gridstack'

import { Id } from '@mm/gql'

import type {
  IEditWorkspaceTilePositionsTile,
  TWorkspaceTileType,
  TWorkspaceType,
} from '@mm/core-bloom'

type TMeetingWorkspacePageContainerProps = {
  workspaceType: 'MEETING'
  meetingId: Id
  children: (props: IWorkspacePageViewProps) => JSX.Element
}

type TPersonalWorkspacePageContainerProps = {
  workspaceType: 'PERSONAL'
  workspaceId: Id
  children: (props: IWorkspacePageViewProps) => JSX.Element
}

export type TWorkspacePageContainerProps =
  | TMeetingWorkspacePageContainerProps
  | TPersonalWorkspacePageContainerProps

export interface IWorkspacePageViewProps {
  data: () => IWorkspacePageViewData
  actions: () => IWorkspacePageViewActions
}

export interface IWorkspacePageViewData {
  workspaceId: Maybe<Id>
  workspaceTiles: TWorkspacePageTile[]
  workspaceHomeId: Maybe<Id>
}

export interface IWorkspacePageViewActions {
  onEditWorkspaceTilePositions: (opts: {
    updatedTiles: IEditWorkspaceTilePositionsTile[]
  }) => Promise<void>
  onSetPrimaryWorkspace: (opts: {
    workspaceType: TWorkspaceType
    meetingOrWorkspaceId: Id
  }) => Promise<void>
}

interface IWorkspaceTileBase {
  // Gridstack needs a unique id for each tile. Can use ids from BE for custom workspaces.
  id: Id
  workspaceType: TWorkspaceType
  tileType: TWorkspaceTileType
  gridstackWidgetOpts?: GridStackWidget
}

export interface IPersonalWorkspaceTile extends IWorkspaceTileBase {
  meetingId: null
}

export interface IMeetingWorkspaceTile extends IWorkspaceTileBase {
  tileTitle: string
  meetingId: Id
}

export type TWorkspacePageTile = IPersonalWorkspaceTile | IMeetingWorkspaceTile
