import { action, runInAction, transaction } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { useDocument, useWindow } from '@mm/core/ssr'

import { OrgChartPermissions, useBloomCustomTerms } from '@mm/core-bloom'

import { useCurrentRoute } from '@mm/core-web/router'
import {
  DRAWER_EXPANDED_PERCENT_OF_WINDOW,
  usePrintContext,
} from '@mm/core-web/ui'
import { usePrintController } from '@mm/core-web/ui/components/print/printController'

import { NO_SCROLL_CLASS } from '../../layout/consts'
import { BloomHeader } from '../../layout/header/bloomHeader'
import {
  useAction,
  useComputed,
  useObservable,
  useRunOnceOnMount,
} from '../../performance/mobx'
import {
  CHART_MARGIN_PX,
  HORIZONTAL_SEAT_MARGIN,
  MAX_SCALE,
  MIN_SCALE,
  SEAT_CENTER_ANIMATION_DURATION_MS,
  SEAT_DRAG_TIMEOUT_MS,
  SEAT_TEMPORARY_HIGHLIGHT_DURATION_MS,
  VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS,
  ZOOM_SCALE_STEP,
} from './consts'
import { canEditAnyFieldInOrgChartSeatDrawer } from './dataParsingUtilts'
import {
  HierarchicalOrgChartSeat,
  OrgChartContainerHooks,
  OrgChartViewProps,
} from './types'
import {
  DirectReportButtons,
  DirectReportGroup,
  FitScreenButton,
  OrgChartGroup,
  OrgChartSeat,
  PrintVisibleButton,
  ViewDepthControl,
  ZoomControl,
} from './ui'
import { CreateOrgChartSeatButton } from './ui/createOrgChartSeatButton'
import {
  IZoomableAreaActions,
  IZoomableAreaState,
  ZoomableArea,
  ZoomableAreaProps,
} from './ui/zoomableArea'

