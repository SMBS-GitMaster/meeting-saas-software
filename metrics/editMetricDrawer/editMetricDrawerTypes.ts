import { type Id, NodesCollection } from '@mm/gql'

import { FormValuesForSubmit } from '@mm/core/forms'

import {
  PermissionCheckResult,
  UserAvatarColorType,
  UserDrawerViewType,
} from '@mm/core-bloom'

import {
  IMeetingAttendeesAndOrgUsersLookup,
  IMeetingLookup,
} from '@mm/core-bloom/meetings'
import {
  MetricFrequency,
  MetricGoalInfoType,
  MetricRules,
  MetricUnits,
} from '@mm/core-bloom/metrics'

import { EFormulaBadgeType } from '../formula'

export interface IEditMetricDrawerContainerProps {
  metricId: Id
  meetingId: Maybe<Id>
  children: (props: IEditMetricDrawerViewProps) => JSX.Element
}

export interface IEditMetricDrawerViewProps {
  getData: () => IEditMetricDrawerData
  getActionHandlers: () => IEditMetricDrawerActionHandlers
}

export interface IEditMetricDrawerData {
  getMetric: () => {
    id: Id
    title: string
    frequency: MetricFrequency
    units: MetricUnits
    rule: MetricRules
    goal: MetricGoalInfoType
    notesId: Id
    progressiveDate: Maybe<number>
    averageDate: Maybe<number>
    cumulativeDate: Maybe<number>
    showAverage: boolean
    showCumulative: boolean
    formula: Maybe<string>
    meetingIds: Array<Id>
    customGoals: Maybe<
      NodesCollection<{
        TItemType: {
          startDate: number
          endDate: number
          id: Id
          singleGoalValue: Maybe<string>
          minGoalValue: Maybe<string>
          maxGoalValue: Maybe<string>
          rule: MetricRules
          goal: (units: MetricUnits) => MetricGoalInfoType
        }
        TIncludeTotalCount: false
      }>
    >
    assigneeId: Id
    assigneeFullName: string
  }
  getCurrentUserPermissions: () => {
    canEditMetricsInMeeting: PermissionCheckResult
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canEditMetricsMeetingInMeeting: PermissionCheckResult
    canArchiveMetricsInMeeting: PermissionCheckResult
  }
  meetingId: Maybe<Id>
  isLoading: boolean
  currentUser: Maybe<{ id: Id; settings: { timezone: Maybe<string> } }>
  getMeetingsLookup: () => Array<IMeetingLookup>
  getMeetingAttendeesAndOrgUsersLookup: () => Array<IMeetingAttendeesAndOrgUsersLookup>
  getMetricsFormulasLookup: () => Array<{
    type: EFormulaBadgeType.Metric
    text: string
    value: Id
    ownerMetaData: {
      firstName: string
      lastName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
    }
  }>
  nodesCollectionForMetricsFormulasLookup: Maybe<
    NodesCollection<{
      TItemType: {
        id: Id
        title: string
        assignee: {
          firstName: string
          lastName: string
          avatar: Maybe<string>
          userAvatarColor: UserAvatarColorType
        }
      }
      TIncludeTotalCount: false
    }>
  >
  getWeekStartAndEndNumbersForLuxon: () => {
    weekdayStartNumber: number
    weekdayEndNumber: number
  }
  metricNoteText: Maybe<string>
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
  metricIdFromProps: Id
}

export interface IEditMetricFormValues {
  title: string
  frequency: MetricFrequency
  owner: Id
  units: MetricUnits
  rule: MetricRules
  singleGoal: Maybe<string>
  goalMin: Maybe<string>
  goalMax: Maybe<string>
  notesId: Id
  meetingIds: Array<Id>
  createAnotherCheckedInDrawer: boolean
  progressiveTrackingTargetDate: Maybe<number>
  cumulativeDate: Maybe<number>
  averageDate: Maybe<number>
  showAverage: boolean
  showCumulative: boolean
  showFormula: boolean
  formula: Maybe<string>
  customGoals: Array<{
    id: Id
    startDate: number
    endDate: number
    singleGoalValue: Maybe<string>
    minGoalValue: Maybe<string>
    maxGoalValue: Maybe<string>
    rule: MetricRules
  }>
}
export interface IEditMetricDrawerActionHandlers {
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  onArchiveMetric: () => Promise<void>
  onUpdateMetric: (
    values: Partial<
      FormValuesForSubmit<IEditMetricFormValues, true, 'customGoals'>
    >
  ) => Promise<void>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
}
