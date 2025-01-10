import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { type Id } from '@mm/gql'
import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  TMeetingWorkspaceTileType,
  type TWorkspaceTileFromV1ToIgnore,
  getBloomWorkspaceTileTitle,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomUserMutations,
  useBloomWorkspaceMutations,
  useBloomWorkspaceNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'

import { useWorkspaceFullScreenTileController } from './workspaceFullScreenTile/workspaceFullScreenTileController'
import {
  V1_TILES_TO_IGNORE,
  getMeetingWorkspaceTiles,
} from './workspacePageConstants'
import {
  type IWorkspacePageViewActions,
  IWorkspacePageViewData,
  type TWorkspacePageContainerProps,
  type TWorkspacePageTile,
} from './workspacePageTypes'

export const WorkspacePageContainer = observer(function WorkspacePageContainer(
  props: TWorkspacePageContainerProps
) {
  const pageState = useObservable<{
    isLoading: boolean
  }>({
    isLoading: false,
  })

  const bloomMeetingNode = useBloomMeetingNode()
  const bloomWorkspaceNode = useBloomWorkspaceNode()
  const terms = useBloomCustomTerms()
  const { clearWorkspaceTileIds, setWorkspaceTileIds } =
    useWorkspaceFullScreenTileController()
  const { editAuthenticatedUserSettings } = useBloomUserMutations()
  const { editWorkspaceTilePositions } = useBloomWorkspaceMutations()
  const { openOverlazy } = useOverlazyController()
  const { t } = useTranslation()

  const isMeetingWorkspace = props.workspaceType === 'MEETING'
  const workspaceId = isMeetingWorkspace ? null : props.workspaceId

  const querySubscriptionIdEnd = isMeetingWorkspace
    ? `Meeting-${props.meetingId}`
    : `Workspace-${props.workspaceId}`

  const workspaceSubscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ settings }) => ({
          settings,
        }),
      }),
      meeting: isMeetingWorkspace
        ? queryDefinition({
            def: bloomMeetingNode,
            map: ({ meetingType }) => ({
              meetingType: meetingType,
            }),
            useSubOpts: {
              doNotSuspend: true,
            },
            target: {
              id: props.meetingId,
            },
          })
        : null,
      workspace: isMeetingWorkspace
        ? null
        : queryDefinition({
            def: bloomWorkspaceNode,
            map: ({ tiles }) => ({
              tiles: tiles({
                map: ({ tileType, meetingId, positions }) => ({
                  tileType,
                  meetingId,
                  positions,
                }),
              }),
            }),
            useSubOpts: {
              doNotSuspend: true,
            },
            target: {
              id: props.workspaceId,
            },
          }),
    },
    {
      subscriptionId: `WorkspacePageContainer-${querySubscriptionIdEnd}`,
    }
  )

  const workspaceTiles: () => TWorkspacePageTile[] = useComputed(
    () => {
      const meeting = workspaceSubscription().data.meeting
      const workspace = workspaceSubscription().data.workspace

      if (meeting) {
        return getMeetingWorkspaceTiles({
          meetingId: meeting.id,
          meetingType: meeting.meetingType,
          terms,
        })
      } else if (workspace) {
        return workspace.tiles.nodes
          .filter(
            (tile) =>
              !V1_TILES_TO_IGNORE.includes(
                tile.tileType as TWorkspaceTileFromV1ToIgnore
              )
          )
          .map((tile) => {
            const positioningOpts = {
              h: tile.positions.h,
              w: tile.positions.w,
              x: tile.positions.x,
              y: tile.positions.y,
            }

            if (tile.meetingId) {
              return {
                id: tile.id,
                tileType: tile.tileType,
                workspaceType: 'PERSONAL',
                meetingId: tile.meetingId,
                tileTitle: getBloomWorkspaceTileTitle({
                  tileType: tile.tileType,
                  terms,
                }),
                gridstackWidgetOpts: {
                  ...positioningOpts,
                },
              }
            } else {
              return {
                id: tile.id,
                tileType: tile.tileType,
                workspaceType: 'PERSONAL',
                meetingId: null,
                gridstackWidgetOpts: {
                  ...positioningOpts,
                },
              }
            }
          })
      } else {
        return []
      }
    },
    { name: 'WorkspacePageContainer-workspaceTiles' }
  )

  const getWorkspaceFullscreenTileIds = useComputed(
    () => {
      const meeting = workspaceSubscription().data.meeting
      const tilesInWorkspace = workspaceTiles()
      const tileIds: Id[] = []

      if (meeting) {
        const meetingTileTypesInOrder: TMeetingWorkspaceTileType[] = [
          'MEETING_METRICS',
          'MEETING_GOALS',
          'MEETING_TODOS',
          'MEETING_ISSUES',
          'MEETING_HEADLINES',
          'MEETING_NOTES',
          'MEETING_STATS',
        ]

        meetingTileTypesInOrder.forEach((tileType) => {
          const tile = tilesInWorkspace.find((t) => t.tileType === tileType)
          if (tile) {
            tileIds.push(tile.id)
          }
        })
      } else {
        tilesInWorkspace.forEach((t) => {
          tileIds.push(t.id)
        })
      }

      return tileIds
    },
    {
      name: 'WorkspacePageContainer-getMeetingWorkspaceFullscreenTileIds',
    }
  )

  const onEditWorkspaceTilePositions: IWorkspacePageViewActions['onEditWorkspaceTilePositions'] =
    useAction(async (opts) => {
      const workspaceData = workspaceSubscription().data.workspace
      if (workspaceData) {
        try {
          await editWorkspaceTilePositions({
            workspaceId: workspaceData.id,
            tiles: opts.updatedTiles,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue saving the workspace layout`),
            error: new UserActionError(error),
          })
        }
      }
    })

  const onSetPrimaryWorkspace: IWorkspacePageViewActions['onSetPrimaryWorkspace'] =
    useAction(async (opts) => {
      try {
        await editAuthenticatedUserSettings({
          workspaceHomeType: opts.workspaceType,
          workspaceHomeId: opts.meetingOrWorkspaceId,
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t(`Primary workspace set`),
          undoClicked: () => null,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was an issue setting your primary workspace`),
          error: new UserActionError(error),
        })
      }
    })

  const workspaceFullscreenTileIds = getWorkspaceFullscreenTileIds()
  useEffect(() => {
    setWorkspaceTileIds(workspaceFullscreenTileIds)
    return () => {
      clearWorkspaceTileIds()
    }
  }, [workspaceFullscreenTileIds, clearWorkspaceTileIds, setWorkspaceTileIds])

  useEffect(() => {
    runInAction(() => {
      pageState.isLoading = true
    })
    const time = setTimeout(() => {
      runInAction(() => {
        pageState.isLoading = false
      })
    }, 400)
    return () => {
      clearTimeout(time)
    }
  }, [workspaceId])

  const getData = useComputed(
    () => {
      const data: IWorkspacePageViewData = {
        workspaceId: workspaceSubscription().data.workspace?.id ?? null,
        workspaceTiles: workspaceTiles(),
        workspaceHomeId:
          workspaceSubscription().data.currentUser.settings.workspaceHomeId,
      }
      return data
    },
    { name: 'WorkspacePageContainer-getData' }
  )

  const getActions = useComputed(
    () => {
      const actions: IWorkspacePageViewActions = {
        onEditWorkspaceTilePositions,
        onSetPrimaryWorkspace,
      }
      return actions
    },
    {
      name: 'WorkspacePageContainer-getActions',
    }
  )

  if (pageState.isLoading || workspaceSubscription().querying) return null
  return <props.children data={getData} actions={getActions} />
})
