import { type Id } from '@mm/gql'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
  PermissionCheckResult,
  UserDrawerViewType,
} from '@mm/core-bloom'

export interface IEditHeadlineDrawerProps {
  headlineId: Id
  meetingId: Maybe<Id>
}

export interface IEditHealineValues {
  id: Id
  title: string
  assignee: {
    avatar: Maybe<string>
    firstName: string
    lastName: string
  }
  meetingId: Id
  notesId: Id
}

export interface IEditHeadlineFormValues {
  editHeadlineTitle: string
  editHeadlineAttachToOwner: Id
  editHeadlineAttachToMeeting: Id
  editHeadlineNotes: Id
}

export interface IEditHeadlineDrawerViewProps {
  data: IEditHeadlineDrawerContainerData
  actionHandlers: IEditHeadlineDrawerActionHandlers
}

export interface IEditHeadlineDrawerContainerData {
  currentUserPermissions: {
    canEditHeadlinesInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
  }
  isLoading: boolean
  meetingId: Maybe<Id>
  headline: {
    id: Id
    title: string
    assignee: {
      id: Id
      avatar: Maybe<string>
      firstName: string
      lastName: string
      fullName: string
    }
    meeting: { id: Id; name: string }
    notesId: Id
  }
  currentMeetingsLookup: Array<IMeetingLookup>
  meetingAttendeesAndOrgUsersLookup: Array<IMeetingAttendeesAndOrgUsersLookup>
  headlineNotesText: Maybe<string>
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
  headlineIdFromProps: Id
}

export interface IEditHeadlineDrawerActionHandlers {
  onSubmit: (values: Partial<IEditHeadlineFormValues>) => Promise<void>
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  onArchiveHeadline: () => Promise<void>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface IEditHeadlineDrawerContainerProps {
  headlineId: Id
  meetingId: Maybe<Id>
  children: (props: IEditHeadlineDrawerViewProps) => JSX.Element
}
