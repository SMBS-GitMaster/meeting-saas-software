import { Duration } from 'luxon'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { StatsTile, Text, toREM } from '@mm/core-web/ui'

import clock from './meetingStatsAssets/clock.svg'
import issues from './meetingStatsAssets/issues.svg'
import todos from './meetingStatsAssets/todos.svg'

export const MeetingStatsStatistics: React.FC<{
  todosCompletedPercentage: number
  todosCompletedPercentageDifferenceFromLastMeeting: number
  issuesSolvedCount: number
  issuesSolvedCountForTheQuarter: number
  meetingDurationInSeconds: number
  meetingDurationDifferenceFromLastMeetingInMinutes: number
}> = function MeetingStatsStatistics(props) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const meetingToalTimeInHHMMFormat = Duration.fromObject({
    seconds: props.meetingDurationInSeconds,
  }).toFormat(`hh:mm`)

  const [meetingTimeTotalHours, meetingTimeTotalMinutes] =
    meetingToalTimeInHHMMFormat.split(':')

  return (
    <>
      {/* <div
        css={css`
          text-align: center;
          margin-bottom: ${(prop) => prop.theme.sizes.spacing24};
        `}
      >
        <Text color={{ intent: 'default' }} type='h2'>
          {t('Meeting Statistics')}
        </Text>
      </div> */}
      <div
        css={css`
          margin-bottom: ${(prop) => prop.theme.sizes.spacing24};
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: ${toREM(53.5)};
        `}
      >
        <StatsTile
          title={t('{{todo}} completed', {
            todo: terms.todo.singular,
          })}
          description={t('That’s {{value}}% {{compare}} than last meeting.', {
            value: Math.abs(
              props.todosCompletedPercentageDifferenceFromLastMeeting
            ),
            compare:
              props.todosCompletedPercentageDifferenceFromLastMeeting < 0
                ? t('less')
                : t('more'),
          })}
          image={todos}
          value={t(`{{value}}%`, { value: props.todosCompletedPercentage })}
        />
        <StatsTile
          title={t('{{label}} solved', {
            label:
              props.issuesSolvedCount === 1
                ? terms.issue.singular
                : terms.issue.plural,
          })}
          description={t(`That’s {{value}} total this quarter.`, {
            value: props.issuesSolvedCountForTheQuarter,
          })}
          image={issues}
          value={props.issuesSolvedCount.toString()}
        />
        <StatsTile
          title={t('Total meeting time')}
          image={clock}
          description={t(
            "That's {{count}} {{unit}} {{compare}} than last meeting. ",
            {
              count: Math.abs(
                props.meetingDurationDifferenceFromLastMeetingInMinutes
              ),
              compare:
                props.meetingDurationDifferenceFromLastMeetingInMinutes < 0
                  ? t('shorter')
                  : t('longer'),
              unit:
                Math.abs(
                  props.meetingDurationDifferenceFromLastMeetingInMinutes
                ) === 1
                  ? t('minute')
                  : t('minutes'),
            }
          )}
          value={
            <>
              {meetingTimeTotalHours}
              <Text
                type='h1'
                css={css`
                  font-weight: 500;
                  font-size: ${toREM(14)};
                `}
              >
                {t('hr')}
              </Text>{' '}
              {meetingTimeTotalMinutes}
              <Text
                type='h1'
                css={css`
                  font-weight: 500;
                  font-size: ${toREM(14)};
                `}
              >
                {t('min')}
              </Text>
            </>
          }
        />
      </div>
    </>
  )
}
