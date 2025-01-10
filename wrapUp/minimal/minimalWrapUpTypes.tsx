import { Id } from '@mm/gql'

import { IWrapUpActionHandlers, IWrapUpViewData } from '../wrapUpTypes'

export interface IMinimalWrapUpViewProps {
  getData: () => Pick<
    IWrapUpViewData,
    | 'isLoading'
    | 'currentUser'
    | 'getCurrentUserPermissions'
    | 'sendEmailSummaryTo'
    | 'includeMeetingNotesInEmailSummary'
    | 'getMeetingNotes'
  >
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onUpdateWrapUpMeetingValues' | 'onConclude'
  >
  className?: string
}

export interface IMinimalWrapUpContainerProps {
  onConclude: () => void
  children: (props: IMinimalWrapUpViewProps) => JSX.Element
  className?: string
  meetingId: Id
}
