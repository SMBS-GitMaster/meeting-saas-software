import { type Id } from '@mm/gql'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
  PermissionCheckResult,
  UserDrawerViewType,
} from '@mm/core-bloom'

export interface ICreateHeadlineDrawerProps {
  meetingId: Maybe<Id>
  isUniversalAdd?: boolean
}

export interface ICreateHeadlineDrawerContainerProps {
  meetingId: Maybe<Id>
  isUniversalAdd?: boolean
  children: (props: ICreateHeadlineDrawerViewProps) => JSX.Element
}

export interface ICreateHeadlineDrawerViewProps {
  data: ICreateHeadlineDrawerContainerData
  actionHandlers: ICreateHeadlineDrawerActionHandlers
}

export interface ICreateHeadlineDrawerContainerData {
  isLoading: boolean
  currentUserId: Maybe<Id>
  meetingId: Maybe<Id>
  currentUserPermissions: { canCreateHeadlines: PermissionCheckResult }
  currentMeetingsLookup: Array<IMeetingLookup>
  meetingAttendeesAndOrgUsersLookup: Array<IMeetingAttendeesAndOrgUsersLookup>
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
}

export interface ICreateHeadlineDrawerActionHandlers {
  onSubmit: (values: ICreateHeadlineFormValues) => Promise<void>
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface ICreateHeadlineFormValues {
  createHeadlineTitle: string
  createHeadlineAttachToOwner: Id
  createHeadlineAttachToMeetings: Array<Id>
  createHeadlineNotes: Id
  createAnotherCheckedInDrawer: boolean
}
