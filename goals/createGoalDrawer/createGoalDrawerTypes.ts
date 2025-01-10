import { type Id } from '@mm/gql'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
  PermissionCheckResult,
  UserDrawerViewType,
} from '@mm/core-bloom'

import { GoalStatus } from '@mm/core-bloom/goals'

import { IColoredSelectInputOption } from '@mm/core-web/ui'

import { TGoalDepartmentPlanEntry } from '../goalsDrawerDepartmentPlanView'

export interface ICreateGoalDrawerProps {
  initialItemValues?: Partial<ICreateGoalFormValues>
  meetingId?: Maybe<Id>
}

export interface ICreateGoalFormValues {
  createGoalDueDate: number
  createGoalStatus: GoalStatus
  createGoalTitle: string
  createGoalAttachToOwner: string
  createGoalAttachToMeetings: Array<string>
  addToDepartmentPlans: Array<TGoalDepartmentPlanEntry>
  createGoalNotesId: Id
  createGoalMilestones: Array<{
    milestoneTitle: string
    milestoneDueDate: number
    milestoneCompleted: boolean
    id: Id
  }>
  createAnotherCheckedInDrawer: boolean
}

export interface ICreateGoalDrawerViewProps {
  data: ICreateGoalDrawerContainerData
  actionHandlers: ICreateGoalDrawerActionHandlers
}

export interface ICreateGoalDrawerContainerData {
  isLoading: boolean
  currentMeetingsLookup: Array<IMeetingLookup>
  meetingAttendeesAndOrgUsersLookup: Array<IMeetingAttendeesAndOrgUsersLookup>
  currentUserPermissions: {
    canCreateGoalsInMeeting: PermissionCheckResult
  }
  goalStatusLookup: Array<IColoredSelectInputOption>
  currentUserId: Maybe<Id>
  currentUserTimezone: string
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
  meetingId?: Maybe<Id>
  initialItemValues?: Partial<ICreateGoalFormValues>
}

export interface ICreateGoalDrawerActionHandlers {
  onSubmit: (values: ICreateGoalFormValues) => Promise<void>
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}

export interface ICreateGoalDrawerContainerProps {
  initialItemValues?: Partial<ICreateGoalFormValues>
  meetingId?: Maybe<Id>
  children: (props: ICreateGoalDrawerViewProps) => JSX.Element
}
