import { type Id } from '@mm/gql'

import {
  PermissionCheckResult,
  TMeetingFeedbackStyle,
  UserAvatarColorType,
} from '@mm/core-bloom'

import { MeetingInstanceSummarySendTo } from '@mm/core-bloom/meetings/meetingInstanceTypes'

import { QuickAddUserOptionMetadata } from '@mm/core-web/ui'

import {
  IContextAwareItemFromIssueOpts,
  IContextAwareItemFromTodoOpts,
} from '../shared'

export type TWrapUpResponsiveSize =
  | 'XSMALL'
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'UNKNOWN'

export interface IWrapUpViewData {
  getMeetingPageName: () => string
  currentUser: {
    avatar: Maybe<string>
    firstName: string
    lastName: string
    fullName: string
    userAvatarColor: UserAvatarColorType
    id: Id
  }
  getCurrentUserPermissions: () => {
    canEditIssuesInMeeting: PermissionCheckResult
    canEditTodosInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canEditMeetingConcludeActionsInMeeting: PermissionCheckResult
  }
  getQuickAddMeetingAttendeesLookup: () => {
    value: Id
    metadata: QuickAddUserOptionMetadata
  }[]
  getTodosData: () => Array<IWrapUpToDoData>
  getIssuesData: () => Array<IWrapUpIssueData>
  meetingInstanceAttendees: Array<IWrapUpAttendee>
  isCurrentUserMeetingLeader: boolean
  sendEmailSummaryTo: MeetingInstanceSummarySendTo
  includeMeetingNotesInEmailSummary: boolean
  getMeetingNotes: () => Array<{
    id: Id
    title: string
    selected: boolean
  }>
  archiveCompletedTodos: boolean
  archiveHeadlines: boolean
  isLoading: boolean
  displayMeetingRatings: boolean
  feedbackStyle: TMeetingFeedbackStyle
}

export interface IWrapUpConcludeFormValue {
  sendEmailSummaryTo: MeetingInstanceSummarySendTo
  includeMeetingNotesInEmailSummary: boolean
  meetingNotes: Array<{
    id: Id
    title: string
    selected: boolean
  }>
  archiveCompletedTodos: boolean
  archiveHeadlines: boolean
}

export interface IWrapUpToDoData {
  id: Id
  title: string
  assignee: {
    avatar: Maybe<string>
    fullName: string
    firstName: string
    lastName: string
    userAvatarColor: UserAvatarColorType
    id: Id
  }
  completed: boolean
  dueDate: number
  notesId: Id
}
export interface IWrapUpAttendee {
  id: Id
  rating: Maybe<number>
  notesText: Maybe<string>
  attendee: {
    id: Id
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    firstName: string
    lastName: string
    fullName: string
  }
}

export interface IWrapUpMeetingNoteData {
  id: Id
  title: string
}

export interface IWrapUpToDoEntry {
  todo: IWrapUpToDoData
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onUpdateTodo' | 'onCreateContextAwareIssueFromTodo' | 'onTodoClicked'
  >
  getData: () => Pick<IWrapUpViewData, 'getCurrentUserPermissions'>
}
export interface IWrapUpIssueEntry {
  issue: IWrapUpIssueData
  getData: () => Pick<IWrapUpViewData, 'getCurrentUserPermissions'>
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onUpdateIssue' | 'onCreateContextAwareTodoFromIssue'
  >
}

export interface IWrapUpIssueData {
  id: Id
  assignee: {
    avatar: Maybe<string>
    firstName: string
    lastName: string
    fullName: string
    userAvatarColor: UserAvatarColorType
    id: Id
  }
  title: string
  completed: boolean
  notesId: Id
}

export interface IWrapUpActionHandlers {
  onConclude: (values: IWrapUpConcludeFormValue) => Promise<void>
  onUpdateWrapUpMeetingValues: (
    values: Partial<{
      includeMeetingNotesInEmailSummary: boolean
      archiveCompletedTodos: boolean
      archiveHeadlines: boolean
      sendEmailSummaryTo: MeetingInstanceSummarySendTo
      meetingNotes: Array<{
        id: Id
        title: string
        selected: boolean
      }>
    }>
  ) => Promise<void>
  onUpdateWrapUpVotingActions: (
    opts: Partial<{
      feedbackStyle: TMeetingFeedbackStyle
      displayMeetingRatings: boolean
    }>
  ) => Promise<void>
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  onUpdateTodo: (
    opts: Partial<{
      id: Id
      dueDate: number
    }>
  ) => Promise<void>
  onTodoClicked: (opts: { todoId: Id }) => void
  onUpdateIssue: (opts: { issueId: Id; value: boolean }) => void
  onCreateContextAwareIssueFromTodo: (
    opts: IContextAwareItemFromTodoOpts
  ) => void
  onCreateContextAwareTodoFromIssue(opts: IContextAwareItemFromIssueOpts): void
  onQuickAddTodoEnter: (opts: { title: string; assigneeId: Id }) => void
  onMeetingInstanceAttendeeUpdated: (opts: {
    userId: Id
    rating?: Maybe<number>
    notesText?: string
  }) => Promise<void>
}

export interface IWrapUpViewProps {
  getData: () => IWrapUpViewData
  getActions: () => IWrapUpActionHandlers
  className?: string
}

export interface IWrapUpContainerProps {
  onConclude: () => void
  children: (props: IWrapUpViewProps) => JSX.Element
  className?: string
  meetingId: Id
  getPageToDisplayData: () => Maybe<{ pageName: string }>
}
