import DOMPurify from 'dompurify'
import React, { useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  getDateDisplayUserLocale,
  getYesterdayAndTodayFromDate,
  guessTimezone,
} from '@mm/core/date'

import { useTranslation } from '@mm/core-web/i18n'
import { Text, getTextStyles, toREM } from '@mm/core-web/ui'

import { IMeetingStatsViewData } from './meetingStatsTypes'

export const MeetingSummaryNotesItem = (props: {
  note: {
    noteNodeId: Id
    title: string
    dateCreated: number
    details: string
    noteHtml: string
  }
  timezone: IMeetingStatsViewData['timezone']
}) => {
  const { t } = useTranslation()
  const [showNotesDetails] = useState<boolean>(true)

  const { isToday: noteCreatedToday, isYesterday: noteCreatedYesterday } =
    getYesterdayAndTodayFromDate({
      dateSecondsSinceEpochUTC: props.note.dateCreated,
      timezone: props.timezone || guessTimezone(),
    })

  return (
    <>
      <div
        css={css`
          display: flex;
          flex-direction: row;
          align-items: center;
          padding-right: ${(props) => props.theme.sizes.spacing12};
          padding-left: ${(props) => props.theme.sizes.spacing16};
          padding-bottom: ${({ theme }) => theme.sizes.spacing8};
        `}
      >
        <Text css={css``} weight='semibold' color={{ intent: 'default' }}>
          {props.note.title}
        </Text>
        <div
          css={css`
            margin-left: auto;
          `}
        >
          {noteCreatedToday ? (
            <Text
              type='body'
              weight='semibold'
              css={css`
                color: ${(props) => props.theme.colors.datePlainTextColor};
              `}
            >
              {t('Today')}
            </Text>
          ) : noteCreatedYesterday ? (
            <Text
              type='body'
              weight='semibold'
              css={css`
                color: ${(props) => props.theme.colors.datePlainTextColor};
              `}
            >
              {t('Yesterday')}
            </Text>
          ) : (
            <Text
              type='body'
              weight='semibold'
              css={css`
                color: ${(props) => props.theme.colors.datePlainTextColor};
              `}
            >
              {' '}
              {getDateDisplayUserLocale({
                secondsSinceEpochUTC: props.note.dateCreated,
                userTimezone: props.timezone,
              })}
            </Text>
          )}
        </div>
      </div>
      {showNotesDetails && props.note.details && (
        <div
          css={css`
            padding-left: ${toREM(16)};
            padding-right: ${toREM(112)};
            padding-bottom: ${({ theme }) => theme.sizes.spacing8};
          `}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(props.note.noteHtml),
            }}
            css={css`
              max-height: ${toREM(256)};
              overflow: auto;
              ${getTextStyles({ type: 'body' })}
            `}
          />
        </div>
      )}
    </>
  )
}
