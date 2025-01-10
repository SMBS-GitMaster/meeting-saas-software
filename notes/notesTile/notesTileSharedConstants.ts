import { ValidSortForNode } from '@mm/gql'

import { i18n } from '@mm/core/i18n'

import { BloomMeetingNoteNode } from '@mm/core-bloom'

import { TNotesTileSortType } from './notesTileSharedTypes'

export const NOTES_TILE_QUERY_SORT_VALUE_BY_SORTING_TYPE: Record<
  TNotesTileSortType,
  ValidSortForNode<BloomMeetingNoteNode>
> = {
  NEWEST: { dateCreated: 'desc' },
  OLDEST: { dateCreated: 'asc' },
}

export const NOTES_TILE_SORT_OPTS: Array<{
  text: string
  value: TNotesTileSortType
}> = [
  { text: i18n.t('Newest'), value: 'NEWEST' },
  { text: i18n.t('Oldest'), value: 'OLDEST' },
]

export const NOTES_TILE_SAVE_STATE_TO_TEXT_MAP = {
  unsaved: i18n.t('Unsaved changes'),
  saving: i18n.t('Saving...'),
  saved: i18n.t('Changes saved'),
}
