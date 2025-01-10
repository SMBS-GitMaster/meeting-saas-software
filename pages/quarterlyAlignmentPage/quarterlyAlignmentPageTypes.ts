import { Id } from '@mm/gql'

import { type TMeetingTab } from '@mm/bloom-web/pages/meetings'

export interface IQuarterlyAlignmentPageContainerProps {
  children: (props: IQuarterlyAlignmentPageViewProps) => JSX.Element
}

export interface IQuarterlyAlignmentPageViewProps {
  data: () => IQuarterlytAlignmentPageData
  actions: () => IQuarterlyAlignmentPageActions
}

export interface IQuarterlytAlignmentPageData {
  alignmentUser: Maybe<{
    id: Id
  }>
  pageState: IQuarterlyAlignmentPageState
  meetingId: Id
}

export interface IQuarterlyAlignmentPageActions {
  onSetActiveTab: (tab: TMeetingTab) => void
}

export interface IQuarterlyAlignmentPageState {
  activeTab: TMeetingTab
}
