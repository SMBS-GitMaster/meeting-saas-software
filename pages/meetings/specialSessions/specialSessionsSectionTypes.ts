import { Id } from '@mm/gql'

import { type TMeetingType } from '@mm/core-bloom'

export type TSpeicalSessionsIframeExpandedOptions =
  | 'BUSINESS_PLAN'
  | 'MEETING_ARCHIVE'
  | 'ORG_CHART'

export interface ISpecialSessionsSectionViewProps {
  data: {
    getAgendaData: () => {
      agendaIsCollapsed: boolean
    }
    getPageToDisplayData: () => Maybe<{
      subheading: Maybe<string>
      pageName: string
    }>
    meetingId: Id
    meetingType: TMeetingType
  }
  className?: string
}
