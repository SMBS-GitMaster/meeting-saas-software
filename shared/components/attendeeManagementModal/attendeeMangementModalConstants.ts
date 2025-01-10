import { i18n } from '@mm/core/i18n'

import { TAttendeeTabs } from './attendeeManagmentTypes'

export const ATTENDEE_MANAGEMENT_MODAL_TABS: Array<{
  text: string
  value: TAttendeeTabs
}> = [
  {
    text: i18n.t('Add attendee'),
    value: 'ADD_ATTENDEE',
  },
  {
    text: i18n.t('View attendees'),
    value: 'VIEW_ATTENDEE',
  },
]
