import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  ITooltipProps,
  Text,
  UserAvatar,
  useTheme,
} from '@mm/core-web/ui'
import { toREM } from '@mm/core-web/ui/responsive'

import { DrawerCommentBox } from './drawerCommentsBox'
import { IDrawerComment, IDrawerCommentUser } from './drawerCommentsTypes'

export const DrawerComment: React.FC<{
  comment: IDrawerComment
  users: Array<IDrawerCommentUser>
  viewOnlyCommentMode?: {
    tooltip: ITooltipProps
  }
  onDeleteComment: (opts: { commentId: Id }) => Promise<void>
  onEditComment: (opts: { commentId: Id; body: string }) => Promise<void>
}> = observer((props) => {
  const [editingComment, setEditingComment] = React.useState(false)
  const [commentBody, setCommentBody] = React.useState(props.comment.body)

  const { t } = useTranslation()
  const theme = useTheme()

  const handleDeleteComment = async () => {
    await props.onDeleteComment({ commentId: props.comment.id })
  }

  const handleEditComment = async (opts: { value: string }) => {
    await props.onEditComment({ commentId: props.comment.id, body: opts.value })
    setEditingComment(false)
    setCommentBody('')
  }

  return (
    <div
      css={css`
        padding: ${theme.sizes.spacing8};
        border-radius: ${theme.sizes.br1};
        margin-bottom: ${theme.sizes.spacing16};

        background-color: ${editingComment
          ? theme.colors.commentHoverColor
          : theme.colors.commentsBackgroundDefault};

        .show_btns_on_hover {
          visibility: hidden;
        }

        &:hover,
        &:focus {
          background-color: ${props.comment.canEditComment ||
          props.comment.canDeleteComment
            ? theme.colors.commentHoverColor
            : theme.colors.commentsBackgroundDefault};

          .show_btns_on_hover {
            ${!props.viewOnlyCommentMode &&
            css`
              visibility: visible;
            `}
          }
        }
      `}
    >
      <StyledCommentHeaderWrapper>
        <div
          css={css`
            display: inline-flex;
            align-items: center;
          `}
        >
          <UserAvatar
            firstName={props.comment.author.firstName}
            lastName={props.comment.author.lastName}
            avatarUrl={props.comment.author.avatar}
            userAvatarColor={props.comment.author.userAvatarColor}
            size={'s'}
          />
          <Text
            type={'body'}
            weight={'semibold'}
            css={css`
              margin: 0 ${theme.sizes.spacing8};
            `}
          >
            {props.comment.author.fullName}
          </Text>
          <Text
            type={'small'}
            css={css`
              padding-bottom: ${toREM(2)};
            `}
          >
            {props.comment.datePosted}
          </Text>
        </div>
        <div>
          {props.comment.canEditComment && (
            <BtnIcon
              iconProps={{
                iconName: 'editIcon',
                iconSize: 'md',
              }}
              className={'show_btns_on_hover'}
              size='md'
              intent='tertiaryTransparent'
              ariaLabel={t('Edit Comment')}
              tag='button'
              onClick={() => setEditingComment(true)}
            />
          )}

          {props.comment.canDeleteComment && (
            <BtnIcon
              iconProps={{
                iconName: 'trashIcon',
                iconSize: 'md',
              }}
              className={'show_btns_on_hover'}
              size='md'
              intent='tertiaryTransparent'
              ariaLabel={t('Delete Comment')}
              tag='button'
              onClick={handleDeleteComment}
            />
          )}
        </div>
      </StyledCommentHeaderWrapper>

      <div
        css={css`
          min-width: ${toREM(232)};
          width: 100%;
        `}
      >
        {editingComment ? (
          <DrawerCommentBox
            editing
            type={'enabled'}
            value={commentBody}
            users={props.users}
            onChange={({ newBody }) => {
              setCommentBody(newBody)
            }}
            onComment={handleEditComment}
            onCancel={() => setEditingComment(false)}
          />
        ) : (
          <div
            css={css`
              padding-left: ${theme.sizes.spacing24};
            `}
          >
            <DrawerCommentBox
              users={props.users}
              type={'read-only'}
              value={props.comment.body}
            />
          </div>
        )}
      </div>
    </div>
  )
})

const StyledCommentHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
