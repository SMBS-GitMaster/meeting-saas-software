import { type Id, NodesCollection } from '@mm/gql'

import {
  MeetingIssueVoting,
  PermissionCheckResult,
  type TBloomPageType,
  type TWorkspaceType,
  UserAvatarColorType,
} from '@mm/core-bloom'

import { IContextAwareItemFromIssueOpts } from '@mm/bloom-web/shared'

export interface IIssueListContainerProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
  children: (props: IIssueListViewCommonProps) => JSX.Element
}

export interface IIssueListViewCommonProps {
  getData: () => IIssueListViewData
  getActionHandlers: () => IIssueListViewActionHandlers
  className?: string
}

export interface IIssueListViewProps extends IIssueListViewCommonProps {
  responsiveSize: TIssueListResponsiveSize
}

export interface IIssueListItem {
  id: Id
  title: string
  completed: boolean
  completedTimestamp: Maybe<number>
  numStarVotes: Maybe<number>
  priorityVoteRank: Maybe<number>
  archived: boolean
  addToDepartmentPlan: boolean
  dateCreated: number
  sentFromIssueMeetingName: Maybe<string>
  assignee: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }
  notesId: Id
}

export interface IIssueSentToMeetingListItem {
  id: Id
  sentToIssueMeetingName: Maybe<string>
  sentToIssue: {
    id: Id
    title: string
    completed: boolean
    assignee: {
      id: Id
      firstName: string
      lastName: string
      fullName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
    }
  }
}

export type CompletedIssueListItemType = Pick<
  IIssueListItem,
  | 'completed'
  | 'title'
  | 'completedTimestamp'
  | 'assignee'
  | 'id'
  | 'dateCreated'
  | 'sentFromIssueMeetingName'
>

export interface IIssueListViewData {
  issueIdsToMerge: Array<Id>
  mergeIssueMode: boolean
  showNumberedList: boolean
  issueListColumnSize: EIssueListColumnSize
  isCompactView: boolean
  getShortTermIssues: () => NodesCollection<{
    TItemType: IIssueListItem
    TIncludeTotalCount: false
  }>
  selectedIssueTab: TIssueListTabType
  starsToAllocate: number
  recordOfIssueIdsToStars: Record<Id, number>
  numIssuesCurrentlyRanked: number
  hasCurrentUserVoted: boolean
  disableClearPriorityVotesButton: boolean
  currentMeetingId: Id
  isMeetingOngoing: boolean
  issueVotingType: MeetingIssueVoting
  issueVotingHasEnded: boolean
  getAttendeesWhoHaveNotVoted: () => IIssueListViewData['meetingAttendees']
  getCurrentPriorityRankedIssues: () => Record<Id, number>
  currentUser: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    settings: {
      timezone: string
    }
    permissions: {
      currentUserIsMeetingLeader: PermissionCheckResult
      canCreateIssuesInMeeting: PermissionCheckResult
      canEditIssuesInMeeting: PermissionCheckResult
      canCreateTodosInMeeting: PermissionCheckResult
      canStarVoteForIssuesInMeeting: PermissionCheckResult
    }
  }
  meeting: {
    id: Id
    name: string
  }
  meetingAttendees: Array<{
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    hasSubmittedVotes: boolean
  }>
  sortIssuesBy: Maybe<IssueListSortType>
  breadcrumbs: string[]
  isLoading: boolean
  pageType: TBloomPageType
  workspaceType: TWorkspaceType
  workspaceTileId: Maybe<Id>
  isExpandedOnWorkspacePage: boolean
}

export interface IIssueListViewActionHandlers {
  onCreateContextAwareTodoFromIssue: (
    opts: IContextAwareItemFromIssueOpts
  ) => void
  onSortIssues: (sortType: IssueListSortType) => void
  onQuickAddIssueEnter: (opts: {
    quickAddIssueValue: string
    quickAddAssigneeId: Id
  }) => void
  onViewArchivedIssues: () => void
  onPrintIssue: () => void
  onUploadIssue: () => void
  onExportIssue: () => void
  onEditIssueRequest: (issueId: Id) => void
  onMoveIssueToShortTerm: (issueId: Id) => Promise<void>
  onAddIssueToDepartmentPlan: (issueId: Id) => Promise<void>
  onSelectIssueTab: (tab: TIssueListTabType) => void
  onRestoreIssue: (issueId: Id) => void
  onCompleteIssue: (opts: { issueId: Id; value: boolean }) => Promise<void>
  onMergeIssues: (selectedIssueIds: Array<Id>) => void
  onArchiveSentToIssue: (issueId: Id) => void
  onArchiveIssue: (issueId: Id) => Promise<void>
  onSubmitStarVotes: () => Promise<void>
  onRestartStarVoting: () => Promise<void>
  onResetUserStarVotes: () => Promise<void>
  onResetPriorityVotes: () => Promise<void>
  onConcludeStarVoting: () => Promise<void>
  onHandleNumberedList: () => void
  onChangeVotingType: (votingType: MeetingIssueVoting) => void
  onSetIssuePriorityVotes: (opts: {
    issueId: Id
    currentPriorityVoteRank: Maybe<number>
  }) => Promise<void>
  setShowNumberedList: (showNumberedList: boolean) => void
  setSelectedIssueTab: (tab: TIssueListTabType) => void
  setMergeIssueMode: (value: boolean) => void
  setIssueIdsToMerge: (newIds: Id[]) => void
  setSortIssuesBy: (sortType: Maybe<IssueListSortType>) => void
  setIssueListColumnSize: (columnSize: EIssueListColumnSize) => void
  setStarsToAllocate: (stars: number) => void
  setRecordOfIssueIdsToStars: (
    recordOfIssueIdsToStars: Record<Id, number>
  ) => void
  handleAllocateStarsAction: (opts: {
    type: 'ADD' | 'SUBTRACT'
    issueId: Id
    numberToSelect: number
  }) => void
  handleSelectIssueToMerge: (issueId: Id) => void
  createIssueClicked: () => void
  onDeleteTile: () => Promise<void>
}

export type IssueListSortType =
  | 'ASSIGNEE_ASC'
  | 'ASSIGNEE_DESC'
  | 'NEWEST'
  | 'OLDEST'
  | 'VOTES'
  | 'PRIORITY'

export type TIssueListTabType =
  | 'SHORT_TERM'
  | 'LONG_TERM'
  | 'RECENTLY_SOLVED'
  | 'SENT_TO'

export type IssueBreadcrumbStateType =
  | 'DEFAULT'
  | 'VIEWING_ARCHIVE'
  | 'VIEWING_MOVED'

export enum EIssueListColumnSize {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
}

export type TIssueListResponsiveSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN'
