import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { AriaRole } from 'react'
import { css } from 'styled-components'

import { usePrintContext } from '@mm/core-web/ui'

import {
  useAction,
  useObservable,
  useRunOnceOnMount,
} from '@mm/bloom-web/pages/performance/mobx'

import { SEAT_CENTER_ANIMATION_DURATION_MS } from '../consts'

export type ZoomableAreaProps = {
  children: React.ReactNode
  getData: () => {
    getZoomScaleStep: () => number
    getMinScale: () => number
    getMaxScale: () => number
    getPaddingPx: () => number
    getInitialState: () => Maybe<IZoomableAreaState>
  }
  getActions: () => {
    onZoomableAreaReady: (opts: {
      state: IZoomableAreaState
      actions: IZoomableAreaActions
    }) => void
    onInnerWrapperReady: () => void
  }
  className?: string
  id?: string
  role?: AriaRole
  tabIndex?: number
}

export interface IZoomableAreaState {
  draggingToScroll: boolean
  dragToScrollStartPosition: Maybe<{
    x: number
    y: number
  }>
  transform: {
    xTranslate: number
    yTranslate: number
    scale: number
  }
  outerWrapper: Maybe<HTMLDivElement>
  innerWrapper: Maybe<HTMLDivElement>
  scrollAnimationId: Maybe<number>
}

export interface IZoomableAreaActions {
  applyTransforms: (opts?: { smooth?: boolean }) => void
  fitScreen: () => void
  increaseScale: () => void
  decreaseScale: () => void
}

