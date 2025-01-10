import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { createRef, useEffect, useRef } from 'react'
import { css } from 'styled-components'

import { IEditBusinessPlanTilePositionsTile } from '@mm/core-bloom'

import { Card, toREM } from '@mm/core-web/ui'

import { useAction, useObservable } from '../performance/mobx'
import { IBusinessPlanTilesGridProps } from './businessPlanTypes'
import {
  BUSINESS_PLAN_GRID_INIT_OPTS,
  BUSINESS_PLAN_GRID_INIT_OPTS_PDF_PREVIEW,
} from './constants'

export const BusinessPlanTilesGrid = observer(function BusinessPlanTilesGrid(
  props: IBusinessPlanTilesGridProps
) {
  const pageState = useObservable<{
    isDragOrResizing: boolean
  }>({
    isDragOrResizing: false,
  })

  const gridRef = useRef<GridStack>()
  const tileRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})

  const { getData, getTileToRender, getActions, pdfPreview } = props

  getData()
    .getGridstackMetadata()
    .forEach((tileData) => {
      tileRefs.current[tileData.id] =
        tileRefs.current[tileData.id] || createRef()
    })

  const handleTilePositioningUpdate = useAction(
    async (opts: {
      updatedTiles: Array<IEditBusinessPlanTilePositionsTile>
    }) => {
      await getActions().onHandleEditBusinessPlanTilePositions({
        updatedTiles: opts.updatedTiles,
      })
    }
  )

  const gridInitOpts = pdfPreview
    ? BUSINESS_PLAN_GRID_INIT_OPTS_PDF_PREVIEW
    : BUSINESS_PLAN_GRID_INIT_OPTS
  const isEditMode = getData().pageState.businessPlanMode === 'EDIT'

  useEffect(() => {
    if (!gridRef.current) {
      gridRef.current = GridStack.init(
        gridInitOpts,
        `.controlled_${pdfPreview ? 'pdf-preview' : 'grid'}`
      )
      const grid = gridRef.current

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      grid.on('change', async function (_: Event) {
        const isFullScreenView = grid.getColumn() !== 1
        const gridItems = grid.getGridItems()

        if (isFullScreenView && gridItems.length) {
          const updatedTiles: IEditBusinessPlanTilePositionsTile[] = []

          gridItems.forEach((gI) => {
            updatedTiles.push({
              id: gI.id,
              x: gI.gridstackNode?.x ?? 0,
              y: gI.gridstackNode?.y ?? 0,
              h: gI.gridstackNode?.h ?? 8,
              w: gI.gridstackNode?.w ?? 4,
            })
          })

          await handleTilePositioningUpdate({ updatedTiles })
        }
      })

      grid.on('dragstart', function () {
        runInAction(() => {
          pageState.isDragOrResizing = true
        })
      })

      grid.on('dragstop', function () {
        runInAction(() => {
          pageState.isDragOrResizing = false
        })
      })

      grid.on('resizestart', function () {
        runInAction(() => {
          pageState.isDragOrResizing = true
        })
      })

      grid.on('resizestop', function () {
        runInAction(() => {
          pageState.isDragOrResizing = false
        })
      })

      return () => {
        if (gridRef.current) {
          gridRef.current.destroy(true)
        }
      }
    }
  }, [getData().businessPlan?.id, gridInitOpts, handleTilePositioningUpdate])

  const gridItems = getData().getGridstackMetadata()
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.batchUpdate()
      gridRef.current.removeAll(false)

      gridItems.forEach((tileData) => {
        const itemForThisTile = tileRefs.current[tileData.id]

        if (itemForThisTile && itemForThisTile.current) {
          gridRef.current?.makeWidget(itemForThisTile.current, {
            minH: 2,
            minW: 3,
            noMove: !!tileData.disabled,
            noResize: !!tileData.disabled,
            locked: !!tileData.disabled,
            ...tileData.gridStackWidgetOpts,
          })
        }
      })

      gridRef.current.batchUpdate(false)

      if (isEditMode) {
        gridRef.current.enableMove(true)
        gridRef.current.enableResize(true)
      } else {
        gridRef.current.enableMove(false)
        gridRef.current.enableResize(false)
      }
    }
  }, [isEditMode, gridItems])

  return (
    <>
      <div
        css={css`
          width: 100%;
          max-height: 100%;

          @media print {
            height: auto;
          }

          ${getData().pageState.renderPDFStyles &&
          css`
            height: auto;
          `}
        `}
      >
        <div
          css={css`
            padding: ${(props) => props.theme.sizes.spacing16};
            position: relative;

            @media print {
              padding: 0;
            }

            ${pageState.isDragOrResizing &&
            css`
              background-image: ${(prop) =>
                `radial-gradient(${prop.theme.colors.businessPlanDragOrResizingBackgroundColor} ${toREM(1)}, transparent 0);`};
              background-size:
                ${toREM(30)} ${toREM(30)},
                calc(8.33% + 0px) ${toREM(100)},
                ${toREM(20)} ${toREM(20)};
              background-position: 0 0;
            `}
          `}
        >
          <div
            className={`grid-stack controlled_${pdfPreview ? 'pdf-preview' : 'grid'}`}
            css={css`
              .grid-stack-placeholder {
                background-color: ${(prop) =>
                  prop.theme.colors
                    .businessPlanDragOrResizingPlaceholderBackgroundColor};
                cursor: grabbing;
                opacity: 10%;
              }

              .ui-draggable-dragging {
                .grid-stack-item-content {
                  border-radius: ${(props) => props.theme.sizes.br1};
                  border: ${(props) => props.theme.sizes.mediumSolidBorder}
                    ${(prop) =>
                      prop.theme.colors
                        .businessPlanDrageOrResizingContentBorderColor};
                  opacity: 1;
                }
              }

              .ui-resizable-resizing {
                .grid-stack-item-content {
                  border-radius: ${(props) => props.theme.sizes.br1};
                  border: ${(props) => props.theme.sizes.mediumSolidBorder}
                    ${(prop) =>
                      prop.theme.colors
                        .businessPlanDrageOrResizingContentBorderColor};
                  opacity: 1;
                }
              }
            `}
          >
            {getData()
              .getGridstackMetadata()
              .map((tileData) => {
                const tileToRender = getTileToRender(tileData, pdfPreview)

                if (tileToRender) {
                  return (
                    <div
                      id={`${tileData.id}`}
                      key={`${tileData.id}_${pdfPreview ? 'pdf-preview' : 'grid'}`}
                      ref={tileRefs.current[tileData.id]}
                      className={'grid-stack-item'}
                      css={css`
                        opacity: 1 !important;

                        .ui-resizable-ne,
                        .ui-resizable-nw,
                        .ui-resizable-se,
                        .ui-resizable-sw {
                          opacity: 0;
                        }
                      `}
                    >
                      <div className='grid-stack-item-content'>
                        <Card
                          css={css`
                            width: 100%;
                            height: 100%;
                            overflow-x: hidden;

                            @media print {
                              box-shadow: unset;
                              border: unset;
                            }

                            ${getData().pageState.renderPDFStyles &&
                            css`
                              box-shadow: unset;
                              border: unset;
                            `}

                            ${getData().pageState.businessPlanMode === 'EDIT' &&
                            getData().getCurrentUserPermissions()
                              .canEditBusinessPlan.allowed &&
                            css`
                              cursor: grab;
                            `}
                          `}
                        >
                          {tileToRender}
                        </Card>
                      </div>
                    </div>
                  )
                } else {
                  return null
                }
              })}
          </div>
        </div>
      </div>
    </>
  )
})
