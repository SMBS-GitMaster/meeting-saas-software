import React from 'react'
import { css } from 'styled-components'

import { type Id, NodesCollection } from '@mm/gql'

import { getShortDateDisplay } from '@mm/core/date'

import { UserAvatarColorType } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Accordion,
  BtnText,
  Icon,
  Text,
  UserAvatar,
  useTheme,
} from '@mm/core-web/ui'

export interface IIssueCommentItem {
  id: Id
  author: {
    avatar: Maybe<string>
    firstName: string
    lastName: string
    fullName: string
    userAvatarColor: UserAvatarColorType
  }
  postedTimestamp: number
  body: string
}

interface IIssueCommentProps {
  timezone: string
  commentsData: NodesCollection<{
    TItemType: IIssueCommentItem
    TIncludeTotalCount: false
  }>
  startShowed?: boolean
  className?: string
}

export const CommentsForIssueDrawers: React.FC<IIssueCommentProps> = ({
  commentsData,
  className,
  startShowed,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Accordion
      title={t('Comments')}
      startShowed={startShowed}
      className={className}
    >
      <>
        {commentsData.nodes.map((comment) => {
          const { id, author, body, postedTimestamp } = comment
          const timeFormatted = getShortDateDisplay({
            secondsSinceEpochUTC: postedTimestamp,
            userTimezone: 'utc',
          })

          return (
            <div
              key={id}
              css={css`
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                margin-bottom: ${({ theme }) => theme.sizes.spacing16};
              `}
            >
              <div>
                <UserAvatar
                  avatarUrl={author.avatar}
                  firstName={author.firstName}
                  lastName={author.lastName}
                  userAvatarColor={author.userAvatarColor}
                  adornments={{ tooltip: true }}
                  size='s'
                  css={css`
                    flex: 0 0 ${({ theme }) => theme.sizes.spacing24};
                    margin-right: ${(prop) => prop.theme.sizes.spacing8};
                  `}
                />
              </div>
              <div>
                <div
                  css={css`
                    margin-bottom: ${({ theme }) => theme.sizes.spacing4};
                  `}
                >
                  <Text
                    type='body'
                    weight='semibold'
                    css={css`
                      color: ${(props) =>
                        props.theme.colors.commentItemAssigneeNameColor};
                    `}
                  >
                    {author.fullName}
                  </Text>
                  <Text
                    type='small'
                    css={css`
                      padding-left: ${({ theme }) => theme.sizes.spacing16};
                      color: ${(props) =>
                        props.theme.colors.commentItemTextColor};
                    `}
                  >
                    {timeFormatted}
                  </Text>
                </div>
                <Text
                  type='body'
                  css={css`
                    color: ${(props) =>
                      props.theme.colors.commentItemTextColor};
                  `}
                >
                  {body}
                </Text>
              </div>
            </div>
          )
        })}
        {commentsData.hasNextPage && (
          <BtnText
            onClick={() => {
              commentsData.loadMore()
            }}
            intent='tertiaryTransparent'
            width='noPadding'
            ariaLabel={t('Load more')}
            css={css`
              align-self: flex-start;
            `}
          >
            <>
              <Icon
                iconName={'loadingIcon'}
                iconSize={'md'}
                iconColor={{ color: theme.colors.bodyTextDefault }}
              />
              <Text
                weight='semibold'
                type='small'
                css={css`
                  padding-left: ${theme.sizes.spacing6};
                `}
              >
                {t('Load more')}
              </Text>
            </>
          </BtnText>
        )}
      </>
    </Accordion>
  )
}
