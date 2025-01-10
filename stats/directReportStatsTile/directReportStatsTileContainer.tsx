import { observer } from 'mobx-react'
import React from 'react'

import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'

import type {
  IDirectReportStatsTileActions,
  IDirectReportStatsTileContainerProps,
  IDirectReportStatsTileData,
  IDirectReportStatsTileState,
} from './directReportStatsTileTypes'

export const DirectReportStatsTileContainer = observer(
  function DirectReportStatsTileContainer(
    props: IDirectReportStatsTileContainerProps
  ) {
    const pageState = useObservable<IDirectReportStatsTileState>({
      selectedDateRange: 'MONTH',
      statsData: {
        goals: [5, 10, 2, 8, 1, 0, 0, 15, 0, 0, 2, 1, 3, 6],
        milestones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 2, 4, 6, 8],
        dateRangeLabels: [
          '30 Jun',
          '07 Jul',
          '14 Jul',
          '21 Jul',
          '28 Jul',
          '04 Aug',
          '11 Aug',
          '18 Aug',
          '25 Aug',
          '01 Sep',
          '08 Sep',
          '15 Sep',
          '22 Sep',
          '29 Sep',
        ],
      },
    })

    const onSetDateRange: IDirectReportStatsTileActions['onSetDateRange'] =
      useAction((newDateRange) => {
        pageState.selectedDateRange = newDateRange
      })

    const getData = useComputed(
      () => {
        const data: IDirectReportStatsTileData = {
          pageState,
        }
        return data
      },
      { name: 'DirectReportStatsTileContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        const actions: IDirectReportStatsTileActions = {
          onSetDateRange,
        }
        return actions
      },
      {
        name: `DirectReportStatsTileContainer-getActions`,
      }
    )

    return <props.children data={getData} actions={getActions} />
  }
)
