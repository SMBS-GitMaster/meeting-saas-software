import { observer } from 'mobx-react'
import React from 'react'

import { Id } from '@mm/gql'

import { CoreValuesContainer } from './coreValuesContainer'
import { CoreValuesView } from './coreValuesView'

interface ICoreValuesProps {
  workspaceTileId: Id
  expandableTileOptions?: {
    expandedHeight: number
    collapsedHeight: number
    isInitiallyExpanded: boolean
    onHandleUpdateTileHeight: (opts: { tileId: Id; height: number }) => void
  }
  // Allows for viewing tile in full screen and deleting the tile
  displayTileWorkspaceOptions?: boolean
  className?: string
}

export const CoreValues = observer(function CoreValues(
  props: ICoreValuesProps
) {
  return <CoreValuesContainer {...props}>{CoreValuesView}</CoreValuesContainer>
})
