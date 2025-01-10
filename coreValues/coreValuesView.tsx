import { observer } from 'mobx-react'
import React from 'react'
import { css, useTheme } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Card,
  Clickable,
  Icon,
  Loading,
  Menu,
  Text,
  TextEllipsis,
  toREM,
} from '@mm/core-web/ui/'

import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import emptyCoreValuesImg from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateAssets/emptyCoreValues.svg'

import { ICoreValuesViewProps } from './coreValuesTypes'

export const CoreValuesView = observer(function CoreValuesView(
  props: ICoreValuesViewProps
) {
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const { fullScreenTile, minimizeTile } =
    useWorkspaceFullScreenTileController()
  const { t } = useTranslation()

  return (
    <Card
      className={props.className}
      css={css`
        ${(props.data().isExpandedOnWorkspacePage ||
          props.data().pageState.isTileExpanded) &&
        css`
          height: 100%;
          width: 100%;
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
              {t('{{coreValues}}', {
                coreValues: terms.coreValues.plural,
              })}
            </TextEllipsis>
          </div>
        }
        renderRight={
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            {!!props.data().isExpandableTile && (
              <BtnIcon
                intent='tertiaryTransparent'
                size='lg'
                iconProps={{
                  iconName: props.data().pageState.isTileExpanded
                    ? 'chevronUpIcon'
                    : 'chevronDownIcon',
                  iconSize: 'lg',
                }}
                ariaLabel={t('See all {{todos}} data', {
                  todos: terms.todo.plural,
                })}
                tag={'span'}
                onClick={props.actions().onHandleToggleIsTileExpanded}
                css={css`
                  ${props.data().displayTileWorkspaceOptions &&
                  css`
                    margin-right: ${theme.sizes.spacing16};
                  `}
                `}
              />
            )}
            {props.data().displayTileWorkspaceOptions && (
              <>
                <Menu
                  maxWidth={toREM(330)}
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
                {props.data().isExpandedOnWorkspacePage && (
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
              </>
            )}
          </div>
        }
      />
      {props.data().pageState.isTileExpanded && (
        <Card.Body>
          {props.data().isLoading && (
            <Loading
              size='small'
              css={css`
                padding: ${theme.sizes.spacing16};
              `}
            />
          )}
          {!!props.data().getMainOrgCoreValues() ? (
            <div
              css={css`
                width: 100%;
                height: 100%;
                display: flex;
                align-items: flex-start;
                flex-direction: column;
                justify-content: flex-start;
                padding: ${theme.sizes.spacing8} 0;
              `}
            >
              {props
                .data()
                .getMainOrgCoreValues()
                ?.listItems.nodes.map((listItem, index) => {
                  return (
                    <div
                      key={listItem.id}
                      css={css`
                        display: flex;
                        align-items: flex-start;
                        justify-content: flex-start;
                        width: 100%;
                        padding: ${theme.sizes.spacing8}
                          ${theme.sizes.spacing16};

                        &:hover,
                        &:focus {
                          background-color: ${theme.colors
                            .coreValuesItemBackgroundColorHover};
                        }
                      `}
                    >
                      <Text
                        type={'body'}
                        weight={'semibold'}
                        css={css`
                          padding-right: ${theme.sizes.spacing4};
                        `}
                      >
                        {index + 1}
                        {'.'}
                      </Text>
                      <Text type={'body'}>{listItem.text}</Text>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div
              css={css`
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                height: 100%;
                padding: ${theme.sizes.spacing16};
              `}
            >
              <img
                src={emptyCoreValuesImg}
                alt={t('{{cv}}', {
                  cv: terms.coreValues.plural,
                })}
                css={css`
                  height: ${toREM(104)};
                  object-fit: contain;
                  object-position: center;
                  width: ${toREM(104)};
                `}
              />
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  justify-content: center;
                `}
              >
                <TextEllipsis type={'body'} lineLimit={3} weight={'semibold'}>
                  {t('You have no active {{cv}}', {
                    cv: terms.coreValues.plural,
                  })}
                </TextEllipsis>
              </div>
            </div>
          )}
        </Card.Body>
      )}
    </Card>
  )
})
