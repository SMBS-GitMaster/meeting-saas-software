import type { Id } from '@mm/gql'

import type {
  INotesTileSharedActions,
  INotesTileSharedData,
} from '../notesTileSharedTypes'

export interface IWorkspacePersonalNotesTileContainerProps {
  workspaceTileId: Id
  workspaceId: Maybe<Id>
  className?: string
  children: (props: IWorkspacePersonalNotesTileViewProps) => JSX.Element
}

export interface IWorkspacePersonalNotesTileViewProps {
  data: () => IWorkspacePersonalNotesTileData
  actions: () => IWorkspacePersonalNotesTileActions
}

export interface IWorkspacePersonalNotesTileData extends INotesTileSharedData {
  workspaceTileId: Id
}

export interface IWorkspacePersonalNotesTileActions
  extends INotesTileSharedActions {
  onUpdateNote: (opts: { workspaceNoteId: Id; title: string }) => Promise<void>
  onArchiveNote: (opts: { workspaceNoteId: Id }) => Promise<void>
}
