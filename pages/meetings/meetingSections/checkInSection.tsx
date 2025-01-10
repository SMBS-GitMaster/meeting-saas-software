import { observer } from 'mobx-react'
import React from 'react'

import {
  CheckInSectionView,
  ICheckInSectionActionHandlers,
  ICheckInSectionViewData,
} from '@mm/bloom-web/checkIn'

interface ICheckInSectionProps {
  data: ICheckInSectionViewData
  actionHandlers: ICheckInSectionActionHandlers
}
export const CheckInSection = observer(function CheckInSection(
  props: ICheckInSectionProps
) {
  return (
    <CheckInSectionView
      data={props.data}
      actionHandlers={props.actionHandlers}
    />
  )
})
