import React from 'react'
import { css } from 'styled-components'

import { getShortDateDisplay } from '@mm/core/date'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Clickable,
  Icon,
  Text,
  bloomColors,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { getEventTypeText } from '../issueHelper'
import {
  StyledAccordionBody,
  StyledAccordionHeader,
  StyledSentFromItem,
  StyledUl,
} from './issueHistoryStyles'
import {
  IIssueHistorySentFromProps,
  TimelineItemForIssues,
} from './issueHistoryTypes'

export const IssueHistorySentFrom = (props: IIssueHistorySentFromProps) => {
  const { t } = useTranslation()
  return (
    <Accordion
      title={t(
        'Sent from {{meetingName}}',
        props.issueMovedLastTimeLine.meeting.name
      )}
    >
      <StyledUl
        css={css`
          min-width: ${toREM(400)};
        `}
      >
        {props.timelineItems.nodes.map((item) => {
          const timeFormatted = getShortDateDisplay({
            secondsSinceEpochUTC: item.dateCreated,
            userTimezone: 'utc',
          })
          const isMatchingParentItem =
            item.meeting.id === props.currentMeetingId
          return (
            <TimeLineItem
              key={item.id}
              isMatchingParentItem={isMatchingParentItem}
              timeFormatted={timeFormatted}
              item={item}
            />
          )
        })}
      </StyledUl>
    </Accordion>
  )
}

const TimeLineItem = (props: {
  item: TimelineItemForIssues
  timeFormatted: string
  isMatchingParentItem: boolean
}) => {
  const { item, timeFormatted, isMatchingParentItem } = props
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const eventTypeText = getEventTypeText({
    eventType: item.eventType,
    terms,
  })

  return (
    <StyledSentFromItem>
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
    </StyledSentFromItem>
  )
}

const Accordion: React.FC<
  IBaseComponentProps & {
    title: string
  }
> = ({ children, title }) => {
  const [collapse, setCollapse] = React.useState(false)
  return (
    <div>
      <StyledAccordionHeader>
        <Text
          type='small'
          weight='semibold'
          color={{
            color: bloomColors.navy500,
          }}
        >
          {title}
        </Text>
        <Clickable clicked={() => setCollapse(!collapse)}>
          {collapse ? (
            <Icon iconSize='md' iconName='chevronUpIcon' />
          ) : (
            <Icon iconSize='md' iconName='chevronDownIcon' />
          )}
        </Clickable>
      </StyledAccordionHeader>
      <StyledAccordionBody collapse={collapse}>{children}</StyledAccordionBody>
    </div>
  )
}
