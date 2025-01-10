import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import { PermissionCheckResult, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  CheckCircleInput,
  Clickable,
  DatePickerInput,
  Icon,
  Text,
  UserAvatar,
} from '@mm/core-web/ui/components'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'
import { toREM } from '@mm/core-web/ui/responsive'

import {
  IContextAwareItemFromTodoOpts,
  getContextAwareIssueText,
} from '@mm/bloom-web/shared'

import {
  ITodoListSharedActions,
  ITodoListTodo,
  TTodoListResponsiveSizes,
} from './todoListTypes'

interface ITodoListItemProps {
  isLoading: boolean
  todo: ITodoListTodo
  meetingStartTime: number | null
  showAssigneeAvatar?: boolean
  displayContextAwareButtons?: boolean
  currentUserPermissions: () => {
    canEditTodosInMeeting: PermissionCheckResult
    canCreateIssuesInMeeting: PermissionCheckResult
  }
  responsiveSize: TTodoListResponsiveSizes
  onCreateContextAwareIssueFromTodo(opts: IContextAwareItemFromTodoOpts): void
  onEditTodoRequest: (todoId: Id) => void
  onUpdateTodo: ITodoListSharedActions['onUpdateTodo']
}

export const TodoListItem = observer(function TodoListItem(
  props: ITodoListItemProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { canEditTodosInMeeting, canCreateIssuesInMeeting } =
    props.currentUserPermissions()

  const isTodoNew = props.todo.isNew(props.meetingStartTime)

  const showAssigneeAvatar =
    props.showAssigneeAvatar === undefined ? true : props.showAssigneeAvatar

  const displayContextAwareButtons =
    props.displayContextAwareButtons === undefined
      ? true
      : props.displayContextAwareButtons

  const memoizedFormValues = useMemo(() => {
    return {
      completed: props.todo.completed,
      dueDate: props.todo.dueDate,
    }
  }, [props.todo.completed, props.todo.dueDate])

  const memoizedFormValidation = useMemo(() => {
    return {
      completed: formValidators.boolean({
        additionalRules: [required()],
      }),
      dueDate: formValidators.number({
        additionalRules: [required()],
      }),
    }
  }, [formValidators, required])

  return (
    <>
      <EditForm
        isLoading={props.isLoading}
        values={memoizedFormValues}
        validation={
          memoizedFormValidation as GetParentFormValidation<{
            completed: boolean
            dueDate: number
          }>
        }
        disabled={!canEditTodosInMeeting.allowed}
        disabledTooltip={
          !canEditTodosInMeeting.allowed
            ? {
                msg: canEditTodosInMeeting.message,
                position: 'top center',
              }
            : undefined
        }
        onSubmit={async (values) =>
          await props.onUpdateTodo({
            id: props.todo.id,
            completed: values.completed,
            dueDate: values.dueDate,
          })
        }
      >
        {({ values, fieldNames }) => {
          return (
            <div
              css={css`
                padding-top: ${(prop) => prop.theme.sizes.spacing8};
                padding-right: ${(prop) => prop.theme.sizes.spacing16};
                padding-bottom: ${(prop) => prop.theme.sizes.spacing8};
                padding-left: ${(prop) => prop.theme.sizes.spacing16};

                &:hover,
                &:focus {
                  background-color: ${(prop) =>
                    prop.theme.colors.newInfoBoxHoverColor};

                  .context-aware-button-icon {
                    background-color: ${(prop) =>
                      prop.theme.colors.newInfoBoxHoverColor};
                  }

                  .new-badge {
                    color: ${!isTodoNew
                      ? css`
                          ${(props) => props.theme.colors.newInfoBoxHoverColor}
                        `
                      : 'default'};
                    background-color: ${!isTodoNew
                      ? css`
                          ${(props) => props.theme.colors.newInfoBoxHoverColor}
                        `
                      : 'default'};
                  }
                }
              `}
            >
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                `}
              >
                <div
                  css={css`
                    align-items: center;
                    display: flex;
                  `}
                >
                  <div
                    css={css`
                      align-items: center;
                      display: flex;
                    `}
                  >
                    <CheckCircleInput
                      id='completed'
                      name={fieldNames.completed}
                    />
                    {showAssigneeAvatar && (
                      <UserAvatar
                        avatarUrl={props.todo.assignee.avatar}
                        firstName={props.todo.assignee.firstName}
                        lastName={props.todo.assignee.lastName}
                        userAvatarColor={props.todo.assignee.userAvatarColor}
                        size='s'
                        adornments={{ tooltip: true }}
                        css={css`
                          flex: 0 0 ${({ theme }) => theme.sizes.spacing24};
                          margin-left: ${(prop) => prop.theme.sizes.spacing16};
                          margin-right: ${(prop) => prop.theme.sizes.spacing16};
                        `}
                      />
                    )}
                  </div>
                  {props.responsiveSize !== 'SMALL' && (
                    <Clickable
                      clicked={() => props.onEditTodoRequest(props.todo.id)}
                      css={css`
                        flex: 1;
                        margin: 0 ${({ theme }) => theme.sizes.spacing40} 0 0;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        min-height: ${({ theme }) => theme.sizes.spacing32};

                        ${!showAssigneeAvatar &&
                        css`
                          margin-left: ${({ theme }) => theme.sizes.spacing8};
                        `}
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
                            lineLimit={2}
                            type='body'
                            wordBreak={true}
                            css={css`
                              text-align: left;
                              text-decoration: ${values && values.completed
                                ? 'line-through'
                                : 'none'};
                            `}
                          >
                            {props.todo.title}
                          </TextEllipsis>
                        </span>
                      </div>
                    </Clickable>
                  )}
                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                      height: ${toREM(39)};
                    `}
                  >
                    {props.todo.isNew(props.meetingStartTime) === true && (
                      <Text
                        className='new-badge'
                        weight='semibold'
                        type='small'
                        css={css`
                          color: ${isTodoNew
                            ? css`
                                ${(props) =>
                                  props.theme.colors.newInfoBoxFontColor}
                              `
                            : css`
                                ${(props) =>
                                  props.theme.colors.cardBackgroundColor}
                              `};
                          background-color: ${isTodoNew
                            ? css`
                                ${(props) =>
                                  props.theme.colors.newInfoBoxBackgroundColor}
                              `
                            : css`
                                ${(props) =>
                                  props.theme.colors.cardBackgroundColor}
                              `};
                          border-radius: ${(props) => props.theme.sizes.br1};
                          padding: 0 ${toREM(4)};
                          margin-right: ${(props) =>
                            props.theme.sizes.spacing32};
                        `}
                      >
                        {t('New')}
                      </Text>
                    )}
                    {displayContextAwareButtons && (
                      <BtnIcon
                        className='context-aware-button-icon'
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
                        intent='tertiary'
                        ariaLabel={getContextAwareIssueText(terms)}
                        tag='button'
                        css={css`
                          margin-right: ${(prop) => prop.theme.sizes.spacing8};
                        `}
                        onClick={() => {
                          props.onCreateContextAwareIssueFromTodo({
                            title: props.todo.title,
                            type: 'To-do',
                            ownerId: props.todo.assignee.id,
                            ownerFullName: props.todo.assignee.fullName,
                            notesId: props.todo.notesId,
                          })
                        }}
                      />
                    )}
                    <div
                      css={css`
                        min-width: ${toREM(120)} !important;
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
                                position: 'top left',
                              }
                            : undefined
                        }
                        customInput={({ value, isOpen, onClick }) => (
                          <Clickable
                            disabled={!canEditTodosInMeeting.allowed}
                            clicked={() => onClick && onClick()}
                            css={css`
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Text
                              color={{
                                intent: props.todo.isOverdue
                                  ? 'warning'
                                  : 'default',
                              }}
                            >
                              {value}
                              <Icon
                                iconName={
                                  isOpen ? 'chevronUpIcon' : 'chevronDownIcon'
                                }
                                iconSize='lg'
                              />
                            </Text>
                          </Clickable>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {props.responsiveSize === 'SMALL' && (
                <div>
                  <Clickable
                    clicked={() => props.onEditTodoRequest(props.todo.id)}
                    css={css`
                      flex: 1;
                      margin: 0 ${({ theme }) => theme.sizes.spacing40} 0 0;
                      display: flex;
                      flex-direction: row;
                      align-items: center;
                      min-height: ${({ theme }) => theme.sizes.spacing32};
                    `}
                  >
                    <div>
                      <span
                        css={css`
                          text-align: left;
                          display: flex;
                          flex-direction: row;
                        `}
                      >
                        <TextEllipsis
                          lineLimit={2}
                          type='body'
                          wordBreak={true}
                          css={css`
                            text-align: left;
                            text-decoration: ${values && values.completed
                              ? 'line-through'
                              : 'none'};
                          `}
                        >
                          {props.todo.title}
                        </TextEllipsis>
                      </span>
                    </div>
                  </Clickable>
                </div>
              )}
            </div>
          )
        }}
      </EditForm>
    </>
  )
})
