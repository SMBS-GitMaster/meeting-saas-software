import { type Id, type NodesCollection } from '@mm/gql'

import {
  type MetricFrequency,
  type MetricGoalInfoType,
  type MetricRules,
  type MetricUnits,
  type UserPermissionType,
} from '@mm/core-bloom'

import {
  type IMetricTableDataItemCustomGoalData,
  type IMetricTableDataItemScoreData,
  type IMetricsTableViewData,
} from '../metricsTableTypes'

export interface IPersonalMetricsTableContainerProps {
  workspaceTileId: Id
  userId: Maybe<Id>
  className?: string
  children: (props: IPersonalMetricsTableViewProps) => JSX.Element
}

export interface IPersonalMetricsTableViewProps {
  data: () => IPersonalMetricsTableViewData
  actions: () => IPersonalMetricsTableViewActions
  className?: string
}

export interface IPersonalMetricsTableViewData {
  columnDisplayValues: Record<
    keyof IMetricsTableViewData['metricTableColumnToIsVisibleSettings'],
    boolean
  >
  getMetricScoreDateRanges: IMetricsTableViewData['getMetricScoreDateRanges']
  isLoading: boolean
  currentUserId: Id
  meetingMetrics: Array<IPersonalMetricTableMeetingItem>
  metricsDateRangeStartAndEndTimestamp: {
    startDate: number
    endDate: number
  }
  metricTotalCountByFrequency: Record<MetricFrequency, number>
  selectedFrequencyTab: MetricFrequency
  workspaceTileId: Id
  isCurrentUser: boolean
}

export interface IPersonalMetricsTableViewActions {
  handleUpdateMetricScore: (props: {
    value: Maybe<string>
    timestamp: number
    metricId: Id
    metricUnits: MetricUnits
    scoreId?: Id
  }) => Promise<void>
  onDeleteTile: () => Promise<void>
  onSetColumnDisplay: (opts: {
    column: keyof IMetricsTableViewData['metricTableColumnToIsVisibleSettings']
    isShowing: boolean
  }) => void
  onSetMetricFrequencyTab: (newTab: MetricFrequency) => void
}

export interface IPersonalMetricTableMeetingItem {
  id: Id
  meetingId: Id
  meetingName: string
  meetingColor: string
  metrics: Array<IPersonalMetricTableDataItem>
  permissionsForMeeting: UserPermissionType
}

export interface IPersonalMetricTableDataItem {
  id: Id
  assignee: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
  }
  title: string
  rule: MetricRules
  units: MetricUnits
  frequency: MetricFrequency
  singleGoalValue: Maybe<string>
  minGoalValue: Maybe<string>
  maxGoalValue: Maybe<string>
  goal: MetricGoalInfoType
  formula: Maybe<string>
  indexInTable: number
  notesId: Id
  dateCreated: number
  metricData: Maybe<{
    cumulativeData: Maybe<{
      startDate: number
      sum: string
    }>
    progressiveData: Maybe<{
      targetDate: number
      sum: string
    }>
    averageData: Maybe<{
      startDate: number
      average: string
    }>
  }>
  formattedAverage: Maybe<string>
  formattedCumulative: Maybe<string>
  scores: Array<IMetricTableDataItemScoreData>
  customGoals: NodesCollection<{
    TItemType: IMetricTableDataItemCustomGoalData
    TIncludeTotalCount: false
  }>
}
