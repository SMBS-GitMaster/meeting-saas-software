import React from 'react'

import { Expandable, UserAvatar } from '@mm/core-web/ui'

export function AvatarDemo() {
  return (
    <Expandable title='Avatars'>
      <>
        <span>Initials, large </span>
        <UserAvatar
          avatarUrl={null}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'l'}
          adornments={{ tooltip: true }}
        />
        <br />
        <br />
        <span>Initials, medium </span>
        <UserAvatar
          avatarUrl={null}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'m'}
          adornments={{ tooltip: true }}
        />
        <br />
        <br />
        <span>Initials, small </span>
        <UserAvatar
          avatarUrl={null}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'s'}
          adornments={{ tooltip: true }}
        />
        <br />
        <br />
        <span>Initials, xsmall </span>
        <UserAvatar
          avatarUrl={null}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'xs'}
          adornments={{ tooltip: true }}
        />
        <br />
        <br />
        <span>Pic, large </span>
        <UserAvatar
          avatarUrl={`https://i.pravatar.cc/180`}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'l'}
          adornments={{ tooltip: true }}
        />
        <br />
        <br />
        <span>Pic, medium </span>
        <UserAvatar
          avatarUrl={`https://i.pravatar.cc/120`}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'m'}
          adornments={{ tooltip: true }}
        />
        <br />
        <br />
        <span>Pic, small </span>
        <UserAvatar
          avatarUrl={`https://i.pravatar.cc/80`}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'s'}
          adornments={{ tooltip: true }}
        />
        <br />
        <br />
        <span>Pic, xsmall </span>
        <UserAvatar
          avatarUrl={`https://i.pravatar.cc/50`}
          userAvatarColor='COLOR1'
          firstName={'John'}
          lastName={'Doe'}
          size={'xs'}
          adornments={{ tooltip: true }}
        />
      </>
    </Expandable>
  )
}
