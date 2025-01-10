import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { DirectReportStatsTileContainer } from './directReportStatsTileContainer'
import { DirectReportStatsTileView } from './directReportStatsTileView'

interface IDirectReportStatsTileProps {
  userId: Maybe<Id>
}

export const DirectReportStatsTile = observer(function DirectReportStatsTile(
  props: IDirectReportStatsTileProps
) {
  return (
    <DirectReportStatsTileContainer userId={props.userId}>
      {DirectReportStatsTileView}
    </DirectReportStatsTileContainer>
  )
})
