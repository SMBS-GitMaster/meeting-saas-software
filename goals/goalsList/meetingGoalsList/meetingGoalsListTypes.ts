import { type Id } from '@mm/gql'

import {
  PermissionCheckResult,
  TBloomPageType,
  type TWorkspaceType,
} from '@mm/core-bloom'

import { GoalStatus } from '@mm/core-bloom/goals/goalTypes'

import { IContextAwareItemFromGoalOpts } from '@mm/bloom-web/shared'

import type { IGoalsListGoalData } from '../goalsListSharedTypes'

export type TMeetingGoalsListTab = 'this_meeting' | 'meeting_business'

export interface IMeetingGoalsListViewData {
  getBreadcrumbs: () => string[]
  getCurrentUserPermissions: () => {
    canEditGoalsInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateGoalsInMeeting: PermissionCheckResult
  }
  getDepartmentPlanGoalsForTotalCount: () => number
  getGoalsTotalCount: () => number
  getGoals: () => Array<IGoalsListGoalData>
  isLoading: boolean
  isShowingAllMilestones: boolean
  meetingId: Id
  meetingName: Maybe<string>
  pageType: TBloomPageType
  selectedTab: TMeetingGoalsListTab
  shouldCreateTodosForMilestone: boolean
  sortBy: TMeetingGoalsListSortingType
  workspaceType: TWorkspaceType
  workspaceTileId: Maybe<Id>
  isExpandedOnWorkspacePage: boolean
}

export interface IMeetingGoalsListActionHandlers {
  onCreateGoal: (meetingId: Id) => void
  onUpdateGoalStatus: (opts: { id: Id; status: GoalStatus }) => void
  onCreateTodosForMilestone: (create: boolean) => void
  onViewArchivedGoals(meetingId: Id): void
  onSelectGoalTab(tab: TMeetingGoalsListTab): void
  onExportGoals(): void
  onUploadGoals(): void
  onPrintGoals(): void
  onRestoreGoal(goalId: Id): Promise<void>
  onCreateContextAwareIssueFromGoal(opts: {
    context: IContextAwareItemFromGoalOpts
    meetingId: Id
  }): void
  onCreateContextAwareTodoFromGoal(opts: {
    context: IContextAwareItemFromGoalOpts
    meetingId: Id
  }): void
  onSelectGoalsSorting(value: TMeetingGoalsListSortingType): void
  onToggleMilestones(show: boolean): void
  onEditGoalRequest: (opts: { goalId: Id; meetingId: Id }) => void
  onUpdateMilestone: (
    opts: Partial<{
      id: Id
      completed: boolean
      dueDate: number
    }>
  ) => Promise<void>
  onDeleteTile: () => Promise<void>
}

export interface IMeetingGoalsListViewProps {
  getData: () => IMeetingGoalsListViewData
  getActionHandlers: () => IMeetingGoalsListActionHandlers
  className?: string
}

export interface IMeetingGoalsListContainerProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  children: (props: IMeetingGoalsListViewProps) => JSX.Element
  className?: string
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
}

export type TMeetingGoalsListSortingType =
  | 'ASSIGNEE_ASC'
  | 'ASSIGNEE_DESC'
  | 'NEWEST'
  | 'OLDEST'
  | 'STATUS'
  | 'BUSINESS_PLAN'
