import { type Id } from '@mm/gql'

import { i18n } from '@mm/core/i18n'

import {
  PermissionCheckResult,
  TBloomPageType,
  type TWorkspaceType,
  UserAvatarColorType,
} from '@mm/core-bloom'

import { IContextAwareItemFromHeadlineOpts } from '@mm/bloom-web/shared'

export interface IHeadlinesListViewData {
  getBreadcrumbs: () => Array<string>
  getCurrentUserPermissions: () => {
    canCreateHeadlinesInMeeting: PermissionCheckResult
    canEditHeadlinesInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
  }
  headlines: Array<IHeadlinesListHeadlineData>
  isExpandedOnWorkspacePage: boolean
  meetingId: Id
  meetingName: string
  pageState: {
    sortBy: HeadlinesListSortingType
  }
  pageType: TBloomPageType
  workspaceType: TWorkspaceType
  workspaceTileId: Maybe<Id>
}

export interface IHeadlinesListActionHandlers {
  onQuickAddValueEnter: (title: string) => void
  onOpenV1ArchiveViewInNewTab(): void
  onExport(): void
  onUpload(): void
  onPrint(): void
  onCreateContextAwareIssueFromHeadline(
    opts: IContextAwareItemFromHeadlineOpts
  ): void
  onCreateContextAwareTodoFromHeadline(
    opts: IContextAwareItemFromHeadlineOpts
  ): void
  onCopy(copyValues: { meetingId: Id; headlineToCopyId: Id }): void
  onSelectSorting(value: HeadlinesListSortingType): void
  onEditHeadlineRequest: (headlineId: Id) => void
  onDeleteTile: () => Promise<void>
}

export interface IHeadlinesListViewProps {
  getData: () => IHeadlinesListViewData
  getActions: () => IHeadlinesListActionHandlers
  className?: string
}

export interface IHeadlinesListContainerProps {
  children: (props: IHeadlinesListViewProps) => JSX.Element
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
}

export type HeadlinesListSortingType =
  | 'ASSIGNEE_ASC'
  | 'ASSIGNEE_DESC'
  | 'NEWEST'
  | 'OLDEST'

export const headlinesListSortingOptions: Array<{
  text: string
  value: HeadlinesListSortingType
}> = [
  { text: i18n.t('Owner: A-Z'), value: 'ASSIGNEE_ASC' },
  { text: i18n.t('Owner: Z-A'), value: 'ASSIGNEE_DESC' },
  { text: i18n.t('Newest'), value: 'NEWEST' },
  { text: i18n.t('Oldest'), value: 'OLDEST' },
]
export interface IHeadlinesListHeadlineData {
  id: Id
  title: string
  notesId: Id
  assignee: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }
}

export interface IHeadlinesListHeadlineEntryProps {
  headline: IHeadlinesListHeadlineData
  getActions: () => Pick<
    IHeadlinesListActionHandlers,
    | 'onCreateContextAwareIssueFromHeadline'
    | 'onCreateContextAwareTodoFromHeadline'
    | 'onCopy'
    | 'onEditHeadlineRequest'
  >
  getData: () => Pick<
    IHeadlinesListViewData,
    'meetingId' | 'getCurrentUserPermissions'
  >
  canCreateTodosInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
  canEditHeadlinesInMeeting: PermissionCheckResult
  responsiveSize: THeadlinesListResponsiveSize
}

export type THeadlinesListResponsiveSize =
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'UNKNOWN'
