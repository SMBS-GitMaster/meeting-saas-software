import { observer } from 'mobx-react'
import React from 'react'

import type { Id } from '@mm/gql'

import { WorkspacePersonalNotesTileContainer } from './workspacePersonalNotesTileContainer'
import { WorkspacePersonalNotesTileView } from './workspacePersonalNotesTileView'

interface IWorkspacePersonalNotesTileProps {
  workspaceTileId: Id
  workspaceId: Maybe<Id>
  className?: string
}

export const WorkspacePersonalNotesTile = observer(
  function WorkspacePersonalNotesTile(props: IWorkspacePersonalNotesTileProps) {
    return (
      <WorkspacePersonalNotesTileContainer
        workspaceTileId={props.workspaceTileId}
        workspaceId={props.workspaceId}
        className={props.className}
      >
        {WorkspacePersonalNotesTileView}
      </WorkspacePersonalNotesTileContainer>
    )
  }
)
