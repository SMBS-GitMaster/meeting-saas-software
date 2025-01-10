import { observer } from 'mobx-react'
import React from 'react'

import { WorkspaceStatsTileContainer } from './workspaceStatsTileContainer'
import { IWorkspaceStatsTileProps } from './workspaceStatsTileTypes'
import { WorkspaceStatsTileView } from './workspaceStatsTileView'

export const WorkspaceStatsTile = observer(function WorkspaceStatsTile(
  props: IWorkspaceStatsTileProps
) {
  return (
    <WorkspaceStatsTileContainer {...props}>
      {WorkspaceStatsTileView}
    </WorkspaceStatsTileContainer>
  )
})
