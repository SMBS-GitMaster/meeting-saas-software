import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { PermissionCheckResult, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Clickable,
  Text,
  TextEllipsis,
  Tooltip,
  UserAvatar,
} from '@mm/core-web/ui/components'
import { toREM } from '@mm/core-web/ui/responsive'

import {
  IIssueListViewActionHandlers,
  IIssueSentToMeetingListItem,
  TIssueListResponsiveSize,
} from '../issueListTypes'

interface ISentToOtherMeetingIssueListItemProps {
  issue: IIssueSentToMeetingListItem
  canEditIssuesInMeeting: PermissionCheckResult
  responsiveSize: TIssueListResponsiveSize
  onArchiveSentToIssue: IIssueListViewActionHandlers['onArchiveSentToIssue']
  onEditIssueRequest: IIssueListViewActionHandlers['onEditIssueRequest']
}

export const SentToOtherMeetingIssueListItem = observer(
  (props: ISentToOtherMeetingIssueListItemProps) => {
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    const badgeTextPrefix = props.issue.sentToIssue.completed
      ? t('Solved in')
      : t('')

    return (
      <div
        css={css`
          display: flex;
          flex-direction: column;
          padding-top: ${(prop) => prop.theme.sizes.spacing20};
          padding-right: ${(prop) => prop.theme.sizes.spacing16};
          padding-bottom: ${toREM(10)};
          padding-left: ${(prop) => prop.theme.sizes.spacing16};
        `}
      >
        <div
          css={css`
            align-items: center;
            display: flex;
            justify-content: space-between;
          `}
        >
          <Clickable
            clicked={() => props.onEditIssueRequest(props.issue.sentToIssue.id)}
            css={css`
              align-items: center;
              cursor: pointer;
              display: flex;
            `}
          >
            <>
              <UserAvatar
                avatarUrl={props.issue.sentToIssue.assignee.avatar}
                firstName={props.issue.sentToIssue.assignee.firstName}
                lastName={props.issue.sentToIssue.assignee.lastName}
                userAvatarColor={
                  props.issue.sentToIssue.assignee.userAvatarColor
                }
                adornments={{ tooltip: true }}
                size='s'
                css={css`
                  flex: 0 0 ${(prop) => prop.theme.sizes.spacing24};
                  margin-left: ${(prop) => prop.theme.sizes.spacing8};
                  margin-right: ${(prop) => prop.theme.sizes.spacing16};
                `}
              />
              <Clickable
                css={css`
                  align-self: center;
                  flex: 1;
                `}
                clicked={() => props.onEditIssueRequest(props.issue.id)}
              >
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
                    {props.issue.sentToIssue.title}
                  </TextEllipsis>
                </span>
              </Clickable>
            </>
          </Clickable>
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            {props.responsiveSize !== 'SMALL' && (
              <Tooltip
                position={'top center'}
                msg={`${badgeTextPrefix} ${props.issue.sentToIssueMeetingName}`}
              >
                <span
                  css={css`
                    align-items: center;
                    display: flex;
                    margin-right: ${toREM(20)};
                  `}
                >
                  <Text
                    type='badge'
                    weight='bold'
                    css={css`
                      background-color: ${(prop) =>
                        prop.theme.colors.issueListColumnBorderColor};
                      border-radius: 0.125rem;
                      overflow: hidden;
                      max-width: ${toREM(60)};
                      padding: ${toREM(2)} ${toREM(4)};
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    `}
                  >
                    {t('Sent')}
                  </Text>
                  {props.issue.sentToIssue.completed && (
                    <Text
                      type='badge'
                      weight='bold'
                      css={css`
                        background-color: #00ccc5;
                        border-radius: 0.125rem;
                        overflow: hidden;
                        max-width: ${toREM(60)};
                        margin-left: ${toREM(8)};
                        padding: ${toREM(2)} ${toREM(4)};
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      `}
                    >
                      {t('Solved')}
                    </Text>
                  )}
                </span>
              </Tooltip>
            )}
            <BtnIcon
              iconProps={{
                iconName: 'archiveIcon',
              }}
              tooltip={
                !props.canEditIssuesInMeeting.allowed
                  ? {
                      msg: props.canEditIssuesInMeeting.message,
                      type: 'light',
                      position: 'top left',
                    }
                  : {
                      msg: t('Archive'),
                      type: 'light',
                      position: 'top center',
                    }
              }
              disabled={!props.canEditIssuesInMeeting.allowed}
              size='lg'
              intent='tertiary'
              ariaLabel={t('Archive {{issue}}', {
                issue: terms.issue.lowercaseSingular,
              })}
              tag='button'
              css={css`
                margin-left: ${(props) => props.theme.sizes.spacing4};
                background-color: transparent;

                &:hover,
                &:focus {
                  background-color: ${(prop) =>
                    prop.theme.colors.itemHoverBackgroundColor};
                }
              `}
              onClick={() => props.onArchiveSentToIssue(props.issue.id)}
            />
          </div>
        </div>
        {props.responsiveSize === 'SMALL' && (
          <div
            css={css`
              align-items: center;
              display: flex;
              justify-content: space-between;
              margin-left: ${(prop) => prop.theme.sizes.spacing8};
              margin-top: ${(prop) => prop.theme.sizes.spacing8};
            `}
          >
            <Tooltip
              position={'top center'}
              msg={`${badgeTextPrefix} ${props.issue.sentToIssueMeetingName}`}
            >
              <span
                css={css`
                  align-items: center;
                  display: flex;
                  margin-right: ${toREM(20)};
                `}
              >
                <Text
                  type='badge'
                  weight='bold'
                  css={css`
                    background-color: ${(prop) =>
                      prop.theme.colors.issueListColumnBorderColor};
                    border-radius: 0.125rem;
                    overflow: hidden;
                    max-width: ${toREM(60)};
                    padding: ${toREM(2)} ${toREM(4)};
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  `}
                >
                  {t('Sent')}
                </Text>
                {props.issue.sentToIssue.completed && (
                  <Text
                    type='badge'
                    weight='bold'
                    css={css`
                      background-color: #00ccc5;
                      border-radius: 0.125rem;
                      overflow: hidden;
                      max-width: ${toREM(60)};
                      margin-left: ${toREM(8)};
                      padding: ${toREM(2)} ${toREM(4)};
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    `}
                  >
                    {t('Solved')}
                  </Text>
                )}
              </span>
            </Tooltip>
          </div>
        )}
      </div>
    )
  }
)
