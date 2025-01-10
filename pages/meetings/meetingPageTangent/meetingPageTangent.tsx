import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import Lottie from 'react-lottie-player'
import { css } from 'styled-components'

import { useMMErrorLogger } from '@mm/core/logging'

import { useTranslation } from '@mm/core-web/i18n'
import { Clickable } from '@mm/core-web/ui/'

import MeetingPageTangentAudio from './meetingPageTangentAudio.mp3'
import MeetingPageTangentLottie from './meetingPageTangentLottie.json'
import MeetingPageTangentSVG from './meetingPageTangentSVG.svg'

const TIME_TILL_TANGENT_ENDS_IN_MS = 24000

interface IMeetingPageTangentProps {
  tangentAlertTimestamp: number | undefined
}

export const MeetingPageTangent = observer(function MeetingPageTangent(
  props: IMeetingPageTangentProps
) {
  const [isShowing, setIsShowing] = useState(false)
  const [audio] = useState(new Audio(MeetingPageTangentAudio))
  const [lastTimestamp, setLastTimestamp] = useState(
    props.tangentAlertTimestamp || 0
  )

  const { logError } = useMMErrorLogger()
  const { t } = useTranslation()

  useEffect(() => {
    if (props.tangentAlertTimestamp) {
      setLastTimestamp(props.tangentAlertTimestamp)
    }
  }, [props.tangentAlertTimestamp])

  useEffect(() => {
    if (
      props.tangentAlertTimestamp &&
      lastTimestamp &&
      props.tangentAlertTimestamp > lastTimestamp
    ) {
      setLastTimestamp(props.tangentAlertTimestamp)
      setIsShowing(true)

      setTimeout(() => {
        setIsShowing(false)
      }, TIME_TILL_TANGENT_ENDS_IN_MS)
    }
  }, [
    props.tangentAlertTimestamp,
    lastTimestamp,
    setLastTimestamp,
    setIsShowing,
  ])

  useEffect(() => {
    const play = async () => await audio.play().catch((e) => logError(e))

    if (isShowing) {
      play()
    } else {
      audio.pause()
      audio.currentTime = 0
    }
  }, [isShowing, audio, logError])

  if (!isShowing) return null

  return (
    <div
      css={css`
        background: rgba(32, 41, 47, 0.6);
        bottom: 0;
        height: 100vh;
        left: 0;
        margin: auto;
        position: fixed;
        top: 0;
        width: 100vw;
        z-index: 9999999;
      `}
    >
      <Clickable
        clicked={() => setIsShowing(false)}
        css={css`
          width: 100%;
        `}
      >
        <>
          <img
            src={MeetingPageTangentSVG}
            alt={t('Meeting Page Tangent SVG')}
            css={css`
              bottom: 0;
              left: 0;
              height: auto;
              margin: auto;
              max-width: 100%;
              position: absolute;
              right: 0;
              top: 3%;
            `}
          />
          <Lottie
            play
            animationData={MeetingPageTangentLottie}
            style={{
              height: '80vh',
              width: '80vw',
            }}
          />
        </>
      </Clickable>
    </div>
  )
})
