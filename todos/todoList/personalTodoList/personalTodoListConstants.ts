import { i18n } from '@mm/core/i18n'

import { TTodoListSortType } from '../todoListTypes'

export const PERSONAL_TODO_LIST_GROUP_SORTING_OPTS: Array<{
  text: string
  value: TTodoListSortType
}> = [
  { text: i18n.t('Meeting: A-Z'), value: 'MEETING_ASC' },
  { text: i18n.t('Meeting: Z-A'), value: 'MEETING_DESC' },
]

export const PERSONAL_TODO_LIST_CONTENT_SORTING_OPTS: Array<{
  text: string
  value: TTodoListSortType
}> = [
  { text: i18n.t('Title'), value: 'TITLE' },
  { text: i18n.t('Overdue'), value: 'OVERDUE' },
  { text: i18n.t('Completed'), value: 'COMPLETED' },
  { text: i18n.t('Newest'), value: 'NEWEST' },
  { text: i18n.t('Oldest'), value: 'OLDEST' },
]
