import { type Id } from '@mm/gql'

export interface IDirectReportsContainerProps {
  children: (props: IDirectReportsViewProps) => JSX.Element
}

export interface IDirectReportsViewProps {
  data: () => IDirectReportsData
  actions: () => IDirectReportsActions
}

export interface IDirectReportsData {
  directReportUserInfo: () => Array<IDirectReportUserInfo>
}

export interface IDirectReportsActions {}

export interface IDirectReportUserInfo {
  userId: Id
  directReportId: Id
  positionTitles: Array<string>
}
