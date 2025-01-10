import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnIcon, BtnText, UserAvatar, toREM } from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { getContextAwareTodoText } from '../shared'
import { IWrapUpIssueEntry } from './wrapUpTypes'

export interface IWrapUpIssueFormValues {
  completed: boolean
}

export const WrapUpIssueEntry = observer((props: IWrapUpIssueEntry) => {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { openOverlazy } = useOverlazyController()

  const { issue, getActions, getData } = props

  const { canEditIssuesInMeeting, canCreateTodosInMeeting } =
    getData().getCurrentUserPermissions()

  return (
    <>
      <div
        css={css`
          display: flex;
          align-items: center;
          flex-flow: row wrap;
          min-height: ${toREM(60)};
          padding-top: ${(prop) => prop.theme.sizes.spacing8};
          padding-bottom: ${(prop) => prop.theme.sizes.spacing8};

          &:first-of-type {
            padding-top: 0;
          }

          &:last-of-type {
            padding-bottom: 0;
          }
        `}
      >
        <div
          css={css`
            display: flex;
            width: 100%;
            align-items: flex-start;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: flex-start;
              margin: ${toREM(10)} ${({ theme }) => theme.sizes.spacing16} 0 0;
            `}
          >
            <UserAvatar
              avatarUrl={issue.assignee.avatar}
              firstName={issue.assignee.firstName}
              lastName={issue.assignee.lastName}
              userAvatarColor={issue.assignee.userAvatarColor}
              adornments={{ tooltip: true }}
              size='s'
              css={css`
                flex: 0 0 ${({ theme }) => theme.sizes.spacing24};
                margin-left: ${(prop) => prop.theme.sizes.spacing16};
              `}
            />
          </div>
          <div
            css={css`
              flex: 1;
              margin: ${toREM(5)} 0 0 0;
              display: flex;
              flex-direction: row;
              align-items: center;
              min-height: ${({ theme }) => theme.sizes.spacing32};
            `}
          >
            <TextEllipsis
              css={css`
                flex: 1;
                margin-left: ${(prop) => prop.theme.sizes.spacing16};
                margin-right: ${(prop) => prop.theme.sizes.spacing40};
                text-align: left;
              `}
              type='body'
              wordBreak={true}
              lineLimit={2}
            >
              {issue.title}
            </TextEllipsis>
          </div>
          <div
            css={css`
              display: flex;
              align-items: center;
              flex-flow: row wrap;
            `}
          >
            <BtnIcon
              iconProps={{
                iconName: 'toDoCompleteIcon',
              }}
              disabled={!canCreateTodosInMeeting.allowed}
              tooltip={
                !canCreateTodosInMeeting.allowed
                  ? {
                      msg: canCreateTodosInMeeting.message,
                      type: 'light',
                      position: 'top left',
                    }
                  : {
                      msg: getContextAwareTodoText(terms),
                      type: 'light',
                      contentCss: css`
                        transform: translateX(${toREM(2)});
                      `,
                    }
              }
              size='lg'
              intent='naked'
              ariaLabel={getContextAwareTodoText(terms)}
              tag='button'
              css={css`
                margin: 0 ${(props) => props.theme.sizes.spacing16};
              `}
              onClick={() =>
                getActions().onCreateContextAwareTodoFromIssue({
                  ownerId: issue.assignee.id,
                  ownerFullName: issue.assignee.fullName,
                  notesId: issue.notesId,
                  title: issue.title,
                  type: 'Issue',
                })
              }
            />
            {issue.completed && (
              <BtnText
                intent='primary'
                height='small'
                width='fitted'
                ariaLabel={t('Solved !')}
                onClick={() => {
                  openOverlazy('UnsolveIssueModal', {
                    issueId: issue.id,
                    canEditIssuesInMeeting,
                  })
                }}
              >
                {t('Solved !')}
              </BtnText>
            )}
          </div>
        </div>
      </div>
    </>
  )
})
