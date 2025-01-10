import React from 'react'
import { css } from 'styled-components'

import { getShortDateDisplay } from '@mm/core/date'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { Clickable } from '@mm/core-web/ui/components/clickable'
import { Icon } from '@mm/core-web/ui/components/icon'
import { Text } from '@mm/core-web/ui/components/text'
import { toREM } from '@mm/core-web/ui/responsive'
import { useTheme } from '@mm/core-web/ui/theme'

import { getEventTypeText } from './issueHelper'
import {
  StyledListTimeLineItem,
  StyledUl,
} from './sentIssueList/issueHistoryStyles'
import {
  ITimelineStringForIssuesProps,
  TimelineItemForIssues,
} from './sentIssueList/issueHistoryTypes'

export const TimelineStringForIssues = function TimelineString(
  props: ITimelineStringForIssuesProps
) {
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const [showTimelineString, setShowTimelineString] = React.useState(false)

  const { className, timelineItems, currentMeetingId } = props

  const toggleShowTimelineString = () => {
    setShowTimelineString((current) => !current)
  }

  const renderListItem = (opts: {
    item: TimelineItemForIssues
    timeFormatted: string
    isLastItem: boolean
    isFirstItem: boolean
    isMatchingParentItem: boolean
  }) => {
    const {
      item,
      timeFormatted,
      isLastItem,
      isFirstItem,
      isMatchingParentItem,
    } = opts

    const eventTypeText = getEventTypeText({
      eventType: item.eventType,
      terms,
    })

    return (
      <>
        {(isFirstItem || showTimelineString) && (
          <StyledListTimeLineItem
            showTimelineString={showTimelineString}
            isLastItem={isLastItem}
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
              ellipsis={{ widthPercentage: 60 }}
              css={css`
                ${isMatchingParentItem &&
                `color: ${theme.colors.timelineMeetingItemColor};`}
                max-width: ${toREM(150)};
              `}
            >
              {item.meeting.name}
            </Text>
            {item.eventType !== 'MOVED' && (
              <Text type={'small'}>{`${t(':')} ${eventTypeText}`}</Text>
            )}

            {isFirstItem && (
              <Clickable clicked={toggleShowTimelineString}>
                <Icon
                  iconSize='md'
                  iconName={
                    showTimelineString ? 'chevronUpIcon' : 'chevronDownIcon'
                  }
                  css={css`
                    margin-bottom: ${theme.sizes.spacing4};
                  `}
                />
              </Clickable>
            )}
          </StyledListTimeLineItem>
        )}
      </>
    )
  }

  return (
    <div
      css={css`
        max-height: ${showTimelineString ? `auto` : toREM(21)};
        width: ${toREM(400)};
      `}
    >
      <StyledUl className={className}>
        <>
          {timelineItems.nodes.map((item, index) => {
            const timeFormatted = getShortDateDisplay({
              secondsSinceEpochUTC: item.dateCreated,
              userTimezone: 'utc',
            })
            const isLastItem = index === timelineItems.nodes.length - 1
            const isFirstItem = index === 0
            const isMatchingParentItem = item.meeting.id === currentMeetingId

            return (
              <div
                key={index}
                css={css`
                  position: relative;
                `}
              >
                {renderListItem({
                  item,
                  timeFormatted,
                  isLastItem,
                  isFirstItem,
                  isMatchingParentItem,
                })}
              </div>
            )
          })}
        </>
      </StyledUl>
    </div>
  )
}
