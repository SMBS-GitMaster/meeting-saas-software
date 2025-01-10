import { NodesCollection } from '@mm/gql'

import {
  IIssueListItem,
  IIssueListViewActionHandlers,
  IIssueListViewData,
  TIssueListResponsiveSize,
} from '../issueListTypes'

export interface ILongTermIssueListViewData extends IIssueListViewData {
  longTermIssues: NodesCollection<{
    TItemType: IIssueListItem
    TIncludeTotalCount: false
  }>
}

interface ILongTermIssueListViewActionHandlers
  extends IIssueListViewActionHandlers {}

export interface ILongTermIssueListViewProps {
  getData: () => ILongTermIssueListViewData
  responsiveSize: TIssueListResponsiveSize
  getActionHandlers: () => ILongTermIssueListViewActionHandlers
}

export interface ILongTermIssueListContainerProps {
  getData: () => IIssueListViewData
  responsiveSize: TIssueListResponsiveSize
  getActionHandlers: () => IIssueListViewActionHandlers
  children: React.FC<ILongTermIssueListViewProps>
}
