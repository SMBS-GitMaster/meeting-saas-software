import { type Id } from '@mm/gql'

import type { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import { QuickAddUserOptionMetadata } from '@mm/core-web/ui'

import { IContextAwareItemFromTodoOpts } from '@mm/bloom-web/shared'

import {
  ITodoListTodo,
  ITodoListUserPermissions,
  TTodoListSortType,
} from '../todoListTypes'
import { ITodoListSharedActions } from '../todoListTypes'

export interface IMeetingTodoListContainerProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  className?: string
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  children: (props: IMeetingTodoListViewProps) => JSX.Element
}

export interface IMeetingTodoListViewProps {
  data: () => IMeetingTodoListViewData
  actions: () => IMeetingTodoListViewActions
  className?: string
}

export interface IMeetingTodoListViewData {
  isLoadingActiveTodos: boolean
  isLoadingArchivedTodos: boolean
  activeTodos: () => ITodoListTodo[]
  archivedTodos: () => ITodoListTodo[]
  currentUser: () => IMeetingTodoListMeetingAttendee & {
    permissions: () => ITodoListUserPermissions
  }
  quickAddMeetingAttendeesLookup: () => {
    value: Id
    metadata: QuickAddUserOptionMetadata
  }[]
  meetingId: Id
  meetingName: string
  meetingStartTime: number | null
  sortBy: Maybe<TTodoListSortType>
  isViewingArchivedTodos: boolean
  breadcrumbs: () => string[]
  pageType: TBloomPageType
  workspaceType: TWorkspaceType
  isCurrentMeetingInstance: boolean
  workspaceTileId: Maybe<Id>
  IsExpandedOnWorkspacePage: boolean
}

export interface IMeetingTodoListMeetingAttendee {
  id: Id
  firstName: string
  lastName: string
  fullName: string
  avatar: Maybe<string>
}

export interface IMeetingTodoListViewActions extends ITodoListSharedActions {
  sort: (sortBy: TTodoListSortType) => void
  onViewArchivedTodos: (viewArchivedTodos: boolean) => void
  export: () => void
  upload: () => void
  print: () => void
  onCreateContextAwareIssueFromTodo(opts: IContextAwareItemFromTodoOpts): void
  onQuickAddTodoEnter: (opts: {
    title: string
    assigneeId: Id
  }) => Promise<void>
  onEditTodoRequest: (todoId: Id) => void
  onDeleteTile: () => Promise<void>
}
