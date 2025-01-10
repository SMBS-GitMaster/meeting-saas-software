import React from 'react'
import { css } from 'styled-components'

import { Expandable } from '@mm/core-web/ui'

import { MeetingGoalsList } from '@mm/bloom-web/goals/'

export function GoalsListDemo() {
  return (
    <Expandable title='Goals'>
      <MeetingGoalsList
        getPageToDisplayData={() => {
          return { pageName: 'Goals' }
        }}
        meetingId={'mock-meeting-id-1'}
        workspaceTileId={null}
        css={css`
          width: 912px;
          height: 456px;
        `}
      />
    </Expandable>
  )
}