export const OrgChartView = observer(function OrgChartView(
  props: OrgChartViewProps
) {
  const terms = useBloomCustomTerms()
  const printController = usePrintController()
  const window = useWindow()
  const route = useCurrentRoute()
  const componentState = useObservable({
    zoomableArea: null as Maybe<{
      state: IZoomableAreaState
      actions: IZoomableAreaActions
    }>,
    preventHoverEventsTimeout: null as Maybe<number>,
    seatBeingHovered: null as Maybe<Id>,
  })

  const seatStateById = useObservable<Record<Id, SeatState>>({})

  // After executing an action (cb), keep the seat in the same location on the screen
  const keepSeatInSameLocation = useAction(
    (opts: { cb: () => void; seatId: Id }) => {
      const zoomableAreaState = componentState.zoomableArea?.state
      if (!zoomableAreaState) return
      const seatElement = zoomableAreaState.innerWrapper?.querySelector(
        `[data-seat-id="${opts.seatId}"]`
      ) as HTMLElement

      const outerWrapper = zoomableAreaState.outerWrapper
      if (!outerWrapper || !seatElement) return

      const currentPosition = seatElement.getBoundingClientRect()

      opts.cb()

      const update = action(() => {
        const newPosition = seatElement.getBoundingClientRect()

        const dx = currentPosition.left - newPosition.left
        const dy = currentPosition.top - newPosition.top

        zoomableAreaState.transform.xTranslate += dx
        zoomableAreaState.transform.yTranslate += dy
        componentState.zoomableArea?.actions.applyTransforms()
      })

      if (zoomableAreaState.scrollAnimationId) {
        cancelAnimationFrame(zoomableAreaState.scrollAnimationId)
      }
      zoomableAreaState.scrollAnimationId = requestAnimationFrame(update)
    }
  )

  const centerSeat = useAction(function (opts: {
    seatId: Id
    smooth?: boolean
  }) {
    const zoomableAreaState = componentState.zoomableArea?.state
    if (!zoomableAreaState) return
    const element = zoomableAreaState.innerWrapper?.querySelector(
      `[data-seat-id="${opts.seatId}"]`
    ) as HTMLElement
    if (!element) return

    if (zoomableAreaState.scrollAnimationId) {
      cancelAnimationFrame(zoomableAreaState.scrollAnimationId)
    }

    zoomableAreaState.scrollAnimationId = requestAnimationFrame(
      action(() => {
        if (!zoomableAreaState.outerWrapper) return

        const outerWrapper = zoomableAreaState.outerWrapper

        const topOfOuterWrapper = outerWrapper.getBoundingClientRect().top
        const leftOfOuterWrapper = outerWrapper.getBoundingClientRect().left
        const outerWrapperHeight = outerWrapper.clientHeight
        let outerWrapperWidth = outerWrapper.clientWidth

        if (
          props.getData().getSeatBeingEdited() ||
          props.getData().getSeatBeingCreated()
        ) {
          // if the edit drawer is open, we need to account for the drawer width
          const drawerWidth =
            window.innerWidth * DRAWER_EXPANDED_PERCENT_OF_WINDOW
          outerWrapperWidth -= drawerWidth
        }

        const topOfElement = element.getBoundingClientRect().top
        const leftOfElement = element.getBoundingClientRect().left
        const elementHeight =
          element.clientHeight * zoomableAreaState.transform.scale
        const elementWidth =
          element.clientWidth * zoomableAreaState.transform.scale

        const distanceFromCenterY = topOfElement - topOfOuterWrapper
        const distanceFromCenterX = leftOfElement - leftOfOuterWrapper

        zoomableAreaState.transform.xTranslate =
          zoomableAreaState.transform.xTranslate -
          (distanceFromCenterX + elementWidth / 2) +
          outerWrapperWidth / 2
        zoomableAreaState.transform.yTranslate =
          zoomableAreaState.transform.yTranslate -
          (distanceFromCenterY + elementHeight / 2) +
          outerWrapperHeight / 2

        componentState.zoomableArea?.actions.applyTransforms(opts)
      })
    )
  })

  const highlightSeatTemporarily = useAction((seatId: Id) => {
    runInAction(() => {
      if (seatStateById[seatId]) {
        seatStateById[seatId].seatIsBeingHighlighted = true
      }
    })

    setTimeout(
      action(() => {
        if (seatStateById[seatId]) {
          seatStateById[seatId].seatIsBeingHighlighted = false
        }
      }),
      SEAT_TEMPORARY_HIGHLIGHT_DURATION_MS
    )
  })

  useRunOnceOnMount(() => {
    props.getActions().setHooks({
      onSeatCreated: action((opts) => {
        requestAnimationFrame(() => {
          centerSeat({
            seatId: opts.newSeatId,
            smooth: true,
          })
          setTimeout(() => {
            highlightSeatTemporarily(opts.newSeatId)
          }, SEAT_CENTER_ANIMATION_DURATION_MS)
        })
      }),
      onSeatDeleted: action((opts) => {
        const directReportSeatIds = opts.directReportSeatIds
        if (directReportSeatIds && directReportSeatIds.length) {
          requestAnimationFrame(() => {
            centerSeat({
              seatId: directReportSeatIds[0],
              smooth: true,
            })

            setTimeout(() => {
              directReportSeatIds.forEach(highlightSeatTemporarily)
            }, SEAT_CENTER_ANIMATION_DURATION_MS)
          })
        }
      }),
      // the seat is already centered when the user starts editing
      // via onEditSeatRequested action below
      onSeatEdited: null,
      onSupervisorChangeInDrawer: action((opts) => {
        const newSupervisorSeatId = opts.newSupervisorSeatId
        if (!newSupervisorSeatId) return

        const allSeatsAboveThisSeat = Object.keys(
          props.getData().getAllReportSeatIdsBySupervisorSeatId()
        ).filter((seatId) =>
          props
            .getData()
            .getAllReportSeatIdsBySupervisorSeatId()
            [seatId].includes(newSupervisorSeatId)
        )

        // there is a chance for this to be called with a supervisor that is not being displayed
        // by selecting this supervisor via the create or edit drawer
        // in that case, we  expand the org chart tree up to that seat and then center it
        transaction(() => {
          allSeatsAboveThisSeat.forEach((seatId) => {
            props.getActions().expandSeatDirectReportsById(seatId)
          })

          props.getActions().expandSeatDirectReportsById(newSupervisorSeatId)
        })

        requestAnimationFrame(() => {
          centerSeat({
            seatId: newSupervisorSeatId,
            smooth: true,
          })

          setTimeout(() => {
            highlightSeatTemporarily(newSupervisorSeatId)
          }, SEAT_CENTER_ANIMATION_DURATION_MS)
        })
      }),
    } as OrgChartContainerHooks)
  })

  const onSeatInteraction = useAction(
    (opts: {
      interaction: () => void
      seatId: Id
      newSupervisorSeatId?: Id
      addRaf?: boolean
    }) => {
      // prevent rogue hover events from firing when the user interacts with a seat
      // which causes a quick relayout of the chart
      // and the hover event to fire on a different seat
      // leading to 2 seats appearing to be hovered
      componentState.preventHoverEventsTimeout = window.setTimeout(
        action(() => {
          componentState.preventHoverEventsTimeout = null
        })
      )

      if (route().queryParams['post-action-behavior'] === 'center_seat') {
        opts.interaction()

        if (opts.addRaf) {
          requestAnimationFrame(() => {
            centerSeat({
              seatId: opts.seatId,
              smooth: false,
            })
          })
        } else {
          centerSeat({
            seatId: opts.seatId,
            smooth: false,
          })
        }
      } else {
        keepSeatInSameLocation({
          seatId: opts.newSupervisorSeatId || opts.seatId,
          cb: opts.interaction,
        })
      }
    }
  )

  const onSeatGrabbed = useAction(() => {
    const zoomableAreaState = componentState.zoomableArea?.state
    if (!zoomableAreaState) return
    if (zoomableAreaState.outerWrapper)
      zoomableAreaState.outerWrapper.style.cursor = 'grabbing'
  })
  const onSeatReleased = useAction((idOfReleasedSeat: Id) => {
    const zoomableAreaState = componentState.zoomableArea?.state
    if (!zoomableAreaState) return
    if (zoomableAreaState.outerWrapper)
      zoomableAreaState.outerWrapper.style.cursor = 'grab'

    if (
      componentState.seatBeingHovered &&
      componentState.seatBeingHovered !== idOfReleasedSeat
    ) {
      const newSupervisorSeatId = componentState.seatBeingHovered

      props.getActions().onUpdateSeatSupervisor({
        seatId: idOfReleasedSeat,
        newSupervisorSeatId,
      })

      onSeatInteraction({
        seatId: idOfReleasedSeat,
        newSupervisorSeatId,
        interaction: () =>
          props.getActions().expandSeatDirectReportsById(newSupervisorSeatId),
        // this requestAnimationFrame ensures that the post interaction fn is called
        // after the seat has been rendered under the new supervisor
        addRaf: true,
      })
    }
  })

  const getSubTreeData = useComputed(
    () => {
      return {
        ...props.getData(),
        getOrgChartScale: () =>
          componentState.zoomableArea?.state.transform.scale || 1,
        getSeatBeingHovered: () => componentState.seatBeingHovered,
        getPreventHoverEventsTimeout: () =>
          componentState.preventHoverEventsTimeout,
      }
    },
    {
      name: 'OrgChartView.getData',
    }
  )

  const onCollapseAllDirectReports = useAction(() => {
    const rootSeatId = props.getData().getSeats()[0].id
    onSeatInteraction({
      interaction: props.getActions().onCollapseAllDirectReports,
      seatId: rootSeatId,
    })
  })

  const onLevelChange = useAction((level: number) => {
    const rootSeatId = props.getData().getSeats()[0].id
    onSeatInteraction({
      interaction: () =>
        props.getActions().onDirectReportViewDepthChange(level),
      seatId: rootSeatId,
    })
  })

  const onExpandAllDirectReports = useAction(() => {
    const rootSeatId = props.getData().getSeats()[0].id
    onSeatInteraction({
      interaction: props.getActions().onExpandAllDirectReports,
      seatId: rootSeatId,
    })
  })

  const getSubTreeActions = useComputed(
    () => {
      return {
        ...props.getActions(),
        expandSeatDirectReportsById: (seatId: Id) => {
          onSeatInteraction({
            interaction: () =>
              props.getActions().expandSeatDirectReportsById(seatId),
            seatId,
          })
        },
        collapseSeatDirectReportsById: (seatId: Id) => {
          onSeatInteraction({
            interaction: () =>
              props.getActions().collapseSeatDirectReportsById(seatId),
            seatId,
          })
        },
        onEditSeatRequested: (opts: { seatId: Id }) => {
          props.getActions().onEditSeatRequested({
            seatId: opts.seatId,
            onEditSeatDrawerClosed: action(() => {
              if (seatStateById[opts.seatId]) {
                seatStateById[opts.seatId].seatIsBeingEdited = false
              }
            }),
          })
          centerSeat({
            seatId: opts.seatId,
            smooth: true,
          })
        },
        onDirectReportCreateRequested: (opts: { supervisorSeatId: Id }) => {
          props.getActions().onDirectReportCreateRequested(opts)
        },
        onSeatGrabbed,
        onSeatReleased,
        onSeatMouseEnter: action((seatId: Id) => {
          componentState.seatBeingHovered = seatId
        }),
        onSeatMouseLeave: action(() => {
          componentState.seatBeingHovered = null
        }),
        onSeatInternalStateMounted: action(
          (opts: { seatId: Id; state: SeatState }) => {
            seatStateById[opts.seatId] = opts.state
          }
        ),
      }
    },
    {
      name: 'OrgChartView.getActions',
    }
  )

  const getZoomableAreaData: ZoomableAreaProps['getData'] = useComputed(
    () => {
      return {
        getZoomScaleStep: () => ZOOM_SCALE_STEP,
        getMinScale: () => MIN_SCALE,
        getMaxScale: () => MAX_SCALE,
        getPaddingPx: () => CHART_MARGIN_PX,
        getInitialState: () => componentState.zoomableArea?.state ?? null,
      }
    },
    {
      name: 'OrgChartView.getZoomableAreaData',
    }
  )

  const getZoomableAreaActions: ZoomableAreaProps['getActions'] = useComputed(
    () => {
      return {
        onZoomableAreaReady: action((opts) => {
          componentState.zoomableArea = opts
        }),
        onInnerWrapperReady: action(() => {
          const rootSeatId = props.getData().getSeats()[0].id

          centerSeat({
            seatId: rootSeatId,
            smooth: false,
          })
        }),
      }
    },
    {
      name: 'OrgChartView.getZoomableAreaActions',
    }
  )

  function getViewOrPrint() {
    return (
      <ZoomableArea
        className={`${NO_SCROLL_CLASS}`}
        id='outer-wrapper'
        role='treegrid'
        tabIndex={0}
        getData={getZoomableAreaData}
        getActions={getZoomableAreaActions}
      >
        <div
          css={css`
            display: flex;
          `}
        >
          {props
            .getData()
            .getSeats()
            .map((seat, seatIdx) => (
              <WrappedOrgChartSubTree
                css={css`
                  margin-left: ${seatIdx === 0 ? 0 : HORIZONTAL_SEAT_MARGIN}em;
                `}
                key={seat.id}
                seat={seat}
                getData={getSubTreeData}
                getActions={getSubTreeActions}
                isDirectReport={false}
                isOnlyDirectReport={false}
                isLeftEdgeGroup={false}
                isRightEdgeGroup={false}
                leftMargin={false}
              />
            ))}
        </div>
      </ZoomableArea>
    )
  }

  const onPrintVisible = useAction(() => {
    const pageWidth =
      componentState.zoomableArea?.state.outerWrapper?.clientWidth
    const pageHeight =
      componentState.zoomableArea?.state.outerWrapper?.clientHeight

    if (!pageWidth || !pageHeight) {
      throw Error('Page width and height are not available')
    }

    printController.setupForPrint({
      view: getViewOrPrint(),
      printSettings: {
        isCustomSize: true,
        width: pageWidth,
        height: pageHeight,
      },
    })
    printController.print()
  })

  return (
    <>
      <BloomHeader
        title={terms.organizationalChart.singular}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <div
        css={css`
          width: 100%;
          height: 100%;
          position: relative;
        `}
      >
        {componentState.zoomableArea && (
          <OrgChartControls
            currentScale={componentState.zoomableArea.state.transform.scale}
            onIncreaseScale={componentState.zoomableArea.actions.increaseScale}
            onDecreaseScale={componentState.zoomableArea.actions.decreaseScale}
            maxScale={MAX_SCALE}
            minScale={MIN_SCALE}
            maxLevel={getSubTreeData().getMaxDirectReportsExpandDepth()}
            onCollapseAllDirectReports={onCollapseAllDirectReports}
            onLevelChange={onLevelChange}
            onExpandAllDirectReports={onExpandAllDirectReports}
            directReportsExpandDepth={getSubTreeData().directReportsExpandDepth}
            onFitScreen={componentState.zoomableArea.actions.fitScreen}
            onCreateSeatRequested={props.getActions().onCreateSeatRequested}
            permissions={props.getData().getCurrentUserOrgChartPermissions()}
            onPrintVisible={onPrintVisible}
          />
        )}
        {getViewOrPrint()}
      </div>
    </>
  )
})

