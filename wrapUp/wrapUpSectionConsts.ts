import { i18n } from '@mm/core/i18n'

import { TMeetingFeedbackStyle } from '@mm/core-bloom'

import { TWrapUpResponsiveSize } from './wrapUpTypes'

export const WRAP_UP_FEEDBACK_STYLES_OPTS: Array<{
  text: string
  selectedText: string
  value: TMeetingFeedbackStyle
}> = [
  {
    text: i18n.t('In Person/Hybrid'),
    selectedText: i18n.t('All attendees'),
    value: 'ALL_PARTICIPANTS',
  },
  {
    text: i18n.t('Remote'),
    selectedText: i18n.t('Individual'),
    value: 'INDIVIDUAL',
  },
]

export const RECORD_OF_GRID_SIZE_TO_WRAP_UP_RESPONSIVE_SIZE: Record<
  TWrapUpResponsiveSize,
  number
> = {
  UNKNOWN: 0,
  XSMALL: 1,
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
}
