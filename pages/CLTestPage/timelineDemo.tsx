import React from 'react'
import { css } from 'styled-components'

import { guessTimezone } from '@mm/core/date'

import { useTranslation } from '@mm/core-web/i18n'
import { Expandable, Timeline, TimelineString } from '@mm/core-web/ui'

export function TimelineDemo() {
  const { t } = useTranslation()

  const timeLineMockData = [
    {
      dateCreated: 1628600000000,
      eventText: 'Marketing',
      details: 'issue created',
    },
    {
      dateCreated: 1628600000000,
      eventText: 'Product',
    },
    {
      dateCreated: 1628600000000,
      eventText: 'UX Weekly Meeting',
      isMeetingItem: true,
    },
    {
      dateCreated: 1628600000000,
      eventText: 'Marketing',
    },
    {
      dateCreated: 1628600000000,
      eventText: 'Sales',
    },
    {
      dateCreated: 1628600000000,
      eventText: 'Sales',
      details: 'issue solved',
    },
  ]

  return (
    <Expandable title='Timeline'>
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
          <Timeline
            timezone={guessTimezone()}
            timelineText={t('Timeline')}
            timelineItems={timeLineMockData}
          />
          <div
            css={css`
              height: 20px;
            `}
          />
          <TimelineString
            timezone={guessTimezone()}
            timelineItems={timeLineMockData}
          />
        </div>
      </div>
    </Expandable>
  )
}
