import { type Id } from '@mm/gql'

import {
  type TWorkspaceStatsTileSelectedDateRangeFilter,
  type UserAvatarColorType,
} from '@mm/core-bloom'

import { type IWorkspaceStatsTileStatsData } from '@mm/bloom-web/stats'

export interface IDirectReportUserTileContainerProps {
  userId: Id
  positionTitles: Array<string>
  children: (props: IDirectReportUserTileViewProps) => JSX.Element
}

export interface IDirectReportUserTileViewProps {
  data: () => IDirectReportUserTileViewData
  actions: () => IDirectReportUserTileViewActions
}

export interface IDirectReportUserTileViewData {
  user: Maybe<{
    id: Id
    firstName: string
    lastName: string
    profilePictureUrl: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }>
  positionTitles: Array<string>
  selectedDateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  statsData: IWorkspaceStatsTileStatsData
}

export interface IDirectReportUserTileViewActions {
  onSetDateRange: (
    dateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  ) => Promise<void>
}
