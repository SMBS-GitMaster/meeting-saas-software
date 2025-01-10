import { GridStack, GridStackNode } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { createRef, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { css } from 'styled-components'

import type { IEditWorkspaceTilePositionsTile } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { toREM } from '@mm/core-web/ui'

import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'

import { PersonalWorkspacePageHeader } from './personalWorkspacePageHeader'
import {
  MEETING_WORKSPACE_GRID_INIT_OPTS,
  PERSONAL_WORKSPACE_GRID_INIT_OPTS,
} from './workspacePageConstants'
import { WorkspacePageTile } from './workspacePageTile'
import type {
  IWorkspacePageViewActions,
  IWorkspacePageViewProps,
} from './workspacePageTypes'

export const WorkspacePageView = observer(function WorkspacePageView(
  props: IWorkspacePageViewProps
) {
  const pageState = useObservable<{
    isDragOrResizing: boolean
  }>({
    isDragOrResizing: false,
  })

  const gridRef = useRef<GridStack>()
  const tileRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})

  props.data().workspaceTiles.forEach((tileData) => {
    tileRefs.current[tileData.id] = tileRefs.current[tileData.id] || createRef()
  })

  const { t } = useTranslation()

  const getGridInitOpts = useComputed(
    () => {
      const workspaceId = props.data().workspaceId
      const isMeetingWorkspace = workspaceId === null
      return isMeetingWorkspace
        ? MEETING_WORKSPACE_GRID_INIT_OPTS
        : PERSONAL_WORKSPACE_GRID_INIT_OPTS
    },
    { name: 'workspacePageView-gridInitOpts' }
  )

  const handleTilePositioningUpdate: IWorkspacePageViewActions['onEditWorkspaceTilePositions'] =
    useAction(async (opts) => {
      await props.actions().onEditWorkspaceTilePositions({
        updatedTiles: opts.updatedTiles,
      })
    })

  const gridInitOpts = getGridInitOpts()
  useEffect(() => {
    if (!gridRef.current) {
      gridRef.current = GridStack.init(gridInitOpts, '.controlled')
      const grid = gridRef.current

      grid.on('change', async function (_: Event, items: GridStackNode[]) {
        const isFullScreenView = grid.getColumn() !== 1

        if (isFullScreenView && items && items.length) {
          const updatedTiles: IEditWorkspaceTilePositionsTile[] = []

          items.forEach((gI) => {
            if (gI.el?.id) {
              updatedTiles.push({
                id: Number(gI.el.id),
                x: gI.x || 0,
                y: gI.y || 0,
                h: gI.h || 8,
                w: gI.w || 4,
              })
            }
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
  }, [props.data().workspaceId, gridInitOpts, handleTilePositioningUpdate])

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.batchUpdate()
      gridRef.current.removeAll(false)

      props.data().workspaceTiles.forEach((tileData) => {
        const itemForThisTile = tileRefs.current[tileData.id]

        if (gridRef.current && itemForThisTile && itemForThisTile.current) {
          gridRef.current.makeWidget(itemForThisTile.current, {
            minH: 8,
            minW: 3,
            ...tileData.gridstackWidgetOpts,
          })
        }
      })

      gridRef.current.batchUpdate(false)
    }
  }, [props.data().workspaceTiles])

  return (
    <>
      <Helmet>
        <title>{t('Workspace')}</title>
      </Helmet>
      {props.data().workspaceId && (
        <PersonalWorkspacePageHeader
          workspaceId={props.data().workspaceId || 0}
          workspaceHomeId={props.data().workspaceHomeId}
          onSetPrimaryWorkspace={props.actions().onSetPrimaryWorkspace}
        />
      )}
      <div
        css={css`
          height: 100%;
          width: 100%;
        `}
      >
        <div
          css={css`
            padding: ${toREM(14)};
            position: relative;

            ${pageState.isDragOrResizing &&
            css`
              background-image: ${(prop) =>
                `radial-gradient(${prop.theme.colors.workspaceDragOrResizingBackgroundColor} ${toREM(1)}, transparent 0);`};
              background-size:
                ${toREM(30)} ${toREM(30)},
                calc(8.33% + 0px) ${toREM(100)},
                ${toREM(20)} ${toREM(20)};
              background-position: 0 0;
            `}
          `}
        >
          <div
            className={`grid-stack controlled`}
            css={css`
              .grid-stack-placeholder {
                background-color: ${(prop) =>
                  prop.theme.colors
                    .workspaceDragOrResizingPlaceholderBackgroundColor};
                cursor: grabbing;
                opacity: 10%;
              }

              .ui-draggable-dragging {
                .grid-stack-item-content {
                  border-color: ${(prop) =>
                    prop.theme.colors
                      .workspaceDrageOrResizingContentBorderColor};
                  border-style: solid;
                  border-width: ${toREM(2)};
                  opacity: 1;
                }
              }

              .ui-resizable-resizing {
                .grid-stack-item-content {
                  border-color: ${(prop) =>
                    prop.theme.colors
                      .workspaceDrageOrResizingContentBorderColor};
                  border-style: solid;
                  border-width: ${toREM(2)};
                  opacity: 1;
                }
              }
            `}
          >
            {props.data().workspaceTiles.map((tileData) => {
              return (
                <div
                  id={`${tileData.id}`}
                  key={tileData.id}
                  ref={tileRefs.current[tileData.id]}
                  className={'grid-stack-item'}
                  css={css`
                    opacity: 1 !important;

                    .ui-resizable-e {
                      right: 1px !important;
                    }

                    .ui-resizable-s {
                      bottom: 1px !important;
                    }

                    .ui-resizable-ne,
                    .ui-resizable-nw,
                    .ui-resizable-se,
                    .ui-resizable-sw {
                      opacity: 0;
                    }
                  `}
                >
                  <div
                    className='grid-stack-item-content'
                    css={css`
                      ${props.data().workspaceId &&
                      css`
                        cursor: grab;
                      `}
                    `}
                  >
                    <WorkspacePageTile
                      workspaceId={props.data().workspaceId}
                      tile={tileData}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
})
