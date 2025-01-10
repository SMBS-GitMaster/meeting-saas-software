import React from 'react'
import { css } from 'styled-components'

import { UserAvatarColorType } from '@mm/core-bloom'

import { Expandable } from '@mm/core-web/ui'
import { Comments } from '@mm/core-web/ui/components/comments'

export function CommentsDemo() {
  const commentsMockData = [
    {
      id: 'comment1',
      assigneeInfo: {
        avatarUrl: '',
        firstName: 'Brittney',
        lastName: 'Murphy',
        fullName: 'Brittney Murphy',
        userAvatarColor: 'COLOR1' as UserAvatarColorType,
      },
      dateCreated: 'March 31, 2022',
      comment:
        'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    },
    {
      id: 'comment2',
      assigneeInfo: {
        avatarUrl: '',
        firstName: 'Brittney',
        lastName: 'Murphy',
        fullName: 'Brittney Murphy',
        userAvatarColor: 'COLOR1' as UserAvatarColorType,
      },
      dateCreated: 'March 30, 2022',
      comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      id: 'comment3',
      assigneeInfo: {
        avatarUrl: '',
        firstName: 'Brittney',
        lastName: 'Murphy',
        fullName: 'Brittney Murphy',
        userAvatarColor: 'COLOR1' as UserAvatarColorType,
      },
      dateCreated: 'March 30, 2022',
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    },
    {
      id: 'comment4',
      assigneeInfo: {
        avatarUrl: '',
        firstName: 'Brittney',
        lastName: 'Murphy',
        fullName: 'Brittney Murphy',
        userAvatarColor: 'COLOR1' as UserAvatarColorType,
      },
      dateCreated: 'March 30, 2022',
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    },
    {
      id: 'comment5',
      assigneeInfo: {
        avatarUrl: '',
        firstName: 'Brittney',
        lastName: 'Murphy',
        fullName: 'Brittney Murphy',
        userAvatarColor: 'COLOR1' as UserAvatarColorType,
      },
      dateCreated: 'March 30, 2022',
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    },
  ]

  return (
    <Expandable title='Comments'>
      <div
        css={css`
          background-color: white;
        `}
      >
        <div
          css={css`
            margin: 20px;
            width: 632px;
          `}
        >
          <Comments startShowed commentsData={commentsMockData} />
        </div>
      </div>
    </Expandable>
  )
}
