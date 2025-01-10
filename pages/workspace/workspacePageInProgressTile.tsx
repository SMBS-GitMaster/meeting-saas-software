import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import type { Id } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  type TWorkspaceTileType,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Card,
  Clickable,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  toREM,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction } from '@mm/bloom-web/pages/performance/mobx'

import { useWorkspaceFullScreenTileController } from './workspaceFullScreenTile/workspaceFullScreenTileController'
import { WorkspaceFullScreenTilePortal } from './workspaceFullScreenTile/workspaceFullScreenTilePortal'

interface IWorkspacePageInProgressTileProps {
  workspaceTileId: Id
  workspaceId: Maybe<Id>
  tileType: TWorkspaceTileType
  tileName: string
  tileImgSrc: string
  hideMenuOptions?: boolean
  renderContentInRow?: boolean
}

export const WorkspacePageInProgressTile = observer(
  function WorkspacePageInProgressTile(
    props: IWorkspacePageInProgressTileProps
  ) {
    const { activeFullScreenTileId, fullScreenTile } =
      useWorkspaceFullScreenTileController()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const isExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const onDeleteTile = useAction(async () => {
      try {
        await editWorkspaceTile({
          id: props.workspaceTileId,
          meetingId: null,
          archived: true,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was an issue deleting the tile`),
          error: new UserActionError(error),
        })
        throw error
      }
    })

    const InProgressTile = (
      <Card
        css={css`
          height: 100%;
          width: 100%;

          ${props.workspaceId &&
          css`
            cursor: grab;
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
                {props.tileName}
              </TextEllipsis>
            </div>
          }
          renderRight={
            <>
              {props.hideMenuOptions ? null : (
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
                            fullScreenTile(props.workspaceTileId)
                          }}
                        >
                          <Text type={'body'}>{t('View in full screen')}</Text>
                        </Menu.Item>
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            onDeleteTile()
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
                </div>
              )}
            </>
          }
        />
        <Card.Body>
          <div
            css={css`
              align-items: center;
              display: flex;
              flex-direction: column;
              height: 100%;

              ${props.renderContentInRow &&
              css`
                flex-direction: row;
              `}
            `}
          >
            <img
              src={props.tileImgSrc}
              alt={props.tileName}
              css={css`
                height: ${toREM(200)};
                object-fit: contain;
                object-position: center;
                width: ${toREM(200)};
              `}
            />
            <div
              css={css`
                background-color: ${(prop) =>
                  prop.theme.colors.workspacePersonalTilePersonalItemsColor};
                padding: ${`${toREM(8)} ${toREM(16)}`};
                margin-bottom: ${toREM(20)};
                width: 75%;
              `}
            >
              <Text>
                <Text weight='bold'>{t('Under construction')}!</Text>{' '}
                {t(
                  'This tile is currently in development and will be available in the workspace soon'
                )}
                .
              </Text>
            </div>
          </div>
        </Card.Body>
      </Card>
    )

    if (isExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {InProgressTile}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return InProgressTile
    }
  }
)
