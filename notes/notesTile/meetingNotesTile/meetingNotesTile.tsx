import { observer } from 'mobx-react'
import React from 'react'

import { Id } from '@mm/gql'

import { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import { MeetingNotesTileContainer } from './meetingNotesTileContainer'
import { MeetingNotesTileView } from './meetingNotesTileView'

interface IMeetingNotesTileProps {
  workspaceTileId: Maybe<Id>
  meetingId: Id
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
}

export const MeetingNotesTile = observer(function MeetingNotesTile(
  props: IMeetingNotesTileProps
) {
  return (
    <MeetingNotesTileContainer {...props}>
      {MeetingNotesTileView}
    </MeetingNotesTileContainer>
  )
})
