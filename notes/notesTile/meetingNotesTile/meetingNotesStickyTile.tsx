import { observer } from 'mobx-react'
import React from 'react'
import { css, keyframes } from 'styled-components'

import { Id } from '@mm/gql'

import { TBloomPageType } from '@mm/core-bloom'

import { StickyDrawer, toREM, useStickyDrawerController } from '@mm/core-web/ui'

import { MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID } from '@mm/bloom-web/pages/layout/consts'

import { MeetingNotesTile } from './meetingNotesTile'

interface IMeetingNotesStickyTileProps {
  meetingId: Id
  stickToElementRef: React.MutableRefObject<Maybe<HTMLElement> | undefined>
  pageType?: TBloomPageType
  className?: string
}

export const MeetingNotesStickyTile = observer(function MeetingNotesStickyTile(
  props: IMeetingNotesStickyTileProps
) {
  const { closeStickyDrawer } = useStickyDrawerController()

  return (
    <StickyDrawer
      id={'MeetingNotesStickyTile'}
      enableUnderlyingClick={true}
      mainBodyContentElementId={MAIN_BODY_SCROLL_CONTENT_CONTAINER_ID}
      stickToElementRef={props.stickToElementRef}
      width={toREM(912)}
      height={toREM(440)}
      expandedWidth={toREM(928)}
      onClose={() => closeStickyDrawer()}
      css={css`
        overflow: auto;
        animation: ${fadeIn} 500ms linear;
      `}
    >
      <MeetingNotesTile
        workspaceTileId={null}
        {...props}
        css={css`
          height: 100%;
        `}
      />
    </StickyDrawer>
  )
})

export default MeetingNotesStickyTile

const fadeIn = keyframes`
  from {  
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`
