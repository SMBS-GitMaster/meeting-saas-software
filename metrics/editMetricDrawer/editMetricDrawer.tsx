import { observer } from 'mobx-react'
import React from 'react'
import { type Id } from '@mm/gql'

import { EditMetricDrawerContainer } from './editMetricDrawerContainer'
import { EditMetricDrawerView } from './editMetricDrawerView'

export interface IEditMetricDrawerProps {
  metricId: Id
  meetingId: Maybe<Id>
}

export const EditMetricDrawer = observer(function EditMetricDrawer(
  props: IEditMetricDrawerProps
) {
  return (
    <EditMetricDrawerContainer
      metricId={props.metricId}
      meetingId={props.meetingId}
    >
      {EditMetricDrawerView}
    </EditMetricDrawerContainer>
  )
})
