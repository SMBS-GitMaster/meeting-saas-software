import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID,
  POPUP_PORTAL_OUT_ID,
} from './consts'
import {
  StyledChildrenContainer,
  StyledContentContainer,
  StyledPageContainer,
} from './containers'

interface IEmptyBloomLayoutProps {
  children: React.ReactNode
}

export default observer(function EmptyBloomLayout(
  props: IEmptyBloomLayoutProps
) {
  return (
    <StyledPageContainer>
      <StyledContentContainer>
        <StyledChildrenContainer id={MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID}>
          {props.children}
        </StyledChildrenContainer>
      </StyledContentContainer>
      <div
        id={POPUP_PORTAL_OUT_ID}
        css={css`
          position: fixed;
          top: ${({ theme }) => theme.sizes.spacing32};
          left: ${({ theme }) => theme.sizes.spacing32};
          right: ${({ theme }) => theme.sizes.spacing32};
          bottom: ${({ theme }) => theme.sizes.spacing32};

          pointer-events: none;
          z-index: ${({ theme }) => theme.zIndices.popups};
        `}
      />
    </StyledPageContainer>
  )
})
