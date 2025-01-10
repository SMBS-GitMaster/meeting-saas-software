import type { Id } from '@mm/gql'

import { IContextAwareItemFromTodoOpts } from '@mm/bloom-web/shared'

import {
  ITodoListSharedActions,
  ITodoListTodo,
  ITodoListUserPermissions,
  TTodoListSortType,
} from '../todoListTypes'

export interface IPersonalTodoListContainerProps {
  workspaceTileId: Id
  className?: string
  children: (props: IPersonalTodoListViewProps) => JSX.Element
}

export interface IPersonalTodoListViewProps {
  data: () => IPersonalTodoListViewData
  actions: () => IPersonalTodoListViewActions
  className?: string
}

export interface IPersonalTodoListViewData {
  isLoading: boolean
  selectedGroupSortBy: TTodoListSortType
  selectedContentSortBy: TTodoListSortType
  userTodosInAllMeetings: () => Array<IUserTodosForMeeting>
  workspaceTileId: Id
  IsExpandedOnWorkspacePage: boolean
}

export interface IPersonalTodoListViewActions extends ITodoListSharedActions {
  onEditTodoRequest: (opts: { todoId: Id; meetingId: Maybe<Id> }) => void
  onCreateContextAwareIssueFromTodo(opts: {
    meetingId: string
    todo: IContextAwareItemFromTodoOpts
  }): void
  setGroupSortBy: (sort: TTodoListSortType) => void
  setContentSortBy: (sort: TTodoListSortType) => void
  onDeleteTile: () => Promise<void>
}

export interface IUserTodosForMeeting {
  id: Id
  meetingId: Id
  meetingName: string
  meetingColor: string
  permissions: ITodoListUserPermissions
  todos: Array<ITodoListTodo>
}
