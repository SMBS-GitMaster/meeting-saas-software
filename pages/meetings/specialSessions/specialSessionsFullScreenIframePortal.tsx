import { observer } from 'mobx-react'
import React from 'react'
import { Portal } from 'react-portal'
import { css } from 'styled-components'

import { useDocument } from '@mm/core/ssr'

import { ExpandedComponent } from '@mm/core-web/ui'

import { useAction } from '../../performance/mobx'
import { BLOOM_SPECIAL_SESSIONS_EXPANDED_PORTAL_OUT_ID } from './constants'

interface ISpecialSessionsFullScreenIframePortalProps {
  children: React.JSX.Element
  closeExpandedIframeOption: () => void
}

export const SpecialSessionsFullScreenIframePortal = observer(
  function SpecialSessionsFullScreenIframePortal(
    props: ISpecialSessionsFullScreenIframePortalProps
  ) {
    const document = useDocument()

    const onBackdropClicked = useAction(() => {
      props.closeExpandedIframeOption()
    })

    return (
      <>
        <Portal
          node={
            document.getElementById(
              BLOOM_SPECIAL_SESSIONS_EXPANDED_PORTAL_OUT_ID
            ) as Maybe<HTMLDivElement>
          }
        >
          <ExpandedComponent
            fillHeightToScreen={true}
            backdropClicked={onBackdropClicked}
            css={css`
              overflow-y: hidden;
            `}
          >
            {props.children}
          </ExpandedComponent>
        </Portal>
      </>
    )
  }
)
