import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Expandable, Text } from '@mm/core-web/ui'

import { MeetingStats } from '@mm/bloom-web/meetingStats'
import { WrapUp } from '@mm/bloom-web/wrapUp'

export const WrapUpDemo = observer(function WrapUpDemo() {
  return (
    <Expandable title='Wrap-up'>
      <div>
        <Text type='h1'>Meeting Concluded Card</Text>
        <br />
        <MeetingStats meetingId={'mock-meeting-id-1'} meetingPageName='Stats' />
        <br />
        <br />
        <WrapUp
          onConclude={() => {}}
          getPageToDisplayData={() => {
            return { pageName: 'Wrap-up' }
          }}
          css={css`
            width: 912px;
          `}
          meetingId='mock-meeting-id-1'
        />
      </div>
    </Expandable>
  )
})
