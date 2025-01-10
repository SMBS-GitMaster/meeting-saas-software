import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Card,
  Clickable,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  toREM,
} from '@mm/core-web/ui/'

import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'

import RolesTileEmptyStateImage from './assets/rolesEmptyState.svg'
import type { IRolesTileViewProps } from './rolesTileTypes'

export const RolesTileView = observer(function RolesTileView(
  props: IRolesTileViewProps
) {
  const { minimizeTile, fullScreenTile } =
    useWorkspaceFullScreenTileController()
  const { t } = useTranslation()

  const isViewingCurrentUser = props.data().isViewingCurrentUser
  const isRolesListExpanded = props.data().isRolesListExpanded

  return (
    <Card
      css={css`
        ${isRolesListExpanded &&
        css`
          height: 100%;
        `}
      `}
    >
      <Card.Header
        renderLeft={
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <TextEllipsis type='h3' lineLimit={1}>
              {isViewingCurrentUser
                ? t('Roles')
                : t(`Roles and responsibilities`)}
            </TextEllipsis>
          </div>
        }
        renderRight={
          isViewingCurrentUser ? (
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
                        fullScreenTile(props.data().workspaceTileId)
                      }}
                    >
                      <Text type={'body'}>{t('View in full screen')}</Text>
                    </Menu.Item>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        props.actions().onDeleteTile()
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
              {props.data().isExpandedInWorkspace && (
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
          ) : (
            <div
              css={css`
                align-items: center;
                display: flex;
              `}
            >
              <BtnIcon
                iconProps={{
                  iconName: props.data().isRolesListExpanded
                    ? 'chevronUpIcon'
                    : 'chevronDownIcon',
                  iconSize: 'lg',
                }}
                size='lg'
                intent='tertiaryTransparent'
                ariaLabel={t('Expand or collapse roles tile')}
                tag='button'
                onClick={() => props.actions().onHandleTileExpand()}
              />
            </div>
          )
        }
      />
      <Card.Body>
        {props.data().isRolesListExpanded && (
          <div
            css={css`
              padding: ${(prop) => prop.theme.sizes.spacing16};
            `}
          >
            {!props.data().isLoading &&
              props.data().getPositionRolesData().length === 0 && (
                <div
                  css={css`
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                  `}
                >
                  <img
                    src={RolesTileEmptyStateImage}
                    alt={t('Roles tiles empty state')}
                    css={css`
                      height: ${toREM(200)};
                      object-fit: contain;
                      object-position: center;
                      width: ${toREM(200)};
                    `}
                  />
                  <TextEllipsis
                    lineLimit={2}
                    weight='semibold'
                    css={css`
                      margin-top: ${toREM(4)};
                    `}
                  >
                    {t('You have no active roles')}
                  </TextEllipsis>
                </div>
              )}
            {!props.data().isLoading &&
              props
                .data()
                .getPositionRolesData()
                .map((positionDatum, index) => {
                  return (
                    <div key={index}>
                      <TextEllipsis
                        lineLimit={1}
                        wordBreak={true}
                        weight='semibold'
                        css={css`
                          background-color: ${(prop) =>
                            prop.theme.colors
                              .roleTilePositionTitleBackgroundColor};
                          border-radius: ${toREM(4)};
                          margin-bottom: ${(prop) =>
                            prop.theme.sizes.spacing12};
                          padding: ${toREM(2)} ${toREM(6)};
                          width: fit-content;

                          ${index !== 0 &&
                          css`
                            margin-top: ${(prop) => prop.theme.sizes.spacing12};
                          `}
                        `}
                      >
                        {positionDatum.positionTitle}
                      </TextEllipsis>
                      <div>
                        {positionDatum.roles.length === 0 && (
                          <TextEllipsis
                            lineLimit={1}
                            wordBreak={true}
                            css={css`
                              margin-bottom: ${(prop) =>
                                prop.theme.sizes.spacing8};
                              margin-top: ${(prop) =>
                                prop.theme.sizes.spacing8};
                            `}
                          >
                            {t('No roles set for this position')}
                          </TextEllipsis>
                        )}
                        {positionDatum.roles.length !== 0 &&
                          positionDatum.roles.map((role, index) => {
                            if (role) {
                              return (
                                <TextEllipsis
                                  key={index}
                                  lineLimit={1}
                                  wordBreak={true}
                                  css={css`
                                    margin-bottom: ${(prop) =>
                                      prop.theme.sizes.spacing8};
                                    margin-top: ${(prop) =>
                                      prop.theme.sizes.spacing8};
                                  `}
                                >
                                  {index + 1}. {role}
                                </TextEllipsis>
                              )
                            }
                          })}
                      </div>
                    </div>
                  )
                })}
          </div>
        )}
      </Card.Body>
    </Card>
  )
})
