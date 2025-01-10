import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import styled, { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { getDateDisplayUserLocale } from '@mm/core/date'
import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  formFieldArrayValidators,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'
import { useDocument } from '@mm/core/ssr'

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
import { useComputed } from '@mm/bloom-web/pages/performance/mobx'
import { CustomDrawerHeaderContent } from '@mm/bloom-web/shared'

import { GoalsDrawerDepartmentPlanView } from '../goalsDrawerDepartmentPlanView'
import { GoalsDrawerMilestoneEntry } from '../goalsDrawerMilestoneEntry'
import {
  IEditGoalDrawerViewProps,
  IEditGoalFormValues,
} from './editGoalDrawerTypes'

const EDIT_GOAL_DRAWER_ID = 'EditGoalDrawer'

export default observer(function EditGoalDrawerView(
  props: IEditGoalDrawerViewProps
) {
  const document = useDocument()
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()
  const { closeOverlazy } = useOverlazyController()

  const getGoalFormValues = useComputed(
    () => {
      const goal = props.getData().getGoal()
      return {
        editGoalDueDate: goal.dueDate,
        editGoalStatus: goal.status,
        editGoalTitle: goal.title,
        editGoalAttachToOwner: goal.assigneeId,
        editGoalAttachToMeetings: goal.isPersonalGoal
          ? [PERSONAL_MEETING_VALUE]
          : (goal.meetings || []).map((meeting) => meeting.id),
        editGoalNotesId: goal.notesId,
        addToDepartmentPlans: goal.isPersonalGoal
          ? []
          : (goal.departmentPlanRecords || []).map((meetingAndPlanItem) => ({
              id: meetingAndPlanItem.meetingId,
              addToDepartmentPlan: meetingAndPlanItem.isInDepartmentPlan,
            })),
        editGoalMilestones: (goal.milestones || []).map((milestone) => ({
          id: milestone.id,
          milestoneTitle: milestone.title,
          milestoneDueDate: milestone.dueDate,
          milestoneCompleted: milestone.completed,
        })),
      } as IEditGoalFormValues
    },
    {
      name: `EditGoalDrawerView_getGoalFormValues`,
    }
  )

  const {
    canEditGoalsInMeeting,
    canArchiveGoalInMeeting,
    canCreateIssuesInMeeting,
    canCreateTodosInMeeting,
    canEditGoalsMeetingInMeeting,
    canEditGoalsOwnerInMeeting,
  } = props.getData().getCurrentUserPermissions()
  const goal = props.getData().getGoal()

  const handleScrollIntoView = useCallback(() => {
    // we timeout so the field array item is added to the form before we scroll
    setTimeout(() => {
      const bottomOfEditGoalDrawer = document.getElementById(
        'bottomOfEditGoalDrawer'
      )

      if (!bottomOfEditGoalDrawer) return

      bottomOfEditGoalDrawer.scrollIntoView({
        behavior: 'smooth',
      })
    }, 100)
  }, [document])

  return (
    <EditForm
      isLoading={props.getData().isLoading}
      disabled={!canEditGoalsInMeeting.allowed}
      disabledTooltip={
        !canEditGoalsInMeeting.allowed
          ? {
              msg: canEditGoalsInMeeting.message,
              type: 'light',
              position: 'top center',
            }
          : undefined
      }
      values={getGoalFormValues()}
      validation={
        {
          editGoalDueDate: formValidators.number({
            additionalRules: [required()],
          }),
          editGoalStatus: formValidators.string({
            additionalRules: [required()],
          }),
          editGoalTitle: formValidators.string({
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
          editGoalAttachToOwner: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          editGoalAttachToMeetings: formValidators.array({
            additionalRules: [required()],
          }),
          addToDepartmentPlans: formValidators.array({
            additionalRules: [],
          }),
          editGoalNotesId: formValidators.stringOrNumber({
            additionalRules: [],
          }),
          editGoalMilestones: formValidators.arrayOfNodes({
            additionalRules: [],
          }),
        } satisfies GetParentFormValidation<IEditGoalFormValues>
      }
      onSubmit={props.getActionHandlers().onSubmit}
    >
      {({
        saveState,
        hasError,
        onResetForm,
        values,
        fieldNames,
        onFieldChange,
      }) => (
        <Drawer
          id={EDIT_GOAL_DRAWER_ID}
          showEmbeddedDrawer={
            props.getData().drawerIsRenderedInMeeting &&
            props.getData().drawerView === 'EMBEDDED'
          }
          type='edit'
          headerText={
            getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[EDIT_GOAL_DRAWER_ID]
          }
          footerText={t('Archive')}
          saveState={saveState}
          saveAndCloseDisabled={hasError || !canEditGoalsInMeeting.allowed}
          saveDisabledTooltip={
            !canEditGoalsInMeeting.allowed
              ? {
                  msg: canEditGoalsInMeeting.message,
                  type: 'light',
                  position: 'top left',
                }
              : undefined
          }
          footerTextDisabled={!canArchiveGoalInMeeting.allowed}
          footerTextDisabledTooltip={
            !canArchiveGoalInMeeting.allowed
              ? {
                  msg: canArchiveGoalInMeeting.message,
                  type: 'light',
                  position: 'top left',
                }
              : undefined
          }
          footerActionTextClicked={props.getActionHandlers().onArchiveGoal}
          onResetForm={onResetForm}
          closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
          drawerHasUnsavedChanges={
            hasError || saveState === 'unsaved' || saveState == 'saving'
          }
          onHandleCloseDrawerWithUnsavedChangesProtection={
            props.getActionHandlers()
              .onHandleCloseDrawerWithUnsavedChangesProtection
          }
          customHeaderContent={({ drawerHeaderWidth }) => (
            <CustomDrawerHeaderContent
              meetingId={props.getData().meetingId}
              drawerHeaderWidth={drawerHeaderWidth}
              context={{
                dueDate: goal.dueDate,
                dateCreated: goal.dateCreated,
                notesId: goal.notesId,
                ownerId: goal.assigneeId,
                ownerFullName: goal.assigneeFullName,
                status: goal.status,
                type: 'Goal',
                title: goal.title,
              }}
              renderContextIssueOptions={{ canCreateIssuesInMeeting }}
              renderContextTodoOptions={{ canCreateTodosInMeeting }}
              renderDrawerViewMenuOptions={
                props.getData().drawerIsRenderedInMeeting
                  ? {
                      drawerView: props.getData().drawerView,
                      onHandleChangeDrawerViewSetting:
                        props.getActionHandlers()
                          .onHandleChangeDrawerViewSetting,
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
                  m={6}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing24}
                  css={css`
                    padding-top: 0;
                    padding-right: ${theme.sizes.spacing16};
                  `}
                >
                  <DatePickerInput
                    id={'editGoalDueDateId'}
                    name={fieldNames.editGoalDueDate}
                    formControl={{
                      label: t('Due Date'),
                    }}
                    width={'100%'}
                    showCaret={true}
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
                    id={'editGoalStatusId'}
                    name={fieldNames.editGoalStatus}
                    unknownItemText={t('Unknown status')}
                    options={props.getData().getGoalStatusLookup()}
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
                    name={fieldNames.editGoalTitle}
                    id={'editGoalTitleId'}
                    formControl={{
                      label: t('Title'),
                      caption: t(
                        `Date Edited: ${getDateDisplayUserLocale({
                          secondsSinceEpochUTC: goal.dateLastModified,
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
                    id={'editGoalAttachToOwnerId'}
                    name={fieldNames.editGoalAttachToOwner}
                    placeholder={t('Type or choose owner')}
                    options={props
                      .getData()
                      .getMeetingAttendeesAndOrgUsersLookup()}
                    unknownItemText={t('Unknown owner')}
                    disabled={!canEditGoalsOwnerInMeeting.allowed}
                    tooltip={
                      !canEditGoalsOwnerInMeeting.allowed
                        ? {
                            msg: canEditGoalsOwnerInMeeting.message,
                            type: 'light',
                            position: 'top center',
                          }
                        : undefined
                    }
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
                    id={'editGoalAttachToMeetingsId'}
                    name={fieldNames.editGoalAttachToMeetings}
                    placeholder={t('Choose a meeting')}
                    unknownItemText={t('Unknown meeting')}
                    options={props.getData().getCurrentMeetingsLookup()}
                    disabled={!canEditGoalsMeetingInMeeting.allowed}
                    tooltip={
                      !canEditGoalsMeetingInMeeting.allowed
                        ? {
                            msg: canEditGoalsMeetingInMeeting.message,
                            type: 'light',
                            position: 'top center',
                          }
                        : undefined
                    }
                    formControl={{
                      label: t('Attach to meeting(s)'),
                    }}
                    specialValue={PERSONAL_MEETING_VALUE}
                    width={'100%'}
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
                        fieldNames.editGoalAttachToMeetings,
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
                    parentFormValues: IEditGoalFormValues
                    arrayFieldName: typeof fieldNames.addToDepartmentPlans
                  }>
                    name={fieldNames.addToDepartmentPlans}
                    validation={{
                      addToDepartmentPlan: formFieldArrayValidators.boolean({
                        additionalRules: [],
                      }),
                    }}
                  >
                    {({ values, fieldArrayPropNames, generateFieldName }) => {
                      return (
                        <GoalsDrawerDepartmentPlanView
                          currentMeetingsLookup={props
                            .getData()
                            .getCurrentMeetingsLookup()}
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
                    id={'editGoalNotesId'}
                    name={fieldNames.editGoalNotesId}
                    formControl={{
                      label: t('Details'),
                    }}
                    disabled={!canEditGoalsMeetingInMeeting.allowed}
                    text={props.getData().goalNotesText}
                    tooltip={
                      !canEditGoalsMeetingInMeeting.allowed
                        ? {
                            msg: canEditGoalsMeetingInMeeting.message,
                            position: 'top center',
                          }
                        : undefined
                    }
                    width={'100%'}
                    createNotes={props.getActionHandlers().onCreateNotes}
                  />
                </GridItem>
                <FormFieldArray<{
                  parentFormValues: IEditGoalFormValues
                  arrayFieldName: typeof fieldNames.editGoalMilestones
                }>
                  name={fieldNames.editGoalMilestones}
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
                  {({ values, onAddFieldArrayItem, fieldArrayPropNames }) => (
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
                              handleScrollIntoView()
                            }}
                            disabled={!canEditGoalsInMeeting.allowed}
                            tooltip={
                              !canEditGoalsInMeeting.allowed
                                ? {
                                    msg: canEditGoalsInMeeting.message,
                                    position: 'top left',
                                  }
                                : undefined
                            }
                            intent='tertiary'
                            width='noPadding'
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

                      {(values as Array<IGoalMilestone>).map((item) => {
                        return (
                          <GoalsDrawerMilestoneEntry
                            key={item.id}
                            deleteDisabled={canEditGoalsInMeeting}
                            fieldArrayPropNames={fieldArrayPropNames}
                            {...item}
                          />
                        )
                      })}
                    </>
                  )}
                </FormFieldArray>
                <div id={'bottomOfEditGoalDrawer'} />
              </GridContainer>
            )
          }
        </Drawer>
      )}
    </EditForm>
  )
})

const StyledMilestoneTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`
