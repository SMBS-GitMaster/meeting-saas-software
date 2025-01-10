import React from 'react'

import { Id } from '@mm/gql'

import type { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import { MeetingGoalsListContainer } from './meetingGoalsListContainer'
import { MeetingGoalsListView } from './meetingGoalsListView'

export function MeetingGoalsList(props: {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
}) {
  return (
    <MeetingGoalsListContainer {...props}>
      {MeetingGoalsListView}
    </MeetingGoalsListContainer>
  )
}
