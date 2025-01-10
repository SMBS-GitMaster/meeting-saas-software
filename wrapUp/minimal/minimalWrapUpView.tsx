import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Card, toREM, useResizeObserver } from '@mm/core-web/ui'

import {
  useAction,
  useComputed,
  useObservable,
} from '../../pages/performance/mobx'
import { TWrapUpResponsiveSize } from '../wrapUpTypes'
import { MinimalWrapUpConcludeActions } from './minimalWrapUpConcludeActions'
import { RECORD_OF_GRID_SIZE_TO_MINIMAL_WRAP_UP_RESPONSIVE_SIZE } from './minimalWrapUpSectionConsts'
import { IMinimalWrapUpViewProps } from './minimalWrapUpTypes'

export const MinimalWrapUpView = observer(function MinimalWrapUpView(
  props: IMinimalWrapUpViewProps & {
    className?: string
  }
) {
  const componentState = useObservable({
    wrapUpCardEl: null as Maybe<HTMLDivElement>,
  })

  const observableResizeState = useResizeObserver(componentState.wrapUpCardEl)

  const { getData, getActions } = props

  const getWrapUpResponsiveSize: () => TWrapUpResponsiveSize = useComputed(
    () => {
      if (!observableResizeState.ready) return 'UNKNOWN'
      if (observableResizeState.width < 300) return 'XSMALL'
      if (observableResizeState.width < 700) return 'SMALL'
      if (observableResizeState.width < 1000) return 'MEDIUM'
      return 'LARGE'
    },
    { name: 'wrapUpView-getWrapUpResponsiveSize' }
  )

  const getGridResponsiveSize = useComputed(
    () => {
      return RECORD_OF_GRID_SIZE_TO_MINIMAL_WRAP_UP_RESPONSIVE_SIZE[
        getWrapUpResponsiveSize()
      ]
    },
    { name: 'wrapUpView-getGridResponsiveSize' }
  )

  const setWrapUpCardEl = useAction((el: Maybe<HTMLDivElement>) => {
    componentState.wrapUpCardEl = el
  })

  return (
    <Card
      ref={setWrapUpCardEl}
      className={props.className}
      css={css`
        position: relative;
        margin-bottom: ${toREM(64)};
      `}
    >
      <Card.Body>
        {observableResizeState.loadingUI}
        {observableResizeState.ready && (
          <MinimalWrapUpConcludeActions
            getGridResponsiveSize={getGridResponsiveSize}
            getData={getData}
            getActions={getActions}
            getWrapUpResponsiveSize={getWrapUpResponsiveSize}
          />
        )}
      </Card.Body>
    </Card>
  )
})
