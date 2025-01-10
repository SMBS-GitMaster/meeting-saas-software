import React from 'react'
import { css } from 'styled-components'

import { Expandable } from '@mm/core-web/ui'

import { MeetingTodoList } from '@mm/bloom-web/todos'

export const MeetingTodoListDemo = () => {
  return (
    <Expandable title='Meeting To-do List'>
      <div>
        <MeetingTodoList
          meetingId={'mock-meeting-id-1'}
          workspaceTileId={null}
          getPageToDisplayData={() => {
            return { pageName: 'To-dos' }
          }}
          css={css`
            width: 912px;
            height: 600px;
          `}
        />
      </div>
    </Expandable>
  )
}
