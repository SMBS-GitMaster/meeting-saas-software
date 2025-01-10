import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { PermissionCheckResult, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  ActionButton,
  BtnIcon,
  Text,
  UserAvatar,
} from '@mm/core-web/ui/components'

import { IIssueListItem, IIssueListViewActionHandlers } from '../issueListTypes'

interface IArchivedIssueListItemProps {
  issue: IIssueListItem
  canEditIssuesInMeeting: PermissionCheckResult
  onRestoreIssue: IIssueListViewActionHandlers['onRestoreIssue']
}

export const ArchivedIssueListItem = observer(
  (props: IArchivedIssueListItemProps) => {
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    return (
      <>
        <div
          css={css`
            padding-top: ${(prop) => prop.theme.sizes.spacing12};
            padding-right: ${(prop) => prop.theme.sizes.spacing16};
            padding-bottom: ${(prop) => prop.theme.sizes.spacing12};
            padding-left: ${(prop) => prop.theme.sizes.spacing8};
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
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
                margin-left: ${(prop) => prop.theme.sizes.spacing8};
                margin-right: ${(prop) => prop.theme.sizes.spacing16};
              `}
            />

            <div
              css={css`
                flex: 1;
                margin-right: ${(prop) => prop.theme.sizes.spacing40};
              `}
            >
              <Text type='body'>{props.issue.title}</Text>
            </div>
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              <BtnIcon
                iconProps={{
                  iconName: 'restoreIcon',
                }}
                tooltip={
                  !props.canEditIssuesInMeeting.allowed
                    ? {
                        msg: props.canEditIssuesInMeeting.message,
                        type: 'light',
                        position: 'top left',
                      }
                    : {
                        msg: t('Restore'),
                        type: 'light',
                        position: 'top center',
                      }
                }
                disabled={!props.canEditIssuesInMeeting.allowed}
                size='lg'
                intent='tertiaryTransparent'
                ariaLabel={t('Restore {{issue}}', {
                  issue: terms.issue.lowercaseSingular,
                })}
                tag='button'
                css={css`
                  margin-right: ${(props) => props.theme.sizes.spacing16};
                  margin-left: ${(props) => props.theme.sizes.spacing16};
                `}
                onClick={() => props.onRestoreIssue(props.issue.id)}
              />

              <ActionButton
                id={`ArchivedIssueListItemSolvedButtonId_${props.issue.id}`}
                name='ArchivedIssueListItemSolvedButton'
                type='TOGGLE'
                text={t('Solved')}
                tooltip={{
                  msg: t('Restore to change status'),
                  type: 'light',
                  position: 'top right',
                }}
                value={props.issue.completed}
                disabled={true}
                onChange={() => null}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
)
