import React from 'react'
import { css } from 'styled-components'

import { Expandable, Text } from '@mm/core-web/ui'

import { IssueList } from '@mm/bloom-web/issues/issueList'

export const IssueListDemo = () => {
  return (
    <Expandable title='Issue List Demo'>
      <div
        css={css`
          padding: 20px;
        `}
      >
        <Text type='h1'>Issue List Demo</Text>
        <IssueList
          getPageToDisplayData={() => {
            return {
              pageName: 'Issues',
            }
          }}
          meetingId={'mock-meeting-id-1'}
          workspaceTileId={null}
          css={css`
            width: 912px;
            height: 600px;
          `}
        />
      </div>
    </Expandable>
  )
}
