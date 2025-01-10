import React from 'react'

import type { Id } from '@mm/gql'

import type { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import { IssueListContainer } from './issueListContainer'
import { IssueListView } from './issueListView'

export * from './issueListView'
export * from './issueListTypes'

interface IIssueListProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
}

export const IssueList = (props: IIssueListProps) => {
  return <IssueListContainer {...props}>{IssueListView}</IssueListContainer>
}
