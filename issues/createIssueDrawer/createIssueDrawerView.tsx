import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
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
import {
  ContextAwareBanner,
  CustomDrawerHeaderContent,
  isContextAwareMeetingItem,
} from '@mm/bloom-web/shared'

import {
  ICreateIssueDrawerViewProps,
  ICreateIssueValues,
} from './createIssueDrawerTypes'

const CREATE_ISSUE_DRAWER_ID = 'CreateIssueDrawer'

export const CreateIssueDrawerView = observer(function CreateIssueDrawerView(
  props: ICreateIssueDrawerViewProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const theme = useTheme()
  const canCreateIssues = props.data.currentUserPermissions.canCreateIssues
  const hasContextAware = !!(
    props.data.context && props.data.context.title != null
  )

  const ownerId = useMemo(() => {
    if (
      isContextAwareMeetingItem(props.data.context) &&
      props.data.context?.ownerId
    ) {
      return props.data.context.ownerId
    } else if (props.data.currentUser?.id) {
      return props.data.currentUser.id
    } else {
      return ''
    }
  }, [props])

  return (
    <CreateForm
      isLoading={props.data.isLoading}
      disabled={!canCreateIssues.allowed}
      disabledTooltip={
        !canCreateIssues.allowed
          ? {
              msg: canCreateIssues.message,
              type: 'light',
              position: 'top center',
            }
          : undefined
      }
      values={
        {
          title: props.data.initialItemValues?.title ?? '',
          ownerId: props.data.initialItemValues?.ownerId ?? ownerId,
          meetingId:
            props.data.initialItemValues?.meetingId ??
            props.data.meetingId ??
            null,
          addToDepartmentPlan:
            props.data.initialItemValues?.addToDepartmentPlan ?? false,
          notesId: '' as Id,
          createAnotherCheckedInDrawer:
            props.data.initialItemValues?.createAnotherCheckedInDrawer ?? false,
        } as ICreateIssueValues
      }
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
        } satisfies GetParentFormValidation<ICreateIssueValues>
      }
      onSubmit={props.actions.createIssue}
    >
      {({ hasError, fieldNames, onSubmit, onResetForm, values }) => {
        return (
          <Drawer
            id={CREATE_ISSUE_DRAWER_ID}
            type='create'
            showEmbeddedDrawer={
              props.data.drawerIsRenderedInMeeting &&
              props.data.drawerView === 'EMBEDDED'
            }
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                CREATE_ISSUE_DRAWER_ID
              ]
            }
            footerText={t('Create another {{issue}}', {
              issue: terms.issue.lowercaseSingular,
            })}
            saveDisabled={hasError || !canCreateIssues.allowed}
            saveDisabledTooltip={
              !canCreateIssues.allowed
                ? {
                    msg: canCreateIssues.message,
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
                      {props.data.context && (
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
                    css={css`
                      overflow: visible;
                    `}
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
                        placeholder={t('Type or choose owner')}
                        unknownItemText={t('Unknown owner')}
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
                        placeholder={t('Attach to meeting')}
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
                                  'Context-aware {{issues}} can only be made for the current meeting.',
                                  { issues: terms.issue.lowercasePlural }
                                ),
                              }
                            : undefined
                        }
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
                        id='addToDepartmentPlan'
                        name={fieldNames.addToDepartmentPlan}
                        text={terms.longTermIssue.singular}
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
                        disabled={!canCreateIssues.allowed}
                        value={
                          props.data.contextAwareNoteId
                            ? props.data.contextAwareNoteId
                            : ''
                        }
                        tooltip={
                          !canCreateIssues.allowed
                            ? {
                                msg: canCreateIssues.message,
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
