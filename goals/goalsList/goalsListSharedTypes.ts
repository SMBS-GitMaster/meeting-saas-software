import { type Id, NodesCollection } from '@mm/gql'

import { PermissionCheckResult, type UserAvatarColorType } from '@mm/core-bloom'

import { type GoalStatus } from '@mm/core-bloom/goals/goalTypes'

import { type PillIntent } from '@mm/core-web/ui'

export interface IGoalsListGoalData {
  id: Id
  title: string
  status: GoalStatus
  dateCreated: number
  dueDate: number
  notesId: Id
  assignee: {
    id: Id
    avatar: Maybe<string>
    firstName: string
    lastName: string
    fullName: string
    userAvatarColor: UserAvatarColorType
  }
  milestones: {
    nodes: Array<IGoalsListMilestoneData>
  }
  departmentPlanRecords: NodesCollection<{
    TItemType: { isInDepartmentPlan: boolean; meetingId: Id }
    TIncludeTotalCount: false
  }>
}

export interface IGoalsListMilestoneData {
  id: Id
  title: string
  dueDate: number
  completed: boolean
  milestoneColorIntent: PillIntent
}

export interface IGoalsListPermissions {
  canEditGoalsInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
  canCreateTodosInMeeting: PermissionCheckResult
  canCreateGoalsInMeeting: PermissionCheckResult
}

export type TGoalsListResponsiveSizes = 'SMALL' | 'MEDIUM' | 'LARGE' | 'UNKNOWN'
