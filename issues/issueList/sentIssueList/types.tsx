import { Id, NodesCollection } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import {
  IIssueListViewActionHandlers,
  IIssueListViewData,
  TIssueListResponsiveSize,
} from '../issueListTypes'

export interface IIssueSentToMeetingListItem {
  id: Id
  sentToIssueMeetingName: Maybe<string>
  sentToIssue: {
    id: Id
    title: string
    completed: boolean
    assignee: {
      id: Id
      firstName: string
      lastName: string
      fullName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
    }
  }
}

export interface ISentIssueListViewData extends IIssueListViewData {
  issuesSentToOtherMeetings: NodesCollection<{
    TItemType: IIssueSentToMeetingListItem
    TIncludeTotalCount: false
  }>
}

interface ISentIssueListViewActionHandlers
  extends IIssueListViewActionHandlers {}

export interface ISentIssueListViewProps {
  getData: () => ISentIssueListViewData
  responsiveSize: TIssueListResponsiveSize
  getActionHandlers: () => ISentIssueListViewActionHandlers
}

export interface ISentIssueListContainerProps {
  getData: () => IIssueListViewData
  responsiveSize: TIssueListResponsiveSize
  getActionHandlers: () => IIssueListViewActionHandlers
  children: React.FC<ISentIssueListViewProps>
}
