import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { getDateDisplayUserLocale } from '@mm/core/date'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { PERSONAL_MEETING_VALUE, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  CheckCircleInput,
  DatePickerInput,
  Drawer,
  GridContainer,
  GridItem,
  Loading,
  NotesBox,
  SelectInputCategoriesSingleSelection,
  SelectInputSingleSelection,
  Text,
  TextInput,
  renderListOption,
  renderSelectedOptionSmallAvatar,
  shouldOptionBeIncludedInFilteredOptions,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { getRecordOfOverlazyDrawerIdToDrawerTitle } from '@mm/bloom-web/bloomProvider'
import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'
import { useComputed } from '@mm/bloom-web/pages/performance/mobx'
import {
  ContextAwareBanner,
  CustomDrawerHeaderContent,
} from '@mm/bloom-web/shared'

import {
  IEditTodoDrawerViewProps,
  IEditTodoValues,
} from './editTodoDrawerTypes'

const EDIT_TODO_DRAWER_ID = 'EditTodoDrawer'

export const EditTodoDrawerView = observer(function EditTodoDrawerView(
  props: IEditTodoDrawerViewProps
) {
  const { closeOverlazy } = useOverlazyController()

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()

  const currentUserPermissions = props.data().currentUserPermissions()
  const todoContext = props.data().todo.context
  const currentUserId = props.data().currentUser?.id

  const memoizedTodoFormValues = useComputed(
    () => {
      const todo = props.data().todo
      return {
        dueDate: todo.dueDate,
        completed: todo.completed,
        title: todo.title,
        ownerId: todo.assigneeId,
        meetingId: todo.meetingId,
        notesId: todo.notesId,
      }
    },
    { name: 'EditTodoDrawerView-memoizedTodoFormValues' }
  )
  const formValues = memoizedTodoFormValues()

  return (
    <EditForm
      isLoading={props.data().isLoading}
      values={formValues}
      disabled={!currentUserPermissions.canEditTodosInMeeting.allowed}
      disabledTooltip={
        !currentUserPermissions.canEditTodosInMeeting.allowed
          ? {
              msg: currentUserPermissions.canEditTodosInMeeting.message,
              position: 'top center',
            }
          : undefined
      }
      validation={
        {
          dueDate: formValidators.number({
            additionalRules: [required()],
          }),
          title: formValidators.string({
            additionalRules: [
              required(),
              maxLength({
                maxLength: MEETING_TITLES_CHAR_LIMIT,
                customErrorMsg: t(`Can't exceed {{maxLength}} characters`, {
                  maxLength: MEETING_TITLES_CHAR_LIMIT,
                }),
              }),
            ],
          }),
          ownerId: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          meetingId: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          notesId: formValidators.stringOrNumber({ additionalRules: [] }),
          completed: formValidators.boolean({ additionalRules: [] }),
        } satisfies GetParentFormValidation<IEditTodoValues>
      }
      onSubmit={props.actions().editTodo}
    >
      {({
        saveState,
        hasError,
        fieldNames,
        onResetForm,
        values,
        onFieldChange,
      }) => {
        return (
          <Drawer
            id={EDIT_TODO_DRAWER_ID}
            type='edit'
            showEmbeddedDrawer={
              props.data().drawerIsRenderedInMeeting &&
              props.data().drawerView === 'EMBEDDED'
            }
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                EDIT_TODO_DRAWER_ID
              ]
            }
            footerText={t('Archive')}
            saveState={saveState}
            saveAndCloseDisabled={
              hasError || !currentUserPermissions.canEditTodosInMeeting.allowed
            }
            saveDisabledTooltip={
              !currentUserPermissions.canEditTodosInMeeting.allowed
                ? {
                    msg: currentUserPermissions.canEditTodosInMeeting.message,
                    type: 'light',
                    position: 'top left',
                  }
                : undefined
            }
            footerTextDisabled={
              !currentUserPermissions.canEditTodosInMeeting.allowed
            }
            footerTextDisabledTooltip={
              !currentUserPermissions.canEditTodosInMeeting.allowed
                ? {
                    msg: currentUserPermissions.canEditTodosInMeeting.message,
                    type: 'light',
                    position: 'top left',
                  }
                : undefined
            }
            drawerHasUnsavedChanges={
              hasError || saveState === 'unsaved' || saveState == 'saving'
            }
            onHandleCloseDrawerWithUnsavedChangesProtection={
              props.actions().onHandleCloseDrawerWithUnsavedChangesProtection
            }
            footerActionTextClicked={props.actions().archiveTodo}
            onResetForm={onResetForm}
            closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
            customHeaderContent={({ drawerHeaderWidth }) =>
              props.data().hideContextAwareButtons ? null : (
                <CustomDrawerHeaderContent
                  drawerHeaderWidth={drawerHeaderWidth}
                  meetingId={props.data().meetingId}
                  context={{
                    title: props.data().todo.title,
                    type: 'To-do',
                    ownerId: props.data().todo.assigneeId,
                    ownerFullName: props.data().todo.assigneeFullName,
                    notesId: props.data().todo.notesId,
                  }}
                  renderContextIssueOptions={{
                    canCreateIssuesInMeeting: props
                      .data()
                      .currentUserPermissions().canCreateIssuesInMeeting,
                  }}
                  renderDrawerViewMenuOptions={
                    props.data().drawerIsRenderedInMeeting
                      ? {
                          drawerView: props.data().drawerView,
                          onHandleChangeDrawerViewSetting:
                            props.actions().onHandleChangeDrawerViewSetting,
                        }
                      : undefined
                  }
                />
              )
            }
            customSubHeaderContent={
              todoContext && todoContext.fromNodeTitle != null
                ? ({ isExpanded }) => (
                    <>
                      {props.data().todo.context && (
                        <ContextAwareBanner
                          fromNodeTitle={todoContext.fromNodeTitle}
                          fromNodeType={todoContext.fromNodeType}
                          customXPadding={
                            props.data().drawerIsRenderedInMeeting &&
                            props.data().drawerView === 'EMBEDDED' &&
                            !isExpanded
                              ? theme.sizes.spacing16
                              : undefined
                          }
                        />
                      )}
                    </>
                  )
                : undefined
            }
          >
            {({ isExpanded }: { isExpanded: boolean }) => {
              if (!values) {
                return <Loading size='small' />
              }
              return (
                <GridContainer columns={12} withoutMargin={true}>
                  <GridItem
                    m={12}
                    css={`
                      align-self: center;
                      padding-top: 0;
                    `}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <CheckCircleInput
                      id='completed'
                      name={fieldNames.completed}
                      text={
                        <Text color={{ intent: 'default' }} weight='semibold'>
                          {t('Complete')}
                        </Text>
                      }
                      tooltip={
                        !currentUserPermissions.canEditTodosInMeeting.allowed
                          ? {
                              msg: currentUserPermissions.canEditTodosInMeeting
                                .message,
                              type: 'light',
                              position: 'top left',
                            }
                          : undefined
                      }
                      size='default'
                      intent='default'
                      css={css`
                        font-weight: bold;
                        gap: ${(props) => props.theme.sizes.spacing8};
                      `}
                    />
                  </GridItem>
                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <DatePickerInput
                      id={'dueDate'}
                      name={fieldNames.dueDate}
                      formControl={{
                        label: t('Due Date'),
                      }}
                      showCaret={true}
                      width={isExpanded ? '100%' : toREM(200)}
                    />
                  </GridItem>

                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <TextInput
                      id={'title'}
                      name={fieldNames.title}
                      formControl={{
                        label: terms.todo.singular,
                        caption: t(`Date Created: {{dateDisplay}}`, {
                          dateDisplay: getDateDisplayUserLocale({
                            secondsSinceEpochUTC: props.data().todo.dateCreated,
                            userTimezone: props.data().currentUser?.timezone,
                          }),
                        }),
                      }}
                      placeholder={t('Type a title')}
                      width={'100%'}
                    />
                  </GridItem>
                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <SelectInputCategoriesSingleSelection
                      id={'ownerId'}
                      name={fieldNames.ownerId}
                      options={props.data().meetingAttendeesAndOrgUsersLookup()}
                      unknownItemText={t('Unknown owner')}
                      placeholder={t('Type or choose owner')}
                      formControl={{
                        label: t('Attach to owner'),
                      }}
                      width={'100%'}
                      renderListOption={renderListOption}
                      renderSelectedOption={renderSelectedOptionSmallAvatar}
                      shouldOptionBeIncludedInFilteredOptions={
                        shouldOptionBeIncludedInFilteredOptions
                      }
                      disableOptionOnSelect={false}
                      disabled={values.meetingId === PERSONAL_MEETING_VALUE}
                    />
                  </GridItem>
                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                  >
                    <SelectInputSingleSelection<Id>
                      id={'meetingId'}
                      name={fieldNames.meetingId}
                      options={props.data().meetingLookup}
                      unknownItemText={t('Unknown meeting')}
                      placeholder={t('Choose a meeting')}
                      formControl={{
                        label: t('Attach to meeting'),
                      }}
                      specialValue={PERSONAL_MEETING_VALUE}
                      width={'100%'}
                      onChange={(meetingId) => {
                        onFieldChange('meetingId', meetingId)
                        if (
                          meetingId === PERSONAL_MEETING_VALUE &&
                          currentUserId
                        ) {
                          onFieldChange('ownerId', currentUserId)
                        }
                      }}
                    />
                  </GridItem>
                  <GridItem
                    m={12}
                    withoutXPadding={true}
                    rowSpacing={theme.sizes.spacing24}
                    css={css`
                      padding-bottom: 0;
                    `}
                  >
                    <NotesBox
                      id={'notesId'}
                      name={fieldNames.notesId}
                      formControl={{
                        label: t('Details'),
                      }}
                      disabled={
                        !currentUserPermissions.canEditTodosInMeeting.allowed
                      }
                      text={props.data().todoNotesText}
                      tooltip={
                        !currentUserPermissions.canEditTodosInMeeting.allowed
                          ? {
                              msg: currentUserPermissions.canEditTodosInMeeting
                                .message,
                              position: 'top center',
                            }
                          : undefined
                      }
                      width={'100%'}
                      createNotes={props.actions().createNotes}
                    />
                  </GridItem>
                </GridContainer>
              )
            }}
          </Drawer>
        )
      }}
    </EditForm>
  )
})
