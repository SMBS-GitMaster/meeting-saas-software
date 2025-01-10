import React from 'react'
import { css } from 'styled-components'

import { Expandable } from '@mm/core-web/ui'

import { HeadlinesList } from '@mm/bloom-web/headlines/headlinesList/headlinesList'

export function HeadlinesListDemo() {
  return (
    <Expandable title='HeadlinesList UI Demo'>
      <HeadlinesList
        getPageToDisplayData={() => {
          return {
            pageName: 'Headlines',
          }
        }}
        meetingId={'123'}
        workspaceTileId={null}
        css={css`
          width: 912px;
          height: 456px;
        `}
      />
    </Expandable>
  )
}