type SeatState = {
  seatIsBeingEdited: boolean
  seatIsBeingHovered: boolean
  seatIsBeingHighlighted: boolean
  dragInfo: Maybe<{
    startX: number
    startY: number
    element: HTMLElement
  }>
  dragTimeout: Maybe<number>
}

const WrappedOrgChartSubTree = observer(function OrgChartSubTree(props: {
  seat: HierarchicalOrgChartSeat
  className?: string
  getData: () => {
    showDirectReportsForSeatsById: Record<Id, boolean>
    getOrgChartScale: () => number
    getSeatBeingHovered: () => Maybe<Id>
    getSeatBeingEdited: () => Maybe<Id>
    getPreventHoverEventsTimeout: () => Maybe<number>
  }
  getActions: () => {
    expandSeatDirectReportsById: (seatId: Id) => void
    collapseSeatDirectReportsById: (seatId: Id) => void
    onSeatGrabbed: () => void
    onSeatReleased: (seatId: Id) => void
    onSeatMouseEnter: (seatId: Id) => void
    onSeatMouseLeave: () => void
    onEditSeatRequested: (opts: { seatId: Id }) => void
    onDirectReportCreateRequested: (opts: { supervisorSeatId: Id }) => void
    onSeatInternalStateMounted: (opts: { seatId: Id; state: SeatState }) => void
    onDeleteSeatRequested: (opts: { seatId: Id }) => void
  }
  leftMargin: boolean
  isLeftEdgeGroup: boolean
  isRightEdgeGroup: boolean
  isDirectReport: boolean
  isOnlyDirectReport: boolean
}) {
  const printContext = usePrintContext()
  const document = useDocument()
  const window = useWindow()
  const componentState = useObservable<SeatState>(() => ({
    // initially this state may seem redundant since the org chart container has info about the seat being edited and hovered
    // however, passing that info down to this component and using it on every render to determine the state of the seat
    // causes all of the seats to re-render when any seat is hovered or edited
    //
    // to prevent that, we keep this state at the component level
    //
    // the container level state is also still necessary, since actions (such as drag release) require knowledge of the seat being hovered
    //
    // additionally, we use the container state to initialize this sub state because this components get unmounted
    // and re-mounted as we edit its supervisors, and we want to retain that "isBeingEdited" state as it unmounts and re-mounts
    seatIsBeingEdited: props.getData().getSeatBeingEdited() === props.seat.id,
    seatIsBeingHovered: false,
    seatIsBeingHighlighted: false,
    dragInfo: null,
    dragTimeout: null,
  }))

  useRunOnceOnMount(() => {
    // without this, after printing, borders around selected seats don't disappear when the seat is deselected
    if (printContext.isInPrint) return

    props.getActions().onSeatInternalStateMounted({
      seatId: props.seat.id,
      state: componentState,
    })
  })

  const showDirectReports = useAction(() => {
    props.getActions().expandSeatDirectReportsById(props.seat.id)
  })

  const collapseDirectReports = useAction(() => {
    props.getActions().collapseSeatDirectReportsById(props.seat.id)
  })

  const toggleShowDirectReports = useAction(() => {
    const isShowindDirectReports =
      props.getData().showDirectReportsForSeatsById[props.seat.id] ?? false

    if (isShowindDirectReports) {
      collapseDirectReports()
    } else {
      showDirectReports()
    }
  })

  const getCanEditAnyFieldInOrgChartSeatDrawer = useComputed(
    () => {
      return canEditAnyFieldInOrgChartSeatDrawer(props.seat)
    },
    {
      name: 'WrappedOrgChartSubTree.getCanEditAnyFieldInOrgChartSeatDrawer',
    }
  )

  const onSeatMouseDown = useAction((e: React.MouseEvent<HTMLElement>) => {
    if (
      !props.seat.permissions.canEditSupervisor.allowed &&
      !getCanEditAnyFieldInOrgChartSeatDrawer()
    )
      return

    // not left-click
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const element = e.currentTarget as HTMLElement

    // time to wait before registering a mouse down on a seat as a drag event
    // this is to prevent accidental drag events when clicking on a seat
    componentState.dragTimeout = window.setTimeout(
      action(() => {
        componentState.dragTimeout = null
        if (!props.seat.permissions.canEditSupervisor.allowed) return
        componentState.dragInfo = {
          startX,
          startY,
          element,
        }
        element.style.position = 'absolute'
        element.style.zIndex = '9999'
        props.getActions().onSeatGrabbed()
      }),
      SEAT_DRAG_TIMEOUT_MS
    )

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)
  })

  const onMouseUp = useAction((e: MouseEvent) => {
    // not left-click
    if (e.button !== 0) return

    // the user clicked on a seat and is trying to edit it
    if (componentState.dragTimeout) {
      window.clearTimeout(componentState.dragTimeout)
      componentState.dragTimeout = null
      componentState.dragInfo = null
      if (!getCanEditAnyFieldInOrgChartSeatDrawer()) {
        return
      }
      props.getActions().onEditSeatRequested({
        seatId: props.seat.id,
      })
      componentState.seatIsBeingEdited = true
      onHoverAreaLeave()
      return
    }

    if (!componentState.dragInfo) return

    componentState.dragInfo.element.style.position = 'relative'
    componentState.dragInfo.element.style.transform = 'initial'
    componentState.dragInfo.element.style.zIndex = 'initial'

    componentState.dragInfo = null

    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('mousemove', onMouseMove)
    document.body.style.cursor = 'initial'
    props.getActions().onSeatReleased(props.seat.id)
  })

  const onMouseMove = useAction((e: MouseEvent) => {
    if (!componentState.dragInfo) return

    const dx =
      (e.clientX - componentState.dragInfo.startX) /
      props.getData().getOrgChartScale()
    const dy =
      (e.clientY - componentState.dragInfo.startY) /
      props.getData().getOrgChartScale()

    const elmnt = componentState.dragInfo.element

    elmnt.style.transform = `translate(${dx}px, ${dy}px)`
  })

  const onHoverAreaEnter = useAction(() => {
    if (props.getData().getPreventHoverEventsTimeout()) return
    componentState.seatIsBeingHovered = true
    props.getActions().onSeatMouseEnter(props.seat.id)
  })

  const onHoverAreaLeave = useAction(() => {
    if (props.getData().getPreventHoverEventsTimeout()) return
    componentState.seatIsBeingHovered = false
    props.getActions().onSeatMouseLeave()
  })

  const onHoverAreaMouseMove = useAction(() => {
    // if the edit drawer is closed by clicking on the same seat that opened the drawer
    // the hover area will not receive a mouse enter event
    // this ensures that the seat is hovered when the mouse is over the hover area
    // even if the mouse did not leave the seat
    if (!componentState.seatIsBeingHovered) {
      onHoverAreaEnter()
    }
  })

  const isShowingDirectReports =
    props.getData().showDirectReportsForSeatsById[props.seat.id] ?? false

  function getSeatState() {
    if (componentState.seatIsBeingHighlighted) {
      return 'highlighted'
    } else if (componentState.seatIsBeingEdited) {
      return 'editing'
    } else if (componentState.dragInfo) {
      return 'dragging'
    } else if (componentState.seatIsBeingHovered) {
      return 'hovered'
    } else {
      return 'default'
    }
  }

  const state = getSeatState()

  const onEditSeatRequested = useAction(() => {
    props.getActions().onEditSeatRequested({
      seatId: props.seat.id,
    })
    componentState.seatIsBeingEdited = true
  })

  const onDeleteSeatRequested = useAction(() => {
    props.getActions().onDeleteSeatRequested({
      seatId: props.seat.id,
    })
  })

  return (
    <OrgChartGroup
      parentSeatId={props.seat.id}
      className={props.className}
      isLeftEdgeGroup={props.isLeftEdgeGroup}
      isRightEdgeGroup={props.isRightEdgeGroup}
      horizontalLine={props.isDirectReport && !props.isOnlyDirectReport}
    >
      <div
        css={css`
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;
          margin-left: ${props.leftMargin
            ? `${HORIZONTAL_SEAT_MARGIN}em`
            : 'initial'};
          pointer-events: inherit;
        `}
      >
        {/* vertical line that descends to this seat from the horizontal line in DirectReportGroup  */}
        {props.isDirectReport && (
          <div
            css={css`
              background: ${({ theme }) => theme.colors.orgChartLineColor};
              position: absolute;
              height: ${VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS}em;
              width: 1px;
              top: 0;
              left: 50%;
              transform: translate(-50%, -100%);
            `}
          />
        )}
        <div
          css={css`
            position: relative;
          `}
          onMouseMove={onHoverAreaMouseMove}
          onMouseEnter={onHoverAreaEnter}
          onMouseLeave={onHoverAreaLeave}
        >
          <OrgChartSeat
            state={state}
            seat={props.seat}
            onSeatMouseDown={onSeatMouseDown}
            onDeleteSeatRequested={onDeleteSeatRequested}
            onEditSeatRequested={onEditSeatRequested}
          />

          {state === 'dragging' && (
            <OrgChartSeat
              state={'clone'}
              seat={props.seat}
              // safe for these to all be no-ops
              // since the clone seat should not be interacted with
              // and is better to keep these as required props
              onDeleteSeatRequested={() => {}}
              onEditSeatRequested={() => {}}
              onSeatMouseDown={() => {}}
            />
          )}
          {!(state === 'dragging') && (
            <DirectReportButtons
              seat={props.seat}
              css={css`
                opacity: ${state === 'hovered' ? 1 : 0};
              `}
              toggleExpandDirectReports={toggleShowDirectReports}
              directReportsAreExpanded={isShowingDirectReports}
              numberOfDirectReports={props.seat.directReports?.length ?? 0}
              onAddDirectReportClick={() => {
                props.getActions().onDirectReportCreateRequested({
                  supervisorSeatId: props.seat.id,
                })
              }}
            />
          )}
        </div>

        {props.seat.directReports?.length && isShowingDirectReports ? (
          // needs to be rendered and only hidden when this seat is being dragged
          // otherwise the layout will shift if this seat has direct reports and is dragged
          <DirectReportGroup hide={state === 'dragging'}>
            {props.seat.directReports.map(
              (directReportSeat, directReportIdx, directReports) => (
                <WrappedOrgChartSubTree
                  key={directReportSeat.id}
                  seat={directReportSeat}
                  getData={props.getData}
                  getActions={props.getActions}
                  leftMargin={directReportIdx > 0}
                  isLeftEdgeGroup={directReportIdx === 0}
                  isRightEdgeGroup={
                    directReportIdx === directReports.length - 1
                  }
                  isDirectReport
                  isOnlyDirectReport={directReports.length === 1}
                />
              )
            )}
          </DirectReportGroup>
        ) : null}
      </div>
    </OrgChartGroup>
  )
})

