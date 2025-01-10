import { type Id } from '@mm/gql'

import { PermissionCheckResult, UserDrawerViewType } from '@mm/core-bloom'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
} from '@mm/core-bloom/meetings'

import { TCreateContextAwareItemOpts } from '@mm/bloom-web/shared/contextAware/contextAwareTypes'

export interface ICreateIssueDrawerProps {
  meetingId: Maybe<Id>
  isUniversalAdd?: boolean
  context?: TCreateContextAwareItemOpts
  initialItemValues?: Partial<ICreateIssueValues>
}

export interface ICreateIssueDrawerContainerProps {
  meetingId: Maybe<Id>
  isUniversalAdd?: boolean
  context?: TCreateContextAwareItemOpts
  initialItemValues?: Partial<ICreateIssueValues>
  children: (props: ICreateIssueDrawerViewProps) => JSX.Element
}

export interface ICreateIssueDrawerViewProps {
  data: ICreateIssueDrawerData
  actions: ICreateIssueDrawerActions
}

export interface ICreateIssueDrawerData {
  currentUser: Maybe<{
    id: Id
  }>
  currentUserPermissions: { canCreateIssues: PermissionCheckResult }
  meetingId: Maybe<Id>
  meetingAttendeesAndOrgUsersLookup: Array<IMeetingAttendeesAndOrgUsersLookup>
  meetingLookup: IMeetingLookup[]
  isLoading: boolean
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
  context?: TCreateContextAwareItemOpts
  contextAwareNoteId: Maybe<string>
  initialItemValues?: Partial<ICreateIssueValues>
}

export interface ICreateIssueDrawerActions {
  createIssue: (values: ICreateIssueValues) => Promise<void>
  createNotes: (opts: { notes: string }) => Promise<string>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface ICreateIssueValues {
  title: string
  ownerId: Id
  meetingId: Id
  addToDepartmentPlan: boolean
  notesId: Id
  createAnotherCheckedInDrawer: boolean
}
