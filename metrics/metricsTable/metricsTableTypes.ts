import { type Id, NodesCollection } from '@mm/gql'

import {
  ChartableMetricUnits,
  MetricFrequency,
  MetricGoalInfoType,
  MetricRules,
  MetricUnits,
  PermissionCheckResult,
  TBloomPageType,
  type TWorkspaceType,
  TrackedMetricColorIntention,
  UserAvatarColorType,
  UserPermissionType,
  WeekStartType,
} from '@mm/core-bloom'

import { TabData } from '../metricsTabs/metricsTabsController'

export type MetricTableColumnOptions =
  | 'drag'
  | 'title'
  | 'owner'
  | 'goal'
  | 'graph'
  | 'cumulative'
  | 'average'

export interface IMetricsTableViewProps {
  getData: () => IMetricsTableViewData
  getActionHandlers: () => IMetricsTableViewActionHandlers
  className?: string
}
export interface IMetricsTableContainerProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
  children: (props: IMetricsTableViewProps) => JSX.Element
}

export interface IMetricTableDataItemScoreData {
  value: string
  scoreValueRounded: string
  timestamp: number
  id: Id
  notesText: Maybe<string>
  isTimestampWithinDateRange: (opts: {
    startDate: number
    endDate: number
    frequency: MetricFrequency
    startOfWeek: WeekStartType
  }) => boolean
}

export interface IMetricTableDataItemCustomGoalData {
  goal: (units: MetricUnits) => MetricGoalInfoType
  startDate: number
  endDate: number
  rule: MetricRules
}

export interface IMetricTableScoreData {
  id: Id
  ownerId: Id
  frequency: MetricFrequency
  units: MetricUnits
  title: string
  goal: MetricGoalInfoType
  notesId: Id
  formula: Maybe<string>
  metricDivider: Maybe<{
    title: string
    height: number
    id: Id
    indexInTable: number
  }>
  progressiveData: Maybe<{ targetDate: number; sum: string }>
  rule: MetricRules
  permissions: { canEditMetricsInMeeting: PermissionCheckResult }
  getDateRangesData: () => Array<{
    start: number
    end: number
    scoreData: Maybe<IMetricTableDataItemScoreData>
    customGoalData: Maybe<IMetricTableDataItemCustomGoalData>
    highlightedWeekIsWithinRange: boolean
    formattedDates: string | JSX.Element
    cellNotesText: Maybe<string>
  }>
  assignee: {
    fullName: string
  }
}

export interface IMetricTableDataItem {
  id: Id
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
  assignee: {
    firstName: string
    lastName: string
    fullName: string
    id: Id
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }
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
  metricDivider: Maybe<{
    title: string
    height: number
    id: Id
    indexInTable: number
  }>
  formattedAverage: Maybe<string>
  formattedCumulative: Maybe<string>
  scores: Array<IMetricTableDataItemScoreData>
  customGoals: NodesCollection<{
    TItemType: IMetricTableDataItemCustomGoalData
    TIncludeTotalCount: false
  }>
}

export interface IMetricsTableViewData {
  meetingPageName: string
  currentUserPermissions: Maybe<UserPermissionType>
  getCurrentUserPermissions: () => {
    canCreateTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
    canReverseMetricsInMeeting: PermissionCheckResult
    canCreateMetricDividersInMeeting: PermissionCheckResult
    canAddExistingMetricsToMeeting: PermissionCheckResult
    canEditMetricDividersInMeeting: PermissionCheckResult
    canPerformEditActionsForMetricsInMeeting: PermissionCheckResult
    canCreateMetricsTabsInMeeting: PermissionCheckResult
  }
  isScoreTableReversed: boolean
  metricTableColumnToIsVisibleSettings: {
    owner: boolean
    goal: boolean
    cumulative: boolean
    average: boolean
  }
  metricTableWidthDragScrollPct: Maybe<number>
  meeting: {
    id: Id
    name: string
  }
  workspaceType: TWorkspaceType
  isLoading: boolean
  preventEditingUnownedMetrics: boolean
  highlightPreviousWeekForMetrics: boolean
  metricsTableSelectedTab: MetricFrequency
  metrics: NodesCollection<{
    TItemType: IMetricTableDataItem
    TIncludeTotalCount: false
  }>
  trackedMetrics: Array<{
    id: Id // this id is the id of the trackedMetric node, not the metric node
    color: TrackedMetricColorIntention
    metric: { id: Id } // this id is the id of the metric node
  }>
  allTabs: Array<TabData>
  currentUser: {
    id: Id
  }
  getActiveTab: () => Maybe<TabData | { newTab: true }>
  getAllMetricsHaveDividers: () => boolean
  weekStart: WeekStartType
  metricsDateRangeStartAndEndTimestamp: { startDate: number; endDate: number }
  getMetricsHaveCumulativeData: () => boolean
  getMetricsHaveAverageData: () => boolean
  getMetricScoreDateRanges: () => Array<{ start: number; end: number }>
  totalCountData: Record<MetricFrequency, number>
  pageType: TBloomPageType
  workspaceTileId: Maybe<Id>
  isExpandedOnWorkspacePage: boolean
}

type TDragSortOptions = { id: Id } & (TMetricDragSort | TDividerDragSort)

type TMetricDragSort = { type: 'METRIC'; newIndex: number }

type TDividerDragSort = {
  type: 'DIVIDER'
  newIndex: number
  newMetricToAttachToId: Id
}

export interface IMetricsTableViewActionHandlers {
  handleSetMetricsTableSelectedTab: (tab: MetricFrequency) => void
  handleSwitchMetricsTableSortByValue: () => void
  handlePrintMetricsTable: () => void
  handleMetricsTableDragSort: (props: TDragSortOptions) => void
  handleUpdateMetricScore: (props: {
    value: Maybe<string>
    timestamp: number
    metricId: Id
    metricUnits: MetricUnits
    scoreId?: Id
  }) => void
  handleChartButtonClick: (props: {
    metric: {
      id: Id
      units: ChartableMetricUnits
      title: string
      frequency: MetricFrequency
    }
  }) => void
  displayMetricsTabs: () => void
  hideMetricsTabs: () => void
  handleUpdateMetricTableColumnToIsVisibleSettings: (props: {
    owner: boolean
    goal: boolean
    cumulative: boolean
    average: boolean
  }) => void
  handleCreateMetricDivider: (opts: { frequency: MetricFrequency }) => void
  handleDeleteMetricDivider: (dividerId: Id) => void
  handleEditMetricDivider: (opts: {
    id: Id
    metricId?: Id
    title?: string
    height?: number
  }) => void
  handleUpdateMetricTableWidthDragScrollPct: (pct: number) => void
  isTabData: <
    TTabData extends {
      id: Id
    },
  >(
    tab: Maybe<
      | {
          newTab: true
        }
      | TTabData
    >
  ) => tab is TTabData
  getActiveTabPermissions: () => {
    canPerformDeleteActionsForMetricTabInMeeting: PermissionCheckResult
    canEditMetricTabInMeeting: PermissionCheckResult
  }
  onDeleteTile: () => Promise<void>
}

export type TMetricsTableResponsiveSize = 'XS' | 'S' | 'M' | 'L' | 'UNKNOWN'
