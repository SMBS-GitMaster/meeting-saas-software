import { type Id } from '@mm/gql'

export interface IWhiteboardSectionProps {
  data: {
    meetingId: Id
    meetingPageName: string
  }
  actionHandlers: {
    onCheckIfUrlIsEmbeddable: (url: string) => Promise<boolean>
  }
  className?: string
}
