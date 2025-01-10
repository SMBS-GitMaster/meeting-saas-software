import { observer } from 'mobx-react'
import React from 'react'

import { UserAvatarColorType } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { useNavigation } from '@mm/core-web/router'
import { Menu, Text, UserAvatar, toREM } from '@mm/core-web/ui'

import { paths } from '@mm/bloom-web/router/paths'

import { SideNavIcon } from './sideNav'
import { SideNavEntry } from './sideNavEntry'

export const SideNavUserMenu = observer(
  (props: {
    isExpandedSideNav: boolean
    getData: () => {
      currentUser: Maybe<{
        avatar: Maybe<string>
        firstName: string
        lastName: string
        fullName: string
        userAvatarColor: UserAvatarColorType
      }>
      getReferSideNavEntry: () => {
        title: string
        href: string
      }
    }
    getActions: () => {
      logout: () => Promise<void>
    }
  }) => {
    const { isExpandedSideNav, getData, getActions } = props

    const { navigate } = useNavigation()
    const { t } = useTranslation()

    const currentUser = getData().currentUser

    return (
      <>
        <Menu
          position='left center'
          offset={toREM(600)}
          content={(close) => (
            <>
              <Menu.Item href={paths.editProfile} onClick={close}>
                {' '}
                <Text type={'body'}>{t('Edit Profile')}</Text>
              </Menu.Item>
              <Menu.Item
                href={getData().getReferSideNavEntry().href}
                target='_blank'
                onClick={close}
              >
                {' '}
                <Text type={'body'}>
                  {getData().getReferSideNavEntry().title}
                </Text>
              </Menu.Item>
              <Menu.Item onClick={getActions().logout}>
                {' '}
                <Text type={'body'}>{t('Log out')}</Text>
              </Menu.Item>
            </>
          )}
        >
          {currentUser && (
            <SideNavEntry
              expanded={isExpandedSideNav}
              image={
                <UserAvatar
                  size='s'
                  avatarUrl={currentUser.avatar}
                  firstName={currentUser.firstName}
                  lastName={currentUser.lastName}
                  userAvatarColor={currentUser.userAvatarColor}
                />
              }
              text={currentUser.fullName}
            />
          )}
        </Menu>
        <SideNavEntry
          onClick={() => navigate(paths.home)}
          image={<SideNavIcon iconName='homeIcon' />}
          expanded={isExpandedSideNav}
          text={t('Home')}
        />
      </>
    )
  }
)
