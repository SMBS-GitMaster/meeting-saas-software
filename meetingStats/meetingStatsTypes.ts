import { type Id } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

export interface IMeetingStatsNoteData {
  id: Id
  title: string
}

export interface IMeetingStatsToDoData {
  id: Id
  title: string
  assignee: {
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    firstName: string
    lastName: string
    fullName: string
  }
  completed: boolean
  dueDate: number
}

export interface IMeetingStatsHeadlineData {
  id: Id
  assignee: {
    id: Id
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    firstName: string
    lastName: string
  }
  title: string
}

export interface IMeetingStatsSolvedIssuesData {
  id: Id
  assignee: {
    id: Id
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    firstName: string
    lastName: string
  }
  title: string
  issue?: string
  completed: boolean
}

export interface IMeetingStatsViewData {
  meetingPageName: string
  attendeeInstances: Array<IMeetingStatsAttendeeInstance>
  averageMeetingRating: string
  priorAverageMeetingRating: string
  meetingConcludedTime: Maybe<number>
  todosCompletedPercentage: number
  feedbackInstances?: Array<IMeetingStatsFeedbackInstance>
  issuesSolvedCount: number
  meetingDurationInSeconds: number
  issuesSolvedCountForTheQuarter: number
  meetingDurationDifferenceFromLastMeetingInMinutes: number
  todosCompletedPercentageDifferenceFromLastMeeting: number
  todos: Array<IMeetingStatsToDoData>
  headlines: Array<IMeetingStatsHeadlineData>
  solvedIssues: Array<IMeetingStatsSolvedIssuesData>
  meetingTitle: string
  writtenFeedback: Record<string, Record<string, string | null>>
  timezone: string
  recordOfSelectedNotesIdToNotesText: Array<{
    noteNodeId: Id
    title: string
    noteHtml: string
    dateCreated: number
    details: string
  }>
  currentUserSettings: {
    hasViewedFeedbackModalOnce: boolean
    doNotShowFeedbackModalAgain: boolean
    timezone: Maybe<string>
  }
  feedbackStyle: string
  meetingId: string | number
}

export interface IMeetingStatsAttendeeInstance {
  id: Id
  notesText: Maybe<string>
  rating: Maybe<number>
  attendee: {
    id: Id
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    fullName: string
    firstName: string
    lastName: string
    isPresent: boolean
  }
}

export interface IMeetingStatsToDoCompleteSummaryData {
  messages: Array<{
    dueDate: number
    title: string
  }>
  assignee: {
    avatar: Maybe<string>
    firstName: string
    lastName: string
    fullName: string
    userAvatarColor: UserAvatarColorType
  }
}

export interface IMeetingStatsFeedbackInstance {
  id: Id
  message: Maybe<string>
  attendee: {
    id: Id
    avatar: Maybe<string>
    fullName: string
    firstName: string
    lastName: string
    userAvatarColor: UserAvatarColorType
  }
}

export interface IMeetingStatsViewActionHandlers {
  callGetSelectedMeetingNotesText: () => void
}

export interface IMeetingStatsViewProps {
  data: IMeetingStatsViewData
  actionHandlers: IMeetingStatsViewActionHandlers
  className?: string
}

export interface IMeetingStatsContainerProps {
  meetingId: Id
  meetingPageName: string
  children: (props: IMeetingStatsViewProps) => JSX.Element
  className?: string
}
