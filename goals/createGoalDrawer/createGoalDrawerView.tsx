import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import styled, { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  getDateDisplayUserLocale,
  getEndOfQuarterSecondsSinceEpochUTC,
  useTimeController,
} from '@mm/core/date'
import {
  CreateForm,
  FormFieldArray,
  GetParentFormValidation,
  formFieldArrayValidators,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { PERSONAL_MEETING_VALUE, useBloomCustomTerms } from '@mm/core-bloom'

import { IGoalMilestone } from '@mm/core-bloom/goals'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  ColoredSelectInput,
  DatePickerInput,
  Drawer,
  GridContainer,
  GridItem,
  Loading,
  NotesBox,
  SelectInputCategoriesSingleSelection,
  SelectInputMultipleSelection,
  Text,
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

import { GoalsDrawerDepartmentPlanView } from '../goalsDrawerDepartmentPlanView'
import { GoalsDrawerMilestoneEntry } from '../goalsDrawerMilestoneEntry'
import {
  ICreateGoalDrawerViewProps,
  ICreateGoalFormValues,
} from './createGoalDrawerTypes'

const CREATE_GOAL_DRAWER_ID = 'CreateGoalDrawer'

export default observer(function CreateGoalDrawerlView(
  props: ICreateGoalDrawerViewProps
) {
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const { closeOverlazy } = useOverlazyController()

  const { getSecondsSinceEpochUTC } = useTimeController()
  const { t } = useTranslation()

  const lastMilestoneRef = useRef<HTMLDivElement>(null)
  const [activeMilestoneLengthState, setActiveMilestoneLengthState] =
    React.useState<number>()

  useEffect(() => {
    if (lastMilestoneRef.current) {
      lastMilestoneRef.current.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }, [activeMilestoneLengthState])

  const {
    isLoading,
    currentMeetingsLookup,
    meetingAttendeesAndOrgUsersLookup,
    goalStatusLookup,
    meetingId,
    currentUserId,
    currentUserPermissions: { canCreateGoalsInMeeting },
    drawerIsRenderedInMeeting,
    drawerView,
    initialItemValues,
  } = props.data
  const {
    onSubmit,
    onCreateNotes,
    onHandleChangeDrawerViewSetting,
    onHandleCloseDrawerWithUnsavedChangesProtection,
  } = props.actionHandlers

  return (
    <CreateForm
      isLoading={isLoading}
      disabled={!canCreateGoalsInMeeting.allowed}
      disabledTooltip={
        !canCreateGoalsInMeeting.allowed
          ? {
              msg: canCreateGoalsInMeeting.message,
              type: 'light',
              position: 'top center',
            }
          : undefined
      }
      values={
        {
          createGoalDueDate:
            initialItemValues?.createGoalDueDate ??
            getEndOfQuarterSecondsSinceEpochUTC(),
          createGoalStatus: initialItemValues?.createGoalStatus ?? 'ON_TRACK',
          createGoalTitle: initialItemValues?.createGoalTitle ?? '',
          createGoalAttachToOwner:
            initialItemValues?.createGoalAttachToOwner ?? currentUserId ?? '',
          createGoalAttachToMeetings:
            initialItemValues?.createGoalAttachToMeetings
              ? [initialItemValues.createGoalAttachToMeetings]
              : meetingId
                ? [meetingId]
                : meetingId === undefined
                  ? []
                  : [PERSONAL_MEETING_VALUE],
          addToDepartmentPlans: initialItemValues?.addToDepartmentPlans
            ? initialItemValues?.addToDepartmentPlans
            : meetingId
              ? [{ id: meetingId, addToDepartmentPlan: false }]
              : [],
          createGoalNotesId: '',
          createGoalMilestones: initialItemValues?.createGoalMilestones ?? [],
          createAnotherCheckedInDrawer:
            initialItemValues?.createAnotherCheckedInDrawer ?? false,
        } as ICreateGoalFormValues
      }
      validation={
        {
          createGoalDueDate: formValidators.number({
            additionalRules: [required()],
          }),
          createGoalStatus: formValidators.string({
            additionalRules: [required()],
          }),
          createGoalTitle: formValidators.string({
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
          createGoalAttachToOwner: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          createGoalAttachToMeetings: formValidators.array({
            additionalRules: [required()],
          }),
          addToDepartmentPlans: formValidators.array({
            additionalRules: [],
          }),
          createGoalNotesId: formValidators.stringOrNumber({
            additionalRules: [],
          }),
          createGoalMilestones: formValidators.array({ additionalRules: [] }),
          createAnotherCheckedInDrawer: formValidators.boolean({
            additionalRules: [],
          }),
        } satisfies GetParentFormValidation<ICreateGoalFormValues>
      }
      onSubmit={onSubmit}
    >
      {({
        onSubmit,
        fieldNames,
        hasError,
        values,
        onFieldChange,
        onResetForm,
      }) => {
        return (
          <Drawer
            id={CREATE_GOAL_DRAWER_ID}
            type='create'
            showEmbeddedDrawer={
              drawerIsRenderedInMeeting && drawerView === 'EMBEDDED'
            }
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                CREATE_GOAL_DRAWER_ID
              ]
            }
            footerText={t('Create another {{goal}}', {
              goal: terms.goal.lowercaseSingular,
            })}
            saveDisabled={hasError || !canCreateGoalsInMeeting.allowed}
            saveDisabledTooltip={
              !canCreateGoalsInMeeting.allowed
                ? {
                    msg: canCreateGoalsInMeeting.message,
                    type: 'light',
                    position: 'top left',
                  }
                : undefined
            }
            closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
            drawerHasUnsavedChanges
            onHandleCloseDrawerWithUnsavedChangesProtection={
              onHandleCloseDrawerWithUnsavedChangesProtection
            }
            onSaveClicked={onSubmit}
            onResetForm={onResetForm}
            staticBackdrop
            customHeaderContent={({ drawerHeaderWidth }) => {
              return (
                <CustomDrawerHeaderContent
                  drawerHeaderWidth={drawerHeaderWidth}
                  meetingId={meetingId || null}
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
            {() => {
              if (!values) {
                return <Loading size='small' />
              } else {
                return (
                  <GridContainer columns={12} withoutMargin={true}>
                    <GridItem
                      m={6}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: 0;
                        padding-right: ${theme.sizes.spacing16};
                      `}
                    >
                      <DatePickerInput
                        id={'createGoalDueDateId'}
                        name={fieldNames.createGoalDueDate}
                        formControl={{
                          label: t('Due Date'),
                        }}
                        showCaret={true}
                        width={'100%'}
                      />
                    </GridItem>
                    <GridItem
                      m={6}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: 0;
                      `}
                    >
                      <ColoredSelectInput
                        id={'createGoalStatusId'}
                        name={fieldNames.createGoalStatus}
                        options={goalStatusLookup}
                        unknownItemText={t('Unknown status')}
                        formControl={{
                          label: t('Status'),
                        }}
                        width={'100%'}
                        disableOptionOnSelect={false}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <TextInput
                        name={fieldNames.createGoalTitle}
                        id={'createGoalTitleId'}
                        formControl={{
                          label: t('Title'),
                          caption: t(
                            `Date Created: ${getDateDisplayUserLocale({
                              secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
                              userTimezone: 'utc',
                            })}`
                          ),
                        }}
                        width={'100%'}
                        placeholder={t('Type a title')}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <SelectInputCategoriesSingleSelection
                        id={'createGoalAttachToOwner'}
                        unknownItemText={t('Unknown owner')}
                        name={fieldNames.createGoalAttachToOwner}
                        placeholder={t('Type or choose owner')}
                        options={meetingAttendeesAndOrgUsersLookup}
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
                      css={css`
                        padding-bottom: 0;
                      `}
                    >
                      <SelectInputMultipleSelection<Id>
                        id={'createGoalAttachToMeetings'}
                        name={fieldNames.createGoalAttachToMeetings}
                        placeholder={t('Choose a meeting')}
                        unknownItemText={t('Unknown meeting')}
                        options={currentMeetingsLookup}
                        formControl={{
                          label: t('Attach to meeting(s)'),
                        }}
                        specialValue={PERSONAL_MEETING_VALUE}
                        width={'100%'}
                        disabled={values.createGoalAttachToMeetings.includes(
                          PERSONAL_MEETING_VALUE
                        )}
                        onChange={(meetingIds) => {
                          const createGoalDepartmentPlanValues = meetingIds.map(
                            (meetingId) => {
                              return {
                                id: meetingId,
                                addToDepartmentPlan: false,
                              }
                            }
                          )

                          onFieldChange(
                            fieldNames.createGoalAttachToMeetings,
                            meetingIds as Array<string>
                          )
                          onFieldChange(
                            fieldNames.addToDepartmentPlans,
                            createGoalDepartmentPlanValues
                          )
                        }}
                      />
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: ${(props) => props.theme.sizes.spacing4};
                      `}
                    >
                      <FormFieldArray<{
                        parentFormValues: ICreateGoalFormValues
                        arrayFieldName: typeof fieldNames.addToDepartmentPlans
                      }>
                        name={fieldNames.addToDepartmentPlans}
                        validation={{
                          addToDepartmentPlan: formFieldArrayValidators.boolean(
                            {
                              additionalRules: [],
                            }
                          ),
                        }}
                      >
                        {({
                          values,
                          fieldArrayPropNames,
                          generateFieldName,
                        }) => {
                          return (
                            <GoalsDrawerDepartmentPlanView
                              currentMeetingsLookup={currentMeetingsLookup}
                              fieldArrayPropNames={fieldArrayPropNames}
                              values={values}
                              generateFieldName={generateFieldName}
                            />
                          )
                        }}
                      </FormFieldArray>
                    </GridItem>
                    <GridItem
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <NotesBox
                        id={'createGoalNotesId'}
                        name={fieldNames.createGoalNotesId}
                        formControl={{
                          label: t('Details'),
                        }}
                        disabled={!canCreateGoalsInMeeting.allowed}
                        text={''}
                        tooltip={
                          !canCreateGoalsInMeeting.allowed
                            ? {
                                msg: canCreateGoalsInMeeting.message,
                                position: 'top center',
                              }
                            : undefined
                        }
                        width={'100%'}
                        createNotes={onCreateNotes}
                      />
                    </GridItem>

                    <FormFieldArray<{
                      parentFormValues: ICreateGoalFormValues
                      arrayFieldName: typeof fieldNames.createGoalMilestones
                    }>
                      name={fieldNames.createGoalMilestones}
                      validation={{
                        milestoneTitle: formFieldArrayValidators.string({
                          additionalRules: [
                            maxLength({ maxLength: 600 }),
                            required(),
                          ],
                        }),
                        milestoneDueDate: formFieldArrayValidators.number({
                          additionalRules: [required()],
                        }),
                        milestoneCompleted: formFieldArrayValidators.boolean({
                          additionalRules: [required()],
                          defaultValue: false,
                        }),
                      }}
                    >
                      {({
                        values,
                        fieldArrayPropNames,
                        onAddFieldArrayItem,
                      }) => (
                        <>
                          <GridItem
                            m={12}
                            withoutXPadding={true}
                            rowSpacing={theme.sizes.spacing24}
                          >
                            <StyledMilestoneTitleWrapper>
                              <Text weight='bold' type='body'>
                                {terms.milestone.plural}
                              </Text>

                              <BtnText
                                onClick={() => {
                                  onAddFieldArrayItem(values.length)
                                }}
                                intent='tertiary'
                                width='noPadding'
                                disabled={!canCreateGoalsInMeeting.allowed}
                                tooltip={
                                  !canCreateGoalsInMeeting.allowed
                                    ? {
                                        msg: canCreateGoalsInMeeting.message,
                                        type: 'light',
                                        position: 'top left',
                                      }
                                    : undefined
                                }
                                ariaLabel={t('Add {{milestone}}', {
                                  milestone: terms.milestone.lowercaseSingular,
                                })}
                                iconProps={{
                                  iconName: 'plusIcon',
                                  iconSize: 'md',
                                }}
                              >
                                {t('Add {{milestone}}', {
                                  milestone: terms.milestone.lowercaseSingular,
                                })}
                              </BtnText>
                            </StyledMilestoneTitleWrapper>
                          </GridItem>

                          {(values as Array<IGoalMilestone>)
                            .slice()
                            .reverse()
                            .map((item, index) => {
                              const ref =
                                index === values.length - 1
                                  ? lastMilestoneRef
                                  : null
                              setActiveMilestoneLengthState(values.length)
                              return (
                                <GoalsDrawerMilestoneEntry
                                  ref={ref}
                                  key={item.id}
                                  fieldArrayPropNames={fieldArrayPropNames}
                                  deleteDisabled={canCreateGoalsInMeeting}
                                  {...item}
                                />
                              )
                            })}
                        </>
                      )}
                    </FormFieldArray>
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

const StyledMilestoneTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`
