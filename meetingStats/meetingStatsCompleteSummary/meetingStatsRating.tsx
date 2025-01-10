import React from 'react'
import { css } from 'styled-components'

import { uuid } from '@mm/core/utils'

import { useTranslation } from '@mm/core-web/i18n'
import { SquareRatingInput, Text, toREM, useTheme } from '@mm/core-web/ui'

import {
  IMeetingStatsAttendeeInstance,
  IMeetingStatsViewData,
} from '../meetingStatsTypes'
import { MeetingStatTitle } from './meetingStatsTitle'

export const MeetingStatsRating: React.FC<{
  attendeesInstances: IMeetingStatsAttendeeInstance[]
  averageMeetingRating: IMeetingStatsViewData['averageMeetingRating']
}> = function Attendee({ attendeesInstances, averageMeetingRating }) {
  const { colors } = useTheme()
  const { t } = useTranslation()

  return (
    <>
      <MeetingStatTitle text={t('Meeting rating')} />
      <Text
        type='body'
        weight='semibold'
        color={{ color: `${colors.meetingBtnRatingText}` }}
        css={css`
          width: 100%;
          padding: 0 ${(props) => props.theme.sizes.spacing16};
        `}
      >
        {t(`This meeting's rating average`)}:{' '}
        <Text
          type='h3'
          weight='semibold'
          color={{ color: `${colors.meetingBtnRatingText}` }}
        >
          {averageMeetingRating}
        </Text>
      </Text>
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          margin-bottom: ${({ theme }) => theme.sizes.spacing24};
        `}
      >
        {attendeesInstances.map((attendeeInstance) => (
          <div
            key={uuid()}
            css={css`
              height: ${toREM(52)};
              width: 33.33%;
              padding: ${(prop) => prop.theme.sizes.spacing12};
              display: flex;
              align-items: center;
            `}
          >
            <div
              css={css`
                margin-right: ${({ theme }) => theme.sizes.spacing16};
              `}
            >
              <SquareRatingInput
                id={`rating_for_${attendeeInstance.attendee.id}`}
                name={`rating_${attendeeInstance.rating}`}
                placeholder={'-'}
                value={`${attendeeInstance.rating || '-'}`}
                disabled
              />
            </div>
            <Text
              type='body'
              weight='semibold'
              color={{ intent: 'default' }}
            >{`${attendeeInstance.attendee.firstName} ${attendeeInstance.attendee.lastName}`}</Text>
          </div>
        ))}
      </div>
    </>
  )
}
