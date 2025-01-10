import type { Id } from '@mm/gql'

import type { TWorkspaceTileType } from '@mm/core-bloom'
import type { IMeetingLookup } from '@mm/core-bloom'

export type TPersonalTile = Extract<
  TWorkspaceTileType,
  'PERSONAL_GOALS' | 'PERSONAL_TODOS' | 'PERSONAL_METRICS' | 'PERSONAL_NOTES'
>

export type TOtherTile = Extract<
  TWorkspaceTileType,
  'ROLES' | 'MANAGE' | 'VALUES' | 'PROCESSES' | 'USER_PROFILE'
>

export type TMeetingTile = Extract<
  TWorkspaceTileType,
  | 'MEETING_GOALS'
  | 'MEETING_TODOS'
  | 'MEETING_HEADLINES'
  | 'MEETING_ISSUES'
  | 'MEETING_METRICS'
  | 'MEETING_NOTES'
  | 'MEETING_STATS'
>

export interface ICreateEditWorkspaceDrawerMeetingLookup
  extends IMeetingLookup {
  isSelected: boolean
}

export interface ICreateEditWorkspaceDrawerSharedData {
  isLoading: boolean
  isCoreProcessEnabled: boolean
  meetingLookup: ICreateEditWorkspaceDrawerMeetingLookup[]
}

export interface ICreateEditWorkspaceDrawerSharedActions {
  onPersonalTileClicked: (opts: { tileType: TPersonalTile }) => void
  onOtherTileClicked: (opts: { tileType: TOtherTile }) => void
  onMeetingTileClicked: (opts: {
    tileType: TMeetingTile
    meetingId: Id
  }) => void
  onAddMeetingClicked: (opts: {
    meetingLookup: ICreateEditWorkspaceDrawerMeetingLookup
  }) => void
  onDeleteMeetingSectionClicked: (opts: { meetingId: Id }) => void
  onExpandMeetingSectionClicked: (opts: { meetingId: Id }) => void
}
