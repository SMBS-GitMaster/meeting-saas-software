import { type Id } from '@mm/gql'

import { PermissionCheckResult } from '@mm/core-bloom'

export interface IExternalPageSectionContainerProps {
  meetingPageId: Id
  className?: string
}

export interface IExternalPageSectionViewData {
  page: {
    id: Id
    pageName: string
    externalPageUrl: Maybe<string>
  }
  isLoading: boolean
  currentUserPermissions: {
    canEditExternalLinkInMeeting: PermissionCheckResult
  }
}

export interface IExternalPageSectionActions {
  onUpdateExternalLink: (opts: { id: Id; url: Maybe<string> }) => Promise<void>
  onCheckIfUrlIsEmbeddable: (url: string) => Promise<boolean>
}

export interface IExternalPageLinkViewProps {
  data: IExternalPageSectionViewData
  actions: IExternalPageSectionActions
}
