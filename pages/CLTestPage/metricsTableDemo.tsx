import React from 'react'
import { css } from 'styled-components'

import { Expandable } from '@mm/core-web/ui'

import { MetricsTable } from '@mm/bloom-web/metrics/metricsTable'

import { MEETING_PAGE_BOTTOM_PORTAL_ID } from '../meetings/meetingPageView'

export const MetricsTableDemo = () => {
  return (
    <Expandable title='Metrics Table & Tabs'>
      <div
        css={`
          width: 1200px;
        `}
      >
        <MetricsTable
          meetingId={'mock-meeting-id-1'}
          workspaceTileId={null}
          getPageToDisplayData={() => {
            return {
              pageName: 'Metrics',
            }
          }}
        />

        <div
          id={MEETING_PAGE_BOTTOM_PORTAL_ID}
          css={css`
            align-items: flex-end;
            align-self: flex-end;
            display: inline-flex;
            margin-top: 20px;
            width: 100%;
            background: ${({ theme }) => theme.colors.bodyBackgroundColor};
            z-index: ${({ theme }) => theme.zIndices.tabs};
          `}
        ></div>
      </div>
    </Expandable>
  )
}
