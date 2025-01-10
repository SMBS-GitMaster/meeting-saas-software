import { type Id } from '@mm/gql'

import { IMeetingPageViewData } from '../pages/meetings'

export interface INotesBoxSectionProps {
  data: {
    meetingPageName: string
    meetingId: Id
    currentUser: IMeetingPageViewData['currentUser']
    padId: Maybe<Id>
  }
  actionHandlers: {
    onCheckIfUrlIsEmbeddable: (url: string) => Promise<boolean>
  }
  className?: string
}
