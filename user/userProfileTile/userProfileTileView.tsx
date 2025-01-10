import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Card,
  Clickable,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  getRecordOfUserAvatarColorToThemeColor,
  toREM,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui/'

import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'

import { type IUserProfileTileViewProps } from './userProfileTileTypes'

export const UserProfileTileView = observer(function UserProfileTileView(
  props: IUserProfileTileViewProps
) {
  const [imgContainerEl, setImgContainerEl] =
    useState<Maybe<HTMLDivElement>>(null)

  const theme = useTheme()
  const { minimizeTile, fullScreenTile } =
    useWorkspaceFullScreenTileController()
  const { height, width, ready } = useResizeObserver(imgContainerEl)
  const { t } = useTranslation()

  const isCurrentUser = props.getData().isCurrentUser
  const firstName = props.getData().user.firstName
  const lastName = props.getData().user.lastName
  const fullName = `${firstName} ${lastName}`
  const firstInitial = firstName ? firstName[0].toUpperCase() : ''
  const lastInitial = lastName ? lastName[0].toUpperCase() : ''
  const profilePictureUrl = props.getData().user.profilePictureUrl

  const initialsBackgroundColor =
    getRecordOfUserAvatarColorToThemeColor(theme)[
      props.getData().user.userAvatarColor
    ]

  const imageSize = useMemo(() => {
    if (!ready) return 0
    const sizeToUse = height > width ? width : height
    const sizeOffset = isCurrentUser ? 140 : 80
    return sizeToUse - sizeOffset
  }, [height, width, ready])

  return (
    <Card className={props.className}>
      <Card.Header
        renderLeft={
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <TextEllipsis type='h3' lineLimit={1}>
              {isCurrentUser ? t('Profile') : `${fullName}`}
            </TextEllipsis>
          </div>
        }
        renderRight={
          isCurrentUser ? (
            <div
              css={css`
                align-items: center;
                display: flex;
              `}
            >
              <Menu
                content={(close) => (
                  <>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        fullScreenTile(props.getData().workspaceTileId)
                      }}
                    >
                      <Text type={'body'}>{t('View in full screen')}</Text>
                    </Menu.Item>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        props.getActions().onDeleteTile()
                      }}
                    >
                      <Text type={'body'}>{t('Delete tile')}</Text>
                    </Menu.Item>
                  </>
                )}
              >
                <span>
                  <Clickable clicked={() => null}>
                    <Icon iconName='moreVerticalIcon' iconSize='lg' />
                  </Clickable>
                </span>
              </Menu>
              {props.getData().isExpandedInWorkspace && (
                <Clickable clicked={() => minimizeTile()}>
                  <Icon
                    iconName='closeIcon'
                    iconSize='lg'
                    css={css`
                      margin-left: ${(prop) => prop.theme.sizes.spacing8};
                    `}
                  />
                </Clickable>
              )}
            </div>
          ) : null
        }
      />
      <Card.Body>
        <div
          ref={setImgContainerEl}
          css={css`
            align-items: center;
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: flex-start;
            padding: ${(prop) => prop.theme.sizes.spacing24};
            width: 100%;
          `}
        >
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={t('User avatar')}
              css={css`
                border-radius: ${(prop) => prop.theme.sizes.br2};
                height: ${imageSize}px;
                width: ${imageSize}px;
              `}
            />
          ) : (
            <div
              css={css`
                align-items: center;
                background-color: ${initialsBackgroundColor};
                border-radius: ${(prop) => prop.theme.sizes.br2};
                display: flex;
                height: ${imageSize}px;
                justify-content: center;
                width: ${imageSize}px;
              `}
            >
              <Text
                type='h1'
                css={css`
                  font-size: ${toREM(40)};
                `}
              >
                {firstInitial}
                {lastInitial}
              </Text>
            </div>
          )}
          {isCurrentUser && (
            <Text
              type='h2'
              css={css`
                margin-top: ${(prop) => prop.theme.sizes.spacing32};
              `}
            >
              {fullName}
            </Text>
          )}
        </div>
      </Card.Body>
    </Card>
  )
})
