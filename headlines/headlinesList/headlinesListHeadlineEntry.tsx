import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Clickable,
  Icon,
  Menu,
  Text,
  UserAvatar,
  toREM,
} from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

import {
  getContextAwareIssueText,
  getContextAwareTodoText,
} from '@mm/bloom-web/shared'

import { IHeadlinesListHeadlineEntryProps } from './headlinesListTypes'

export const HeadlinesListHeadlineEntry = observer(
  function HeadlinesListHeadlineEntry(props: IHeadlinesListHeadlineEntryProps) {
    const {
      canCreateTodosInMeeting,
      canCreateIssuesInMeeting,
      canEditHeadlinesInMeeting,
      headline,
      getData,
      getActions,
      responsiveSize,
    } = props

    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    return (
      <div
        css={css`
          align-items: center;
          display: flex;
          height: ${toREM(56)};
          padding-top: ${(prop) => prop.theme.sizes.spacing8};
          padding-right: ${(prop) => prop.theme.sizes.spacing16};
          padding-bottom: ${(prop) => prop.theme.sizes.spacing8};
          padding-left: ${(prop) => prop.theme.sizes.spacing16};

          &:last-of-type {
            padding-bottom: ${(props) => props.theme.sizes.spacing16};
          }

          &:hover,
          &:focus {
            background-color: ${(prop) =>
              prop.theme.colors.itemHoverBackgroundColor};
          }
        `}
      >
        <div
          css={css`
            align-items: center;
            display: flex;
            width: 100%;
          `}
        >
          <UserAvatar
            avatarUrl={headline.assignee.avatar}
            firstName={headline.assignee.firstName}
            lastName={headline.assignee.lastName}
            userAvatarColor={headline.assignee.userAvatarColor}
            adornments={{ tooltip: true }}
            size='s'
            css={css`
              flex: 0 0 ${toREM(24)};
              margin-right: ${({ theme }) => theme.sizes.spacing16};
            `}
          />
          <Clickable
            clicked={() =>
              getActions().onEditHeadlineRequest(props.headline.id)
            }
            css={css`
              flex: 1;
              margin-right: ${({ theme }) => theme.sizes.spacing40};
              display: flex;
              flex-direction: row;
              align-items: center;
              min-height: ${({ theme }) => theme.sizes.spacing32};
            `}
          >
            <div>
              <span
                css={css`
                  display: flex;
                  flex-direction: row;
                  text-align: left;
                `}
              >
                <TextEllipsis
                  type='body'
                  lineLimit={2}
                  wordBreak={true}
                  css={css`
                    text-align: left;
                  `}
                >
                  {headline.title}
                </TextEllipsis>
              </span>
            </div>
          </Clickable>
          <div
            css={css`
              display: flex;
            `}
          >
            {responsiveSize === 'SMALL' && (
              <>
                <Menu
                  minWidthRems={17}
                  content={(close) => (
                    <>
                      <Menu.Item
                        disabled={!canEditHeadlinesInMeeting.allowed}
                        tooltip={
                          !canEditHeadlinesInMeeting.allowed
                            ? {
                                msg: canEditHeadlinesInMeeting.message,
                                position: 'top left',
                              }
                            : {
                                msg: t('Copy to another meeting'),
                                type: 'light',
                                offset: `${toREM(-10)}`,
                              }
                        }
                        onClick={(e) => {
                          getActions().onCopy({
                            headlineToCopyId: headline.id,
                            meetingId: getData().meetingId,
                          })
                          close(e)
                        }}
                      >
                        <div>
                          <Icon
                            iconName='copyIcon'
                            iconSize='lg'
                            css={css`
                              margin-right: ${({ theme }) =>
                                theme.sizes.spacing8};
                            `}
                          />
                          <Text>{t('Copy to another meeting')}</Text>
                        </div>
                      </Menu.Item>
                      <Menu.Item
                        disabled={!canCreateIssuesInMeeting.allowed}
                        tooltip={
                          !canCreateIssuesInMeeting.allowed
                            ? {
                                msg: canCreateIssuesInMeeting.message,
                                position: 'top left',
                              }
                            : {
                                msg: getContextAwareIssueText(terms),
                                type: 'light',
                                offset: `${toREM(-10)}`,
                              }
                        }
                        onClick={(e) => {
                          getActions().onCreateContextAwareIssueFromHeadline({
                            title: headline.title,
                            type: 'Headline',
                            ownerId: headline.assignee.id,
                            notesId: headline.notesId,
                            ownerFullName: headline.assignee.fullName,
                          })
                          close(e)
                        }}
                      >
                        <div>
                          <Icon
                            iconName='issuesIcon'
                            iconSize='lg'
                            css={css`
                              margin-right: ${({ theme }) =>
                                theme.sizes.spacing8};
                            `}
                          />
                          <Text>{getContextAwareIssueText(terms)}</Text>
                        </div>
                      </Menu.Item>
                      <Menu.Item
                        disabled={!canCreateTodosInMeeting.allowed}
                        tooltip={
                          !canCreateTodosInMeeting.allowed
                            ? {
                                msg: canCreateTodosInMeeting.message,
                                position: 'top left',
                              }
                            : {
                                msg: getContextAwareTodoText(terms),
                                type: 'light',
                                offset: `${toREM(-10)}`,
                              }
                        }
                        onClick={(e) => {
                          getActions().onCreateContextAwareTodoFromHeadline({
                            title: headline.title,
                            type: 'Headline',
                            ownerId: headline.assignee.id,
                            notesId: headline.notesId,
                            ownerFullName: headline.assignee.fullName,
                          })
                          close(e)
                        }}
                      >
                        <div>
                          <Icon
                            iconName='toDoCompleteIcon'
                            iconSize='lg'
                            css={css`
                              margin-right: ${({ theme }) =>
                                theme.sizes.spacing8};
                            `}
                          />
                          <Text>{getContextAwareTodoText(terms)}</Text>
                        </div>
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
              </>
            )}
            {responsiveSize !== 'SMALL' && (
              <>
                <BtnIcon
                  iconProps={{
                    iconName: 'copyIcon',
                    iconSize: 'lg',
                  }}
                  disabled={!canEditHeadlinesInMeeting.allowed}
                  tooltip={
                    !canEditHeadlinesInMeeting.allowed
                      ? {
                          msg: canEditHeadlinesInMeeting.message,
                          position: 'top left',
                        }
                      : {
                          msg: t('Copy to another meeting'),
                          type: 'light',
                          offset: `${toREM(-10)}`,
                        }
                  }
                  size='lg'
                  intent='tertiaryTransparent'
                  ariaLabel={t('Copy to another meeting')}
                  tag='button'
                  css={css`
                    background-color: inherit;
                  `}
                  onClick={() =>
                    getActions().onCopy({
                      headlineToCopyId: props.headline.id,
                      meetingId: getData().meetingId,
                    })
                  }
                />
                <BtnIcon
                  iconProps={{
                    iconName: 'issuesIcon',
                    iconSize: 'lg',
                  }}
                  disabled={!canCreateIssuesInMeeting.allowed}
                  tooltip={
                    !canCreateIssuesInMeeting.allowed
                      ? {
                          msg: canCreateIssuesInMeeting.message,
                          position: 'top left',
                        }
                      : {
                          msg: getContextAwareIssueText(terms),
                          type: 'light',
                          offset: `${toREM(-10)}`,
                        }
                  }
                  size='lg'
                  intent='tertiaryTransparent'
                  ariaLabel={getContextAwareIssueText(terms)}
                  tag='button'
                  css={css`
                    background-color: inherit;
                  `}
                  onClick={() =>
                    getActions().onCreateContextAwareIssueFromHeadline({
                      title: headline.title,
                      type: 'Headline',
                      ownerId: headline.assignee.id,
                      notesId: headline.notesId,
                      ownerFullName: headline.assignee.fullName,
                    })
                  }
                />
                <BtnIcon
                  iconProps={{
                    iconName: 'toDoCompleteIcon',
                    iconSize: 'lg',
                  }}
                  disabled={!canCreateTodosInMeeting.allowed}
                  tooltip={
                    !canCreateTodosInMeeting.allowed
                      ? {
                          msg: canCreateTodosInMeeting.message,
                          position: 'top left',
                        }
                      : {
                          msg: getContextAwareTodoText(terms),
                          type: 'light',
                          offset: `${toREM(-10)}`,
                        }
                  }
                  size='lg'
                  intent='tertiaryTransparent'
                  ariaLabel={getContextAwareTodoText(terms)}
                  tag='button'
                  css={css`
                    background-color: inherit;
                  `}
                  onClick={() =>
                    getActions().onCreateContextAwareTodoFromHeadline({
                      title: headline.title,
                      type: 'Headline',
                      ownerId: headline.assignee.id,
                      notesId: headline.notesId,
                      ownerFullName: headline.assignee.fullName,
                    })
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
)
