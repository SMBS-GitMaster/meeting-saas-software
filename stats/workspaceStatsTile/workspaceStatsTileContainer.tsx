import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  TWorkspaceStatsTileSelectedDateRangeFilter,
  TWorkspaceStatsTileSelectedNodeFilter,
  useBloomMeetingNode,
  useBloomWorkspaceMutations,
  useBloomWorkspaceQueries,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'

import {
  DEFAULT_STATS,
  getNodeStatsQueryOptsForDateRange,
  getStatsTileDataFromQueryResponse,
} from './workspaceStatsTileConstants'
import {
  IWorkspaceStatsTileActions,
  IWorkspaceStatsTileContainerProps,
  IWorkspaceStatsTileStatsData,
} from './workspaceStatsTileTypes'

export const WorkspaceStatsTileContainer = observer(
  function WorkspaceStatsTileContainer(
    props: IWorkspaceStatsTileContainerProps
  ) {
    const pageState = useObservable<{
      statsData: IWorkspaceStatsTileStatsData
    }>({
      statsData: DEFAULT_STATS,
    })

    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { getNodeCompletionStats } = useBloomWorkspaceQueries()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const subscription = useSubscription(
      {
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ name, workspace }) => ({
            name,
            workspace: workspace({
              map: ({ tiles }) => ({
                tiles: tiles({
                  map: ({ tileType, tileSettings }) => ({
                    tileType,
                    tileSettings,
                  }),
                }),
              }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
          target: { id: props.meetingId },
        }),
      },
      {
        subscriptionId: `WorkspaceStatsTileContainer-${props.meetingId}`,
      }
    )

    const isExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const getStatsTileNode = useComputed(
      () => {
        return subscription().data.meeting?.workspace.tiles.nodes.find(
          (t) => t.tileType === 'MEETING_STATS'
        )
      },
      { name: 'WorkspaceStatsTileContainer-statsTileNode' }
    )

    const getSelectedDateRange: () => TWorkspaceStatsTileSelectedDateRangeFilter =
      useComputed(
        () => {
          return (
            getStatsTileNode()?.tileSettings.selectedStatsTileDateRange ??
            'MONTH'
          )
        },
        { name: 'WorkspaceStatsTileContainer-selectedDateRange' }
      )

    const getSelectedNodes: () => Array<TWorkspaceStatsTileSelectedNodeFilter> =
      useComputed(
        () => {
          return (
            getStatsTileNode()?.tileSettings.selectedStatsTileNodes ?? [
              'GOALS',
              'ISSUES',
              'MILESTONES',
              'TODOS',
            ]
          )
        },
        { name: 'WorkspaceStatsTileContainer-selectedNodes' }
      )

    const onAddStatsNodeFilter: IWorkspaceStatsTileActions['onAddStatsNodeFilter'] =
      useAction(async (nodeToAdd: TWorkspaceStatsTileSelectedNodeFilter) => {
        const statsTileNode = getStatsTileNode()

        if (statsTileNode) {
          try {
            const currentSelectedNodes = getSelectedNodes()
            const updatedNodes = [...currentSelectedNodes, nodeToAdd]

            await editWorkspaceTile({
              id: statsTileNode.id,
              meetingId: props.meetingId,
              tileSettings: {
                ...statsTileNode.tileSettings,
                selectedStatsTileNodes: updatedNodes,
              },
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error saving your stats filters`),
              error: new UserActionError(error),
            })
          }
        }
      })

    const onRemoveStatsNodeFilter: IWorkspaceStatsTileActions['onRemoveStatsNodeFilter'] =
      useAction(async (nodeToRemove: TWorkspaceStatsTileSelectedNodeFilter) => {
        const statsTileNode = getStatsTileNode()

        if (statsTileNode) {
          try {
            const currentSelectedNodes = getSelectedNodes()
            const updatedNodes = currentSelectedNodes.filter(
              (node) => node !== nodeToRemove
            )

            await editWorkspaceTile({
              id: statsTileNode.id,
              meetingId: props.meetingId,
              tileSettings: {
                ...statsTileNode.tileSettings,
                selectedStatsTileNodes: updatedNodes,
              },
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error saving your stats filters`),
              error: new UserActionError(error),
            })
          }
        }
      })

    const onSetDateRange: IWorkspaceStatsTileActions['onSetDateRange'] =
      useAction(
        async (newDateRange: TWorkspaceStatsTileSelectedDateRangeFilter) => {
          const statsTileNode = getStatsTileNode()

          if (statsTileNode) {
            try {
              await editWorkspaceTile({
                id: statsTileNode.id,
                meetingId: props.meetingId,
                tileSettings: {
                  ...statsTileNode.tileSettings,
                  selectedStatsTileDateRange: newDateRange,
                },
              })
            } catch (error) {
              openOverlazy('Toast', {
                type: 'error',
                text: t(`Error saving your stats filters`),
                error: new UserActionError(error),
              })
            }
          }
        }
      )

    const onDeleteTile: IWorkspaceStatsTileActions['onDeleteTile'] = useAction(
      async () => {
        if (props.workspaceTileId) {
          try {
            await editWorkspaceTile({
              id: props.workspaceTileId,
              meetingId: null,
              archived: true,
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`There was an issue deleting the tile`),
              error: new UserActionError(error),
            })
            throw error
          }
        }
      }
    )

    const fetchMilestoneStats = useAction(async () => {
      const currentDateRange = getSelectedDateRange()

      const queryOpts = getNodeStatsQueryOptsForDateRange({
        selectedDateRange: currentDateRange,
      })

      const queryResponse = await getNodeCompletionStats({
        ...queryOpts,
        recurrenceId: props.meetingId,
      })

      const stats = getStatsTileDataFromQueryResponse({
        selectedDateRange: currentDateRange,
        queryResponse,
      })

      runInAction(() => {
        pageState.statsData = stats
      })
    })

    const selectedDateRange = getSelectedDateRange()
    useEffect(() => {
      fetchMilestoneStats()
    }, [selectedDateRange, fetchMilestoneStats])

    const statsViewData = useComputed(
      () => {
        return {
          className: props.className,
          workspaceTileId: props.workspaceTileId,
          workspaceType: props.workspaceType,
          meeting: subscription().data.meeting || { name: '' },
          statsData: pageState.statsData,
          statsTileSettings: {
            getSelectedNodes,
            getSelectedDateRange,
          },
        }
      },
      { name: 'WorkspaceStatsTileContainer-statsViewData' }
    )

    const statsViewActions = useComputed(
      () => ({
        onAddStatsNodeFilter,
        onRemoveStatsNodeFilter,
        onSetDateRange,
        onDeleteTile,
      }),
      {
        name: `WorkspaceStatsTileContainer-statsViewActions`,
      }
    )

    const WorkspaceStatsTileView = (
      <props.children data={statsViewData} actions={statsViewActions} />
    )

    if (isExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {WorkspaceStatsTileView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return WorkspaceStatsTileView
    }
  }
)
