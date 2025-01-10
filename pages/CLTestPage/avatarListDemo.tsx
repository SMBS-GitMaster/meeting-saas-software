import React from 'react'

import { chance } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import { Expandable, Text, UserAvatarList } from '@mm/core-web/ui'

export function AvatarListDemo() {
  function getUsers() {
    return new Array(chance.natural({ min: 2, max: 10 }))
      .fill('')
      .map((_, index) => {
        return {
          firstName: chance.first(),
          lastName: chance.last(),
          avatar: chance.bool() ? `https://i.pravatar.cc/${index + 1}00` : null,
          userAvatarColor: 'COLOR1' as UserAvatarColorType,
        }
      })
  }

  return (
    <Expandable title='Avatars List'>
      <>
        <Text>Large</Text>
        <UserAvatarList size='l' users={getUsers()} />
        <br />
        <Text>Medium</Text>
        <UserAvatarList size='m' users={getUsers()} />
        <br />
        <Text>Small</Text>
        <UserAvatarList size='s' users={getUsers()} />
        <br />
        <Text>Extra Small</Text>
        <UserAvatarList size='xs' users={getUsers()} />
      </>
    </Expandable>
  )
}
