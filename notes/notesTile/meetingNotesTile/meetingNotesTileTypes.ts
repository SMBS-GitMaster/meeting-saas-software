import { type Id } from '@mm/gql'

import type { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import {
  INotesTileSharedActions,
  INotesTileSharedData,
} from '../notesTileSharedTypes'

export interface IMeetingNotesTileContainerProps {
  workspaceTileId: Maybe<Id>
  meetingId: Id
  className?: string
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  children: (props: IMeetingNotesTileViewProps) => JSX.Element
}

export interface IMeetingNotesTileViewProps {
  data: () => IMeetingNotesTileData
  actions: () => IMeetingNotesTileActions
}

export interface IMeetingNotesTileData extends INotesTileSharedData {
  workspaceTileId: Maybe<Id>
  pageType: TBloomPageType
  workspaceType: TWorkspaceType
  meetingName: string
}

export interface IMeetingNotesTileActions extends INotesTileSharedActions {
  onUpdateNote: (opts: {
    meetingNoteId: Id
    notesId: Id
    title: string
  }) => Promise<void>
  onArchiveNote: (opts: { meetingNoteId: Id }) => Promise<void>
  onExport: () => void
  onUpload: () => void
  onPrint: () => void
}
