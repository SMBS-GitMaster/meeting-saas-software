import { i18n } from '@mm/core/i18n'

import { type TPersonalGoalsListSortBy } from './personalGoalsListTypes'

export const PERSONAL_GOALS_LIST_GROUP_SORTING_OPTS: Array<{
  text: string
  value: TPersonalGoalsListSortBy
}> = [
  { text: i18n.t('Meeting: A-Z'), value: 'MEETING_ASC' },
  { text: i18n.t('Meeting: Z-A'), value: 'MEETING_DESC' },
]

export const PERSONAL_GOALS_LIST_CONTENT_SORTING_OPTS: Array<{
  text: string
  value: TPersonalGoalsListSortBy
}> = [
  { text: i18n.t('Newest'), value: 'NEWEST' },
  { text: i18n.t('Oldest'), value: 'OLDEST' },
  { text: i18n.t('Status'), value: 'STATUS' },
  { text: i18n.t('Title: A-Z'), value: 'TITLE_ASC' },
  { text: i18n.t('Title: Z-A'), value: 'TITLE_DESC' },
]
