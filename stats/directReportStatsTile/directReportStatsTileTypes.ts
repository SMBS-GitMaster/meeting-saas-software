import { type Id } from '@mm/gql'

import type { TWorkspaceStatsTileSelectedDateRangeFilter } from '@mm/core-bloom'

export interface IDirectReportStatsTileContainerProps {
  userId: Maybe<Id>
  children: (props: IDirectReportStatsTileViewProps) => JSX.Element
}

export interface IDirectReportStatsTileViewProps {
  data: () => IDirectReportStatsTileData
  actions: () => IDirectReportStatsTileActions
}

export interface IDirectReportStatsTileData {
  pageState: IDirectReportStatsTileState
}

export interface IDirectReportStatsTileActions {
  onSetDateRange: (
    dateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  ) => void
}

export interface IDirectReportStatsTileStatsData {
  goals: number[]
  milestones: number[]
  dateRangeLabels: string[]
}

export interface IDirectReportStatsTileState {
  selectedDateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  statsData: IDirectReportStatsTileStatsData
}
