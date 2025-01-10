import { type Id } from '@mm/gql'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
  PermissionCheckResult,
  UserDrawerViewType,
} from '@mm/core-bloom'

export interface IMergeIssuesDrawerProps {
  issues: Array<Id>
  meetingId: Maybe<Id>
}

export interface IMergeIssuesDrawerContainerProps {
  issues: Array<Id>
  meetingId: Maybe<Id>
  children: (props: IMergeIssuesDrawerViewProps) => JSX.Element
}

export interface IMergeIssuesDrawerViewProps {
  data: IMergeIssuesDrawerData
  actions: IMergeIssuesDrawerActions
}

export interface IMergeIssuesDrawerData {
  isLoading: boolean
  meetingId: Maybe<Id>
  issues: IIssueToMerge[]
  newMergedIssueNoteId: Id
  parentIssuesData: Array<{
    title: string
    id: Id
    details: Maybe<string>
    meeting: {
      name: string
    }
    assignee: { fullName: string }
  }>
  currentUser: Maybe<{
    id: Id
    settings: {
      timezone: Maybe<string>
    }
  }>
  currentUserPermissions: { canCreateIssuesInMeeting: PermissionCheckResult }
  meetingAttendeesAndOrgUsersLookup: Array<IMeetingAttendeesAndOrgUsersLookup>
  meetingLookup: IMeetingLookup[]
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
}

export interface IMergeIssuesDrawerActions {
  createIssue: (values: ICreateMergedIssueValues) => Promise<void>
  createNotes: (opts: { notes: string }) => Promise<string>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface IIssueToMerge {
  id: Id
  title: string
  addToDepartmentPlan: boolean
  notesId: Id
  assignee: {
    id: Id
  }
  meeting: {
    id: Id
  }
}

export interface ICreateMergedIssueValues {
  title: string
  ownerId: Id
  meetingId: Id
  addToDepartmentPlan: boolean
  notesId: Id
  createAnotherCheckedInDrawer: boolean
}
