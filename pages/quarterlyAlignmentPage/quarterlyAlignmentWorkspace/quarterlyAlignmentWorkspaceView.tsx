import { GridStack } from 'gridstack'
import 'gridstack/dist/gridstack.min.css'
import { observer } from 'mobx-react'
import React, { createRef, useEffect, useRef } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { toREM } from '@mm/core-web/ui'

import { ROLES_TILE_GRIDSTACK_COLLAPSED_HEIGHT } from '@mm/bloom-web/roles'

import { useAction } from '../../performance/mobx'
import {
  QUARTERLY_ALIGNEMNT_WORKSPACE_GRID_INIT_OPTS,
  QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_COLLAPSED_HEIGHT,
  USER_METRICS_TILE_RR_TAB_ID,
  USER_ROLES_TILE_RR_TAB_ID,
  USER_TODOS_TILE_RR_TAB_ID,
} from './constants'
import { QuarterlyAlignmentWorkspaceTile } from './quarterlyAlignmentWorkspaceTile'
import { type IQuarterlyAlignmentWorkspaceViewProps } from './quarterlyAlignmentWorkspaceTypes'
import { QuarterlyAlignmentWorkspaceTabs } from './quaterlyAlignmentWorkspaceTabs'

export const QuarterlyAlignmentWorkspaceView = observer(
  function QuarterlyAlignmentWorkspaceView(
    props: IQuarterlyAlignmentWorkspaceViewProps
  ) {
    const gridRef = useRef<GridStack>()
    const tileRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})

    const gridInitOpts = QUARTERLY_ALIGNEMNT_WORKSPACE_GRID_INIT_OPTS
    const tiles = props.data().tiles()

    props
      .data()
      .tiles()
      .forEach((tileData) => {
        tileRefs.current[tileData.id] =
          tileRefs.current[tileData.id] || createRef()
      })

    const onHandleUserTodosTileOnRRTabExpandAndCollapse = useAction(
      (opts: { height: number }) => {
        const todosTile = tileRefs.current[USER_TODOS_TILE_RR_TAB_ID]
        const metricsTile = tileRefs.current[USER_METRICS_TILE_RR_TAB_ID]

        if (!todosTile.current || !metricsTile.current) {
          return
        }

        const gridItems = gridRef.current?.getGridItems()

        if (!gridItems) {
          return
        }

        const rolesGridElHeight = gridItems.find(
          (gI) => gI.id === USER_ROLES_TILE_RR_TAB_ID
        )?.gridstackNode?.h

        if (!rolesGridElHeight) {
          return
        }

        gridRef.current?.batchUpdate()

        if (
          opts.height ===
          QUARTERLY_ALIGNEMNT_WORKSPACE_TODOS_EXPANDED_TILE_COLLAPSED_HEIGHT
        ) {
          gridRef.current?.update(todosTile.current, {
            h: opts.height,
          })
          gridRef.current?.update(metricsTile.current, {
            y: 2,
          })
        } else {
          gridRef.current?.update(metricsTile.current, {
            y: opts.height + rolesGridElHeight,
          })
          gridRef.current?.update(todosTile.current, {
            h: opts.height,
          })
        }

        gridRef.current?.batchUpdate(false)
      }
    )

    const onHandleUserRolesTileOnRRTabExpandAndCollapse = useAction(
      (opts: { height: number }) => {
        const rolesTile = tileRefs.current[USER_ROLES_TILE_RR_TAB_ID]
        const todosTile = tileRefs.current[USER_TODOS_TILE_RR_TAB_ID]
        const metricsTile = tileRefs.current[USER_METRICS_TILE_RR_TAB_ID]

        if (!rolesTile.current || !todosTile.current || !metricsTile.current) {
          return
        }

        const gridItems = gridRef.current?.getGridItems()

        if (!gridItems) {
          return
        }

        const todosGridElHeight = gridItems.find(
          (gI) => gI.id === USER_TODOS_TILE_RR_TAB_ID
        )?.gridstackNode?.h

        if (!todosGridElHeight) {
          return
        }

        gridRef.current?.batchUpdate()

        if (opts.height === ROLES_TILE_GRIDSTACK_COLLAPSED_HEIGHT) {
          gridRef.current?.update(rolesTile.current, {
            h: opts.height,
          })
          gridRef.current?.update(todosTile.current, {
            y: 1,
          })
          gridRef.current?.update(metricsTile.current, {
            y: 2,
          })
        } else {
          gridRef.current?.update(metricsTile.current, {
            y: todosGridElHeight + opts.height,
          })
          gridRef.current?.update(todosTile.current, {
            y: opts.height,
          })
          gridRef.current?.update(rolesTile.current, {
            h: opts.height,
          })
        }

        gridRef.current?.batchUpdate(false)
      }
    )

    const onHandleUpdateTileHeight = useAction(
      (opts: { tileId: Id; height: number }) => {
        if (opts.tileId === USER_TODOS_TILE_RR_TAB_ID) {
          onHandleUserTodosTileOnRRTabExpandAndCollapse({ height: opts.height })
        }

        if (opts.tileId === USER_ROLES_TILE_RR_TAB_ID) {
          onHandleUserRolesTileOnRRTabExpandAndCollapse({ height: opts.height })
        }
      }
    )

    useEffect(() => {
      if (!gridRef.current) {
        gridRef.current = GridStack.init(gridInitOpts, '.controlled')
        const grid = gridRef.current

        grid.on('change', async function () {
          return
          // no-op static tiles
        })

        return () => {
          if (gridRef.current) {
            gridRef.current.destroy(true)
          }
        }
      }
    }, [props.data().meetingId, gridInitOpts])

    useEffect(() => {
      if (gridRef.current) {
        gridRef.current.batchUpdate()
        gridRef.current.removeAll(false)

        props
          .data()
          .tiles()
          .forEach((tileData) => {
            const itemForThisTile = tileRefs.current[tileData.id]

            if (gridRef.current && itemForThisTile && itemForThisTile.current) {
              gridRef.current.makeWidget(itemForThisTile.current, {
                minH: 2,
                minW: 3,
                noResize: true,
                noMove: true,
                locked: true,
                ...tileData.gridstackWidgetOpts,
              })
            }
          })

        gridRef.current.batchUpdate(false)
      }
    }, [tiles])

    return (
      <div
        css={css`
          width: 100%;
        `}
      >
        <QuarterlyAlignmentWorkspaceTabs
          data={props.data}
          actions={props.actions}
        />
        <div
          css={css`
            height: 100%;
            width: 100%;
          `}
        >
          <div
            css={css`
              padding: ${toREM(16)};
              position: relative;
            `}
          >
            <div className={`grid-stack controlled`}>
              {props
                .data()
                .tiles()
                .map((tileData) => {
                  return (
                    <div
                      id={`${tileData.id}`}
                      key={tileData.id}
                      ref={tileRefs.current[tileData.id]}
                      className={'grid-stack-item'}
                      css={css`
                        opacity: 1 !important;
                      `}
                    >
                      <div className='grid-stack-item-content'>
                        <QuarterlyAlignmentWorkspaceTile
                          tile={tileData}
                          data={props.data}
                          onHandleUpdateTileHeight={onHandleUpdateTileHeight}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
