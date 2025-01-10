import { observer } from 'mobx-react'
import React from 'react'
import { Mention, MentionsInput } from 'react-mentions'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Icon,
  Menu,
  Text,
  UserAvatar,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { DrawerCommentMention, IDrawerCommentUser } from './drawerCommentsTypes'

interface IDrawerCommentBoxReadOnlyProps {
  type: 'read-only'
}

interface IDrawerCommentBoxEnabledProps {
  type: 'enabled'
  editing: boolean
  isCreateCommentBox?: boolean
  onChange(opts: {
    newBody: string
    newMentions?: Array<DrawerCommentMention>
  }): void
  onComment(opts: { value: string }): void
  onCancel(): void
}

type DrawerCommentBoxProps = (
  | IDrawerCommentBoxReadOnlyProps
  | IDrawerCommentBoxEnabledProps
) & {
  users: Array<IDrawerCommentUser>
  value: string
  placeholder?: string
  className?: string
}

export const DrawerCommentBox: React.FC<DrawerCommentBoxProps> = observer(
  function DrawerCommentBox(props) {
    const { t } = useTranslation()
    const theme = useTheme()

    const inputRef = React.useRef<HTMLTextAreaElement>()

    return (
      <div
        className={props.className}
        css={`
          position: relative;

          .comments-input__suggestions {
            // Fixes issue with suggestions box placed under the "Save Edits" button
            // need to use "!important" cause the z-index is defined as inline-style by react-mentions library
            z-index: ${theme.zIndices.commentsMentionsMenu} !important;
            border-radius: ${theme.sizes.br1} !important;
            box-shadow: ${theme.sizes.bs3} !important;
          }

          .comments-input__highlighter,
          .comments-input__input {
            font-family: ${theme.fontFamily} !important;
            font-size: ${theme.sizes.bodyText};
            line-height: ${theme.sizes.bodyLineHeight};
          }
        `}
      >
        <MentionsInput
          inputRef={inputRef as any}
          placeholder={props.placeholder}
          // eslint-disable-next-line
          autoFocus={props.type === 'enabled' && !props.isCreateCommentBox}
          value={props.value}
          disabled={props.type === 'read-only'}
          onChange={(_e, newValue, _newPlainTextValue, newMentions) => {
            return (
              props.type === 'enabled' &&
              props.onChange({
                newBody: newValue,
                newMentions: newMentions.map((mention) => ({
                  type: 'user',
                  userId: mention.id,
                })),
              })
            )
          }}
          onKeyDown={(e) => {
            if (props.type === 'enabled' && props.isCreateCommentBox) {
              if (e.altKey && e.key === 'Enter') {
                return (
                  inputRef.current?.value &&
                  props.onChange({
                    newBody: (inputRef.current.value += '\n'),
                  })
                )
              }
              if (e.key === 'Enter' && !e.altKey) {
                return props.onComment({ value: inputRef.current?.value || '' })
              }
            }
          }}
          allowSuggestionsAboveCursor
          className='comments-input'
          style={{
            cursor: props.type === 'read-only' ? 'inherit' : undefined,
            boxShadow: props.type === 'enabled' ? theme.sizes.bs1 : undefined,
            borderRadius: theme.sizes.br1,
            background:
              props.type === 'enabled'
                ? theme.colors.textFieldBackgroundDefault
                : undefined,

            highlighter: {
              minHeight: props.type === 'enabled' ? toREM(120) : undefined,
              border: 0,
              padding: theme.sizes.spacing8,
              paddingBottom: props.type === 'enabled' ? toREM(48) : undefined,
            },

            suggestions: {
              list: {
                'height': toREM(192),
                'maxHeight': toREM(192),
                'overflowY': 'auto',
                'borderRadius': theme.sizes.br1,

                '::-webkit-scrollbar': {
                  width: theme.sizes.spacing8,
                },

                '::-webkit-scrollbar-track': {
                  marginTop: theme.sizes.spacing4,
                  marginBottom: theme.sizes.spacing4,
                  borderRadius: theme.sizes.br1,
                },

                '::-webkit-scrollbar-track-piece': {
                  backgroundColor: theme.colors.dropdownScrollBackgroundColor,
                  borderRadius: theme.sizes.br1,
                },

                '::-webkit-scrollbar-thumb': {
                  'background': theme.colors.dropdownScrollThumbColor,

                  '&focus': {
                    background: theme.colors.dropdownScrollThumbColor,
                  },

                  '&hover': {
                    background: theme.colors.dropdownScrollThumbColor,
                  },
                },
              },
            },

            input: {
              cursor: props.type === 'read-only' ? 'inherit' : undefined,
              minHeight: props.type === 'enabled' ? toREM(120) : undefined,
              border: 0,
              outline: 0,
              padding: theme.sizes.spacing8,
              paddingBottom: props.type === 'enabled' ? toREM(48) : undefined,
            },
          }}
        >
          <Mention
            style={{
              position: 'relative',
              color: theme.colors.hyperlinkTextDefault,
              zIndex: theme.zIndices.commentsMentions,
              visibility: props.type === 'read-only' ? 'hidden' : 'visible',
            }}
            trigger={'@'}
            data={(props.users || []).map((user) => ({
              id: user.id,
              display: user.fullName,
              avatar: user.avatar,
            }))}
            displayTransform={(_id, display) => `@${display}`}
            renderSuggestion={(entry) => {
              // eslint-disable-next-line
              // @ts-ignore
              const avatarUrl: string = entry.avatar
              // eslint-disable-next-line
              // @ts-ignore
              const userAvatarColor = entry.userAvatarColor
              const userData = (props.users || []).find(
                (user) => entry.id === user.id
              )

              const avatar = (
                <UserAvatar
                  firstName={userData?.firstName || ''}
                  lastName={userData?.lastName || ''}
                  avatarUrl={avatarUrl}
                  userAvatarColor={userAvatarColor}
                  size={'s'}
                  css={css`
                    margin-right: ${theme.sizes.spacing8};
                  `}
                />
              )

              return (
                <Menu.Item
                  tag={'div'}
                  css={css`
                    &:hover,
                    &:focus {
                      background-color: ${theme.colors.menuItemBackgroundHover};
                    }
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      justify-content: flex-start;
                      align-items: center;
                    `}
                  >
                    {avatar}
                    <Text
                      type={'body'}
                      ellipsis={{
                        widthPercentage: 90,
                      }}
                    >
                      {entry.display}
                    </Text>
                  </div>
                </Menu.Item>
              )
            }}
          />
        </MentionsInput>
        {props.type === 'enabled' && (
          <div
            css={css`
              position: absolute;
              z-index: ${theme.zIndices.commentsSaveCancelBtn};
              bottom: ${theme.sizes.spacing8};
              right: ${theme.sizes.spacing8};
            `}
          >
            {props.editing && (
              <BtnText
                onClick={props.onCancel}
                intent={'tertiary'}
                ariaLabel={t('cancel')}
                css={css`
                  margin-right: ${theme.sizes.spacing8};
                `}
              >
                {t('Cancel')}
              </BtnText>
            )}

            {props.isCreateCommentBox ? (
              <>
                <BtnText
                  width={'noPadding'}
                  disabled={props.value === ''}
                  ariaLabel={t('Add comment')}
                  intent={'tertiary'}
                  onClick={() =>
                    props.onComment({ value: inputRef.current?.value || '' })
                  }
                >
                  <Text type='small' weight='semibold'>
                    {t('Add comment')}
                  </Text>
                </BtnText>
                <Icon
                  iconName={'uploadIcon'}
                  iconSize='md'
                  iconColor={
                    props.value === '' ? { intent: 'disabled' } : undefined
                  }
                  css={css`
                    margin-left: ${theme.sizes.spacing4};
                  `}
                />
              </>
            ) : (
              <BtnText
                onClick={() =>
                  props.onComment({ value: inputRef.current?.value || '' })
                }
                disabled={props.value === ''}
                tooltip={
                  props.value === ''
                    ? { msg: t('Please enter a comment') }
                    : undefined
                }
                ariaLabel={t('save')}
                intent={'primary'}
              >
                {t('Save')}
              </BtnText>
            )}
          </div>
        )}
      </div>
    )
  }
)
