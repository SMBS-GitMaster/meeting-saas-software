import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  Text,
  TextEllipsis,
  UserAvatar,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { IWrapUpViewData } from './wrapUpTypes'

interface IWrapUpAttendeeFeedbackItemValues {
  meetingAttendee: IWrapUpViewData['meetingInstanceAttendees'][0]['attendee']
  notesText: string
  className?: string
}

export const WrapUpAttendeeFeedbackItem = observer(
  (props: IWrapUpAttendeeFeedbackItemValues) => {
    const { meetingAttendee, notesText, className } = props
    const { sizes } = useTheme()

    return (
      <div
        className={className}
        css={css`
          display: inline-flex;
          align-items: center;
        `}
      >
        <UserAvatar
          firstName={meetingAttendee.firstName}
          lastName={meetingAttendee.lastName}
          avatarUrl={meetingAttendee.avatar}
          userAvatarColor={meetingAttendee.userAvatarColor}
          size={'s'}
          adornments={{ tooltip: true }}
          tooltipPosition={'top center'}
          css={css`
            padding-right: ${sizes.spacing16};
            flex-shrink: 0;
          `}
        />
        <Text
          type='body'
          weight='normal'
          fontStyle='italic'
          css={css`
            padding-right: ${(props) => props.theme.sizes.spacing8};
            flex-shrink: 1;
            max-width: ${toREM(452)};
            align-self: flex-end;
          `}
        >
          {`"${notesText}"`}
        </Text>
        <TextEllipsis
          lineLimit={1}
          wordBreak={true}
          type='body'
          weight={'semibold'}
          css={css`
            flex-shrink: 0;
            align-self: flex-end;
          `}
        >
          {meetingAttendee.fullName}
        </TextEllipsis>
      </div>
    )
  }
)
