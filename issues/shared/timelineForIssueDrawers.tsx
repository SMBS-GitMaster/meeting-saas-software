import React, { useState } from 'react'
import { css } from 'styled-components'

import { type Id, NodesCollection } from '@mm/gql'

import { getShortDateDisplay } from '@mm/core/date'

import { TIssueEventType, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnIcon, BtnText, Icon, Text, useTheme } from '@mm/core-web/ui'
import { toREM } from '@mm/core-web/ui/responsive'

import { getEventTypeText } from '../issueList/issueHelper'

export type TimelineItemForIssueDrawers = {
  dateCreated: number
  eventType: TIssueEventType
  id: Id
  meeting: { name: string; id: Id }
}

export interface ITimelineForIssueDrawersProps {
  className?: string
  timezone: string
  timelineText: string
  currentMeetingId: Id
  timelineItems: NodesCollection<{
    TItemType: TimelineItemForIssueDrawers
    TIncludeTotalCount: false
  }>
}

export const TimelineForIssueDrawers = function TimelineForIssueDrawers(
  props: ITimelineForIssueDrawersProps
) {
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const [showTimeline, setShowTimeline] = useState(false)

  const { className, timelineText, timelineItems, currentMeetingId } = props

  const toggleShowTimeline = () => {
    setShowTimeline((current) => !current)
  }

  return (
    <div className={className}>
      <div
        css={css`
          display: flex;
          height: ${toREM(32)};
          padding: ${theme.sizes.spacing16};
          align-items: center;
          justify-content: flex-start;
          background-color: ${theme.colors.timelinePrimaryBackgroundColor};
        `}
      >
        <BtnIcon
          iconProps={{
            iconName: showTimeline ? 'chevronDownIcon' : 'chevronRightIcon',
            iconSize: 'md',
          }}
          size='md'
          intent='tertiaryTransparent'
          ariaLabel={t('Show timeline')}
          tag='button'
          onClick={toggleShowTimeline}
        />
        <Text type={'body'} weight={'semibold'}>
          {timelineText}
        </Text>
      </div>

      {showTimeline && (
        <div
          css={css`
            display: flex;
            justify-content: flex-start;
            flex-direction: column;
            padding: ${theme.sizes.spacing16};
            background-color: ${theme.colors.timelineDropdownBackgroundColor};
          `}
        >
          {(timelineItems.nodes || []).map((item, index) => {
            const timeFormatted = getShortDateDisplay({
              secondsSinceEpochUTC: item.dateCreated,
              userTimezone: 'utc',
            })
            return (
              <div
                key={index}
                css={css`
                  display: flex;
                  padding-bottom: ${theme.sizes.spacing4};

                  :last-child {
                    padding-bottom: 0;
                  }
                `}
              >
                <Text
                  type={'small'}
                  css={css`
                    padding-right: ${theme.sizes.spacing4};
                  `}
                >
                  {timeFormatted}
                </Text>
                <Text
                  type={'small'}
                  weight={'semibold'}
                  css={css`
                    ${item.meeting.id === currentMeetingId &&
                    `color: ${theme.colors.timelineMeetingItemColor};`}
                  `}
                >
                  {item.meeting.name}
                </Text>
                {item.eventType !== 'MOVED' && (
                  <Text type={'small'}>{`${t(':')} ${getEventTypeText({
                    eventType: item.eventType,
                    terms,
                  })}`}</Text>
                )}
              </div>
            )
          })}
          {timelineItems.hasNextPage && (
            <BtnText
              onClick={() => {
                timelineItems.loadMore()
              }}
              intent='tertiaryTransparent'
              width='noPadding'
              ariaLabel={t('Load more')}
              css={css`
                align-self: flex-start;
              `}
            >
              <>
                <Icon
                  iconName={'loadingIcon'}
                  iconSize={'md'}
                  iconColor={{ color: theme.colors.bodyTextDefault }}
                />
                <Text
                  weight='semibold'
                  type='small'
                  css={css`
                    padding-left: ${theme.sizes.spacing6};
                  `}
                >
                  {t('Load more')}
                </Text>
              </>
            </BtnText>
          )}
        </div>
      )}
    </div>
  )
}
