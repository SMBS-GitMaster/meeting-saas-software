import { i18n } from '@mm/core/i18n'

import { TTodoListSortType } from '../todoListTypes'

export const MEETING_TODO_LIST_SORTING_OPTS: Array<{
  text: string
  value: TTodoListSortType
}> = [
  { text: i18n.t('Owner: A-Z'), value: 'ASSIGNEE_ASC' },
  { text: i18n.t('Owner: Z-A'), value: 'ASSIGNEE_DESC' },
  { text: i18n.t('Overdue'), value: 'OVERDUE' },
  { text: i18n.t('Completed'), value: 'COMPLETED' },
  { text: i18n.t('Newest'), value: 'NEWEST' },
  { text: i18n.t('Oldest'), value: 'OLDEST' },
]
