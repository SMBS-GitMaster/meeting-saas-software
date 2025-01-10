import { type Id } from '@mm/gql'

export interface ITitlePageSectionActions {
  onSubmit: (subheading: Maybe<string>) => Promise<void>
}

export interface ITitlePageSectionContainerProps {
  data: {
    meetingId: Id
    isLoading: boolean
    subheading: Maybe<string>
    pageName: string
    id: Id
    isMeetingOngoing: boolean
  }
  className?: string
}

export interface ITitlePageSectionViewProps {
  data: {
    isLoading: boolean
    isMeetingOngoing: boolean
    subheading: Maybe<string>
    pageName: string
  }
  actionHandlers: ITitlePageSectionActions
  className?: string
}
