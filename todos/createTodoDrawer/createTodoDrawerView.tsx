import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { addOrRemoveDays, useTimeController } from '@mm/core/date'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { PERSONAL_MEETING_VALUE, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  DatePickerInput,
  Drawer,
  GridContainer,
  GridItem,
  Loading,
  NotesBox,
  SelectInputSingleSelection,
  SelectUserInputMultipleSelection,
  TextInput,
  useTheme,
} from '@mm/core-web/ui'

import { getRecordOfOverlazyDrawerIdToDrawerTitle } from '@mm/bloom-web/bloomProvider'
import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'
import {
  ContextAwareBanner,
  CustomDrawerHeaderContent,
  isContextAwareMeetingItem,
} from '@mm/bloom-web/shared'

import {
  ICreateTodoDrawerViewProps,
  ICreateTodoValues,
} from './createTodoDrawerTypes'

const CREATE_TODO_DRAWER_ID = 'CreateTodoDrawer'

export const CreateTodoDrawerView = observer(function CreateTodoDrawerView(
  props: ICreateTodoDrawerViewProps
) {
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const { closeOverlazy } = useOverlazyController()

  const { getSecondsSinceEpochUTC } = useTimeController()
  const { t } = useTranslation()

  const canCreateTodos = props.data.currentUserPermissions.canCreateTodos
  const hasContextAware = !!(
    props.data.context && props.data.context.title !== ''
  )

  const ownerIds = useMemo(() => {
    if (
      isContextAwareMeetingItem(props.data.context) &&
      props.data.context?.ownerId
    ) {
      return [props.data.context.ownerId]
    } else if (props.data.currentUser?.id) {
      return [props.data.currentUser.id]
    } else {
      return []
    }
  }, [props])

  return (
    <CreateForm
      isLoading={props.data.isLoading}
      disabled={!canCreateTodos.allowed}
      disabledTooltip={
        !canCreateTodos.allowed
          ? {
              msg: canCreateTodos.message,
              position: 'top center',
            }
          : undefined
      }
      values={
        {
          dueDate: addOrRemoveDays({
            secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
            days: 7,
          }),
          title: '',
          ownerIds: ownerIds,
          meetingId: props.data.meetingId ?? PERSONAL_MEETING_VALUE,
          notesId: '' as Id,
          createAnotherCheckedInDrawer: false,
        } as ICreateTodoValues
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
          ownerIds: formValidators.array({
            additionalRules: [required()],
          }),
          meetingId: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          notesId: formValidators.stringOrNumber({ additionalRules: [] }),
          createAnotherCheckedInDrawer: formValidators.boolean({
            additionalRules: [],
          }),
        } satisfies GetParentFormValidation<ICreateTodoValues>
      }
      onSubmit={props.actions.createTodo}
    >
      {({
        fieldNames,
        hasError,
        values,
        onSubmit,
        onResetForm,
        onFieldChange,
      }) => {
        return (
          <Drawer
            id={CREATE_TODO_DRAWER_ID}
            type='create'
            showEmbeddedDrawer={
              props.data.drawerIsRenderedInMeeting &&
              props.data.drawerView === 'EMBEDDED'
            }
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                CREATE_TODO_DRAWER_ID
              ]
            }
            footerText={t('Create another {{todo}}', {
              todo: terms.todo.lowercaseSingular,
            })}
            saveDisabled={hasError || !canCreateTodos.allowed}
            saveDisabledTooltip={
              !canCreateTodos.allowed
                ? {
                    msg: canCreateTodos.message,
                    type: 'light',
                    position: 'top left',
                  }
                : undefined
            }
            drawerHasUnsavedChanges
            onHandleCloseDrawerWithUnsavedChangesProtection={
              props.actions.onHandleCloseDrawerWithUnsavedChangesProtection
            }
            onSaveClicked={onSubmit}
            onResetForm={onResetForm}
            staticBackdrop
            closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
            customSubHeaderContent={
              hasContextAware
                ? ({ isExpanded }) => (
                    <>
                      {props.data.context &&
                        props.data.context.title !== '' && (
                          <ContextAwareBanner
                            fromNodeTitle={props.data.context.title}
                            fromNodeType={props.data.context.type}
                            customXPadding={
                              props.data.drawerIsRenderedInMeeting &&
                              props.data.drawerView === 'EMBEDDED' &&
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
            customHeaderContent={({ drawerHeaderWidth }) => {
              return (
                <CustomDrawerHeaderContent
                  drawerHeaderWidth={drawerHeaderWidth}
                  meetingId={props.data.meetingId}
                  renderDrawerViewMenuOptions={
                    props.data.drawerIsRenderedInMeeting
                      ? {
                          drawerView: props.data.drawerView,
                          onHandleChangeDrawerViewSetting:
                            props.actions.onHandleChangeDrawerViewSetting,
                        }
                      : undefined
                  }
                />
              )
            }}
          >
            {({ isExpanded }) => {
              if (!values) {
                return <Loading size='small' />
              } else {
                return (
                  <GridContainer
                    columns={12}
                    withoutMargin={isExpanded ? false : true}
                  >
                    <GridItem
                      m={5}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: 0;
                      `}
                    >
                      <DatePickerInput
                        id={'dueDate'}
                        name={fieldNames.dueDate}
                        formControl={{
                          label: t('Due Date'),
                        }}
                        showCaret={true}
                        width={'100%'}
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
                      <SelectUserInputMultipleSelection
                        id={'ownerIds'}
                        name={fieldNames.ownerIds}
                        options={props.data.meetingAttendeesOrOrgUsersLookup}
                        placeholder={t('Type or choose owner')}
                        unknownItemText={t('Unknown owner')}
                        formControl={{
                          label: t('Attach to owner(s)'),
                        }}
                        disabled={values.meetingId === PERSONAL_MEETING_VALUE}
                        width={'100%'}
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
                        options={props.data.meetingLookup}
                        placeholder={t('Choose a meeting')}
                        unknownItemText={t('Unknown meeting')}
                        formControl={{
                          label: t('Attach to meeting'),
                        }}
                        disabled={hasContextAware}
                        tooltip={
                          hasContextAware
                            ? {
                                position: 'top center',
                                msg: t(
                                  'Context-aware {{todos}} can only be made for the current meeting.',
                                  { todos: terms.todo.lowercasePlural }
                                ),
                              }
                            : undefined
                        }
                        specialValue={PERSONAL_MEETING_VALUE}
                        width={'100%'}
                        onChange={(meetingId) => {
                          onFieldChange('meetingId', meetingId)
                          if (meetingId === PERSONAL_MEETING_VALUE) {
                            props.actions.setSelectedMeetingId(null)
                            if (props.data.currentUser?.id) {
                              onFieldChange('ownerIds', [
                                props.data.currentUser.id,
                              ])
                            }
                          } else {
                            props.actions.setSelectedMeetingId(meetingId)
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
                        disabled={!canCreateTodos.allowed}
                        value={
                          props.data.contextAwareNoteId
                            ? props.data.contextAwareNoteId
                            : ''
                        }
                        tooltip={
                          !canCreateTodos.allowed
                            ? {
                                msg: canCreateTodos.message,
                                position: 'top center',
                              }
                            : undefined
                        }
                        width={'100%'}
                        createNotes={props.actions.createNotes}
                      />
                    </GridItem>
                  </GridContainer>
                )
              }
            }}
          </Drawer>
        )
      }}
    </CreateForm>
  )
})
