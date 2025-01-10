import { observer } from 'mobx-react'
import React from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import {
  type TWorkspaceStatsTileSelectedDateRangeFilter,
  useBloomUserNode,
} from '@mm/core-bloom'

import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { type IWorkspaceStatsTileStatsData } from '@mm/bloom-web/stats'

import type {
  IDirectReportUserTileContainerProps,
  IDirectReportUserTileViewActions,
  IDirectReportUserTileViewData,
} from './directReportUserTileTypes'

export const DirectReportUserTileContainer = observer(
  function DirectReportUserTileContainer(
    props: IDirectReportUserTileContainerProps
  ) {
    const pageState = useObservable<{
      statsData: IWorkspaceStatsTileStatsData
      selectedDateRange: TWorkspaceStatsTileSelectedDateRangeFilter
    }>({
      selectedDateRange: 'QUARTER',
      statsData: {
        goals: [5, 10, 2, 8, 1, 0, 0, 15, 0, 0, 2, 1, 3, 6],
        issues: [1, 1, 4, 2, 7, 4, 8, 12, 0, 0, 1, 7, 4, 0],
        milestones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 2, 4, 6, 8],
        todos: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
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

    const userNode = useBloomUserNode()

    const subscription = useSubscription(
      {
        user: queryDefinition({
          def: userNode,
          map: ({
            id,
            firstName,
            lastName,
            profilePictureUrl,
            userAvatarColor,
          }) => ({
            id,
            firstName,
            lastName,
            profilePictureUrl,
            userAvatarColor,
          }),
          target: { id: props.userId },
          useSubOpts: { doNotSuspend: true },
        }),
      },
      {
        subscriptionId: `DirectReportUserTileContainer-${props.userId}`,
      }
    )

    const onSetDateRange: IDirectReportUserTileViewActions['onSetDateRange'] =
      useAction(
        async (newDateRange: TWorkspaceStatsTileSelectedDateRangeFilter) => {
          pageState.selectedDateRange = newDateRange
        }
      )

    const getData = useComputed(
      () => {
        const user = subscription().data.user
        const data: IDirectReportUserTileViewData = {
          user: user,
          positionTitles: props.positionTitles,
          selectedDateRange: pageState.selectedDateRange,
          statsData: pageState.statsData,
        }
        return data
      },
      {
        name: `DirectReportUserTileContainer-getData`,
      }
    )

    const getActions = useComputed(
      () => {
        const actions: IDirectReportUserTileViewActions = {
          onSetDateRange,
        }
        return actions
      },
      {
        name: `DirectReportUserTileContainer-getActions`,
      }
    )

    return <props.children data={getData} actions={getActions} />
  }
)
