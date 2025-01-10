import React from 'react'
import { css } from 'styled-components'

import { Expandable } from '@mm/core-web/ui'
import { Details } from '@mm/core-web/ui/components/details'

export function DetailsDemo() {
  const detailsMockData = {
    id: 'details1',
    meetingName: 'UX Weekly L10',
    issueName: 'Facilisis amet a et felis, etiam tincidunt.',
    issueAssignee: 'Craig Matthews',
    details:
      'Non, pharetra faucibus mauris, dis cras diam nisi ut facilisi. Nullam orci purus, faucibus consectetur lobortis in. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.',
  }

  return (
    <Expandable title='Details'>
      <div
        css={css`
          background-color: white;
        `}
      >
        <div
          css={css`
            margin: 20px;
            width: 632px;
          `}
        >
          <Details startShowed detailsData={detailsMockData} />
        </div>
      </div>
    </Expandable>
  )
}
