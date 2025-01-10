import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { chunkArray } from '@mm/gql'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  Menu,
  Text,
  UserAvatar,
  getTextStyles,
  toREM,
  usePrintContext,
} from '@mm/core-web/ui'

import {
  MAX_AVATARS_TO_DISPLAY,
  SEAT_WIDTH,
  VERTICAL_SEAT_MARGIN_FROM_SUPERVISOR_TO_TOP_OF_HORIZONTAL_LINE,
  VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS,
} from '../consts'
import { canEditAnyFieldInOrgChartSeatDrawer } from '../dataParsingUtilts'
import { HierarchicalOrgChartSeat } from '../types'
import { OpenAvatarAndBadge } from './openAvatarAndBadge'

export type SeatState =
  | 'default'
  | 'hovered'
  | 'dragging'
  | 'editing'
  | 'clone'
  | 'highlighted'

const borderSizeByState: Record<SeatState, number> = {
  default: 2,
  hovered: 2,
  dragging: 2,
  editing: 2,
  clone: 2,
  highlighted: 2,
}

const borderOffsetByState: Record<SeatState, number> = {
  default: 0,
  hovered: 0,
  dragging: 6,
  editing: 0,
  clone: 0,
  highlighted: 0,
}

const borderStyleByState: Record<SeatState, string> = {
  default: 'solid',
  hovered: 'solid',
  dragging: 'dashed',
  editing: 'solid',
  clone: 'solid',
  highlighted: 'solid',
}

const showBorderByState: Record<SeatState, boolean> = {
  default: false,
  hovered: true,
  dragging: true,
  editing: true,
  clone: false,
  highlighted: false,
}

const borderAnimatedByState: Record<SeatState, boolean> = {
  default: false,
  hovered: true,
  dragging: true,
  editing: false,
  clone: false,
  highlighted: false,
}