const OrgChartControls = observer(function OrgChartControls(props: {
  maxLevel: number
  directReportsExpandDepth: number
  onLevelChange: (level: number) => void
  onCollapseAllDirectReports: () => void
  onExpandAllDirectReports: () => void
  currentScale: number
  onIncreaseScale: () => void
  onDecreaseScale: () => void
  maxScale: number
  minScale: number
  onFitScreen: () => void
  onCreateSeatRequested: () => void
  permissions: OrgChartPermissions
  onPrintVisible: () => void
}) {
  return (
    <div
      css={css`
        position: absolute;
        top: ${({ theme }) => theme.sizes.spacing16};
        left: ${({ theme }) => theme.sizes.spacing16};
        right: ${({ theme }) => theme.sizes.spacing16};
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      `}
    >
      <div id='left-side-controls'>
        <ViewDepthControl
          maxLevel={props.maxLevel}
          currentLevel={props.directReportsExpandDepth}
          onLevelChange={props.onLevelChange}
          onCollapseAll={props.onCollapseAllDirectReports}
          onExpandAll={props.onExpandAllDirectReports}
        />
        <div
          css={css`
            margin-top: ${({ theme }) => theme.sizes.spacing16};
            display: flex;
          `}
        >
          <ZoomControl
            css={css`
              margin-right: ${({ theme }) => theme.sizes.spacing16};
            `}
            currentScale={props.currentScale}
            onIncreaseScale={props.onIncreaseScale}
            onDecreaseScale={props.onDecreaseScale}
            maxScale={props.maxScale}
            minScale={props.minScale}
          />
          <FitScreenButton
            onClick={props.onFitScreen}
            css={css`
              margin-right: ${({ theme }) => theme.sizes.spacing16};
            `}
          />
          <PrintVisibleButton onClick={props.onPrintVisible} />
        </div>
      </div>

      <div id='right-side-controls'>
        {props.permissions.canCreateNewSeats.allowed && (
          <CreateOrgChartSeatButton onClick={props.onCreateSeatRequested} />
        )}
      </div>
    </div>
  )
})
