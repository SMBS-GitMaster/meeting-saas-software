import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
} from '@mm/core/forms'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  QuickAddTextInput,
  SelectQuickAddUserSelection,
  toREM,
} from '@mm/core-web/ui'

import { MEETING_TITLES_CHAR_LIMIT } from '../consts'
import { IWrapUpActionHandlers, IWrapUpViewData } from './wrapUpTypes'

export const WrapUpQuickTodoView = observer(
  (props: {
    getData: () => Pick<
      IWrapUpViewData,
      | 'getTodosData'
      | 'getCurrentUserPermissions'
      | 'currentUser'
      | 'getQuickAddMeetingAttendeesLookup'
    >
    getActions: () => Pick<IWrapUpActionHandlers, 'onQuickAddTodoEnter'>
  }) => {
    const { getData, getActions } = props

    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    return (
      <CreateForm
        disabled={
          !getData().getCurrentUserPermissions().canCreateTodosInMeeting.allowed
        }
        disabledTooltip={
          !getData().getCurrentUserPermissions().canCreateTodosInMeeting.allowed
            ? {
                msg: (
                  getData().getCurrentUserPermissions()
                    .canCreateTodosInMeeting as {
                    allowed: false
                    message: string
                  }
                ).message,
                type: 'light',
                position: 'top center',
              }
            : undefined
        }
        isLoading={false}
        values={
          {
            quickAddUser: getData().currentUser.id,
            quickAddTodoTitle: '',
          } as {
            quickAddUser: string
            quickAddTodoTitle: string
          }
        }
        validation={
          {
            quickAddUser: formValidators.stringOrNumber({}),
            quickAddTodoTitle: formValidators.string({
              additionalRules: [
                maxLength({
                  maxLength: MEETING_TITLES_CHAR_LIMIT,
                  customErrorMsg: t(`Can't exceed {{maxLength}} characters`, {
                    maxLength: MEETING_TITLES_CHAR_LIMIT,
                  }),
                }),
              ],
            }),
          } as GetParentFormValidation<{
            quickAddUser: string
            quickAddTodoTitle: string
          }>
        }
        onSubmit={async (values) => {
          getActions().onQuickAddTodoEnter({
            title: values.quickAddTodoTitle,
            assigneeId: values.quickAddUser,
          })
        }}
      >
        {({ fieldNames, onSubmit, hasError, onResetForm }) => {
          return (
            <>
              <SelectQuickAddUserSelection
                id='wrap-up-view-quick-add-user-selection'
                name={fieldNames.quickAddUser}
                placeholder={t('Select a user')}
                options={getData().getQuickAddMeetingAttendeesLookup()}
                disabled={
                  !getData().getCurrentUserPermissions().canCreateTodosInMeeting
                    .allowed
                }
                unknownItemText={t('Unknown owner')}
                tooltip={
                  !getData().getCurrentUserPermissions().canCreateTodosInMeeting
                    .allowed
                    ? {
                        msg: (
                          getData().getCurrentUserPermissions()
                            .canCreateTodosInMeeting as {
                            allowed: false
                            message: string
                          }
                        ).message,
                        type: 'light',
                        position: 'top center',
                      }
                    : undefined
                }
                error={undefined}
                width={toREM(56)}
              />
              <QuickAddTextInput
                enableValidationOnFocus
                disabled={
                  !getData().getCurrentUserPermissions().canCreateTodosInMeeting
                    .allowed
                }
                tooltip={
                  !getData().getCurrentUserPermissions().canCreateTodosInMeeting
                    .allowed
                    ? {
                        msg: (
                          getData().getCurrentUserPermissions()
                            .canCreateTodosInMeeting as {
                            allowed: false
                            message: string
                          }
                        ).message,
                        type: 'light',
                        position: 'top center',
                      }
                    : undefined
                }
                id='wrap-up-view-quick-add-input'
                placeholder={t(
                  'Did we make a decision that will affect others? Take a quick {{todo}} to let them know.',
                  {
                    todo: terms.todo.lowercaseSingular,
                  }
                )}
                name={fieldNames.quickAddTodoTitle}
                onEnter={() => {
                  if (hasError) return
                  onSubmit()
                  onResetForm()
                }}
                css={css`
                  flex: 1;
                  margin-left: ${(prop) => prop.theme.sizes.spacing8};
                `}
                instructions={
                  <>
                    {t('Press ')}
                    <strong>{t('enter ')}</strong>
                    {t('to add new {{todo}}', {
                      todo: terms.todo.lowercaseSingular,
                    })}
                  </>
                }
              />
            </>
          )
        }}
      </CreateForm>
    )
  }
)
