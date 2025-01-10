import html2pdf from 'html2pdf.js'
import { observer } from 'mobx-react'
import React from 'react'

import { Id } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useDocument } from '@mm/core/ssr'

import {
  IEditBusinessPlanTilePositionsTile,
  useBloomBusinessPlanMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useAction, useComputed, useObservable } from '../../performance/mobx'
import {
  IBusinessPlanTileData,
  IBusinessPlanViewActions,
} from '../businessPlanTypes'
import { BUSINESS_PLAN_PDF_CONTENT } from '../constants'
import {
  recordOfTileTypeToGridStackWidgetLandscapePrintingOptsDefaults,
  recordOfTileTypeToGridStackWidgetPortraitPrintingOptsDefaults,
} from '../lookups'
import {
  IBusinessPlanPdfPreviewContainerProps,
  IBusinessPlanPdfPreviewViewActions,
  TBusinessPlanPdfPageLayout,
} from './businessPlanPdfPreviewTypes'

export const BusinessPlanPdfPreviewContainer = observer(
  (props: IBusinessPlanPdfPreviewContainerProps) => {
    const document = useDocument()
    const {
      editBusinessPlanTileLandscapePdfPositions,
      editBusinessPlanTilePortraitPdfPositions,
    } = useBloomBusinessPlanMutations()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const pdfPageState = useObservable({
      pdfPreviewPageLayout: 'PORTRAIT' as TBusinessPlanPdfPageLayout,
    })

    const { getBusinessPlanData, getTileToRender, getBusinessPlanActions } =
      props

    // @BLOOM_TODO_BUSINESS_PLAN https://winterinternational.atlassian.net/browse/CT-77 need BE filters here
    const getGridstackMetadata = useComputed(
      () => {
        const businessPlan = getBusinessPlanData().businessPlan

        if (!businessPlan) return []

        const gridstackMetadata = businessPlan.tiles.nodes
          .filter((tileData) => {
            // Note - if this is the main org business plan, and this is a core values tile, we do not allow it to be hidden.
            if (
              businessPlan.isMainOrgBusinessPlan({
                v3BusinessPlanId: getBusinessPlanData().v3BusinessPlanId,
              }) &&
              tileData.tileType === 'CORE_VALUES'
            ) {
              return true
            } else if (
              // Note - if this is not the main org business plan, and this is a core values tile, we want to filter it out.
              // We do not want to show the UI placeholder here.
              !businessPlan.isMainOrgBusinessPlan({
                v3BusinessPlanId: getBusinessPlanData().v3BusinessPlanId,
              }) &&
              tileData.tileType === 'CORE_VALUES'
            ) {
              return false
            } else {
              return !tileData.isHidden
            }
          })
          .map((tileData) => {
            return {
              id: tileData.id,
              tileType: tileData.tileType,
              gridStackWidgetOpts: {
                h:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? tileData.gridStackWidgetPortraitPrintingOpts.h
                    : tileData.gridStackWidgetLandscapePrintingOpts.h,
                w:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? tileData.gridStackWidgetPortraitPrintingOpts.w
                    : tileData.gridStackWidgetLandscapePrintingOpts.w,
                x:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? tileData.gridStackWidgetPortraitPrintingOpts.x
                    : tileData.gridStackWidgetLandscapePrintingOpts.x,
                y:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? tileData.gridStackWidgetPortraitPrintingOpts.y
                    : tileData.gridStackWidgetLandscapePrintingOpts.y,
              },
            }
          })

        // Note - if this is the main bp, we didn't filter out the core values tile so good to return all data.
        if (
          businessPlan.isMainOrgBusinessPlan({
            v3BusinessPlanId: getBusinessPlanData().v3BusinessPlanId,
          })
        ) {
          return gridstackMetadata
        } else {
          // Note - if this is not the main org business plan, we want to augment the tile data with the core values from the main bp if it exists.
          // We also want the ability to edit the tile position and page without augmenting the current main org bp tile data, so we store the
          // gridstackWidgetOpts & parentPageType on the coreValues tiles on the current plan.
          const mainOrgBusinessPlanCoreValuesTileData =
            getBusinessPlanData().getMainOrgBusinessPlanCoreValuesTileData()

          const currentBusinessPlanCoreValuesTileData =
            getBusinessPlanData().getBusinessPlanCoreValuesTileData()

          if (
            !mainOrgBusinessPlanCoreValuesTileData ||
            !currentBusinessPlanCoreValuesTileData
          )
            return gridstackMetadata

          // Note - if this is not the main org plan, this is the core values tile, and its hidden, do not add it.
          if (
            currentBusinessPlanCoreValuesTileData.isHidden &&
            !businessPlan.isMainOrgBusinessPlan({
              v3BusinessPlanId: getBusinessPlanData().v3BusinessPlanId,
            })
          ) {
            return gridstackMetadata
          }

          const mainOrgBusinessPlanCoreValuesTileGridstackMetadata = {
            id: mainOrgBusinessPlanCoreValuesTileData.id,
            tileType: mainOrgBusinessPlanCoreValuesTileData.tileType,
            gridStackWidgetOpts: {
              h:
                pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                  ? currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetPortraitPrintingOpts.h
                  : currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetLandscapePrintingOpts.h,
              w:
                pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                  ? currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetPortraitPrintingOpts.w
                  : currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetLandscapePrintingOpts.w,
              x:
                pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                  ? currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetPortraitPrintingOpts.x
                  : currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetLandscapePrintingOpts.x,
              y:
                pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                  ? currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetPortraitPrintingOpts.y
                  : currentBusinessPlanCoreValuesTileData
                      .gridStackWidgetLandscapePrintingOpts.y,
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
      { name: 'businessPlanPdfPreviewContainer-getGridstackMetadata' }
    )

    const getRecordOfTileIdToTileData = useComputed(
      () => {
        const businessPlan = getBusinessPlanData().businessPlan

        if (!businessPlan) {
          return {}
        }

        const recordOfTileIdToTileMetadata = businessPlan.tiles.nodes.reduce(
          (acc, tileData) => {
            // Note - if this is the main org plan and the core values tile, we do not allow it to be hidden.
            if (
              tileData.tileType === 'CORE_VALUES' &&
              businessPlan.isMainOrgBusinessPlan({
                v3BusinessPlanId: getBusinessPlanData().v3BusinessPlanId,
              })
            ) {
              acc[tileData.id] = tileData
              return acc
            }
            // Note - if this is not the main org business plan, and this is a core values tile, we want to filter it out.
            // This is because the core values tile is a special tile that is shared across all business plans from main org plan.
            if (
              !businessPlan.isMainOrgBusinessPlan({
                v3BusinessPlanId: getBusinessPlanData().v3BusinessPlanId,
              }) &&
              tileData.tileType === 'CORE_VALUES'
            ) {
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
            v3BusinessPlanId: getBusinessPlanData().v3BusinessPlanId,
          })
        ) {
          return recordOfTileIdToTileMetadata
        } else {
          // Note - if this is not the main org business plan, we want to augment the tile data with the core values from the main bp if it exists.
          const mainOrgBusinessPlanCoreValuesTileData =
            getBusinessPlanData().getMainOrgBusinessPlanCoreValuesTileData()

          const currentBusinessPlanCoreValuesTileData =
            getBusinessPlanData().getBusinessPlanCoreValuesTileData()

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
                h:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetPortraitPrintingOpts.h
                    : currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetLandscapePrintingOpts.h,
                w:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetPortraitPrintingOpts.w
                    : currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetLandscapePrintingOpts.w,
                x:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetPortraitPrintingOpts.x
                    : currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetLandscapePrintingOpts.x,
                y:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetPortraitPrintingOpts.y
                    : currentBusinessPlanCoreValuesTileData
                        .gridStackWidgetLandscapePrintingOpts.y,
              },
              parentPageType:
                currentBusinessPlanCoreValuesTileData.parentPageType,
            },
          }
        }
      },
      { name: `businessPlanPdfPreviewContainer-getRecordOfTileIdToTileData` }
    )

    const onHandleSetPdfPreviewPageLayout: IBusinessPlanPdfPreviewViewActions['onHandleSetPdfPreviewPageLayout'] =
      useAction((pageLayout) => {
        pdfPageState.pdfPreviewPageLayout = pageLayout
      })

    const onHandleDownloadPDF: IBusinessPlanPdfPreviewViewActions['onHandleDownloadPDF'] =
      useAction(async () => {
        try {
          getBusinessPlanActions().onHandleRenderPDFStyles(true)

          setTimeout(() => {
            const element = document.getElementById(BUSINESS_PLAN_PDF_CONTENT)

            if (!element) {
              return openOverlazy('Toast', {
                type: 'error',
                text: t(`Error downloading PDF.`),
                error: new UserActionError(
                  t('No content found for PDF download.')
                ),
              })
            }

            const opts = {
              margin: 0,
              filename: 'businessPlan.pdf',
              html2canvas: {
                scale: 2,
                letterRendering: true,
                useCORS: true,
                allowTaint: true,
              },
              image: { type: 'png', quality: 0.98 },
              jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation:
                  pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
                    ? 'portrait'
                    : 'landscape',
              },
            }
            html2pdf()
              .from(element)
              .set(opts)
              .save()
              .then(() => {
                getBusinessPlanActions().onHandleRenderPDFStyles(false)
              })
          }, 0)
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error downloading PDF.`),
            error: new UserActionError(e),
          })
        }
      })

    const onHandleEditBusinessPlanTilePositions: IBusinessPlanViewActions['onHandleEditBusinessPlanTilePositions'] =
      useAction(async (opts) => {
        const businessPlanId = getBusinessPlanData().businessPlan?.id

        const mainOrgBusinessPlanCoreValuesTileData =
          getBusinessPlanData().getMainOrgBusinessPlanCoreValuesTileData()
        const currentBusinessPlanCoreValuesTileData =
          getBusinessPlanData().getBusinessPlanCoreValuesTileData()

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
            pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
              ? await editBusinessPlanTilePortraitPdfPositions({
                  businessPlanId,
                  tiles: updatedTilesWithCoreValuesIdsSwapped,
                })
              : await editBusinessPlanTileLandscapePdfPositions({
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

    const onHandleResetPdfLayout: IBusinessPlanPdfPreviewViewActions['onHandleResetPdfLayout'] =
      useAction(() => {
        const resetTilePositions: Array<IEditBusinessPlanTilePositionsTile> =
          getGridstackMetadata().map((tile) => {
            if (pdfPageState.pdfPreviewPageLayout === 'LANDSCAPE') {
              return {
                id: tile.id,
                x: recordOfTileTypeToGridStackWidgetLandscapePrintingOptsDefaults[
                  tile.tileType
                ].x,
                y: recordOfTileTypeToGridStackWidgetLandscapePrintingOptsDefaults[
                  tile.tileType
                ].y,
                h: recordOfTileTypeToGridStackWidgetLandscapePrintingOptsDefaults[
                  tile.tileType
                ].h,
                w: recordOfTileTypeToGridStackWidgetLandscapePrintingOptsDefaults[
                  tile.tileType
                ].w,
              }
            } else {
              return {
                id: tile.id,
                x: recordOfTileTypeToGridStackWidgetPortraitPrintingOptsDefaults[
                  tile.tileType
                ].x,
                y: recordOfTileTypeToGridStackWidgetPortraitPrintingOptsDefaults[
                  tile.tileType
                ].y,
                h: recordOfTileTypeToGridStackWidgetPortraitPrintingOptsDefaults[
                  tile.tileType
                ].h,
                w: recordOfTileTypeToGridStackWidgetPortraitPrintingOptsDefaults[
                  tile.tileType
                ].w,
              }
            }
          })

        return onHandleEditBusinessPlanTilePositions({
          updatedTiles: resetTilePositions,
        })
      })

    const getData = useComputed(
      () => {
        return {
          ...getBusinessPlanData(),
          getTileToRender,
          getGridstackMetadata,
          getRecordOfTileIdToTileData,
          pdfPageState,
        }
      },
      { name: 'businessPlanPdfPreviewContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        return {
          ...getBusinessPlanActions(),
          onHandleDownloadPDF,
          onHandleEditBusinessPlanTilePositions,
          onHandleSetPdfPreviewPageLayout,
          onHandleResetPdfLayout,
        }
      },
      { name: 'businessPlanPdfPreviewContainer-getActions' }
    )

    return <props.children getData={getData} getActions={getActions} />
  }
)
