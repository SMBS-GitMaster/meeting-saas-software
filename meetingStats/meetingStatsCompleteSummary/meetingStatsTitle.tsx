import React from 'react'
import { css } from 'styled-components'

import { Icon, SingleColorIconName, Text, toREM } from '@mm/core-web/ui'

export const MeetingStatTitle: React.FC<{
  text: string
  icon?: SingleColorIconName
}> = function Attendee({ text, icon }) {
  return (
    <div
      css={css`
        align-items: center;
        display: flex;
        padding: ${toREM(11)} ${(props) => props.theme.sizes.spacing16};
        width: 100%;
      `}
    >
      {icon && (
        <Icon
          css={css`
            margin-right: ${({ theme }) => theme.sizes.spacing8};
          `}
          iconName={icon}
          iconSize='lg'
        />
      )}

      <Text color={{ intent: 'default' }} type='h3' weight='semibold'>
        {text}
      </Text>
    </div>
  )
}
