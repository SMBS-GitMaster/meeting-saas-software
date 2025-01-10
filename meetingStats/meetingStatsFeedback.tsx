import React from 'react'
import { css } from 'styled-components'

import { uuid } from '@mm/core/utils'

import { useTranslation } from '@mm/core-web/i18n'
import { Text, UserAvatar, toREM } from '@mm/core-web/ui'

import { IMeetingStatsFeedbackInstance } from './meetingStatsTypes'

export const MeetingStatsFeedback: React.FC<{
  feedbackInstances?: IMeetingStatsFeedbackInstance[]
  isCompleteSummary?: boolean
}> = function Feedback({ feedbackInstances, isCompleteSummary }) {
  const { t } = useTranslation()
  return (
    <>
      <div
        css={css`
          display: flex;
          flex-direction: column;
          margin-left: ${isCompleteSummary
            ? ({ theme }) => theme.sizes.spacing16
            : ({ theme }) => theme.sizes.spacing24};
        `}
      >
        <Text
          type={isCompleteSummary ? 'h3' : 'h1'}
          weight='semibold'
          color={{ intent: 'default' }}
          css={css`
            padding-bottom: ${toREM(11)};
            font-size: ${toREM(18)};
          `}
        >
          {t('Meeting feedback')}
        </Text>
      </div>
      {feedbackInstances?.length ? (
        <div
          css={css`
            display: flex;
            flex-wrap: wrap;
          `}
        >
          {feedbackInstances?.map((feedbackInstance) => (
            <>
              {feedbackInstance.message && (
                <div
                  key={uuid()}
                  css={css`
                    padding-bottom: ${(prop) => prop.theme.sizes.spacing8};
                    padding-left: ${isCompleteSummary
                      ? (prop) => prop.theme.sizes.spacing16
                      : (prop) => prop.theme.sizes.spacing24};
                    display: flex;
                    width: ${toREM(563)};
                  `}
                >
                  <>
                    {!isCompleteSummary && (
                      <UserAvatar
                        firstName={feedbackInstance.attendee.firstName}
                        lastName={feedbackInstance.attendee.lastName}
                        avatarUrl={feedbackInstance.attendee.avatar}
                        userAvatarColor={
                          feedbackInstance.attendee.userAvatarColor
                        }
                        adornments={{ tooltip: true }}
                        size='s'
                        css={css`
                          margin-right: ${(prop) => prop.theme.sizes.spacing8};
                        `}
                      />
                    )}
                    <div
                      css={css`
                        display: flex;
                        justify-content: space-between;
                        width: 100%;
                      `}
                    >
                      <Text
                        type='body'
                        weight='normal'
                        color={{ intent: 'default' }}
                        fontStyle='italic'
                        css={css`
                          max-width: ${toREM(400)};
                        `}
                      >
                        {`"${feedbackInstance.message}"`}
                      </Text>
                      <Text
                        type='body'
                        weight='semibold'
                        color={{ intent: 'default' }}
                        css={css`
                          margin-left: ${({ theme }) => theme.sizes.spacing16};
                        `}
                      >
                        {`${feedbackInstance.attendee.firstName} ${feedbackInstance.attendee.lastName}`}
                      </Text>
                    </div>
                  </>
                </div>
              )}
            </>
          ))}
        </div>
      ) : (
        <Text
          fontStyle='italic'
          css={css`
            display: inline-flex;
            margin: auto;
            width: 100%;
            justify-content: space-evenly;
          `}
          type='body'
          weight='normal'
        >
          {t('No written feedback added.')}
        </Text>
      )}
    </>
  )
}
