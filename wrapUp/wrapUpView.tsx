import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Card, toREM, useResizeObserver } from '@mm/core-web/ui'

import {
  useAction,
  useComputed,
  useObservable,
} from '../pages/performance/mobx'
import { WrapUpConcludeActions } from './wrapUpConcludeActions'
import { WrapUpIssuesView } from './wrapUpIssuesView'
import { WrapUpMeetingFeedback } from './wrapUpMeetingFeedback'
import { WrapUpQuickTodoView } from './wrapUpQuickTodoView'
import { RECORD_OF_GRID_SIZE_TO_WRAP_UP_RESPONSIVE_SIZE } from './wrapUpSectionConsts'
import { WrapUpTodosView } from './wrapUpTodosView'
import { IWrapUpViewProps, TWrapUpResponsiveSize } from './wrapUpTypes'

export const WrapUpView = observer(function WrapUpView(
  props: IWrapUpViewProps
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
      return RECORD_OF_GRID_SIZE_TO_WRAP_UP_RESPONSIVE_SIZE[
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
      <Card.Header
        renderLeft={<Card.Title>{getData().getMeetingPageName()}</Card.Title>}
      >
        <Card.SubHeader>
          <div
            css={css`
              display: flex;
              align-items: flex-end;
            `}
          >
            <WrapUpQuickTodoView getData={getData} getActions={getActions} />
          </div>
        </Card.SubHeader>
      </Card.Header>
      <Card.Body
        css={css`
          padding-top: ${(prop) => prop.theme.sizes.spacing24};
        `}
      >
        {observableResizeState.loadingUI}
        {observableResizeState.ready && (
          <>
            <WrapUpTodosView getData={getData} getActions={getActions} />
            <WrapUpIssuesView getData={getData} getActions={getActions} />
            <WrapUpMeetingFeedback
              getGridResponsiveSize={getGridResponsiveSize}
              getData={getData}
              getActions={getActions}
            />

            <WrapUpConcludeActions
              getGridResponsiveSize={getGridResponsiveSize}
              getData={getData}
              getActions={getActions}
              getWrapUpResponsiveSize={getWrapUpResponsiveSize}
            />
          </>
        )}
      </Card.Body>
    </Card>
  )
})
