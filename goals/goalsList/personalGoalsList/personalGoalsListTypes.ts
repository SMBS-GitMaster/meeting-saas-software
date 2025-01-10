import type { Id } from '@mm/gql'

import type { GoalStatus } from '@mm/core-bloom/goals'

import type {
  IGoalsListGoalData,
  IGoalsListPermissions,
} from '../goalsListSharedTypes'

export interface IPersonalGoalsListContainerProps {
  workspaceTileId: Id
  children: (props: IPersonalGoalsListViewProps) => JSX.Element
  userId?: Id
  className?: string
}

export interface IPersonalGoalsListViewProps {
  data: () => IPersonalGoalsListViewData
  actions: () => IPersonalGoalsListViewActions
  className?: string
}

export interface IPersonalGoalsListViewData {
  isLoading: boolean
  workspaceTileId: Id
  isComponentPurposedForAnotherUser: boolean
  selectedGroupSortBy: TPersonalGoalsListSortBy
  selectedContentSortBy: TPersonalGoalsListSortBy
  isExpandedMilestones: boolean
  isExpandedOnWorkspacePage: boolean
  userGoalsInAllMeetings: () => Array<IUserGoalsForMeeting>
}

export interface IPersonalGoalsListViewActions {
  onToggleMilestones(show: boolean): void
  onCreateGoal: () => void
  onEditGoalRequest: (opts: { goalId: Id; meetingId: Id }) => void
  onUpdateGoalStatus: (opts: { id: Id; status: GoalStatus }) => void
  onUpdateMilestone: (
    opts: Partial<{
      id: Id
      completed: boolean
      dueDate: number
    }>
  ) => Promise<void>
  setGroupSortBy: (sort: TPersonalGoalsListSortBy) => void
  setContentSortBy: (sort: TPersonalGoalsListSortBy) => void
  onDeleteTile: () => Promise<void>
}

export interface IPersonalGoalsListPageState {
  selectedGroupSortBy: TPersonalGoalsListSortBy
  selectedContentSortBy: TPersonalGoalsListSortBy
  isExpandedMilestones: boolean
}

export interface IUserGoalsForMeeting {
  id: Id // SAME AS MEETING ID, NEEDED FOR FASTLIST.
  meetingId: Id
  meetingName: string
  meetingColor: string
  permissions: IGoalsListPermissions
  goals: Array<IGoalsListGoalData>
}

export type TPersonalGoalsListSortBy =
  | 'MEETING_ASC'
  | 'MEETING_DESC'
  | 'NEWEST'
  | 'OLDEST'
  | 'STATUS'
  | 'TITLE_ASC'
  | 'TITLE_DESC'
