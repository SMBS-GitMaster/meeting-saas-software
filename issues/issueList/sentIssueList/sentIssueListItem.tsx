import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { PermissionCheckResult } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  ActionButton,
  Clickable,
  Text,
  Tooltip,
  UserAvatar,
} from '@mm/core-web/ui'
import { toREM } from '@mm/core-web/ui/responsive'

import {
  CompletedIssueListItemType,
  IIssueListViewActionHandlers,
} from '../issueListTypes'

interface ICompletedIssueListItemProps {
  issue: CompletedIssueListItemType
  canEditIssuesInMeeting: PermissionCheckResult
  isCompactView: boolean
  onEditIssueRequest: IIssueListViewActionHandlers['onEditIssueRequest']
  onCompleteIssue: IIssueListViewActionHandlers['onCompleteIssue']
}

export const CompletedIssueListItem = observer(function CompletedIssueListItem(
  props: ICompletedIssueListItemProps
) {
  const { t } = useTranslation()

  return (
    <>
      <div
        css={css`
          padding-top: ${(prop) => prop.theme.sizes.spacing12};
          padding-right: ${(prop) => prop.theme.sizes.spacing16};
          padding-bottom: ${(prop) => prop.theme.sizes.spacing12};
          padding-left: ${(prop) => prop.theme.sizes.spacing16};
        `}
      >
        <div
          css={css`
            align-items: center;
            display: flex;
            height: ${toREM(40)};
            width: 100%;
          `}
        >
          <UserAvatar
            avatarUrl={props.issue.assignee.avatar}
            firstName={props.issue.assignee.firstName}
            lastName={props.issue.assignee.lastName}
            userAvatarColor={props.issue.assignee.userAvatarColor}
            adornments={{ tooltip: true }}
            size='s'
            css={css`
              flex: 0 0 ${(prop) => prop.theme.sizes.spacing24};
              margin-right: ${(prop) => prop.theme.sizes.spacing16};
            `}
          />

          <div
            css={css`
              flex: 1;
            `}
          >
            <Clickable clicked={() => props.onEditIssueRequest(props.issue.id)}>
              <Text type='body'>{props.issue.title}</Text>
            </Clickable>
          </div>
          <div>
            {props.issue.sentFromIssueMeetingName && (
              <Tooltip
                position='top center'
                msg={props.issue.sentFromIssueMeetingName}
              >
                <Text
                  type='badge'
                  weight='bold'
                  css={css`
                    background-color: #e7eaeb;
                    background-color: ${(prop) =>
                      prop.theme.colors.issueListColumnBorderColor};
                    padding: ${toREM(2)} ${toREM(4)};

                    ${props.isCompactView
                      ? css`
                          margin-right: ${toREM(12)};
                        `
                      : css`
                          margin-right: ${toREM(52)};
                        `}
                  `}
                >
                  From
                </Text>
              </Tooltip>
            )}
            <ActionButton
              id={`CompeltedIssueListItemSolvedButtonId_${props.issue.id}`}
              name='CompeltedIssueListItemSolvedButton'
              type='TOGGLE'
              text={t('Solved')}
              value={props.issue.completed}
              tooltip={
                !props.canEditIssuesInMeeting.allowed
                  ? {
                      msg: props.canEditIssuesInMeeting.message,
                      type: 'light',
                      position: 'top left',
                    }
                  : undefined
              }
              disabled={!props.canEditIssuesInMeeting.allowed}
              onChange={(value) =>
                props.onCompleteIssue({ value, issueId: props.issue.id })
              }
            />
          </div>
        </div>
      </div>
    </>
  )
})
