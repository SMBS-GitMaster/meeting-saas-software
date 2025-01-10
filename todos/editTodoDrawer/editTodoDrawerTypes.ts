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

export interface IEditTodoDrawerProps {
  todoId: Id
  meetingId: Maybe<Id>
  hideContextAwareButtons?: boolean
}

export interface IEditTodoDrawerContainerProps {
  todoId: Id
  meetingId: Maybe<Id>
  hideContextAwareButtons?: boolean
  children: (props: IEditTodoDrawerViewProps) => JSX.Element
}

export interface IEditTodoDrawerViewProps {
  data: () => IEditTodoDrawerData
  actions: () => IEditTodoDrawerActions
}

export interface IEditTodoDrawerData {
  isLoading: boolean
  meetingId: Maybe<Id>
  currentUserPermissions: () => {
    canEditTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
  }
  meetingAttendeesAndOrgUsersLookup: () => Array<IMeetingAttendeesAndOrgUsersLookup>
  meetingLookup: IMeetingLookup[]
  todo: {
    title: string
    dateCreated: number
    dueDate: number
    completed: boolean
    assigneeId: Id
    assigneeFullName: string
    meetingId: Id
    notesId: Id
    context: Maybe<IContextAwareItemNodeTypeAndFromOpts>
  }
  currentUser: Maybe<{
    id: Id
    timezone: string
  }>
  todoNotesText: Maybe<string>
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
  hideContextAwareButtons?: boolean
}

export interface IEditTodoDrawerActions {
  editTodo: (values: Partial<IEditTodoValues>) => Promise<void>
  createNotes: (opts: { notes: string }) => Promise<string>
  archiveTodo: () => Promise<void>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface IEditTodoValues {
  title: string
  dueDate: number
  completed: boolean
  ownerId: Id
  meetingId: Id
  notesId: Id
}
