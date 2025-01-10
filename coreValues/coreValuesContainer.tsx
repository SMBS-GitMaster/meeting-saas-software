import { observer } from 'mobx-react'
import React from 'react'

import { queryDefinition, useObservable, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomBusinessPlanNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction, useComputed } from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'

import {
  ICoreValuesContainerProps,
  ICoreValuesViewActions,
} from './coreValuesTypes'

export const CoreValuesContainer = observer(function CoreValuesContainer(
  props: ICoreValuesContainerProps
) {
  const pageState = useObservable<{ isTileExpanded: boolean }>({
    isTileExpanded: props.expandableTileOptions?.isInitiallyExpanded ?? true,
  })

  const businessPlanNode = useBloomBusinessPlanNode()
  const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
  const { editWorkspaceTile } = useBloomWorkspaceMutations()
  const { openOverlazy } = useOverlazyController()
  const { t } = useTranslation()

  const isExpandedOnWorkspacePage =
    activeFullScreenTileId !== null &&
    activeFullScreenTileId === props.workspaceTileId

  const subscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ id, orgSettings }) => ({
          id,
          orgSettings: orgSettings({
            map: ({ v3BusinessPlanId }) => ({ v3BusinessPlanId }),
          }),
        }),
      }),
    },
    {
      subscriptionId: `CoreValuesContainer`,
    }
  )

  const v3BusinessPlanId =
    subscription().data.currentUser.orgSettings.v3BusinessPlanId
  const subscriptionTwo = useSubscription(
    {
      mainOrgBusinessPlan: v3BusinessPlanId
        ? queryDefinition({
            def: businessPlanNode,
            map: ({ bpTiles }) => ({
              tiles: bpTiles({
                map: ({ id, tileType, listCollections }) => ({
                  id,
                  tileType,
                  listCollections: listCollections({
                    map: ({ id, listItems }) => ({
                      id,
                      listItems: listItems({
                        sort: { sortOrder: 'asc' },
                        filter: { and: [{ deleteTime: { eq: null } }] },
                        map: ({ id, text, sortOrder, deleteTime }) => ({
                          id,
                          text,
                          sortOrder,
                          deleteTime,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
            target: {
              id: v3BusinessPlanId,
            },
            useSubOpts: { doNotSuspend: true },
          })
        : null,
    },
    {
      subscriptionId: `CoreValuesContainerMainOrgBusinessPlanSubscription`,
    }
  )

  const getMainOrgCoreValues = useComputed(
    () => {
      const mainOrgBusinessPlan = subscriptionTwo().data.mainOrgBusinessPlan

      if (!mainOrgBusinessPlan) return null

      const mainOrgBusinessPlanCoreValuesTileData =
        mainOrgBusinessPlan.tiles.nodes.find((tileData) => {
          return tileData.tileType === 'CORE_VALUES'
        })

      if (!mainOrgBusinessPlanCoreValuesTileData) return null

      // Note: A core values tile will only have one listCollection that contains the core values data.
      const listCollectionForCoreValues =
        mainOrgBusinessPlanCoreValuesTileData.listCollections.nodes[0]

      if (!listCollectionForCoreValues) return null

      return listCollectionForCoreValues
    },
    {
      name: 'coreValuesContainer-getMainOrgBusinessPlanCoreValues',
    }
  )

  const onDeleteTile: ICoreValuesViewActions['onDeleteTile'] = useAction(
    async () => {
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
  )

  const onHandleToggleIsTileExpanded = useAction(() => {
    pageState.isTileExpanded = !pageState.isTileExpanded

    if (props.expandableTileOptions) {
      props.expandableTileOptions.onHandleUpdateTileHeight({
        height: pageState.isTileExpanded
          ? props.expandableTileOptions.expandedHeight
          : props.expandableTileOptions.collapsedHeight,
        tileId: props.workspaceTileId,
      })
    }
  })

  const getData = useComputed(
    () => ({
      displayTileWorkspaceOptions: !!props.displayTileWorkspaceOptions,
      getMainOrgCoreValues,
      isExpandableTile: !!props.expandableTileOptions,
      isExpandedOnWorkspacePage,
      isLoading: subscription().querying,
      pageState,
      workspaceTileId: props.workspaceTileId,
    }),
    {
      name: `CoreValuesContainer-getData`,
    }
  )

  const getActions = useComputed(
    () => ({
      onDeleteTile,
      onHandleToggleIsTileExpanded,
    }),
    {
      name: `CoreValuesContainer-getActions`,
    }
  )

  const CoreValuesView = (
    <props.children
      className={props.className}
      data={getData}
      actions={getActions}
    />
  )

  if (isExpandedOnWorkspacePage) {
    return (
      <WorkspaceFullScreenTilePortal>
        {CoreValuesView}
      </WorkspaceFullScreenTilePortal>
    )
  } else {
    return CoreValuesView
  }
})
