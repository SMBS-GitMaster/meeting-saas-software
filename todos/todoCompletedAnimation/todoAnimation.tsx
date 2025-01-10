import React, { useEffect } from 'react'
import Lottie from 'react-lottie-player'
import { css } from 'styled-components'

import { useSafeState } from '@mm/core/ui/hooks'

import { Clickable } from '@mm/core-web/ui'

import fireworksDataLottie from './fireworksDataLottie.json'

interface ITodoAnimation {
  isCurrentMeetingInstance: boolean
}

export const TodoAnimation = ({ isCurrentMeetingInstance }: ITodoAnimation) => {
  const [show, setShow] = useSafeState(false)
  const [isVisibleTodoAnimation, setIsVisibleTodoAnimation] =
    useSafeState(false)

  useEffect(() => {
    if (!isVisibleTodoAnimation) {
      setIsVisibleTodoAnimation(true)
    }
  }, [isVisibleTodoAnimation])

  useEffect(() => {
    if (isVisibleTodoAnimation && isCurrentMeetingInstance) {
      setShow(true)
    }
  }, [isVisibleTodoAnimation, isCurrentMeetingInstance])

  if (!show) return null

  return (
    <div
      css={css`
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
      `}
    >
      <Clickable
        clicked={() => setShow(false)}
        css={css`
          width: 100%;
          height: 100%;
        `}
      >
        <Lottie
          loop={false}
          onLoopComplete={() => {
            setShow(false)
          }}
          play
          animationData={fireworksDataLottie}
          style={{
            height: '90vh',
          }}
        />
      </Clickable>
    </div>
  )
}
