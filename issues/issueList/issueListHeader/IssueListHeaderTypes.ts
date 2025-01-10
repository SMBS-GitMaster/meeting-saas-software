import { Id } from '@mm/gql'

import {
  MeetingIssueVoting,
  PermissionCheckResult,
  type TBloomPageType,
  type TWorkspaceType,
} from '@mm/core-bloom'

import {
  EIssueListColumnSize,
  IssueListSortType,
  TIssueListResponsiveSize,
  TIssueListTabType,
} from '../issueListTypes'

export interface IIssueListHeaderData {
  pageType: TBloomPageType
  workspaceType: TWorkspaceType
  workspaceTileId: Maybe<Id>
  isExpandedOnWorkspacePage: boolean
  showNumberedList: boolean
  selectedIssueTab: TIssueListTabType
  issueIdsToMerge: Array<Id>
  issueVotingType: MeetingIssueVoting
  mergeIssueMode: boolean
  currentUser: {
    permissions: {
      currentUserIsMeetingLeader: PermissionCheckResult
      canCreateIssuesInMeeting: PermissionCheckResult
      canEditIssuesInMeeting: PermissionCheckResult
      canCreateTodosInMeeting: PermissionCheckResult
    }
  }
  meeting: {
    id: Id
    name: string
  }
  sortIssuesBy: Maybe<IssueListSortType>
  breadcrumbs: string[]
}

export interface IIssueListHeaderActionHandlers {
  setSortIssuesBy: (sortType: IssueListSortType) => void
  onViewArchivedIssues: () => void
  onPrintIssue: () => void
  onUploadIssue: () => void
  onExportIssue: () => void
  setSelectedIssueTab: (tab: TIssueListTabType) => void
  onMergeIssues: (selectedIssueIds: Array<Id>) => void
  setShowNumberedList: (showNumberedList: boolean) => void
  setIssueListColumnSize: (columnSize: EIssueListColumnSize) => void
  setMergeIssueMode: (value: boolean) => void
  setIssueIdsToMerge: (issueIds: Id[]) => void
  createIssueClicked: () => void
  onDeleteTile: () => Promise<void>
}

export interface IIssueListHeaderProps {
  data: IIssueListHeaderData
  actionHandlers: IIssueListHeaderActionHandlers
  responsiveSize: TIssueListResponsiveSize
  className?: string
}
