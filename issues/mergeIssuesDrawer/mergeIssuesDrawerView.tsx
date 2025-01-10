import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

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
  CheckBoxInput,
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
  ICreateMergedIssueValues,
  IIssueToMerge,
  IMergeIssuesDrawerViewProps,
} from './mergeIssuesDrawerTypes'

const MERGE_ISSUES_DRAWER_ID = 'MergeIssuesDrawer'

export const MergeIssuesDrawerView = observer(function MergeIssuesDrawerView(
  props: IMergeIssuesDrawerViewProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()
  const { closeOverlazy } = useOverlazyController()

  const primaryIssue: IIssueToMerge =
    props.data.issues.length === 2
      ? {
          ...props.data.issues[0],
          notesId: props.data.newMergedIssueNoteId,
        }
      : {
          id: '',
          title: '',
          assignee: { id: '' },
          meeting: { id: '' },
          addToDepartmentPlan: false,
          notesId: props.data.newMergedIssueNoteId,
        }

  return (
    <CreateForm
      isLoading={props.data.isLoading}
      values={{
        title: primaryIssue.title,
        ownerId: primaryIssue.assignee.id,
        meetingId: primaryIssue.meeting.id,
        addToDepartmentPlan: primaryIssue.addToDepartmentPlan,
        createAnotherCheckedInDrawer: false,
        notesId: primaryIssue.notesId,
      }}
      validation={
        {
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
          addToDepartmentPlan: formValidators.boolean({
            additionalRules: [],
          }),
          notesId: formValidators.stringOrNumber({ additionalRules: [] }),
          createAnotherCheckedInDrawer: formValidators.boolean({
            additionalRules: [],
          }),
        } satisfies GetParentFormValidation<ICreateMergedIssueValues>
      }
      disabled={
        !props.data.currentUserPermissions.canCreateIssuesInMeeting.allowed
      }
      disabledTooltip={
        !props.data.currentUserPermissions.canCreateIssuesInMeeting.allowed
          ? {
              msg: props.data.currentUserPermissions.canCreateIssuesInMeeting
                .message,
              type: 'light',
              position: 'top center',
            }
          : undefined
      }
      onSubmit={props.actions.createIssue}
    >
      {({ values, fieldNames, hasError, onSubmit, onResetForm }) => {
        return (
          <Drawer
            id={MERGE_ISSUES_DRAWER_ID}
            showEmbeddedDrawer={
              props.data.drawerIsRenderedInMeeting &&
              props.data.drawerView === 'EMBEDDED'
            }
            type='create'
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                MERGE_ISSUES_DRAWER_ID
              ]
            }
            footerText={t('')}
            disableCreateAnother={true}
            saveDisabled={
              hasError ||
              !props.data.currentUserPermissions.canCreateIssuesInMeeting
                .allowed
            }
            saveDisabledTooltip={
              !props.data.currentUserPermissions.canCreateIssuesInMeeting
                .allowed
                ? {
                    msg: props.data.currentUserPermissions
                      .canCreateIssuesInMeeting.message,
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
            closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
            staticBackdrop
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
                return <Loading />
              } else {
                return (
                  <GridContainer
                    columns={12}
                    withoutMargin={isExpanded ? false : true}
                    css={css`
                      overflow: visible;
                    `}
                  >
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding: 0;
                      `}
                    >
                      <TextInput
                        id={'title'}
                        name={fieldNames.title}
                        formControl={{
                          label: terms.issue.singular,
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
                        options={props.data.meetingAttendeesAndOrgUsersLookup}
                        unknownItemText={t('Unknown owner')}
                        placeholder={t('Type or choose owner')}
                        formControl={{
                          label: t('Owner'),
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
                      css={css`
                        padding-bottom: 0;
                      `}
                    >
                      <SelectInputSingleSelection
                        id={'meetingId'}
                        name={fieldNames.meetingId}
                        options={props.data.meetingLookup}
                        unknownItemText={t('Unknown meeting')}
                        placeholder={t('Attach to meeting')}
                        formControl={{
                          label: t('Attach to meeting'),
                        }}
                        width={'100%'}
                        disableOptionOnSelect={false}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: ${theme.sizes.spacing4};
                      `}
                    >
                      <CheckBoxInput
                        css={css`
                          padding-top: ${(props) => props.theme.sizes.spacing8};
                        `}
                        id='addToDepartmentPlan'
                        name={fieldNames.addToDepartmentPlan}
                        text={terms.longTermIssue.singular}
                        iconSize={'lg'}
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
                        name={'notesId'}
                        value={props.data.newMergedIssueNoteId}
                        formControl={{
                          label: t('Details'),
                        }}
                        disabled={
                          !props.data.currentUserPermissions
                            .canCreateIssuesInMeeting.allowed
                        }
                        tooltip={
                          !props.data.currentUserPermissions
                            .canCreateIssuesInMeeting.allowed
                            ? {
                                msg: props.data.currentUserPermissions
                                  .canCreateIssuesInMeeting.message,
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
