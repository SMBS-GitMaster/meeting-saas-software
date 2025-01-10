import React from 'react'

import { type Id } from '@mm/gql'

import type { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import { HeadlinesListContainer } from './headlinesListContainer'
import { HeadlinesListView } from './headlinesListView'

export * from './headlinesListTypes'
export * from './headlinesListView'

interface IHeadlinesListProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
}

export function HeadlinesList(props: IHeadlinesListProps) {
  return (
    <HeadlinesListContainer {...props}>
      {HeadlinesListView}
    </HeadlinesListContainer>
  )
}
