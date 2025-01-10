import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { useAction } from '@mm/gql'

import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Badge,
  BtnIcon,
  Clickable,
  DatePickerInput,
  Icon,
  Text,
  UserAvatar,
  toREM,
} from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

import { getContextAwareIssueText } from '../shared'
import { IWrapUpToDoEntry } from './wrapUpTypes'

export interface IWrapUpTodoFormValues {
  dueDate: number
}

export const WrapUpTodoEntry = observer((props: IWrapUpToDoEntry) => {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const { todo, getActions, getData } = props

  const { canEditTodosInMeeting, canCreateIssuesInMeeting } =
    getData().getCurrentUserPermissions()

  const memoizedTodoFormValues = useMemo(() => {
    return {
      dueDate: todo.dueDate,
    }
  }, [todo.dueDate])

  const onTodoClicked = useAction(() => {
    getActions().onTodoClicked({
      todoId: todo.id,
    })
  })

  return (
    <>
      <EditForm
        disabled={!canEditTodosInMeeting.allowed}
        disabledTooltip={
          !canEditTodosInMeeting.allowed
            ? {
                msg: canEditTodosInMeeting.message,
                type: 'light',
                position: 'top center',
              }
            : undefined
        }
        isLoading={false}
        values={memoizedTodoFormValues}
        validation={
          {
            dueDate: formValidators.number({
              additionalRules: [required()],
            }),
          } satisfies GetParentFormValidation<IWrapUpTodoFormValues>
        }
        onSubmit={async (value) =>
          await getActions().onUpdateTodo({
            id: todo.id,
            dueDate: value.dueDate,
          })
        }
      >
        {({ fieldNames }) => {
          return (
            <div
              css={css`
                display: flex;
                align-items: center;
                flex-flow: row wrap;
                margin-top: ${(prop) => prop.theme.sizes.spacing8};
                margin-bottom: ${(prop) => prop.theme.sizes.spacing8};
                padding: 0 ${(prop) => prop.theme.sizes.spacing8} 0
                  ${(prop) => prop.theme.sizes.spacing16};

                &:first-of-type {
                  margin-top: 0;
                }

                &:last-of-type {
                  margin-bottom: 0;
                }

                &:hover,
                &:focus {
                  background-color: ${(prop) =>
                    prop.theme.colors.newInfoBoxHoverColor};

                  .context-aware-button-icon {
                    background-color: ${(prop) =>
                      prop.theme.colors.newInfoBoxHoverColor};
                  }
                }
              `}
            >
              <Clickable
                css={css`
                  display: flex;
                  align-items: center;
                  flex: 1;
                  height: 100%;
                  padding: ${(prop) => prop.theme.sizes.spacing16} 0;
                `}
                clicked={onTodoClicked}
              >
                <UserAvatar
                  avatarUrl={todo.assignee.avatar}
                  firstName={todo.assignee.firstName}
                  lastName={todo.assignee.lastName}
                  userAvatarColor={todo.assignee.userAvatarColor}
                  adornments={{ tooltip: true }}
                  size='s'
                  css={css`
                    flex: 0 0 ${({ theme }) => theme.sizes.spacing24};
                    margin-left: ${(prop) => prop.theme.sizes.spacing8};
                  `}
                />
                <div
                  css={css`
                    flex: 1;
                    margin-left: ${(prop) => prop.theme.sizes.spacing16};
                    margin-right: ${(prop) => prop.theme.sizes.spacing40};
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                  `}
                >
                  <TextEllipsis
                    lineLimit={2}
                    type='body'
                    css={css`
                      text-align: left;
                    `}
                  >
                    {todo.title}
                  </TextEllipsis>
                </div>
              </Clickable>

              <Badge
                intent='primary'
                text={t('New')}
                css={css`
                  margin-right: ${(prop) => prop.theme.sizes.spacing16};
                `}
              />

              <BtnIcon
                iconProps={{
                  iconName: 'contextAwareIssueIcon',
                  iconSize: 'lg',
                }}
                className='context-aware-button-icon'
                disabled={!canCreateIssuesInMeeting.allowed}
                tooltip={
                  !canCreateIssuesInMeeting.allowed
                    ? {
                        msg: canCreateIssuesInMeeting.message,
                        type: 'light',
                        position: 'top left',
                      }
                    : {
                        msg: getContextAwareIssueText(terms),
                        type: 'light',
                        offset: `${toREM(-10)}`,
                      }
                }
                size='lg'
                intent='tertiary'
                ariaLabel={getContextAwareIssueText(terms)}
                tag='button'
                onClick={() =>
                  getActions().onCreateContextAwareIssueFromTodo({
                    title: todo.title,
                    type: 'To-do',
                    ownerId: todo.assignee.id,
                    ownerFullName: todo.assignee.fullName,
                    notesId: todo.notesId,
                  })
                }
                css={css`
                  margin-right: ${(prop) => prop.theme.sizes.spacing16};
                `}
              />
              <div
                css={css`
                  flex: 0 0 ${toREM(108)};
                `}
              >
                <DatePickerInput
                  isSkinny={true}
                  id={'dueDate'}
                  name={fieldNames.dueDate}
                  tooltip={
                    !canEditTodosInMeeting.allowed
                      ? {
                          msg: canEditTodosInMeeting.message,
                          type: 'light',
                          position: 'top left',
                        }
                      : undefined
                  }
                  customInput={({ onClick, value }) => (
                    <Clickable
                      disabled={!canEditTodosInMeeting.allowed}
                      css={css`
                        display: flex;
                      `}
                      clicked={() => onClick && onClick()}
                    >
                      <span>
                        <Text type='body' weight='semibold'>
                          {value}
                        </Text>
                        <Icon iconName='chevronDownIcon' iconSize='lg' />
                      </span>
                    </Clickable>
                  )}
                />
              </div>
            </div>
          )
        }}
      </EditForm>
    </>
  )
})
