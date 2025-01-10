import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { BtnText, Expandable, Text } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const MeetingNotesDemo = observer(function MeetingNotesDemo() {
  const { openOverlazy } = useOverlazyController()

  const stickToElementRef = React.useRef<Maybe<HTMLDivElement>>()

  return (
    <Expandable title='Meeting Notes'>
      <div>
        <div
          css={css`
            display: flex;
          `}
        >
          <div
            css={css`
              border: 1px solid gainsboro;
              position: sticky;
              height: 25vh;
              top: 0;
              padding: 16px;
            `}
          >
            <div>
              <Text type='h3'>Agenda Items</Text>
            </div>
            <BtnText
              ariaLabel=''
              onClick={() =>
                openOverlazy('MeetingNotesStickyTile', {
                  meetingId: '88389',
                  stickToElementRef,
                })
              }
            >
              Open meeting notes
            </BtnText>
          </div>
          <div
            ref={(r) => {
              stickToElementRef.current = r
            }}
            css={css`
              border: 1px solid gainsboro;
              background: whitesmoke;
              height: 80vh;
              min-width: 950px;
              padding: 16px;
            `}
          >
            <Text type='h3'>Agenda Content</Text>
          </div>
        </div>
      </div>
    </Expandable>
  )
})
