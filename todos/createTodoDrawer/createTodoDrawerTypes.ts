import { type Id } from '@mm/gql'

import { PermissionCheckResult, UserDrawerViewType } from '@mm/core-bloom'

import { IMeetingAttendeeLookup, IMeetingLookup } from '@mm/core-bloom/meetings'

import { TCreateContextAwareItemOpts } from '@mm/bloom-web/shared'

export interface ICreateTodoDrawerProps {
  meetingId: Maybe<Id>
  isUniversalAdd?: boolean
  context?: TCreateContextAwareItemOpts
}

export interface ICreateTodoDrawerContainerProps {
  meetingId: Maybe<Id>
  isUniversalAdd?: boolean
  context?: TCreateContextAwareItemOpts
  children: (props: ICreateTodoDrawerViewProps) => JSX.Element
}

export interface ICreateTodoDrawerViewProps {
  data: ICreateTodoDrawerData
  actions: ICreateTodoDrawerActions
}

export interface ICreateTodoDrawerData {
  currentUser: Maybe<{
    id: Id
    timezone: string
  }>
  currentUserPermissions: {
    canCreateTodos: PermissionCheckResult
  }
  meetingAttendeesOrOrgUsersLookup: Array<IMeetingAttendeeLookup>
  meetingLookup: IMeetingLookup[]
  isLoading: boolean
  meetingId: Maybe<Id>
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
  context?: TCreateContextAwareItemOpts
  contextAwareNoteId: Maybe<string>
}

export interface ICreateTodoDrawerActions {
  createTodo: (values: ICreateTodoValues) => Promise<void>
  createNotes: (opts: { notes: string }) => Promise<string>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
  setSelectedMeetingId: (meetingId: Maybe<Id>) => void
}

export interface ICreateTodoValues {
  title: string
  dueDate: number
  ownerIds: Id[]
  meetingId: Id
  notesId: Id
  createAnotherCheckedInDrawer: boolean
}
