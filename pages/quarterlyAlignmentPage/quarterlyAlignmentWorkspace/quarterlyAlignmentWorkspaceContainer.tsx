import { observer } from 'mobx-react'
import React from 'react'

import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { ROLES_TILE_GRIDSTACK_EXPANDED_HEIGHT } from '@mm/bloom-web/roles'

import {
  CORE_VALUES_TILE_EXPANDED_HEIGHT,
  QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_COLLAPSED_HEIGHT,
  USER_METRICS_TILE_RR_TAB_ID,
  USER_ROLES_TILE_RR_TAB_ID,
  USER_TODOS_TILE_RR_TAB_ID,
} from './constants'
import type {
  IQuarterlyAlignmentWorkspaceActions,
  IQuarterlyAlignmentWorkspaceContainerProps,
  IQuarterlyAlignmentWorkspaceData,
  IQuarterlyAlignmentWorkspaceTile,
  TQuarterlyAlignmentWorkspaceTabType,
} from './quarterlyAlignmentWorkspaceTypes'

export const QuarterlyAlignmentWorkspaceContainer = observer(
  function QuarterlyAlignmentWorkspaceContainer(
    props: IQuarterlyAlignmentWorkspaceContainerProps
  ) {
    const pageState = useObservable({
      currentTab: 'PRIORITIES' as TQuarterlyAlignmentWorkspaceTabType,
    })

    const getTilesBasedOnCurrentTab = useComputed(
      (): IQuarterlyAlignmentWorkspaceTile[] => {
        switch (pageState.currentTab) {
          case 'PRIORITIES':
            return [
              {
                id: 'user-profile-tile-priorities',
                tileType: 'USER_PROFILE',
                gridstackWidgetOpts: {
                  x: 0,
                  y: 0,
                  h: 6,
                  w: 3,
                },
              },
              {
                id: 'direct-report-',
                tileType: 'DIRECT_REPORT_STATS',
                gridstackWidgetOpts: {
                  x: 0,
                  y: 6,
                  h: 12,
                  w: 3,
                },
              },
              {
                id: 'mock-goal-tile-1',
                tileType: 'PERSONAL_GOALS',
                gridstackWidgetOpts: {
                  x: 4,
                  y: 0,
                  h: 12,
                  w: 9,
                },
              },
            ]

          case 'R&R':
            return [
              {
                id: 'user-profile-tile-rr',
                tileType: 'USER_PROFILE',
                gridstackWidgetOpts: {
                  x: 0,
                  y: 0,
                  h: 6,
                  w: 3,
                },
              },
              {
                id: USER_ROLES_TILE_RR_TAB_ID,
                tileType: 'ROLES',
                gridstackWidgetOpts: {
                  x: 3,
                  y: 0,
                  h: ROLES_TILE_GRIDSTACK_EXPANDED_HEIGHT,
                  w: 9,
                },
              },
              {
                id: USER_TODOS_TILE_RR_TAB_ID,
                tileType: 'PERSONAL_TODOS',
                gridstackWidgetOpts: {
                  x: 3,
                  y: 1,
                  h: QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_COLLAPSED_HEIGHT,
                  w: 9,
                },
              },
              {
                id: USER_METRICS_TILE_RR_TAB_ID,
                tileType: 'PERSONAL_METRICS',
                gridstackWidgetOpts: {
                  x: 3,
                  y: 2,
                  h: 12,
                  w: 9,
                },
              },
            ]

          case 'CULTURE':
            return [
              {
                id: 'user-profile-tile-culture',
                tileType: 'USER_PROFILE',
                gridstackWidgetOpts: {
                  x: 0,
                  y: 0,
                  h: 6,
                  w: 3,
                },
              },
              {
                id: 'core-values-tile',
                tileType: 'VALUES',
                gridstackWidgetOpts: {
                  x: 4,
                  y: 0,
                  h: CORE_VALUES_TILE_EXPANDED_HEIGHT,
                  w: 9,
                },
              },
            ]

          default:
            return []
        }
      },
      { name: 'QuarterlyAlignmentPageContainer-getTilesBasedOnCurrentTab' }
    )

    const onHandleSetCurrentTab = useAction(
      (newTab: TQuarterlyAlignmentWorkspaceTabType) => {
        pageState.currentTab = newTab
      }
    )

    const getData = useComputed(
      () => {
        const data: IQuarterlyAlignmentWorkspaceData = {
          alignmentUser: props.data().alignmentUser,
          meetingId: props.data().meetingId,
          pageState,
          tiles: getTilesBasedOnCurrentTab,
        }
        return data
      },
      {
        name: `QuarterlyAlignmentWorkspaceContainer-getData`,
      }
    )

    const getActions = useComputed(
      () => {
        const actions: IQuarterlyAlignmentWorkspaceActions = {
          onHandleSetCurrentTab,
        }
        return actions
      },
      {
        name: `QuarterlyAlignmentWorkspaceContainer-getActions`,
      }
    )

    return <props.children data={getData} actions={getActions} />
  }
)
