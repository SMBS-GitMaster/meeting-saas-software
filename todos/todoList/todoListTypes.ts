import { type Id } from '@mm/gql'

import { PermissionCheckResult, UserAvatarColorType } from '@mm/core-bloom'

export interface ITodoListSharedActions {
  onUpdateTodo: (
    opts: Partial<{
      id: Id
      completed?: boolean
      dueDate: number
    }>
  ) => Promise<void>
}

export interface ITodoListTodo {
  id: Id
  title: string
  completed: boolean
  dateCreated: number
  dueDate: number
  archived: boolean
  isOverdue: boolean
  notesId: Id
  isNew: (meetingStartTime: number | null) => boolean
  assignee: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }
}

export interface ITodoListUserPermissions {
  canEditTodosInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
  canCreateTodosInMeeting: PermissionCheckResult
}

export type TTodoListResponsiveSizes = 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN'

export type TTodoListSortType =
  | 'ASSIGNEE_ASC'
  | 'ASSIGNEE_DESC'
  | 'MEETING_ASC'
  | 'MEETING_DESC'
  | 'OVERDUE'
  | 'COMPLETED'
  | 'NEWEST'
  | 'OLDEST'
  | 'TITLE'
