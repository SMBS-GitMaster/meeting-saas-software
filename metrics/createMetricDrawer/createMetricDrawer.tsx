import { observer } from 'mobx-react'
import React from 'react'

import { CreateMetricDrawerContainer } from './createMetricDrawerContainer'
import { ICreateMetricDrawerProps } from './createMetricDrawerTypes'
import { CreateMetricDrawerView } from './createMetricDrawerView'

export const CreateMetricDrawer = observer(function CreateMetricDrawer(
  props: ICreateMetricDrawerProps
) {
  return (
    <CreateMetricDrawerContainer
      meetingId={props.meetingId}
      frequency={props.frequency}
      units={props.units}
      rule={props.rule}
      createAnotherCheckedInDrawer={props.createAnotherCheckedInDrawer}
    >
      {CreateMetricDrawerView}
    </CreateMetricDrawerContainer>
  )
})
