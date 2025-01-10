import { observer } from 'mobx-react'
import React from 'react'

import { DirectReportUserTileContainer } from './directReportUserTileContainer'
import { IDirectReportUserTileContainerProps } from './directReportUserTileTypes'
import { DirectReportUserTileView } from './directReportUserTileView'

interface IDirectReportUserTileProps {
  userId: IDirectReportUserTileContainerProps['userId']
  positionTitles: IDirectReportUserTileContainerProps['positionTitles']
}

export const DirectReportUserTile = observer(function DirectReportUserTile(
  props: IDirectReportUserTileProps
) {
  return (
    <DirectReportUserTileContainer
      userId={props.userId}
      positionTitles={props.positionTitles}
    >
      {DirectReportUserTileView}
    </DirectReportUserTileContainer>
  )
})
