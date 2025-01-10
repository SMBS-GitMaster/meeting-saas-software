import React from 'react'
import styled, { css } from 'styled-components'

import { useSubscription } from '@mm/gql'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  Text,
  UserAvatar,
  toREM,
  useOnClickOutside,
} from '@mm/core-web/ui'

import {
  StyledListLayoutBackdrop,
  StyledSideNavListContainer,
  StyledSideNavListHeaderContainer,
} from './listLayoutComponents'

export function NotificationsList(props: { onRequestClose: () => void }) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const ref = React.useRef<HTMLDivElement>() as any
  useOnClickOutside(ref, () => {
    props.onRequestClose()
  })
  const subscription = useSubscription(
    {
      user: useAuthenticatedBloomUserQueryDefinition({
        map: ({
          notifications,
          avatar,
          userAvatarColor,
          firstName,
          lastName,
        }) => ({
          avatar,
          userAvatarColor,
          firstName,
          lastName,
          notifications: notifications({
            map: ({ mentioner, meeting, todo, viewState }) => ({
              viewState,
              mentioner: mentioner({
                map: ({ firstName, lastName }) => ({ firstName, lastName }),
              }),
              meeting: meeting({ map: ({ name }) => ({ name }) }),
              todo: todo({ map: () => ({}) }),
            }),
            filter: {
              and: [
                {
                  viewState: {
                    neq: 'archived',
                  },
                },
              ],
            },
          }),
        }),
      }),
    },
    {
      subscriptionId: 'NotificationsList',
    }
  )

  const user = subscription().data.user

  return (
    <StyledListLayoutBackdrop>
      <StyledSideNavListContainer
        ref={ref}
        css={css`
          overflow-y: auto;
        `}
      >
        <StyledSideNavListHeaderContainer>
          <Text type={'h3'}>{t('Notifications')}</Text>
          <div
            css={css`
              margin-left: auto;
            `}
          >
            <BtnText
              intent='tertiary'
              ariaLabel='Clear all button'
              onClick={() =>
                console.log(
                  '@TODO_BLOOM https://winterinternational.atlassian.net/browse/TTD-352'
                )
              }
            >
              {t('Clear all')}
            </BtnText>
          </div>
        </StyledSideNavListHeaderContainer>
        {user.notifications.nodes.map((notification) => {
          return (
            <StyledNotificationItem key={'key'} unread={notification.isUnread}>
              <span
                css={css`
                  background-color: ${(props) =>
                    notification.isUnread &&
                    props.theme.colors.sideNavNotificationUnreadColor};
                  max-height: ${(props) => props.theme.sizes.spacing8};
                  min-width: ${(props) => props.theme.sizes.spacing8};
                  margin-right: ${(props) => props.theme.sizes.spacing8};
                  margin-top: ${(props) => props.theme.sizes.spacing8};
                  border-radius: ${toREM(50)};
                `}
              ></span>

              <div
                css={css`
                  display: flex;
                  justify-content: space-between;
                  width: 100%;

                  .closeNotification_button {
                    margin-left: auto;
                    order: 2;
                  }
                `}
              >
                <div
                  css={css`
                    padding-right: ${(props) => props.theme.sizes.spacing8};
                  `}
                >
                  <UserAvatar
                    avatarUrl={user.avatar}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    userAvatarColor={user.userAvatarColor}
                    size='s'
                  />
                </div>
                <div
                  css={css`
                    padding-right: ${toREM(36)};
                    min-height: ${toREM(64)};
                  `}
                >
                  <Text
                    type='body'
                    weight='semibold'
                  >{`${notification.mentioner?.firstName} ${notification.mentioner?.lastName}`}</Text>{' '}
                  <Text type='body'>{'mentioned you in'}</Text>{' '}
                  <Text type='body' weight='semibold'>
                    {`${notification.meeting?.name}`}
                  </Text>
                  {notification.todo && (
                    <>
                      {' '}
                      <Text type='body'>{'in a'}</Text>{' '}
                      <Text type='body' weight='semibold'>
                        {terms.todo.lowercaseSingular}
                      </Text>
                    </>
                  )}
                </div>
                <BtnIcon
                  className='closeNotification_button'
                  intent='naked'
                  size='md'
                  iconProps={{
                    iconName: 'closeIcon',
                    iconSize: 'lg',
                  }}
                  css={css`
                    margin-bottom: auto;
                    min-width: ${(props) => props.theme.sizes.spacing24};
                    min-height: ${(props) => props.theme.sizes.spacing24};
                  `}
                  onClick={() =>
                    console.log(
                      '@TODO_BLOOM https://winterinternational.atlassian.net/browse/TTD-352 change viewState to archived'
                    )
                  }
                  ariaLabel={'close'}
                  tag={'span'}
                />
              </div>
            </StyledNotificationItem>
          )
        })}
      </StyledSideNavListContainer>
    </StyledListLayoutBackdrop>
  )
}

const StyledNotificationItem = styled.div<{ unread: boolean }>`
  display: flex;
  height: auto;
  padding: ${(props) => props.theme.sizes.spacing16};
  padding-left: ${(props) => props.theme.sizes.spacing8};

  &:hover,
  &:focus {
    background-color: ${(props) =>
      props.theme.colors.sideNavListItemBackgroundHover};
  }
`
