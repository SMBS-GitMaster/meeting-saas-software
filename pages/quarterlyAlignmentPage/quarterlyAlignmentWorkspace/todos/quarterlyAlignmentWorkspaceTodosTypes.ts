import { Id } from '@mm/gql'

import { PermissionCheckResult, UserAvatarColorType } from '@mm/core-bloom'

import { IContextAwareItemFromTodoOpts } from '@mm/bloom-web/shared'

export interface IQuarterlyAlignmentWorkspaceTodosProps {
  alignmentUser: Maybe<{ id: Id }>
  tileId: Id
  onHandleUpdateTileHeight: (opts: { tileId: Id; height: number }) => void
}

export interface IQuarterlyAlignmentWorkspaceTodosContainerProps {
  alignmentUser: Maybe<{ id: Id }>
  tileId: Id
  children: (props: IQuarterlyAlignmentWorkspaceTodosViewProps) => JSX.Element
  onHandleUpdateTileHeight: (opts: { tileId: Id; height: number }) => void
}

export interface IQuarterlyAlignmentWorkspaceTodosViewProps {
  data: () => IQuarterlyAlignmentWorkspaceTodosData
  actions: () => IQuarterlyAlignmentWorkspaceTodosActions
}

export interface IQuarterlyAlignmentWorkspaceTodosData {
  isLoading: boolean
  currentUser: Maybe<{
    fullName: string
  }>
  getCompletedTodosPercentage: () => number
  getUserTodosInAllMeetings: () => Maybe<
    Array<IQuarterlyAlignmentWorkspaceTodoItem>
  >
  pageState: {
    isTileExpanded: boolean
    isTodosListExpanded: boolean
  }
  tileId: Id
}

export interface IQuarterlyAlignmentWorkspaceTodosActions {
  onHandleToggleIsTileExpanded: () => void
  onHandleEditTodoRequest: (opts: { todoId: Id; meetingId: Maybe<Id> }) => void
  onHandleCreateContextAwareIssueFromTodo(opts: {
    meetingId: Id
    todo: IContextAwareItemFromTodoOpts
  }): void
  onHandleSetTodosListExpanded: () => void
  onHandleUpdateTodo: (
    opts: Partial<{
      id: Id
      completed?: boolean
      dueDate: number
    }>
  ) => Promise<void>
}

export interface IQuarterlyAlignmentWorkspaceTodoItem {
  id: Id
  title: string
  completed: boolean
  dateCreated: number
  dueDate: number
  archived: boolean
  isOverdue: boolean
  notesId: Id
  isNew: (meetingStartTime: number | null) => boolean
  meeting: {
    id: Id
  }
  assignee: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }
  permissions: {
    canEditTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
  }
}
