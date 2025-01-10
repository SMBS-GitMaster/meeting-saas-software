import { Id } from '@mm/gql'

import { PermissionCheckResult } from '@mm/core-bloom'

export interface INotesTileSharedData {
  isLoading: boolean
  notes: Array<INotesTileNoteDatum>
  selectedNote: Maybe<INotesTileNoteDatum>
  notesTextByNoteId: Record<string, string>
  isViewingArchived: boolean
  sortBy: TNotesTileSortType
  permissions: {
    canCreateNotes: PermissionCheckResult
    canEditNotes: PermissionCheckResult
  }
  isExpandedOnWorkspacePage: boolean
  className?: string
}

export interface INotesTileSharedActions {
  onSelectNote: (id: Id) => void
  onViewAllNotes: () => void
  onCreateNoteEntry: () => Promise<void>
  onCreateNote: (opts: { notes: string }) => Promise<string>
  onRestoreNote: (id: Id) => Promise<void>
  onViewArchivedNotes: (view: boolean) => void
  onSortClicked: (value: TNotesTileSortType) => void
  onDeleteTile: () => Promise<void>
}

export interface INotesTileNoteDatum {
  id: Id
  notesId: Id
  title: string
  dateCreated: number
}

export interface IUpdateNoteTileNoteValues {
  id: Id
  notesId: Id
  title: string
}

export type TNotesTileResponsiveSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN'

export type TNotesTileSortType = 'NEWEST' | 'OLDEST'
