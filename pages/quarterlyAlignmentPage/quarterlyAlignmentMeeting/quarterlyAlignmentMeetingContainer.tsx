import { observer } from 'mobx-react'
import React from 'react'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import type {
  IQuarterlyAlignmentMeetingActions,
  IQuarterlyAlignmentMeetingContainerProps,
  IQuarterlyAlignmentMeetingData,
} from './quarterlyAlignmentMeetingTypes'

export const QuarterlyAlignmentMeetingContainer = observer(
  function QuarterlyAlignmentMeetingContainer(
    props: IQuarterlyAlignmentMeetingContainerProps
  ) {
    const getData = useComputed(
      () => {
        const data: IQuarterlyAlignmentMeetingData = {
          mockPropString: 'Quarterly Alignment Meeting Tab',
        }
        return data
      },
      {
        name: `QuarterlyAlignmentMeetingContainer-getData`,
      }
    )

    const getActions = useComputed(
      () => {
        const actions: IQuarterlyAlignmentMeetingActions = {}
        return actions
      },
      {
        name: `QuarterlyAlignmentMeetingContainer-getActions`,
      }
    )

    return <props.children data={getData} actions={getActions} />
  }
)
