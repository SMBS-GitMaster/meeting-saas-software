import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import {
  EditForm,
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
  SelectInputSingleSelection,
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
  IEditHeadlineDrawerViewProps,
  IEditHeadlineFormValues,
} from './editHeadlineDrawerTypes'

const EDIT_HEADLINE_DRAWER_ID = 'EditHeadlineDrawer'

export default observer(function EditHeadlineDrawerView(
  props: IEditHeadlineDrawerViewProps
) {
  const {
    isLoading,
    headline,
    currentMeetingsLookup,
    meetingAttendeesAndOrgUsersLookup,
    drawerView,
    drawerIsRenderedInMeeting,
    headlineIdFromProps,
  } = props.data
  const {
    onSubmit,
    onCreateNotes,
    onArchiveHeadline,
    onHandleChangeDrawerViewSetting,
    onHandleCloseDrawerWithUnsavedChangesProtection,
  } = props.actionHandlers

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const theme = useTheme()

  const {
    canEditHeadlinesInMeeting,
    canCreateIssuesInMeeting,
    canCreateTodosInMeeting,
  } = props.data.currentUserPermissions

  const memoizedHeadlineFormValues = useMemo(() => {
    return {
      editHeadlineTitle: headline.title,
      editHeadlineAttachToOwner: headline.assignee.id,
      editHeadlineAttachToMeeting: headline.meeting.id,
      editHeadlineNotes: headline.notesId,
    }
  }, [
    headline.title,
    headline.assignee.id,
    headline.meeting.id,
    headline.notesId,
  ])

  const onTitleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <EditForm
      key={`${EDIT_HEADLINE_DRAWER_ID}_${headlineIdFromProps}`}
      isLoading={isLoading}
      disabled={!canEditHeadlinesInMeeting.allowed}
      disabledTooltip={
        !canEditHeadlinesInMeeting.allowed
          ? {
              msg: canEditHeadlinesInMeeting.message,
              position: 'top center',
            }
          : undefined
      }
      values={memoizedHeadlineFormValues}
      validation={
        {
          editHeadlineTitle: formValidators.string({
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
          editHeadlineAttachToOwner: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          editHeadlineAttachToMeeting: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          editHeadlineNotes: formValidators.stringOrNumber({
            additionalRules: [],
          }),
        } satisfies GetParentFormValidation<IEditHeadlineFormValues>
      }
      onSubmit={onSubmit}
    >
      {({ saveState, hasError, onResetForm, values, fieldNames }) => (
        <Drawer
          id={EDIT_HEADLINE_DRAWER_ID}
          type='edit'
          showEmbeddedDrawer={
            drawerIsRenderedInMeeting && drawerView === 'EMBEDDED'
          }
          headerText={
            getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
              EDIT_HEADLINE_DRAWER_ID
            ]
          }
          footerText={t('Archive')}
          saveState={saveState}
          saveAndCloseDisabled={hasError || !canEditHeadlinesInMeeting.allowed}
          saveDisabledTooltip={
            !canEditHeadlinesInMeeting.allowed
              ? {
                  msg: canEditHeadlinesInMeeting.message,
                  type: 'light',
                  position: 'top left',
                }
              : undefined
          }
          footerTextDisabled={true}
          footerTextDisabledTooltip={{
            msg: t('Coming soon'),
          }}
          footerActionTextClicked={onArchiveHeadline}
          drawerHasUnsavedChanges={
            hasError || saveState === 'unsaved' || saveState == 'saving'
          }
          onHandleCloseDrawerWithUnsavedChangesProtection={
            onHandleCloseDrawerWithUnsavedChangesProtection
          }
          onResetForm={onResetForm}
          closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
          customHeaderContent={({ drawerHeaderWidth }) => (
            <CustomDrawerHeaderContent
              drawerHeaderWidth={drawerHeaderWidth}
              meetingId={props.data.meetingId}
              context={{
                type: 'Headline',
                title: headline.title,
                notesId: headline.notesId,
                ownerId: headline.assignee.id,
                ownerFullName: headline.assignee.fullName,
              }}
              renderContextIssueOptions={{ canCreateIssuesInMeeting }}
              renderContextTodoOptions={{ canCreateTodosInMeeting }}
              renderDrawerViewMenuOptions={
                drawerIsRenderedInMeeting
                  ? {
                      drawerView,
                      onHandleChangeDrawerViewSetting,
                    }
                  : undefined
              }
            />
          )}
        >
          {() =>
            !values ? (
              <Loading size='small' />
            ) : (
              <GridContainer columns={12} withoutMargin={true}>
                <GridItem
                  m={12}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing24}
                  css={css`
                    padding-top: 0;
                  `}
                >
                  <TextInput
                    name={fieldNames.editHeadlineTitle}
                    id={'editHeadlineTitleId'}
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
                    id={'editHeadlineAttachToOwnerId'}
                    name={fieldNames.editHeadlineAttachToOwner}
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
                  <SelectInputSingleSelection
                    id={'editHeadlineAttachToMeeting'}
                    name={fieldNames.editHeadlineAttachToMeeting}
                    options={currentMeetingsLookup}
                    unknownItemText={t('Unknown owner')}
                    placeholder={t('Choose a meeting')}
                    formControl={{
                      label: t('Attach to meeting'),
                    }}
                    disabled={true}
                    tooltip={{
                      msg: t(
                        '{{headline}} can be moved to another meeting via copying',
                        {
                          headline: terms.headline.singular,
                        }
                      ),
                      position: 'top center',
                    }}
                    css={css`
                      .selectInput__iconWrapper {
                        top: 0;
                      }
                    `}
                    width={'100%'}
                    disableOptionOnSelect={false}
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
                    key={values.editHeadlineNotes}
                    id={'editHeadlineNotesId'}
                    name={fieldNames.editHeadlineNotes}
                    formControl={{
                      label: t('Details'),
                    }}
                    disabled={!canEditHeadlinesInMeeting.allowed}
                    text={props.data.headlineNotesText}
                    tooltip={
                      !canEditHeadlinesInMeeting.allowed
                        ? {
                            msg: canEditHeadlinesInMeeting.message,
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
        </Drawer>
      )}
    </EditForm>
  )
})
