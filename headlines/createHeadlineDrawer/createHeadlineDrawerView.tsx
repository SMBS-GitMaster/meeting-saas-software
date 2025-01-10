import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Drawer,
  GridContainer,
  GridItem,
  Loading,
  NotesBox,
  SelectInputCategoriesSingleSelection,
  SelectInputMultipleSelection,
  TextInput,
  renderListOption,
  renderSelectedOptionSmallAvatar,
  shouldOptionBeIncludedInFilteredOptions,
  useTheme,
} from '@mm/core-web/ui'

import { getRecordOfOverlazyDrawerIdToDrawerTitle } from '@mm/bloom-web/bloomProvider'
import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'
import { CustomDrawerHeaderContent } from '@mm/bloom-web/shared'

import {
  ICreateHeadlineDrawerViewProps,
  ICreateHeadlineFormValues,
} from './createHeadlineDrawerTypes'

const CREATE_HEADLINE_DRAWER_ID = 'CreateHeadlineDrawer'

export default observer(function CreateHeadlineDrawerView(
  props: ICreateHeadlineDrawerViewProps
) {
  const {
    isLoading,
    currentMeetingsLookup,
    meetingAttendeesAndOrgUsersLookup,
    meetingId,
    currentUserId,
    drawerView,
    drawerIsRenderedInMeeting,
  } = props.data
  const {
    onSubmit,
    onCreateNotes,
    onHandleChangeDrawerViewSetting,
    onHandleCloseDrawerWithUnsavedChangesProtection,
  } = props.actionHandlers

  const canCreateHeadlines =
    props.data.currentUserPermissions.canCreateHeadlines

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const theme = useTheme()

  const initialDefaultFormValues: ICreateHeadlineFormValues = {
    createHeadlineTitle: '',
    createHeadlineAttachToOwner: currentUserId ? currentUserId : '',
    createHeadlineAttachToMeetings: meetingId ? [meetingId] : [],
    createHeadlineNotes: '',
    createAnotherCheckedInDrawer: false,
  }

  const onTitleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <CreateForm
      isLoading={isLoading}
      disabled={!canCreateHeadlines}
      disabledTooltip={
        !canCreateHeadlines.allowed
          ? {
              msg: canCreateHeadlines.message,
              position: 'top center',
            }
          : undefined
      }
      values={initialDefaultFormValues}
      validation={
        {
          createHeadlineTitle: formValidators.string({
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
          createHeadlineAttachToOwner: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          createHeadlineAttachToMeetings: formValidators.array({
            additionalRules: [required()],
          }),
          createHeadlineNotes: formValidators.stringOrNumber({}),
          createAnotherCheckedInDrawer: formValidators.boolean({
            additionalRules: [],
          }),
        } satisfies GetParentFormValidation<ICreateHeadlineFormValues>
      }
      onSubmit={async (values) => onSubmit(values)}
    >
      {({ onSubmit, hasError, fieldNames, onResetForm, values }) => {
        return (
          <Drawer
            id={CREATE_HEADLINE_DRAWER_ID}
            type='create'
            showEmbeddedDrawer={
              drawerIsRenderedInMeeting && drawerView === 'EMBEDDED'
            }
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                CREATE_HEADLINE_DRAWER_ID
              ]
            }
            footerText={t('Create another {{headline}}', {
              headline: terms.headline.lowercaseSingular,
            })}
            saveDisabled={hasError || !canCreateHeadlines.allowed}
            saveDisabledTooltip={
              !canCreateHeadlines.allowed
                ? {
                    msg: canCreateHeadlines.message,
                    type: 'light',
                    position: 'top left',
                  }
                : undefined
            }
            onSaveClicked={onSubmit}
            drawerHasUnsavedChanges
            onHandleCloseDrawerWithUnsavedChangesProtection={
              onHandleCloseDrawerWithUnsavedChangesProtection
            }
            onResetForm={onResetForm}
            closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
            staticBackdrop
            customHeaderContent={({ drawerHeaderWidth }) => {
              return (
                <CustomDrawerHeaderContent
                  drawerHeaderWidth={drawerHeaderWidth}
                  meetingId={meetingId}
                  renderDrawerViewMenuOptions={
                    drawerIsRenderedInMeeting
                      ? {
                          drawerView,
                          onHandleChangeDrawerViewSetting,
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
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: 0;
                      `}
                    >
                      <TextInput
                        name={fieldNames.createHeadlineTitle}
                        id={'createHeadlineTitleId'}
                        formControl={{
                          label: terms.headline.singular,
                        }}
                        width={'100%'}
                        placeholder={t('Type a title')}
                        onKeyDown={onTitleKeyDown}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <SelectInputCategoriesSingleSelection
                        id={'createHeadlineAttachToOwnerId'}
                        name={fieldNames.createHeadlineAttachToOwner}
                        placeholder={t('Type or choose owner')}
                        options={meetingAttendeesAndOrgUsersLookup}
                        unknownItemText={t('Unknown owner')}
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
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <SelectInputMultipleSelection<Id>
                        id={'createHeadlineAttachToMeetingsId'}
                        name={fieldNames.createHeadlineAttachToMeetings}
                        placeholder={t('Choose a meeting')}
                        unknownItemText={t('Unknown meeting')}
                        options={currentMeetingsLookup}
                        formControl={{
                          label: t('Attach to meeting(s)'),
                        }}
                        width={'100%'}
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
                        id={'createHeadlineNotesId'}
                        name={fieldNames.createHeadlineNotes}
                        formControl={{
                          label: t('Details'),
                        }}
                        disabled={!canCreateHeadlines.allowed}
                        text={''}
                        tooltip={
                          !canCreateHeadlines.allowed
                            ? {
                                msg: canCreateHeadlines.message,
                                position: 'top center',
                              }
                            : undefined
                        }
                        width={'100%'}
                        createNotes={onCreateNotes}
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
