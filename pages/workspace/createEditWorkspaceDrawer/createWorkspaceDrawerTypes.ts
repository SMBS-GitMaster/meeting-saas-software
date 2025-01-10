import type { Id } from '@mm/gql'

import { UserDrawerViewType } from '@mm/core-bloom'

import type {
  ICreateEditWorkspaceDrawerSharedActions,
  ICreateEditWorkspaceDrawerSharedData,
  TMeetingTile,
  TOtherTile,
  TPersonalTile,
} from './createEditWorkspaceDrawerSharedTypes'

export interface ICreateWorkspaceDrawerContainerProps {
  children: (props: ICreateWorkspaceDrawerViewProps) => JSX.Element
}

export interface ICreateWorkspaceDrawerViewProps {
  data: () => ICreateWorkspaceDrawerData
  actions: () => ICreateWorkspaceDrawerActions
}

export interface ICreateWorkspaceDrawerData
  extends ICreateEditWorkspaceDrawerSharedData {
  componentState: ICreateWorkspaceDrawerState
}

export interface ICreateWorkspaceDrawerActions
  extends ICreateEditWorkspaceDrawerSharedActions {
  onCreateWorkspace: (values: ICreateWorkspaceValues) => Promise<void>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface ICreateWorkspaceValues {
  title: string
  createAnotherCheckedInDrawer: boolean
}

export interface ICreateWorkspaceDrawerState {
  PERSONAL: Record<TPersonalTile, boolean>
  OTHER: Record<TOtherTile, boolean>
  MEETINGS: ICreateWorkspaceDrawerMeetingSubState[]
}

export interface ICreateWorkspaceDrawerMeetingSubState {
  meetingId: Id
  meetingName: string
  isExpanded: boolean
  numTilesSelected: number
  tiles: Record<TMeetingTile, boolean>
}
