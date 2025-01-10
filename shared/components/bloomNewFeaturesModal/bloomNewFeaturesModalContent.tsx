import { observer } from 'mobx-react'
import React, { useCallback, useState } from 'react'
import styled, { css } from 'styled-components'

import { Clickable, Icon, toREM } from '@mm/core-web/ui'

import { FEATURE_TO_COMPONENT_MAP } from './bloomNewFeaturesModalConstants'
import { TBloomNewFeatureModalFeature } from './bloomNewFeaturesModalTypes'

interface IBloomNewFeatureModalContentProps {
  selectedFeature: TBloomNewFeatureModalFeature
  scrolled: (direction: 'UP' | 'DOWN') => void
  onClose: () => void
}

export const BloomNewFeaturesModalContent = observer(
  function BloomNewFeaturesModalContent(
    props: IBloomNewFeatureModalContentProps
  ) {
    const [isScrolling, setIsScrolling] = useState(false)

    const handleScroll = useCallback(
      (e: React.WheelEvent<HTMLDivElement>) => {
        if (!isScrolling) {
          setIsScrolling(true)
          const direction = e.deltaY > -1 ? 'DOWN' : 'UP'
          props.scrolled(direction)
          setTimeout(() => {
            setIsScrolling(false)
          }, 300)
        }
      },
      [isScrolling, props, setIsScrolling]
    )

    const featureContent = FEATURE_TO_COMPONENT_MAP[props.selectedFeature]

    return (
      <div
        onWheel={(e) => {
          e.persist()
          handleScroll(e)
        }}
        css={css`
          height: ${toREM(720)};
          max-height: ${toREM(720)};
          overflow: auto;
          flex-grow: 1;
        `}
      >
        <div
          css={css`
            display: flex;
            justify-content: end;
            padding-right: ${toREM(4)};
            padding-top: ${toREM(4)};
          `}
        >
          <Clickable clicked={props.onClose}>
            <Icon iconName='closeIcon' iconSize='xl' />
          </Clickable>
        </div>
        <div
          css={css`
            align-items: center;
            display: flex;
            flex-direction: column;
            width: 100%;
          `}
        >
          {featureContent && typeof featureContent === 'string' && (
            <FeatureImg src={featureContent} />
          )}
          {featureContent &&
            typeof featureContent === 'function' &&
            featureContent()}
        </div>
      </div>
    )
  }
)

const FeatureImg = styled.img`
  height: auto;
  width: ${toREM(600)};
`
