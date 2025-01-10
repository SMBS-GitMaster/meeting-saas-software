import { type Id } from '@mm/gql'

import {
  IContextAwareItemNodeTypeAndFromOpts,
  PermissionCheckResult,
  UserDrawerViewType,
} from '@mm/core-bloom'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
} from '@mm/core-bloom/meetings'

import { ITooltipProps } from '@mm/core-web/ui'

export interface IEditIssueDrawerProps {
  issueId: Id
  meetingId: Maybe<Id>
  viewOnlyDrawerMode?: {
    tooltip: ITooltipProps
  }
}

export interface IEditIssueDrawerContainerProps {
  issueId: Id
  meetingId: Maybe<Id>
  viewOnlyDrawerMode?: {
    tooltip: ITooltipProps
  }
  solveOrArchiveIssueClicked?: (opts: {
    issueId: Id
    priorityVoteRank: number
  }) => Promise<void>
  children: (props: IEditIssueDrawerViewProps) => JSX.Element
}

export interface IEditIssueDrawerViewProps {
  getData: () => IEditIssueDrawerData
  getActions: () => IEditIssueDrawerActions
}

export interface IEditIssueDrawerData {
  viewOnlyDrawerMode?: {
    tooltip: ITooltipProps
  }
  getCurrentUserPermissions: () => {
    canEditIssuesInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
  }
  meetingId: Maybe<Id>
  getIssue: () => {
    addToDepartmentPlan: boolean
    completed: boolean
    context: Maybe<IContextAwareItemNodeTypeAndFromOpts>
    dateCreated: number
    id: Id
    meetingId: Id
    fromMergedIssues: boolean
    ownerFullName: string
    ownerId: Id
    notesId: Id
    title: string
  }
  currentUser: Maybe<{
    id: Id
    settings: {
      timezone: Maybe<string>
    }
  }>
  getMeetingAttendeesAndOrgUsersLookup: () => Array<IMeetingAttendeesAndOrgUsersLookup>
  meetingLookup: IMeetingLookup[]
  isLoading: boolean
  issueNotesText: Maybe<string>
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
  issueIdFromProps: Id
}

export interface IEditIssueDrawerActions {
  editIssue: (values: Partial<IEditIssueValues>) => Promise<void>
  archiveIssue: () => Promise<void>
  createNotes: (opts: { notes: string }) => Promise<string>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
  onMoveIssueToShortTerm: (issueId: Id) => Promise<void>
}

export interface IEditIssueValues {
  title: string
  ownerId: Id
  meetingId: Id
  addToDepartmentPlan: boolean
  notesId: Id
  completed: boolean
}
