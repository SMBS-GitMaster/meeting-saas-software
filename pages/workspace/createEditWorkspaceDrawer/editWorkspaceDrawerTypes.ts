import type { Id } from '@mm/gql'

import type {
  ICreateEditWorkspaceDrawerSharedActions,
  ICreateEditWorkspaceDrawerSharedData,
  TMeetingTile,
  TOtherTile,
  TPersonalTile,
} from './createEditWorkspaceDrawerSharedTypes'

export interface IEditWorkspaceDrawerContainerProps {
  workspaceId: Id
  children: (props: IEditWorkspaceDrawerViewProps) => JSX.Element
}

export interface IEditWorkspaceDrawerViewProps {
  data: () => IEditWorkspaceDrawerData
  actions: () => IEditWorkspaceDrawerActions
}

export interface IEditWorkspaceDrawerData
  extends ICreateEditWorkspaceDrawerSharedData {
  componentState: IEditWorkspaceDrawerState
}

export interface IEditWorkspaceDrawerActions
  extends ICreateEditWorkspaceDrawerSharedActions {
  onUpdateWorkspace: () => Promise<void>
}

export interface IEditWorkspaceDrawerState {
  PERSONAL: Record<TPersonalTile, { tileId: Maybe<Id>; isSelected: boolean }>
  OTHER: Record<TOtherTile, { tileId: Maybe<Id>; isSelected: boolean }>
  MEETINGS: IEditWorkspaceDrawerMeetingSubState[]
}

export interface IEditWorkspaceDrawerMeetingSubState {
  meetingId: Id
  meetingName: string
  isExpanded: boolean
  numTilesSelected: number
  tiles: Record<TMeetingTile, { tileId: Maybe<Id>; isSelected: boolean }>
}