export const OrgChartSeat = observer(function OrgChartSeat(props: {
  seat: HierarchicalOrgChartSeat
  state: SeatState
  className?: string
  onSeatMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void
  onEditSeatRequested: () => void
  onDeleteSeatRequested: () => void
}) {
  const state = props.state
  const usersToDisplay = chunkArray(
    props.seat.users.nodes,
    MAX_AVATARS_TO_DISPLAY
  )[0]
  const numberOfUsersNotDisplayed =
    props.seat.users.nodes.length - usersToDisplay.length
  const canEditAnyField = canEditAnyFieldInOrgChartSeatDrawer(props.seat)
  const canDrag = props.seat.permissions.canEditSupervisor.allowed

  const displayBorderAnimation =
    showBorderByState[state] && canEditAnyFieldInOrgChartSeatDrawer(props.seat)

  return (
    <div
      className={props.className}
      data-seat-id={props.seat.id}
      role='treeitem'
      tabIndex={0}
      aria-selected={false}
      css={css`
        box-sizing: border-box;
        box-shadow: ${css`
          ${({ theme }) =>
            state === 'highlighted' ? theme.sizes.bs3Primary : theme.sizes.bs1}
        `};
        background: ${({ theme }) => theme.colors.orgChartSeatBackground};
        margin-bottom: ${VERTICAL_SEAT_MARGIN_FROM_SUPERVISOR_TO_TOP_OF_HORIZONTAL_LINE +
        VERTICAL_SEAT_MARGIN_FROM_TOP_OF_HORIZONTAL_LINE_TO_DIRECT_REPORTS}em;
        width: ${SEAT_WIDTH}em;
        position: relative;
        pointer-events: ${state === 'dragging' ? 'none' : 'inherit'};
        border: ${({ theme }) => theme.sizes.smallSolidBorder}
          ${({ theme }) => theme.colors.orgChartSeatBorder};
        border-radius: ${({ theme }) => theme.sizes.br2};
        opacity: ${state === 'clone' ? 0.5 : 1};
        transition: box-shadow 0.5s;

        /* if the user can drag a seat show the grab cursor
           otherwise if they can edit, show pointer since they can click a seat to edit it
           otherwise show the grab cursor since they can drag the whole org chart by clicking and holding down over a seat */
        cursor: ${canDrag ? 'grab' : canEditAnyField ? 'pointer' : 'grab'};

        @keyframes border-animation {
          0%,
          100% {
            clip-path: inset(0 0 98% 0);
          }

          25% {
            clip-path: inset(0 98% 0 0);
          }

          50% {
            clip-path: inset(98% 0 0 0);
          }

          75% {
            clip-path: inset(0 0 0 98%);
          }
        }

        &::before,
        &::after {
          z-index: 1;
          content: '';
          position: absolute;
          top: -${borderOffsetByState[state] + borderSizeByState[state]}px;
          left: -${borderOffsetByState[state] + borderSizeByState[state]}px;
          right: -${borderOffsetByState[state] + borderSizeByState[state]}px;
          bottom: -${borderOffsetByState[state] + borderSizeByState[state]}px;

          border-width: ${borderSizeByState[state]}px;
          border-style: ${borderStyleByState[state]};

          /** having a transparent border ensures the transition from not showing a border to showing it is smooth */
          border-color: ${css`
            ${({ theme }) =>
              displayBorderAnimation
                ? theme.colors.orgChartSeatInteractionBorder
                : 'transparent'};
          `};

          /* this ternary prevents slow fading of the border when the user mouses out of a seat */
          transition: ${state !== 'default' ? 'all 0.5s' : 'none'};
          border-radius: ${({ theme }) => theme.sizes.br2};
        }

        &::before {
          animation: ${borderAnimatedByState[state]
              ? 'border-animation'
              : 'none'}
            4s infinite ease-in-out;
        }

        &::after {
          animation: ${borderAnimatedByState[state]
              ? 'border-animation'
              : 'none'}
            4s infinite -2s ease-in-out;
        }
      `}
      onMouseDown={props.onSeatMouseDown}
    >
      <div
        css={css`
          ${getTextStyles({
            type: 'body',
            weight: 'semibold',
          })};
          padding: ${({ theme }) => theme.sizes.spacing8};
          border-bottom: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.orgChartSeatBorder};
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        {props.seat.position && props.seat.position.title}

        <OrgChartSeatThreeDotsMenu
          seat={props.seat}
          onEditSeatRequested={props.onEditSeatRequested}
          onDeleteSeatRequested={props.onDeleteSeatRequested}
        />
      </div>

      <div
        css={css`
          display: flex;
          align-items: center;
          padding: ${({ theme }) => theme.sizes.spacing8};
        `}
      >
        {usersToDisplay.map((user) => (
          <UserAvatar
            key={user.id}
            avatarUrl={user.avatar}
            firstName={user.firstName}
            lastName={user.lastName}
            userAvatarColor={user.userAvatarColor}
            size='s'
            css={css`
              border-radius: ${({ theme }) => theme.sizes.br1};
              margin-right: ${({ theme }) => theme.sizes.spacing8};
            `}
          />
        ))}
        {usersToDisplay.length === 0 && <OpenAvatarAndBadge />}
        {numberOfUsersNotDisplayed > 0 && (
          <div
            css={css`
              border-radius: ${({ theme }) => theme.sizes.br1};
              ${getTextStyles({
                type: 'body',
              })};
            `}
          >
            {`+${numberOfUsersNotDisplayed}`}
          </div>
        )}
        {props.seat.users.nodes.length === 1 && (
          <div
            css={css`
              ${getTextStyles({
                type: 'body',
                weight: 'semibold',
              })};
            `}
          >
            {props.seat.users.nodes[0].fullName}
          </div>
        )}
      </div>
      <ul
        css={css`
          padding: 0;
          margin: 0;
          margin-left: ${({ theme }) => theme.sizes.spacing16};
          margin-right: ${({ theme }) => theme.sizes.spacing8};
          margin-bottom: ${({ theme }) => theme.sizes.spacing8};
          list-style-position: outside;
        `}
      >
        {props.seat.position?.roles.map((role, roleIdx) => (
          <li
            key={`${role.id}-${roleIdx}`}
            css={css`
              margin-left: ${({ theme }) => theme.sizes.spacing16};
            `}
          >
            <Text
              type='small'
              wordBreak
              css={`
                /* this vertical align and padding-top keep the li bullet/marker aligned with the first line of text */
                vertical-align: top;
                padding-top: ${toREM(2)};
                line-height: ${toREM(16)};
              `}
            >
              {role.name}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  )
})

const OrgChartSeatThreeDotsMenu = observer(
  function OrgChartSeatThreeDotsMenu(props: {
    seat: HierarchicalOrgChartSeat
    onEditSeatRequested: () => void
    onDeleteSeatRequested: () => void
  }) {
    const { t } = useTranslation()
    const printContext = usePrintContext()

    const canEditAnyField = canEditAnyFieldInOrgChartSeatDrawer(props.seat)
    const canDelete = props.seat.permissions.canDelete.allowed
    if (!canEditAnyField && !canDelete) return null

    return (
      <Menu
        position={'bottom center'}
        content={(close) => (
          <>
            {canEditAnyField && (
              <Menu.Item
                onMouseDown={(e) => {
                  // prevent clicking this from triggering an immediate edit or a drag
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onClick={(e) => {
                  close(e)
                  props.onEditSeatRequested()
                }}
              >
                <Text type={'body'}>{t('Edit')}</Text>
              </Menu.Item>
            )}

            {canDelete && (
              <Menu.Item
                onMouseDown={(e) => {
                  // prevent clicking this from triggering an immediate edit or a drag
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onClick={(e) => {
                  close(e)
                  props.onDeleteSeatRequested()
                }}
              >
                <Text type={'body'}>{t('Delete')}</Text>
              </Menu.Item>
            )}
          </>
        )}
      >
        <BtnIcon
          intent='tertiaryTransparent'
          size='lg'
          iconProps={{
            iconName: 'moreVerticalIcon',
            iconSize: 'lg',
          }}
          // for some reason, the z-index of the menu is not enough to make it appear consistently above the org chart seat
          // and without this, the click event is not triggered consistently
          // also, had to use style as opposed to css prop because the css prop was causing this button to no longer trigger the menu to open
          style={{
            zIndex: 9999,
            visibility: printContext.isInPrint ? 'hidden' : 'visible',
          }}
          onClick={() => null}
          ariaLabel={t('More options')}
          tag={'span'}
          onMouseDown={(e) => {
            // prevent clicking this from triggering an immediate edit or a drag
            e.stopPropagation()
            e.preventDefault()
          }}
        />
      </Menu>
    )
  }
)
