import { NodesCollection } from '@mm/gql'

import {
  IIssueListItem,
  IIssueListViewActionHandlers,
  IIssueListViewData,
  TIssueListResponsiveSize,
} from '../issueListTypes'

export type CompletedIssueListItemType = Pick<
  IIssueListItem,
  | 'completed'
  | 'title'
  | 'completedTimestamp'
  | 'assignee'
  | 'id'
  | 'dateCreated'
  | 'sentFromIssueMeetingName'
>

export interface ICompletedIssueListViewData extends IIssueListViewData {
  completedIssues: NodesCollection<{
    TItemType: CompletedIssueListItemType
    TIncludeTotalCount: false
  }>
}

interface ICompletedIssueListViewActionHandlers
  extends IIssueListViewActionHandlers {}

export interface ICompletedIssueListViewProps {
  getData: () => ICompletedIssueListViewData
  responsiveSize: TIssueListResponsiveSize
  getActionHandlers: () => ICompletedIssueListViewActionHandlers
}

export interface ICompletedIssueListContainerProps {
  getData: () => IIssueListViewData
  responsiveSize: TIssueListResponsiveSize
  getActionHandlers: () => IIssueListViewActionHandlers
  children: React.FC<ICompletedIssueListViewProps>
}