export const ZoomableArea = observer(function ZoomableArea(
  props: ZoomableAreaProps
) {
  const initialState = props.getData().getInitialState()
  const componentState = useObservable<IZoomableAreaState>(
    // allows another instance of zoomable area to be rendered with the same initial state as another instance
    // used for printing
    initialState
      ? {
          ...initialState,
          transform: { ...initialState.transform },
          outerWrapper: null,
          innerWrapper: null,
          scrollAnimationId: null,
        }
      : {
          draggingToScroll: false,
          dragToScrollStartPosition: null,
          transform: {
            xTranslate: 0,
            yTranslate: 0,
            scale: 1,
          },
          outerWrapper: null,
          innerWrapper: null,
          scrollAnimationId: null,
        }
  )
  const printContext = usePrintContext()

  const onMouseDown = useAction(function onMouseDown(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (!componentState.outerWrapper) return

    componentState.draggingToScroll = true
    componentState.dragToScrollStartPosition = {
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    }

    componentState.outerWrapper.style.cursor = 'grabbing'
    componentState.outerWrapper.style.userSelect = 'none'
  })

  const onMouseUp = useAction(function onMouseUp() {
    if (!componentState.draggingToScroll) return
    componentState.draggingToScroll = false
    componentState.dragToScrollStartPosition = null

    if (!componentState.outerWrapper) return

    componentState.outerWrapper.style.cursor = 'grab'
    componentState.outerWrapper.style.removeProperty('user-select')
  })

  const onMouseMove = useAction(function onMouseMove(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (!componentState.outerWrapper) return

    if (
      componentState.draggingToScroll &&
      componentState.dragToScrollStartPosition
    ) {
      // How far the mouse has been moved
      const dx = e.clientX - componentState.dragToScrollStartPosition.x
      const dy = e.clientY - componentState.dragToScrollStartPosition.y

      componentState.dragToScrollStartPosition = {
        x: e.clientX,
        y: e.clientY,
      }

      // Scroll the outerWrapper
      componentState.transform.xTranslate += dx
      componentState.transform.yTranslate += dy

      applyTransforms()
    }
  })

  const onWheel = useAction(function onWheel(e: React.WheelEvent) {
    // apply a linear zoom effect to the element in componentState.element
    // based on how much the user scrolls their wheel
    const innerWrapper = componentState.innerWrapper
    const outerWrapper = componentState.outerWrapper
    if (!innerWrapper || !outerWrapper) return

    const currentScale = componentState.transform.scale
    let scale = currentScale

    const delta = -e.deltaY

    const isZoomingIn = delta > 0
    if (isZoomingIn) {
      scale += props.getData().getZoomScaleStep()
    } else {
      scale -= props.getData().getZoomScaleStep()
    }

    scale = Math.min(
      Math.max(props.getData().getMinScale(), scale),
      props.getData().getMaxScale()
    )

    // prevent the user from zooming in or out past the max or min scale
    if (
      (isZoomingIn && scale > props.getData().getMaxScale()) ||
      (!isZoomingIn && scale < props.getData().getMinScale())
    )
      return

    componentState.transform.scale = scale

    // while the user scrolls their wheel
    // we want the UI to zoom in while keeping the same area of the chart under the mouse
    // said differently, the innerWrapper should be scaled around the mouse position
    // such that if I'm hovering a specific seat, that seat should stay under my mouse cursor
    const innerWrapperBoundingRect = innerWrapper.getBoundingClientRect()
    const outerWrapperBoundingRect = outerWrapper.getBoundingClientRect()

    const coordinatesOfMouseInOuterWrapper = {
      x: e.clientX - outerWrapperBoundingRect.left,
      y: e.clientY - outerWrapperBoundingRect.top,
    }

    // these coordinates are the coordinates of the mouse in the innerWrapper
    // as if it were not scaled (scale 1)
    const coordinatesOfMouseInInnerWrapper = {
      x:
        (innerWrapperBoundingRect.left < outerWrapperBoundingRect.left
          ? coordinatesOfMouseInOuterWrapper.x +
            (outerWrapperBoundingRect.left - innerWrapperBoundingRect.left)
          : coordinatesOfMouseInOuterWrapper.x -
            (innerWrapperBoundingRect.left - outerWrapperBoundingRect.left)) /
        currentScale,
      y:
        (innerWrapperBoundingRect.top < outerWrapperBoundingRect.top
          ? coordinatesOfMouseInOuterWrapper.y +
            (outerWrapperBoundingRect.top - innerWrapperBoundingRect.top)
          : coordinatesOfMouseInOuterWrapper.y -
            (innerWrapperBoundingRect.top - outerWrapperBoundingRect.top)) /
        currentScale,
    }

    const sizeOfInnerWrapper = {
      width: innerWrapper.clientWidth,
      height: innerWrapper.clientHeight,
    }

    const mousePositionInInnerWrapperPercentage = {
      x: coordinatesOfMouseInInnerWrapper.x / sizeOfInnerWrapper.width,
      y: coordinatesOfMouseInInnerWrapper.y / sizeOfInnerWrapper.height,
    }

    const sizeDiffBetweenScalings = {
      width:
        sizeOfInnerWrapper.width * scale -
        sizeOfInnerWrapper.width * currentScale,
      height:
        sizeOfInnerWrapper.height * scale -
        sizeOfInnerWrapper.height * currentScale,
    }

    componentState.transform.xTranslate -=
      sizeDiffBetweenScalings.width * mousePositionInInnerWrapperPercentage.x
    componentState.transform.yTranslate -=
      sizeDiffBetweenScalings.height * mousePositionInInnerWrapperPercentage.y

    applyTransforms()
  })

  const normalizeToSingleDecimal = useAction((num: number) => {
    return Math.round(num * 10) / 10
  })

  const onIncreaseScale = useAction(() => {
    if (!componentState?.innerWrapper) return
    componentState.transform.scale = normalizeToSingleDecimal(
      Math.min(
        props.getData().getMaxScale(),
        componentState.transform.scale + props.getData().getZoomScaleStep()
      )
    )

    applyTransforms()
  })

  const onDecreaseScale = useAction(() => {
    if (!componentState.innerWrapper) return
    componentState.transform.scale = normalizeToSingleDecimal(
      Math.max(
        props.getData().getMinScale(),
        componentState.transform.scale - props.getData().getZoomScaleStep()
      )
    )
    applyTransforms()
  })

  const onFitScreen = useAction(() => {
    if (!componentState.innerWrapper || !componentState.outerWrapper) {
      return
    }

    const scaleToFit = Math.min(
      (componentState.outerWrapper.clientWidth -
        props.getData().getPaddingPx() * 2) /
        componentState.innerWrapper.clientWidth,
      (componentState.outerWrapper.clientHeight -
        props.getData().getPaddingPx() * 2) /
        componentState.innerWrapper.clientHeight
    )

    componentState.transform.scale = Math.min(scaleToFit, 1)

    // center the chart
    const widthDifference =
      componentState.outerWrapper.clientWidth -
      componentState.innerWrapper.clientWidth * componentState.transform.scale
    const heightDifference =
      componentState.outerWrapper.clientHeight -
      componentState.innerWrapper.clientHeight * componentState.transform.scale

    componentState.transform.xTranslate = widthDifference / 2
    componentState.transform.yTranslate = heightDifference / 2

    applyTransforms()
  })

  const fitToPrintPage = useAction(() => {
    const printSettings = printContext.isInPrint
      ? printContext.printSettings
      : null
    const initialState = props.getData().getInitialState()

    if (!initialState || !printSettings) {
      throw Error('initialState and printSettings are required for printing')
    }

    const currentScale = initialState.transform.scale
    const outerWrapper = initialState.outerWrapper
    const innerWrapper = initialState.innerWrapper

    if (!outerWrapper || !innerWrapper) {
      throw Error(
        'outerWrapper and innerWrapper from initial state are required for printing'
      )
    }

    const pageWidth = printSettings.width
    const pageHeight = printSettings.height

    const outerWrapperBoundingRect = outerWrapper.getBoundingClientRect()

    function getScaleToFitSameContentInPage() {
      const outerWrapperWidth = outerWrapperBoundingRect.width
      const outerWrapperHeight = outerWrapperBoundingRect.height

      const scaleToFitWidth = pageWidth / outerWrapperWidth
      const scaleToFitHeight = pageHeight / outerWrapperHeight

      return currentScale * Math.min(scaleToFitWidth, scaleToFitHeight)
    }

    componentState.transform.scale = getScaleToFitSameContentInPage()

    componentState.transform.xTranslate =
      componentState.transform.scale *
      (componentState.transform.xTranslate / currentScale)
    componentState.transform.yTranslate =
      componentState.transform.scale *
      (componentState.transform.yTranslate / currentScale)

    applyTransforms()
  })

  const applyTransforms = useAction(function applyTransforms(opts?: {
    smooth?: boolean
  }) {
    const innerWrapper = componentState.innerWrapper
    const currentTransition = innerWrapper?.style.transition
    if (!innerWrapper) return

    if (opts?.smooth) {
      innerWrapper.style.transition = `transform ${SEAT_CENTER_ANIMATION_DURATION_MS}ms ease-in-out`
      setTimeout(() => {
        innerWrapper.style.transition = currentTransition || 'initial'
      }, SEAT_CENTER_ANIMATION_DURATION_MS)
    }
    innerWrapper.style.transform = `translate(${componentState.transform.xTranslate}px, ${componentState.transform.yTranslate}px) scale(${componentState.transform.scale})`
  })

  useRunOnceOnMount(function onZoomableAreaReady() {
    if (!printContext.isInPrint) {
      props.getActions().onZoomableAreaReady({
        state: componentState,
        actions: {
          applyTransforms,
          fitScreen: onFitScreen,
          increaseScale: onIncreaseScale,
          decreaseScale: onDecreaseScale,
        },
      })
    } else {
      fitToPrintPage()
    }
  })

  return (
    <div
      className={props.className}
      id={props.id}
      role={props.role}
      tabIndex={props.tabIndex}
      ref={(ele) => {
        if (ele && componentState.outerWrapper !== ele) {
          runInAction(() => {
            componentState.outerWrapper = ele
            applyTransforms()
          })
        }
      }}
      css={css`
        width: 100%;
        height: 100%;
        cursor: grab;
        overflow: hidden;
      `}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
      onWheel={onWheel}
    >
      <div
        id='inner-wrapper'
        ref={(ele) => {
          if (ele && componentState.innerWrapper !== ele) {
            runInAction(() => {
              componentState.innerWrapper = ele

              if (!printContext.isInPrint) {
                props.getActions().onInnerWrapperReady()
              }
              applyTransforms()
            })
          }
        }}
        css={css`
          position: absolute;
          box-sizing: content-box;
          transform-origin: 0 0;
        `}
      >
        {props.children}
      </div>
    </div>
  )
})
