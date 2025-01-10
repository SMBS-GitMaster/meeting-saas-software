import { type Id } from '@mm/gql'

import { FormValuesForSubmit } from '@mm/core/forms'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
  PermissionCheckResult,
  UserDrawerViewType,
} from '@mm/core-bloom'

import { GoalStatus } from '@mm/core-bloom/goals'

import { IColoredSelectInputOption } from '@mm/core-web/ui'

import { TGoalDepartmentPlanEntry } from '../goalsDrawerDepartmentPlanView'

export interface IEditGoalDrawerProps {
  meetingId: Maybe<Id>
  goalId: Id
}

export interface IEditGoalFormValues {
  editGoalDueDate: number
  editGoalStatus: GoalStatus
  editGoalTitle: string
  editGoalAttachToOwner: Id
  editGoalAttachToMeetings: Array<Id>
  addToDepartmentPlans: Array<TGoalDepartmentPlanEntry>
  editGoalNotesId: Id
  editGoalMilestones: Array<{
    id: Id
    milestoneTitle: string
    milestoneDueDate: number
    milestoneCompleted: boolean
  }>
}

export interface IEditGoalDrawerViewProps {
  getData: () => IEditGoalDrawerContainerData
  getActionHandlers: () => IEditGoalDrawerActionHandlers
}

export interface IEditGoalDrawerContainerData {
  isLoading: boolean
  meetingId: Maybe<Id>
  getGoal: () => {
    id: Id
    title: string
    dateCreated: number
    dueDate: number
    status: GoalStatus
    notesId: Id
    dateLastModified: number
    departmentPlanRecords: Array<{ meetingId: Id; isInDepartmentPlan: boolean }>
    milestones: Array<{
      completed: boolean
      dueDate: number
      title: string
      id: Id
    }>
    assigneeId: Id
    assigneeFullName: string
    meetings: Array<{ id: Id; name: string }>
    isPersonalGoal: boolean
  }
  getCurrentUserPermissions: () => {
    canEditGoalsInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canEditGoalsOwnerInMeeting: PermissionCheckResult
    canEditGoalsMeetingInMeeting: PermissionCheckResult
    canArchiveGoalInMeeting: PermissionCheckResult
  }
  getCurrentMeetingsLookup: () => Array<IMeetingLookup>
  getMeetingAttendeesAndOrgUsersLookup: () => Array<IMeetingAttendeesAndOrgUsersLookup>
  getGoalStatusLookup: () => Array<IColoredSelectInputOption>
  currentUserTimezone: string
  goalNotesText: Maybe<string>
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
}

export interface IEditGoalDrawerActionHandlers {
  onSubmit: (
    values: Partial<
      FormValuesForSubmit<IEditGoalFormValues, true, 'editGoalMilestones'>
    >
  ) => Promise<void>
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  onArchiveGoal: () => Promise<void>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface IEditGoalDrawerContainerProps {
  goalId: Id
  meetingId: Maybe<Id>
  children: (props: IEditGoalDrawerViewProps) => JSX.Element
}
