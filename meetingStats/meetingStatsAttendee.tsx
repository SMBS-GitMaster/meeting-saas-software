import React from 'react'
import { css } from 'styled-components'

import { uuid } from '@mm/core/utils'

import { useTranslation } from '@mm/core-web/i18n'
import { SquareRatingInput, Text, UserAvatar, toREM } from '@mm/core-web/ui'

import {
  IMeetingStatsAttendeeInstance,
  IMeetingStatsViewData,
} from './meetingStatsTypes'

export const MeetingStatsAttendee: React.FC<{
  attendeesInstances: IMeetingStatsAttendeeInstance[]
  averageMeetingRating: IMeetingStatsViewData['averageMeetingRating']
}> = function Attendee({ attendeesInstances, averageMeetingRating }) {
  const { t } = useTranslation()

  return (
    <>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          margin-left: ${({ theme }) => theme.sizes.spacing24};
          margin-bottom: ${({ theme }) => theme.sizes.spacing16};
        `}
      >
        <Text
          type='h1'
          weight='semibold'
          color={{ intent: 'default' }}
          css={css`
            margin-bottom: ${({ theme }) => theme.sizes.spacing4};
            font-size: ${toREM(20)};
          `}
        >
          {t('Rating')}
        </Text>
        <Text type='body' weight='normal' color={{ intent: 'default' }}>
          {t(`This meeting's rating average`)}:{' '}
          <Text
            type='h1'
            weight='semibold'
            color={{ intent: 'default' }}
            css={css`
              font-size: ${toREM(24)};
            `}
          >
            {averageMeetingRating}
          </Text>
        </Text>
      </div>
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          margin-bottom: ${({ theme }) => theme.sizes.spacing48};
          margin-left: ${({ theme }) => theme.sizes.spacing8};
        `}
      >
        {attendeesInstances.map((attendeeInstance) => (
          <div
            key={uuid()}
            css={css`
              height: ${toREM(64)};
              width: 33.33%;
              padding: ${(prop) => prop.theme.sizes.spacing16};
              display: flex;
              align-items: center;
            `}
          >
            <div
              css={css`
                position: relative;
                display: inline-block;
                margin-right: ${(prop) => prop.theme.sizes.spacing16};
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
            <UserAvatar
              firstName={attendeeInstance.attendee.firstName}
              lastName={attendeeInstance.attendee.lastName}
              userAvatarColor={attendeeInstance.attendee.userAvatarColor}
              avatarUrl={attendeeInstance.attendee.avatar}
              adornments={{ tooltip: true }}
              size='s'
              css={css`
                margin-right: ${(prop) => prop.theme.sizes.spacing8};
              `}
            />
            <Text
              type='body'
              weight='normal'
              color={{ intent: 'default' }}
            >{`${attendeeInstance.attendee.firstName} ${attendeeInstance.attendee.lastName}`}</Text>
          </div>
        ))}
      </div>
    </>
  )
}
