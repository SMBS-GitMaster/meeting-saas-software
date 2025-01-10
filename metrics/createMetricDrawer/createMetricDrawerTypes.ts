import { type Id, NodesCollection } from '@mm/gql'

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
  MetricRules,
  MetricUnits,
} from '@mm/core-bloom/metrics'

import { EFormulaBadgeType } from '../formula'

export interface ICreateMetricDrawerProps {
  meetingId?: Maybe<Id>
  frequency?: MetricFrequency
  units?: MetricUnits
  rule?: MetricRules
  createAnotherCheckedInDrawer?: boolean
}

export interface ICreateMetricDrawerContainerProps {
  meetingId?: Maybe<Id>
  frequency?: MetricFrequency
  units?: MetricUnits
  rule?: MetricRules
  createAnotherCheckedInDrawer?: boolean
  children: (props: ICreateMetricDrawerViewProps) => JSX.Element
}

export interface ICreateMetricDrawerViewProps {
  data: ICreateMetricDrawerData
  actionHandlers: ICreateMetricDrawerActionHandlers
}

export interface ICreateMetricDrawerData {
  isLoading: boolean
  currentUserPermissions: { canCreateMetricsInMeeting: PermissionCheckResult }
  currentUser: Maybe<{ id: Id; settings: { timezone: Maybe<string> } }>
  initialCreateAnotherCheckedInDrawer: Maybe<boolean>
  initialFrequency: Maybe<MetricFrequency>
  initialRule: Maybe<MetricRules>
  initialUnits: Maybe<MetricUnits>
  meetingId?: Maybe<Id>
  meetingsLookup: Array<IMeetingLookup>
  meetingAttendeesAndOrgUsersLookup: Array<IMeetingAttendeesAndOrgUsersLookup>
  metricsFormulasLookup: Array<{
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
  weekStartAndEndNumbersForLuxon: {
    weekdayStartNumber: number
    weekdayEndNumber: number
  }
  drawerIsRenderedInMeeting: boolean
  drawerView: UserDrawerViewType
}

export interface ICreateMetricFormValues {
  title: string
  frequency: MetricFrequency
  units: MetricUnits
  rule: MetricRules
  notesId: Id
  averageDate: Maybe<number>
  showAverage: boolean
  cumulativeDate: Maybe<number>
  showCumulative: boolean
  createAnotherCheckedInDrawer: boolean
  progressiveTracking: boolean
  progressiveTrackingTargetDate: Maybe<number>
  singleGoal: Maybe<string>
  goalMin: Maybe<string>
  goalMax: Maybe<string>
  meetingIds: Array<Id>
  formula: Maybe<string>
  showFormula: boolean
  customGoals: Array<{
    id: Id
    startDate: number
    endDate: number
    singleGoalValue: Maybe<string>
    minGoalValue: Maybe<string>
    maxGoalValue: Maybe<string>
    rule: MetricRules
  }>
  assigneeId: Id
}

export interface ICreateMetricDrawerActionHandlers {
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  onCreateMetric: (values: ICreateMetricFormValues) => Promise<void>
  onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  onHandleCloseDrawerWithUnsavedChangesProtection: (opts: {
    onHandleLeaveWithoutSaving: () => void
  }) => void
  onHandleUpdateMetricFrequency: (frequency: MetricFrequency) => void
}
