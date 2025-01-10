import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import { UnreachableCaseError } from '@mm/gql/exceptions'

import { useDIResolver } from '@mm/core/di/resolver'
import {
  RoutingException,
  RoutingExceptionType,
} from '@mm/core/exceptions/routing'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  IEditBusinessPlanTilePositionsTile,
  TBusinessPlanParentPageType,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomBusinessPlanMutations,
  useBloomMeetingNode,
} from '@mm/core-bloom'

import { useBloomBusinessPlanNode } from '@mm/core-bloom/businessPlan/businessPlanNode'

import { useTranslation } from '@mm/core-web'

import { useCurrentRoute, useNavigation } from '@mm/core-web/router'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { paths } from '@mm/bloom-web/router/paths'

import { useAction, useComputed, useObservable } from '../performance/mobx'
import { getBusinessPlanPermissions } from './businessPlanPermissions'
import {
  EBusinessPlanIssueListColumnSize,
  IBusinessPlanContainerProps,
  IBusinessPlanTileData,
  IBusinessPlanViewActions,
  TBusinessPlanMode,
} from './businessPlanTypes'
import { V3_BUSINESS_PLAN_CREATE_PARAM } from './constants'

export const BusinessPlanContainer = observer(
  (props: IBusinessPlanContainerProps) => {
    const businessPlanNode = useBloomBusinessPlanNode()
    const diResolver = useDIResolver()
    const {
      addListItemToBusinessPlanListCollection,
      createBusinessPlanForMeeting,
      deleteBusinessPlanListItem,
      duplicateBusinessPlanTile,
      editBusinessPlan,
      editBusinessPlanListCollection,
      editBusinessPlanListItem,
      editBusinessPlanTile,
      editBusinessPlanTilePositions,
      sortAndReorderBusinessPlanListItems,
    } = useBloomBusinessPlanMutations()
    const { openOverlazy } = useOverlazyController()

    const { navigate } = useNavigation()
    const { t } = useTranslation()

    const pageState = useObservable({
      businessPlanMode: 'PRESENTATION' as TBusinessPlanMode,
      searchTermForSharedAndUnsharedPlans: '',
      parentPageType: 'FF' as TBusinessPlanParentPageType,
      isLoadingGridstack: false,
      renderPDFPreview: false,
      renderPDFStyles: false,
      issueListColumnSize: EBusinessPlanIssueListColumnSize.One,
    })

    const getCurrentRoute = useCurrentRoute<
      Record<string, never>,
      { businessPlanId: string }
    >()

    const businessPlanId =
      getCurrentRoute().urlParams.businessPlanId ===
      V3_BUSINESS_PLAN_CREATE_PARAM
        ? V3_BUSINESS_PLAN_CREATE_PARAM
        : Number(getCurrentRoute().urlParams.businessPlanId) ||
          getCurrentRoute().urlParams.businessPlanId

    if (!businessPlanId) {
      throw new RoutingException({
        type: RoutingExceptionType.InvalidParams,
        description: 'No business plan id found in the url params',
      })
    }

    const isCreateScreen =
      getCurrentRoute().urlParams.businessPlanId ===
      V3_BUSINESS_PLAN_CREATE_PARAM

    const subscription = useSubscription(
      {
        meetings: queryDefinition({
          def: useBloomMeetingNode(),
          filter: {
            and: [{ businessPlanId: { eq: null } }],
          },
          map: ({ id, name, businessPlanId }) => ({ id, name, businessPlanId }),
        }),
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({
            id,
            isOrgAdmin,
            currentOrgName,
            orgAvatarPictureUrl,
            orgSettings,
          }) => ({
            id,
            isOrgAdmin,
            currentOrgName,
            orgAvatarPictureUrl,
            orgSettings: orgSettings({
              map: ({ v3BusinessPlanId }) => ({ v3BusinessPlanId }),
            }),
          }),
        }),
        businessPlan: !isCreateScreen
          ? queryDefinition({
              def: businessPlanNode,
              map: ({
                dateLastModified,
                createdTime,
                isShared,
                meetingId,
                title,
                currentUserPermissions,
                bpTiles,
              }) => ({
                dateLastModified,
                isShared,
                createdTime,
                meetingId,
                title,
                currentUserPermissions: currentUserPermissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
                // @BLOOM_TODO_BUSINESS_PLAN - https://winterinternational.atlassian.net/browse/CT-77 filters needed
                tiles: bpTiles({
                  map: ({
                    id,
                    isHidden,
                    title,
                    text,
                    tileType,
                    parentPageType,
                    gridStackWidgetOpts,
                    gridStackWidgetPortraitPrintingOpts,
                    gridStackWidgetLandscapePrintingOpts,
                    listCollections,
                  }) => ({
                    id,
                    isHidden,
                    title,
                    text,
                    tileType,
                    parentPageType,
                    gridStackWidgetOpts: gridStackWidgetOpts({
                      map: ({ x, y, h, w }) => ({ x, y, h, w }),
                    }),
                    gridStackWidgetLandscapePrintingOpts:
                      gridStackWidgetLandscapePrintingOpts({
                        map: ({ x, y, h, w }) => ({ x, y, h, w }),
                      }),
                    gridStackWidgetPortraitPrintingOpts:
                      gridStackWidgetPortraitPrintingOpts({
                        map: ({ x, y, h, w }) => ({ x, y, h, w }),
                      }),
                    listCollections: listCollections({
                      map: ({
                        id,
                        title,
                        listItems,
                        isNumberedList,
                        showOwner,
                        listType,
                      }) => ({
                        id,
                        title,
                        isNumberedList,
                        showOwner,
                        listType,
                        listItems: listItems({
                          sort: { sortOrder: 'asc' },
                          filter: { and: [{ deleteTime: { eq: null } }] },
                          map: ({
                            id,
                            textTitle,
                            text,
                            sortOrder,
                            date,
                            listItemType,
                            deleteTime,
                          }) => ({
                            id,
                            textTitle,
                            text,
                            sortOrder,
                            date,
                            listItemType,
                            deleteTime,
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
                // @BLOOM_TODO_BUSINESS_PLAN - https://winterinternational.atlassian.net/browse/CT-77 filters needed
                hiddenTiles: bpTiles({
                  map: ({ id, isHidden, title, tileType }) => ({
                    id,
                    isHidden,
                    title,
                    tileType,
                  }),
                }),
              }),
              target: { id: businessPlanId },
            })
          : null,
      },
      {
        subscriptionId: `businessPlanContainer-${businessPlanId}`,
      }
    )

    const v3BusinessPlanId =
      subscription().data.currentUser.orgSettings.v3BusinessPlanId
    const subscriptionTwo = useSubscription(
      {
        mainOrgBusinessPlan: v3BusinessPlanId
          ? queryDefinition({
              def: businessPlanNode,
              map: ({
                dateLastModified,
                isShared,
                title,
                currentUserPermissions,
                bpTiles,
              }) => ({
                dateLastModified,
                isShared,
                title,
                currentUserPermissions: currentUserPermissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
                // @BLOOM_TODO_BUSINESS_PLAN - https://winterinternational.atlassian.net/browse/CT-77 filters needed
                tiles: bpTiles({
                  map: ({
                    id,
                    isHidden,
                    title,
                    text,
                    tileType,
                    parentPageType,
                    gridStackWidgetOpts,
                    gridStackWidgetLandscapePrintingOpts,
                    gridStackWidgetPortraitPrintingOpts,
                    listCollections,
                  }) => ({
                    id,
                    isHidden,
                    title,
                    text,
                    tileType,
                    parentPageType,
                    gridStackWidgetOpts: gridStackWidgetOpts({
                      map: ({ x, y, h, w }) => ({ x, y, h, w }),
                    }),
                    gridStackWidgetLandscapePrintingOpts:
                      gridStackWidgetLandscapePrintingOpts({
                        map: ({ x, y, h, w }) => ({ x, y, h, w }),
                      }),
                    gridStackWidgetPortraitPrintingOpts:
                      gridStackWidgetPortraitPrintingOpts({
                        map: ({ x, y, h, w }) => ({ x, y, h, w }),
                      }),
                    listCollections: listCollections({
                      map: ({
                        id,
                        title,
                        listItems,
                        isNumberedList,
                        showOwner,
                        listType,
                      }) => ({
                        id,
                        title,
                        isNumberedList,
                        listType,
                        showOwner,
                        listItems: listItems({
                          sort: { sortOrder: 'asc' },
                          filter: { and: [{ deleteTime: { eq: null } }] },
                          map: ({
                            id,
                            textTitle,
                            text,
                            sortOrder,
                            date,
                            listItemType,
                            deleteTime,
                          }) => ({
                            id,
                            textTitle,
                            text,
                            sortOrder,
                            date,
                            listItemType,
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
        subscriptionId: `businessPlanContainerMainSubscriptionTwo-${businessPlanId}`,
      }
    )

    const subscriptionThree = useSubscription(
      {
        businessPlans: queryDefinition({
          def: useBloomBusinessPlanNode(),
          filter: {
            and: [
              {
                title:
                  pageState.searchTermForSharedAndUnsharedPlans !== ''
                    ? {
                        contains: pageState.searchTermForSharedAndUnsharedPlans,
                      }
                    : undefined,
              },
            ],
          },
          map: ({ id, title, isShared, currentUserPermissions }) => ({
            id,
            title,
            isShared,
            currentUserPermissions: currentUserPermissions({
              map: ({ view, edit, admin }) => ({ view, edit, admin }),
            }),
          }),
          useSubOpts: { doNotSuspend: true },
          pagination: {
            includeTotalCount: true,
          },
        }),
      },
      {
        subscriptionId: `businessPlanContainerMainSubscriptionThree-${businessPlanId}`,
      }
    )

    const getCurrentUserPermissions = useComputed(
      () => {
        return getBusinessPlanPermissions({
          currentUserPermissions:
            subscription().data.businessPlan?.currentUserPermissions ?? null,

          isOrgAdmin: subscription().data.currentUser.isOrgAdmin,
        })
      },
      {
        name: `businessPlanContainer-getCurrentUserPermissions`,
      }
    )

    const getMeetingsLookupForCreateBusinessPlan = useComputed(
      () => {
        return subscription().data.meetings.nodes.map((meeting) => {
          return {
            value: meeting.id,
            text: meeting.name,
          }
        })
      },
      { name: `businessPlanContainer-getMeetingsLookupForCreateBusinessPlan` }
    )

    // @BLOOM_TODO_BUSINESS_PLAN https://winterinternational.atlassian.net/browse/CT-77 need BE filters here
    const getHiddenTiles = useComputed(
      () => {
        const businessPlan = subscription().data.businessPlan

        return !businessPlan
          ? []
          : businessPlan.hiddenTiles.nodes.filter((tile) => {
              // Note - we don't allow hidden core values tiles on the main org plan.
              if (
                businessPlan.isMainOrgBusinessPlan({
                  v3BusinessPlanId:
                    subscription().data.currentUser.orgSettings
                      .v3BusinessPlanId,
                }) &&
                tile.tileType === 'CORE_VALUES'
              ) {
                return false
              } else {
                return tile.isHidden
              }
            })
      },
      {
        name: `businessPlanContainer-getHiddenTiles`,
      }
    )

    const getMainOrgBusinessPlanCoreValuesTileData = useComputed(
      () => {
        const mainOrgBusinessPlan = subscriptionTwo().data.mainOrgBusinessPlan

        if (!mainOrgBusinessPlan) return null

        const mainOrgBusinessPlanCoreValuesTileData =
          mainOrgBusinessPlan.tiles.nodes.find((tileData) => {
            return tileData.tileType === 'CORE_VALUES'
          })

        if (!mainOrgBusinessPlanCoreValuesTileData) return null

        return mainOrgBusinessPlanCoreValuesTileData
      },
      {
        name: 'businessPlanContainer-getMainOrgBusinessPlanCoreValues',
      }
    )

    const getBusinessPlanCoreValuesTileData = useComputed(
      () => {
        const businessPlan = subscription().data.businessPlan

        if (!businessPlan) return null

        const businessPlanCoreValuesTileData = businessPlan.tiles.nodes.find(
          (tileData) => {
            return tileData.tileType === 'CORE_VALUES'
          }
        )

        if (!businessPlanCoreValuesTileData) return null

        return businessPlanCoreValuesTileData
      },
      {
        name: 'businessPlanContainer-getBusinessPlanCoreValuesTileData',
      }
    )

    // @BLOOM_TODO_BUSINESS_PLAN https://winterinternational.atlassian.net/browse/CT-77 need BE filters here
    const getGridstackMetadata = useComputed(
      () => {
        const businessPlan = subscription().data.businessPlan

        if (!businessPlan) return []

        const gridstackMetadata = businessPlan.tiles.nodes
          .filter((tileData) => {
            // Note - if this is the main org business plan, and this is a core values tile, we do not allow it to be hidden.
            if (
              businessPlan.isMainOrgBusinessPlan({
                v3BusinessPlanId:
                  subscription().data.currentUser.orgSettings.v3BusinessPlanId,
              }) &&
              tileData.tileType === 'CORE_VALUES'
            ) {
              return tileData.parentPageType === pageState.parentPageType
            }
            // Note - If we have a main org plan set, and this is the core values tile, filter out that tile.
            else if (
              tileData.tileType === 'CORE_VALUES' &&
              subscription().data.currentUser.orgSettings.v3BusinessPlanId
            ) {
              return false
            } else {
              return (
                tileData.parentPageType === pageState.parentPageType &&
                !tileData.isHidden
              )
            }
          })
          .map((tileData) => {
            return {
              id: tileData.id,
              tileType: tileData.tileType,
              gridStackWidgetOpts: {
                h: tileData.gridStackWidgetOpts.h,
                w: tileData.gridStackWidgetOpts.w,
                x: tileData.gridStackWidgetOpts.x,
                y: tileData.gridStackWidgetOpts.y,
              },
            }
          })

        // Note - if this is the main bp, we didn't filter out the core values tile so good to return all data.
        if (
          businessPlan.isMainOrgBusinessPlan({
            v3BusinessPlanId:
              subscription().data.currentUser.orgSettings.v3BusinessPlanId,
          })
        ) {
          return gridstackMetadata
        } else {
          const mainOrgBusinessPlanCoreValuesTileData =
            getMainOrgBusinessPlanCoreValuesTileData()

          const currentBusinessPlanCoreValuesTileData =
            getBusinessPlanCoreValuesTileData()

          if (
            !mainOrgBusinessPlanCoreValuesTileData ||
            !currentBusinessPlanCoreValuesTileData ||
            currentBusinessPlanCoreValuesTileData.parentPageType !==
              pageState.parentPageType
          )
            return gridstackMetadata

          // Note - if this is not the main org plan, this is the core values tile, and its hidden, do not add it.
          if (
            currentBusinessPlanCoreValuesTileData.isHidden &&
            !businessPlan.isMainOrgBusinessPlan({
              v3BusinessPlanId:
                subscription().data.currentUser.orgSettings.v3BusinessPlanId,
            })
          ) {
            return gridstackMetadata
          }

          // Note - if this is not the main org business plan, we want to augment the tile data with the core values from the main bp if it exists.
          // We also want the ability to edit the tile position and page without augmenting the current main org bp tile data, so we store the
          // gridstackWidgetOpts & parentPageType on the coreValues tiles on the current plan.
          const mainOrgBusinessPlanCoreValuesTileGridstackMetadata = {
            id: mainOrgBusinessPlanCoreValuesTileData.id,
            tileType: mainOrgBusinessPlanCoreValuesTileData.tileType,
            gridStackWidgetOpts: {
              h: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.h,
              w: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.w,
              x: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.x,
              y: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.y,
            },
            disabled: false,
          }

          const gridstackMetadataWithCoreValuesMetadata = [
            ...gridstackMetadata,
            mainOrgBusinessPlanCoreValuesTileGridstackMetadata,
          ]

          return gridstackMetadataWithCoreValuesMetadata
        }
      },
      { name: 'businessPlanContainer-getGridstackMetadata' }
    )

    const getRecordOfTileIdToTileData = useComputed(
      () => {
        const businessPlan = subscription().data.businessPlan

        if (!businessPlan) {
          return {}
        }

        const recordOfTileIdToTileMetadata = businessPlan.tiles.nodes.reduce(
          (acc, tileData) => {
            // Note - if this is the main org plan and the core values tile, we do not allow it to be hidden.
            if (
              tileData.tileType === 'CORE_VALUES' &&
              businessPlan.isMainOrgBusinessPlan({
                v3BusinessPlanId:
                  subscription().data.currentUser.orgSettings.v3BusinessPlanId,
              })
            ) {
              acc[tileData.id] = tileData
              return acc
            }

            if (tileData.isHidden) {
              return acc
            }

            acc[tileData.id] = tileData
            return acc
          },
          {} as Record<Id, IBusinessPlanTileData>
        )

        // Note - if this is the main bp, we didn't filter out the core values tile so good to return all data.
        if (
          businessPlan.isMainOrgBusinessPlan({
            v3BusinessPlanId:
              subscription().data.currentUser.orgSettings.v3BusinessPlanId,
          })
        ) {
          return recordOfTileIdToTileMetadata
        } else {
          // Note - if this is not the main org business plan, we want to augment the tile data with the core values from the main bp if it exists.
          const mainOrgBusinessPlanCoreValuesTileData =
            getMainOrgBusinessPlanCoreValuesTileData()

          const currentBusinessPlanCoreValuesTileData =
            getBusinessPlanCoreValuesTileData()

          if (
            !mainOrgBusinessPlanCoreValuesTileData ||
            !currentBusinessPlanCoreValuesTileData
          )
            return recordOfTileIdToTileMetadata

          return {
            ...recordOfTileIdToTileMetadata,
            [mainOrgBusinessPlanCoreValuesTileData.id]: {
              ...mainOrgBusinessPlanCoreValuesTileData,
              // Note: we want the ability to augment and store the gridstackWidgetOpts & parentPageType on the coreValues tiles on the current plan
              // without chaging the mainOrgBusinessPlan. So we store the parentPageType and gridstackWidgetOpts on the current plan core values tile since
              // we do not use it for anything unless its the main org plan.
              // Here, we add that data to the coreValues data so it can be independently edited.
              gridStackWidgetOpts: {
                x: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.x,
                y: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.y,
                h: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.h,
                w: currentBusinessPlanCoreValuesTileData.gridStackWidgetOpts.w,
              },
              parentPageType:
                currentBusinessPlanCoreValuesTileData.parentPageType,
            },
          }
        }
      },
      { name: `businessPlanContainer-getRecordOfTileIdToTileData` }
    )

    // Note - this is a hack to force the useComputed for getCurrentUserBusinessPlansAndSharedOrgPlans to rerender.
    // We had an issue where it would not recalculate when the businessPlans are filtered by the searchTermForSharedAndUnsharedPlans.
    // This is a fix to force it to recalculate.
    const lengthOfSharedAndUnsharedPlans =
      subscriptionThree().data.businessPlans?.nodes.length
    const getCurrentUserBusinessPlansAndSharedOrgPlans = useComputed(
      () => {
        const currentUsersBusinessPlans = (
          subscriptionThree().data.businessPlans?.nodes || []
        ).filter((bp) => {
          const isMainOrgPlan = bp.isMainOrgBusinessPlan({
            v3BusinessPlanId:
              subscription().data.currentUser.orgSettings.v3BusinessPlanId,
          })
          if (isMainOrgPlan) return false

          return bp.currentUserPermissions !== null
        })

        const sharedOrgPlans = (
          subscriptionThree().data.businessPlans?.nodes || []
        ).filter((bp) => {
          const isMainOrgPlan = bp.isMainOrgBusinessPlan({
            v3BusinessPlanId:
              subscription().data.currentUser.orgSettings.v3BusinessPlanId,
          })
          if (isMainOrgPlan) return false

          return bp.currentUserPermissions === null && bp.isShared
        })

        return { currentUsersBusinessPlans, sharedOrgPlans }
      },
      {
        name: 'businessPlanContainer-getCurrentBusinessPlansAndSharedOrgPlansForCurrentUser',
      }
    )

    const getTotalCountOfAllBusinessPlans = useComputed(
      () => {
        const totalCountOfBusinessPlans =
          subscriptionThree().data.businessPlans?.totalCount || 0

        const totalCountOfMainBp = subscriptionTwo().data.mainOrgBusinessPlan
          ? 1
          : 0

        const totalCount = totalCountOfBusinessPlans + totalCountOfMainBp

        return totalCount
      },
      { name: `businessPlanContainer-getTotalCountOfAllBusinessPlans` }
    )

    const onHandleSetBusinessPlanMode: IBusinessPlanViewActions['onHandleSetBusinessPlanMode'] =
      useAction((businessPlanMode) => {
        pageState.businessPlanMode = businessPlanMode
      })

    const onHandleSetCurrentParentPage: IBusinessPlanViewActions['onHandleSetCurrentParentPage'] =
      useAction((parentPageType) => {
        pageState.parentPageType = parentPageType
        pageState.isLoadingGridstack = true

        // Note - we need to render a loader while the parentPageType is being set and loading.
        // the grid renders an empty tile on the top left and it looks glitchy, this prevents that.
        setTimeout(() => {
          runInAction(() => {
            pageState.isLoadingGridstack = false
          })
        }, 300)
      })

    const onHandleUpdateIssueListColumnSize: IBusinessPlanViewActions['onHandleUpdateIssueListColumnSize'] =
      useAction((issueListColumnSize) => {
        return (pageState.issueListColumnSize = issueListColumnSize)
      })

    const onHandleSetSearchTermForSharedAndUnsharedPlans: IBusinessPlanViewActions['onHandleSetSearchTermForSharedAndUnsharedPlans'] =
      useAction((searchTerm) => {
        pageState.searchTermForSharedAndUnsharedPlans = searchTerm
      })

    const onHandleEnterPDFPreview: IBusinessPlanViewActions['onHandleEnterPDFPreview'] =
      useAction(async () => {
        pageState.renderPDFPreview = true
        pageState.businessPlanMode = 'EDIT'
      })

    const onHandleRenderPDFStyles: IBusinessPlanViewActions['onHandleRenderPDFStyles'] =
      useAction((showStyles: boolean) => {
        pageState.renderPDFStyles = showStyles
      })

    const onHandleExitPDFPreview: IBusinessPlanViewActions['onHandleExitPDFPreview'] =
      useAction(async () => {
        pageState.renderPDFPreview = false
      })

    const onHandleSaveBusinessPlanTitle: IBusinessPlanViewActions['onHandleSaveBusinessPlanTitle'] =
      useAction(async ({ title, businessPlanId }) => {
        try {
          await editBusinessPlan({ businessPlanId, title })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing title.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleShareBusinessPlan: IBusinessPlanViewActions['onHandleShareBusinessPlan'] =
      useAction(async ({ isShared, businessPlanId }) => {
        try {
          await editBusinessPlan({ businessPlanId, isShared })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error sharing plan.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleRestoreHiddenTile: IBusinessPlanViewActions['onHandleRestoreHiddenTile'] =
      useAction(async ({ tileId }) => {
        try {
          const businessPlanId = subscription().data.businessPlan?.id

          if (!businessPlanId) return
          await editBusinessPlanTile({
            businessPlanId,
            tileId,
            isHidden: false,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error restoring tile.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleNavigateToBusinessPlan: IBusinessPlanViewActions['onHandleNavigateToBusinessPlan'] =
      useAction(({ businessPlanId }) => {
        pageState.businessPlanMode = 'PRESENTATION'
        return navigate(paths.businessPlan({ businessPlanId }))
      })

    const onHandleCreateBusinessPlanForMeeting: IBusinessPlanViewActions['onHandleCreateBusinessPlanForMeeting'] =
      useAction(async ({ meetingId }) => {
        try {
          const businessPlanId = await createBusinessPlanForMeeting({
            meetingId,
          })
          onHandleNavigateToBusinessPlan({ businessPlanId })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error creating plan.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleEditBusinessPlanTilePositions: IBusinessPlanViewActions['onHandleEditBusinessPlanTilePositions'] =
      useAction(async (opts) => {
        const businessPlanId = subscription().data.businessPlan?.id
        // Note - if we are in pdf preview mode, we don't want to save the tile positions.
        // we save them in the pdfPreviewContainer - just being safe here.
        if (pageState.renderPDFPreview) {
          return
        }

        const mainOrgBusinessPlanCoreValuesTileData =
          getMainOrgBusinessPlanCoreValuesTileData()
        const currentBusinessPlanCoreValuesTileData =
          getBusinessPlanCoreValuesTileData()

        // Note - if we are editing the positions of the coreValues tile, we want to edit the core values tile that belongs to the current
        // businessPlan, not the main org plan. That way we can augment the tile poisition for core values without altering the main org plan.
        const updatedTilesWithCoreValuesIdsSwapped = opts.updatedTiles.reduce(
          (acc, item) => {
            if (
              !mainOrgBusinessPlanCoreValuesTileData ||
              !currentBusinessPlanCoreValuesTileData
            ) {
              acc.push(item)
              return acc
            }

            // If this is the main org plan, the mainOrgBusinessPlanCoreValuesTileData.id and currentBusinessPlanCoreValuesTileData.id will be the same.
            if (item.id === mainOrgBusinessPlanCoreValuesTileData.id) {
              acc.push({
                ...item,
                id: currentBusinessPlanCoreValuesTileData.id,
              })
            } else {
              acc.push(item)
            }

            return acc
          },
          [] as Array<IEditBusinessPlanTilePositionsTile>
        )

        if (businessPlanId) {
          try {
            await editBusinessPlanTilePositions({
              businessPlanId,
              tiles: updatedTilesWithCoreValuesIdsSwapped,
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`There was an issue saving the plan layout.`),
              error: new UserActionError(error),
            })
          }
        }
      })

    const onHandleDuplicateTile: IBusinessPlanViewActions['onHandleDuplicateTile'] =
      useAction(async (tileId) => {
        try {
          const businessPlanId = subscription().data.businessPlan?.id

          if (!businessPlanId) return

          await duplicateBusinessPlanTile({
            tileId,
            businessPlanId,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error duplicating tile.`),
            error: new UserActionError(error),
          })
        }
      })

    const onHandleRenameTile: IBusinessPlanViewActions['onHandleRenameTile'] =
      useAction(async ({ tileId, title }) => {
        try {
          const businessPlanId = subscription().data.businessPlan?.id

          if (!businessPlanId) return
          await editBusinessPlanTile({ businessPlanId, tileId, title })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing tile.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleEditBusinessPlanTileText: IBusinessPlanViewActions['onHandleEditBusinessPlanTileText'] =
      useAction(async ({ tileId, text }) => {
        try {
          const businessPlanId = subscription().data.businessPlan?.id

          if (!businessPlanId) return
          await editBusinessPlanTile({ businessPlanId, tileId, text })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing tile.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleMoveTileToOtherPage: IBusinessPlanViewActions['onHandleMoveTileToOtherPage'] =
      useAction(async ({ tileId, isCoreValuesTile, newParentPageType }) => {
        try {
          const businessPlanId = subscription().data.businessPlan?.id

          let tileIdToSendWithCoreValuesConsideration = tileId
          if (isCoreValuesTile) {
            const mainOrgBusinessPlanCoreValuesTileData =
              getMainOrgBusinessPlanCoreValuesTileData()
            const currentBusinessPlanCoreValuesTileData =
              getBusinessPlanCoreValuesTileData()

            if (
              tileId === mainOrgBusinessPlanCoreValuesTileData?.id &&
              currentBusinessPlanCoreValuesTileData
            ) {
              // If this is the main org plan, the mainOrgBusinessPlanCoreValuesTileData.id and currentBusinessPlanCoreValuesTileData.id will be the same.
              tileIdToSendWithCoreValuesConsideration =
                currentBusinessPlanCoreValuesTileData.id
            }
          }

          if (!businessPlanId) return
          await editBusinessPlanTile({
            businessPlanId,
            tileId: tileIdToSendWithCoreValuesConsideration,
            parentPageType: newParentPageType,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing tile.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleHideTile: IBusinessPlanViewActions['onHandleHideTile'] =
      useAction(async ({ tileId, tileType }) => {
        try {
          let tileIdWithCoreValuesSwappingConsideration = tileId
          if (tileType === 'CORE_VALUES') {
            const mainOrgBusinessPlanCoreValuesTileData =
              getMainOrgBusinessPlanCoreValuesTileData()

            const currentBusinessPlanCoreValuesTileData =
              getBusinessPlanCoreValuesTileData()

            if (
              mainOrgBusinessPlanCoreValuesTileData &&
              currentBusinessPlanCoreValuesTileData
            ) {
              tileIdWithCoreValuesSwappingConsideration =
                currentBusinessPlanCoreValuesTileData.id
            }
          }

          const businessPlanId = subscription().data.businessPlan?.id

          if (!businessPlanId) return
          await editBusinessPlanTile({
            businessPlanId,
            tileId: tileIdWithCoreValuesSwappingConsideration,
            isHidden: true,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error hiding tile.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleEditNumberedOrBulletedListCollection: IBusinessPlanViewActions['onHandleEditNumberedOrBulletedListCollection'] =
      useAction(
        async ({ listCollectionId, tileId, values, onListItemCreated }) => {
          try {
            const businessPlanId = subscription().data.businessPlan?.id
            if (!businessPlanId) return

            if (values.title) {
              await editBusinessPlanListCollection({
                listCollectionId,
                businessPlanId,
                title: values.title,
              })
            }

            if (!values.listItems || values.listItems.length === 0) {
              return
            }

            await Promise.all(
              values.listItems.map(async (listItem) => {
                switch (listItem.action) {
                  case 'ADD': {
                    const id = await addListItemToBusinessPlanListCollection({
                      businessPlanId,
                      listCollectionId,
                      tileId,
                      text: listItem.item.text,
                      sortOrder: listItem.item.sortOrder ?? undefined,
                      listItemType: listItem.item.listItemType,
                    })
                    return onListItemCreated({
                      temporaryId: listItem.item.id,
                      itemId: id,
                    })
                  }
                  case 'UPDATE': {
                    return await editBusinessPlanListItem({
                      businessPlanId,
                      listItemId: listItem.item.id,
                      text: listItem.item.text ?? undefined,
                    })
                  }
                  case 'REMOVE': {
                    return await deleteBusinessPlanListItem({
                      businessPlanId,
                      listCollectionId,
                      tileId,
                      listItemId: listItem.item.id,
                    })
                  }
                  default: {
                    throwLocallyLogInProd(
                      diResolver,
                      new UnreachableCaseError({
                        eventType: listItem,
                        errorMessage: `The action ${listItem} does not exist in onHandleEditListCollection for businessPlanContainer.tsx`,
                      } as never)
                    )
                  }
                }
              })
            )
          } catch (e) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error editing tile.`),
              error: new UserActionError(e),
            })
          }
        }
      )

    const onHandleEditBusinessPlanGoalOptionsMenuItems: IBusinessPlanViewActions['onHandleEditBusinessPlanGoalOptionsMenuItems'] =
      useAction(async ({ listCollectionId, values }) => {
        try {
          const businessPlanId = subscription().data.businessPlan?.id
          if (!businessPlanId) return

          await editBusinessPlanListCollection({
            listCollectionId,
            businessPlanId,
            showOwner: values.showOwner,
            isNumberedList: values.showNumberedList,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing tile.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleEditTitledListCollection: IBusinessPlanViewActions['onHandleEditTitledListCollection'] =
      useAction(
        async ({ listCollectionId, tileId, values, onListItemCreated }) => {
          try {
            const businessPlanId = subscription().data.businessPlan?.id
            if (!businessPlanId) return

            if (values.title) {
              await editBusinessPlanListCollection({
                listCollectionId,
                businessPlanId,
                title: values.title,
              })
            }

            if (!values.listItems || values.listItems.length === 0) {
              return
            }

            await Promise.all(
              values.listItems.map(async (listItem) => {
                switch (listItem.action) {
                  case 'ADD': {
                    const id = await addListItemToBusinessPlanListCollection({
                      businessPlanId,
                      listCollectionId,
                      tileId,
                      listItemType: listItem.item.listItemType,
                      text: listItem.item.text ?? undefined,
                      textTitle: listItem.item.textTitle ?? undefined,
                      sortOrder: listItem.item.sortOrder ?? undefined,
                      date: listItem.item.date ?? undefined,
                    })

                    return onListItemCreated({
                      temporaryId: listItem.item.id,
                      itemId: id,
                    })
                  }
                  case 'UPDATE': {
                    return await editBusinessPlanListItem({
                      businessPlanId,
                      listItemId: listItem.item.id,
                      textTitle: listItem.item.textTitle ?? undefined,
                      text: listItem.item.text ?? undefined,
                      date: listItem.item.date ?? undefined,
                    })
                  }
                  case 'REMOVE': {
                    return await deleteBusinessPlanListItem({
                      businessPlanId,
                      listCollectionId,
                      tileId,
                      listItemId: listItem.item.id,
                    })
                  }
                  default: {
                    throwLocallyLogInProd(
                      diResolver,
                      new UnreachableCaseError({
                        eventType: listItem,
                        errorMessage: `The action ${listItem} does not exist in onHandleEditListCollection for businessPlanContainer.tsx`,
                      } as never)
                    )
                  }
                }
              })
            )
          } catch (e) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error editing tile.`),
              error: new UserActionError(e),
            })
          }
        }
      )

    const onHandleEditTextListCollection: IBusinessPlanViewActions['onHandleEditTextListCollection'] =
      useAction(
        async ({ listCollectionId, tileId, values, onListItemCreated }) => {
          try {
            const businessPlanId = subscription().data.businessPlan?.id
            if (!businessPlanId) return

            if (values.title) {
              await editBusinessPlanListCollection({
                listCollectionId,
                businessPlanId,
                title: values.title,
              })
            }

            if (!values.listItems || values.listItems.length === 0) {
              return
            }

            await Promise.all(
              values.listItems.map(async (listItem) => {
                switch (listItem.action) {
                  case 'ADD': {
                    const id = await addListItemToBusinessPlanListCollection({
                      businessPlanId,
                      listCollectionId,
                      tileId,
                      text: listItem.item.text ?? undefined,
                      sortOrder: listItem.item.sortOrder ?? undefined,
                      listItemType: listItem.item.listItemType,
                    })

                    return onListItemCreated({
                      temporaryId: listItem.item.id,
                      itemId: id,
                    })
                  }
                  case 'UPDATE': {
                    return await editBusinessPlanListItem({
                      businessPlanId,
                      listItemId: listItem.item.id,
                      text: listItem.item.text ?? undefined,
                    })
                  }
                  case 'REMOVE': {
                    return await deleteBusinessPlanListItem({
                      businessPlanId,
                      listCollectionId,
                      tileId,
                      listItemId: listItem.item.id,
                    })
                  }
                  default: {
                    throwLocallyLogInProd(
                      diResolver,
                      new UnreachableCaseError({
                        eventType: listItem,
                        errorMessage: `The action ${listItem} does not exist in onHandleEditListCollection for businessPlanContainer.tsx`,
                      } as never)
                    )
                  }
                }
              })
            )
          } catch (e) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error editing tile.`),
              error: new UserActionError(e),
            })
          }
        }
      )

    const onHandleCreateContextAwareIssueFromBusinessPlan: IBusinessPlanViewActions['onHandleCreateContextAwareIssueFromBusinessPlan'] =
      useAction(({ context, meetingId }) => {
        openOverlazy('CreateIssueDrawer', {
          meetingId,
          context,
          initialItemValues: {
            title: context.title,
          },
        })
      })

    const onHandleSortAndReorderBusinessPlanListItems: IBusinessPlanViewActions['onHandleSortAndReorderBusinessPlanListItems'] =
      useAction(async ({ listItemId, listCollectionId, tileId, sortOrder }) => {
        try {
          const businessPlanId = subscription().data.businessPlan?.id
          if (!businessPlanId) return

          await sortAndReorderBusinessPlanListItems({
            businessPlanId,
            listItemId,
            listCollectionId,
            tileId,
            sortOrder,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error sorting items.`),
            error: new UserActionError(e),
          })
        }
      })

    const getData = useComputed(
      () => {
        return {
          currentOrgAvatar:
            subscription().data.currentUser.orgAvatarPictureUrl || null,
          currentOrgName: subscription().data.currentUser.currentOrgName,
          businessPlan: subscription().data.businessPlan,
          getCurrentUserBusinessPlansAndSharedOrgPlans,
          getCurrentUserPermissions,
          getGridstackMetadata,
          getHiddenTiles,
          getMainOrgBusinessPlanCoreValuesTileData,
          getBusinessPlanCoreValuesTileData,
          getMeetingsLookupForCreateBusinessPlan,
          getRecordOfTileIdToTileData,
          getTotalCountOfAllBusinessPlans,
          isLoadingFirstSubscription: subscription().querying,
          isLoadingSecondSubscription: subscriptionTwo().querying,
          lengthOfSharedAndUnsharedPlans,
          mainOrgBusinessPlan: subscriptionTwo().data.mainOrgBusinessPlan,
          pageState,
          v3BusinessPlanId:
            subscription().data.currentUser.orgSettings.v3BusinessPlanId,
        }
      },
      { name: 'businessPlanContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        return {
          onHandleCreateContextAwareIssueFromBusinessPlan,
          onHandleCreateBusinessPlanForMeeting,
          onHandleDuplicateTile,
          onHandleEditBusinessPlanGoalOptionsMenuItems,
          onHandleEditBusinessPlanTilePositions,
          onHandleEditBusinessPlanTileText,
          onHandleEditTitledListCollection,
          onHandleEditNumberedOrBulletedListCollection,
          onHandleEditTextListCollection,
          onHandleHideTile,
          onHandleMoveTileToOtherPage,
          onHandleNavigateToBusinessPlan,
          onHandleEnterPDFPreview,
          onHandleExitPDFPreview,
          onHandleRenameTile,
          onHandleRenderPDFStyles,
          onHandleRestoreHiddenTile,
          onHandleSaveBusinessPlanTitle,
          onHandleSetCurrentParentPage,
          onHandleSetBusinessPlanMode,
          onHandleShareBusinessPlan,
          onHandleSetSearchTermForSharedAndUnsharedPlans,
          onHandleSortAndReorderBusinessPlanListItems,
          onHandleUpdateIssueListColumnSize,
        }
      },
      { name: 'businessPlanContainer-getActions' }
    )

    return (
      <props.children
        isCreateScreen={isCreateScreen}
        getData={getData}
        getActions={getActions}
      />
    )
  }
)
