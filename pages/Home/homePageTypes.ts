import { type Id } from '@mm/gql'

import { type TWorkspaceType } from '@mm/core-bloom'

export interface IHomePageContainerProps {
  children: (props: IHomePageViewProps) => JSX.Element
}

export interface IHomePageViewProps {
  data: () => IHomePageViewData
  actions: () => IHomePageViewActions
}

export interface IHomePageViewData {
  workspaceHomeType: Maybe<TWorkspaceType>
  workspaceHomeId: Maybe<Id>
}

export interface IHomePageViewActions {
  onSetPrimaryWorkspace: (opts: {
    workspaceType: TWorkspaceType
    meetingOrWorkspaceId: Id
  }) => Promise<void>
}
