import { observer } from 'mobx-react'
import React from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomOrgChartNode,
  useBloomUserNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

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
  ROLES_TILE_GRIDSTACK_COLLAPSED_HEIGHT,
  ROLES_TILE_GRIDSTACK_EXPANDED_HEIGHT,
} from './rolesTileConstants'
import type {
  IPositionRolesDatum,
  IRolesTileActions,
  IRolesTileContainerProps,
  IRolesTileData,
} from './rolesTileTypes'

export const RolesTileContainer = observer(function RolesTileContainer(
  props: IRolesTileContainerProps
) {
  const pageState = useObservable<{
    isRolesListExpanded: boolean
  }>({
    isRolesListExpanded: true,
  })

  const authenticatedBloomUserNode = useAuthenticatedBloomUserQueryDefinition
  const orgChartNode = useBloomOrgChartNode()
  const userNode = useBloomUserNode()
  const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
  const { editWorkspaceTile } = useBloomWorkspaceMutations()
  const { openOverlazy } = useOverlazyController()
  const { t } = useTranslation()

  const isExpandedInWorkspace =
    activeFullScreenTileId !== null &&
    activeFullScreenTileId === props.workspaceTileId

  const userSub = useSubscription(
    {
      user: props.userId
        ? queryDefinition({
            def: userNode,
            target: { id: props.userId },
            useSubOpts: {
              doNotSuspend: true,
            },
            map: ({ orgChartId }) => ({
              orgChartId,
            }),
          })
        : authenticatedBloomUserNode({
            useSubOpts: {
              doNotSuspend: true,
            },
            map: ({ orgChartId }) => ({
              orgChartId,
            }),
          }),
    },
    {
      subscriptionId: `RolesTileContainer-userSub-${props.workspaceTileId}`,
    }
  )

  const orgChartId = userSub().data.user?.orgChartId

  const orgChartSub = useSubscription(
    {
      orgChart: orgChartId
        ? queryDefinition({
            def: orgChartNode,
            map: ({ seats }) => ({
              seats: seats({
                map: ({ position, users }) => ({
                  position: position({
                    map: ({ title, roles }) => ({
                      title,
                      roles: roles({ map: ({ name }) => ({ name }) }),
                    }),
                  }),
                  users: users({ map: ({ id }) => ({ id }) }),
                }),
              }),
            }),
            useSubOpts: { doNotSuspend: true },
            target: { id: orgChartId },
          })
        : null,
    },
    {
      subscriptionId: `RolesTileContainer-orgChartSub-${orgChartId}`,
    }
  )

  const getPositionRolesData = useComputed(
    () => {
      const userId = userSub().data.user?.id
      const orgChartSeats = orgChartSub().data.orgChart?.seats
      const positionData: Array<IPositionRolesDatum> = []

      if (!userId || !orgChartSeats) {
        return positionData
      }

      orgChartSeats.nodes.forEach((orgChartSeat) => {
        const userIsInSeat = orgChartSeat.users.nodes.some(
          (user) => user.id === userId
        )
        if (userIsInSeat) {
          positionData.push({
            positionTitle:
              orgChartSeat.position?.title || t(`No position title set`),
            roles: orgChartSeat.position?.roles.map((r) => r.name) ?? [],
          })
        }
      })

      return positionData
    },
    {
      name: `RolesTileContainer-getPositionRolesData-${props.workspaceTileId}`,
    }
  )

  const onDeleteTile: IRolesTileActions['onDeleteTile'] = useAction(
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

  const onHandleTileExpand: IRolesTileActions['onHandleTileExpand'] = useAction(
    () => {
      const isRolesListExpandedNewValue = !pageState.isRolesListExpanded
      pageState.isRolesListExpanded = isRolesListExpandedNewValue

      props.onHandleUpdateTileHeight({
        tileId: props.workspaceTileId,
        height: isRolesListExpandedNewValue
          ? ROLES_TILE_GRIDSTACK_EXPANDED_HEIGHT
          : ROLES_TILE_GRIDSTACK_COLLAPSED_HEIGHT,
      })
    }
  )

  const getData = useComputed(
    () => {
      const data: IRolesTileData = {
        isLoading: userSub().querying || orgChartSub().querying,
        workspaceTileId: props.workspaceTileId,
        isViewingCurrentUser: props.userId === null,
        isExpandedInWorkspace,
        isRolesListExpanded: pageState.isRolesListExpanded,
        getPositionRolesData,
      }
      return data
    },
    {
      name: `RolesTileContainer-getData`,
    }
  )

  const getActions = useComputed(
    () => {
      const actions: IRolesTileActions = {
        onDeleteTile,
        onHandleTileExpand,
      }
      return actions
    },
    {
      name: `RolesTileContainer-getActions`,
    }
  )

  const RolesTileView = <props.children data={getData} actions={getActions} />

  if (isExpandedInWorkspace) {
    return (
      <WorkspaceFullScreenTilePortal>
        {RolesTileView}
      </WorkspaceFullScreenTilePortal>
    )
  } else {
    return RolesTileView
  }
})
