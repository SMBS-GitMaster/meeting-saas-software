import { observer } from 'mobx-react'
import React from 'react'

import type { Id } from '@mm/gql'

import type { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import { MeetingTodoListContainer } from './meetingTodoListContainer'
import { MeetingTodoListView } from './meetingTodoListView'

interface IMeetingTodoListProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
}

export const MeetingTodoList = observer(function MeetingTodoList(
  props: IMeetingTodoListProps
) {
  return (
    <MeetingTodoListContainer {...props}>
      {MeetingTodoListView}
    </MeetingTodoListContainer>
  )
})
