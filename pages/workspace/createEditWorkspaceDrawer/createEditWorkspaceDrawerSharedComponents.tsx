import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  type TWorkspaceTileType,
  getBloomWorkspaceTermForTileType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Clickable,
  Icon,
  Text,
  TextEllipsis,
  Tooltip,
  toREM,
} from '@mm/core-web/ui'

import { TILE_TYPE_TO_ICON_MAP } from './createEditWorkspaceDrawerSharedConstants'

interface ICreateEditWorkspaceDrawerButtonTileProps {
  tileType: TWorkspaceTileType
  isSelected: boolean
  className?: string
  onTileClicked: () => void
}

export const CreateEditWorkspaceDrawerButtonTile = observer(
  function CreateEditWorkspaceDrawerButtonTile(
    props: ICreateEditWorkspaceDrawerButtonTileProps
  ) {
    const terms = useBloomCustomTerms()
    const label = getBloomWorkspaceTermForTileType({
      tileType: props.tileType,
      terms,
    })

    return (
      <Clickable className={props.className} clicked={props.onTileClicked}>
        <div
          css={css`
            align-items: center;
            border-radius: 0.25rem;
            display: flex;
            height: ${toREM(56)};
            justify-content: center;
            padding: 0 ${(prop) => prop.theme.sizes.spacing16};
            width: ${toREM(146)};

            &:hover,
            &:focus {
              background-color: ${(prop) =>
                `${prop.theme.colors.createEditWorkspaceDrawerTileHoverBackground}`};
            }

            ${props.isSelected
              ? css`
                  background-color: ${(prop) =>
                    `${prop.theme.colors.createEditWorkspaceDrawerSelectedTileBackground}`};
                  border: ${(prop) =>
                    `${prop.theme.sizes.smallSolidBorder} ${prop.theme.colors.createEditWorkspaceDrawerSelectedTileBorder}`};
                `
              : css`
                  background-color: ${(prop) =>
                    `${prop.theme.colors.createEditWorkspaceDrawerUnSelectedTileBackground}`};
                  border: ${(prop) =>
                    `${prop.theme.sizes.smallSolidBorder} ${prop.theme.colors.createEditWorkspaceDrawerUnSelectedTileBorder}`};
                `}
          `}
        >
          {props.isSelected && (
            <div
              css={css`
                height: 0;
                left: ${toREM(108)};
                position: relative;
                top: ${toREM(-18)};
                width: 0;
              `}
            >
              <Icon
                iconName='checkIcon'
                iconSize='md'
                css={css`
                  position: absolute;
                  top: ${toREM(-8)};
                `}
              />
            </div>
          )}
          <Icon
            iconSize='lg'
            iconName={TILE_TYPE_TO_ICON_MAP[props.tileType]}
            css={css`
              margin-right: ${(prop) => prop.theme.sizes.spacing16};
            `}
          />
          <Text
            weight='semibold'
            css={css`
              text-align: left;
              width: inherit;
            `}
          >
            {label}
          </Text>
        </div>
      </Clickable>
    )
  }
)

interface ICreateEditWorkspaceDrawerMeetingSectionHeaderProps {
  meetingName: string
  isExpanded: boolean
  numTilesSelected: number
  className?: string
  onExpandClicked: () => void
  onDeleteMeetingSectionClicked: () => void
}

export const CreateEditWorkspaceDrawerMeetingSectionHeader = observer(
  function CreateEditWorkspaceDrawerMeetingSectionHeader(
    props: ICreateEditWorkspaceDrawerMeetingSectionHeaderProps
  ) {
    const { t } = useTranslation()

    return (
      <div
        className={props.className}
        css={css`
          align-items: center;
          display: flex;
          justify-content: space-between;
          padding-bottom: ${(prop) => prop.theme.sizes.spacing4};
          padding-left: ${(prop) => prop.theme.sizes.spacing16};
          padding-right: ${(prop) => prop.theme.sizes.spacing16};
          padding-top: ${(prop) => prop.theme.sizes.spacing4};

          ${props.numTilesSelected === 0
            ? css`
                background-color: ${(prop) =>
                  `${prop.theme.colors.createEditWorkspaceMeetingEmptySectionHeaderBackground}`};
              `
            : css`
                background-color: ${(prop) =>
                  `${prop.theme.colors.createEditWorkspaceMeetingSectionHeaderBackground}`};
              `}
        `}
      >
        <Clickable clicked={props.onExpandClicked}>
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            <Icon
              iconName={props.isExpanded ? 'chevronUpIcon' : 'chevronDownIcon'}
              css={css`
                margin-right: ${(prop) => prop.theme.sizes.spacing4};
              `}
            />

            <TextEllipsis
              lineLimit={1}
              weight='semibold'
              css={css`
                margin-right: ${(prop) => prop.theme.sizes.spacing24};
              `}
            >
              {props.meetingName}
            </TextEllipsis>
            <Text weight='light'>
              {t(`{{count}} {{tile}} selected`, {
                count: props.numTilesSelected,
                tile: props.numTilesSelected === 1 ? t('tile') : t('tiles'),
              })}
            </Text>
          </div>
        </Clickable>
        <Tooltip position='top center' msg={t('Delete meeting')}>
          <Clickable
            clicked={(e) => {
              e.stopPropagation()
              props.onDeleteMeetingSectionClicked()
            }}
          >
            <Icon
              iconName='trashIcon'
              css={css`
                margin-right: ${(prop) => prop.theme.sizes.spacing12};
              `}
            />
          </Clickable>
        </Tooltip>
      </div>
    )
  }
)
