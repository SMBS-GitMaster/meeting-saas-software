import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { getStartOfDaySecondsSinceEpochUTC } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
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

import {
  IMetricCustomGoal,
  METRICS_FREQUENCY_LOOKUP,
  METRICS_RULES_LOOKUP,
  METRICS_UNITS_LOOKUP,
  METRICS_UNITS_YES_OR_NO_LOOKUP,
  MetricFrequency,
  MetricRules,
  MetricUnits,
} from '@mm/core-bloom/metrics'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  CheckBoxInput,
  DatePickerInput,
  Drawer,
  GridContainer,
  GridItem,
  Loading,
  NotesBox,
  SelectInputCategoriesSingleSelection,
  SelectInputMultipleSelection,
  SelectInputSingleSelection,
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

import {
  getMetricsFormFieldArrayCustomGoalsMinMaxGoalFormattingValidationRule,
  getMetricsFormFieldArrayCustomGoalsMinMaxGoalMaxNumberValidationRule,
  getMetricsFormFieldArrayCustomGoalsSingleGoalFormattingValidationRule,
  getMetricsFormFieldArrayCustomGoalsSingleGoalMaxNumberValidationRule,
  getMetricsParentFormMinMaxGoalFormattingValidationRule,
  getMetricsParentFormMinMaxGoalMaxNumberValidationRule,
  getMetricsParentFormSingleGoalFormattingValidationRule,
  getMetricsParentFormSingleGoalMaxNumberValidationRule,
  getMetricsProgressiveTrackingTargetDateValidationRule,
} from '../drawersShared/commonFormValidations'
import { MetricCustomGoalView } from '../drawersShared/metricCustomGoalView'
import { FormulaInstructions } from '../drawersShared/metricFormulaInstructions'
import { MetricProgressiveTrackingView } from '../drawersShared/metricProgressiveTrackingView'
import { FormulaInput } from '../formula'
import {
  ICreateMetricDrawerViewProps,
  ICreateMetricFormValues,
} from './createMetricDrawerTypes'

const CREATE_METRIC_DRAWER_ID = 'CreateMetricDrawer'

export const CreateMetricDrawerView = observer(function CreateMetricDrawerView(
  props: ICreateMetricDrawerViewProps
) {
  const [showMoreOptions, setShowMoreOptions] = React.useState(false)

  const diResolver = useDIResolver()
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const { closeOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const {
    isLoading,
    currentUser,
    currentUserPermissions: { canCreateMetricsInMeeting },
    meetingId,
    initialFrequency,
    initialRule,
    initialUnits,
    initialCreateAnotherCheckedInDrawer,
    meetingsLookup,
    meetingAttendeesAndOrgUsersLookup,
    metricsFormulasLookup,
    nodesCollectionForMetricsFormulasLookup,
    weekStartAndEndNumbersForLuxon,
    drawerIsRenderedInMeeting,
    drawerView,
  } = props.data
  const {
    onCreateNotes,
    onCreateMetric,
    onHandleChangeDrawerViewSetting,
    onHandleCloseDrawerWithUnsavedChangesProtection,
    onHandleUpdateMetricFrequency,
  } = props.actionHandlers

  const showEmbeddedDrawer =
    drawerIsRenderedInMeeting && drawerView === 'EMBEDDED'

  return (
    <CreateForm
      isLoading={isLoading}
      disabled={!canCreateMetricsInMeeting.allowed}
      disabledTooltip={
        !canCreateMetricsInMeeting.allowed
          ? {
              msg: canCreateMetricsInMeeting.message,
              position: 'top center',
            }
          : undefined
      }
      values={
        {
          title: '',
          frequency: initialFrequency ? initialFrequency : 'WEEKLY',
          assigneeId: currentUser?.id || '',
          units: initialUnits ? initialUnits : 'NONE',
          rule: initialRule ? initialRule : 'GREATER_THAN',
          singleGoal: null,
          meetingIds: meetingId
            ? [meetingId]
            : meetingId === null
              ? [PERSONAL_MEETING_VALUE]
              : [],
          notesId: '',
          createAnotherCheckedInDrawer: initialCreateAnotherCheckedInDrawer
            ? initialCreateAnotherCheckedInDrawer
            : false,
          progressiveTracking: false,
          progressiveTrackingTargetDate: null,
          goalMin: null,
          goalMax: null,
          showAverage: false,
          averageDate: getStartOfDaySecondsSinceEpochUTC(diResolver),
          cumulativeDate: getStartOfDaySecondsSinceEpochUTC(diResolver),
          showCumulative: false,
          showFormula: false,
          formula: null,
          customGoals: [],
        } as ICreateMetricFormValues
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
          frequency: formValidators.string({
            additionalRules: [required()],
          }),
          assigneeId: formValidators.stringOrNumber({
            additionalRules: [required()],
          }),
          units: formValidators.string({
            additionalRules: [required()],
          }),
          rule: formValidators.string({
            additionalRules: [required()],
          }),
          singleGoal: formValidators.string({
            additionalRules: [
              getMetricsParentFormSingleGoalMaxNumberValidationRule(),
              getMetricsParentFormSingleGoalFormattingValidationRule(),
            ],
            optional: true,
          }),
          goalMin: formValidators.string({
            additionalRules: [
              getMetricsParentFormMinMaxGoalMaxNumberValidationRule(),
              getMetricsParentFormMinMaxGoalFormattingValidationRule(),
            ],
            optional: true,
          }),
          goalMax: formValidators.string({
            additionalRules: [
              getMetricsParentFormMinMaxGoalMaxNumberValidationRule(),
              getMetricsParentFormMinMaxGoalFormattingValidationRule(),
            ],
            optional: true,
          }),
          meetingIds: formValidators.array({
            additionalRules: [required()],
          }),
          notesId: formValidators.stringOrNumber({
            additionalRules: [],
          }),
          progressiveTracking: formValidators.boolean({ additionalRules: [] }),
          progressiveTrackingTargetDate: formValidators.number({
            additionalRules: [
              getMetricsProgressiveTrackingTargetDateValidationRule(),
            ],
            optional: true,
          }),
          createAnotherCheckedInDrawer: formValidators.boolean({
            additionalRules: [],
          }),
          showAverage: formValidators.boolean({}),
          averageDate: formValidators.number({ optional: true }),
          showCumulative: formValidators.boolean({}),
          cumulativeDate: formValidators.number({ optional: true }),
          showFormula: formValidators.boolean({}),
          // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-987
          formula: formValidators.string({ optional: true }),
          customGoals: formValidators.array({ additionalRules: [] }),
        } satisfies GetParentFormValidation<ICreateMetricFormValues>
      }
      onSubmit={onCreateMetric}
    >
      {({
        values,
        hasError,
        fieldNames,
        onSubmit,
        onResetForm,
        onFieldChange,
        validateField,
      }) => {
        if (values?.units === 'YESNO') {
          onFieldChange('rule', 'EQUAL_TO')
        }

        return (
          <Drawer
            id={CREATE_METRIC_DRAWER_ID}
            type='create'
            headerText={
              getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                CREATE_METRIC_DRAWER_ID
              ]
            }
            showEmbeddedDrawer={showEmbeddedDrawer}
            footerText={t('Create another {{metric}}', {
              metric: terms.metric.lowercaseSingular,
            })}
            saveDisabled={hasError || !canCreateMetricsInMeeting.allowed}
            saveDisabledTooltip={
              !canCreateMetricsInMeeting.allowed
                ? {
                    msg: canCreateMetricsInMeeting.message,
                    type: 'light',
                    position: 'top left',
                  }
                : undefined
            }
            drawerBodyCustomXPadding={
              showEmbeddedDrawer ? theme.sizes.spacing8 : theme.sizes.spacing24
            }
            drawerBodyCustomYPadding={theme.sizes.spacing12}
            drawerHasUnsavedChanges
            onHandleCloseDrawerWithUnsavedChangesProtection={
              onHandleCloseDrawerWithUnsavedChangesProtection
            }
            onSaveClicked={onSubmit}
            onResetForm={onResetForm}
            closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
            staticBackdrop
            customHeaderContent={({ drawerHeaderWidth }) => {
              return (
                <CustomDrawerHeaderContent
                  drawerHeaderWidth={drawerHeaderWidth}
                  meetingId={meetingId ? meetingId : null}
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
              const largeGridItemSize =
                showEmbeddedDrawer && !isExpanded ? 12 : 6

              if (!values) {
                return <Loading size='small' />
              } else {
                return (
                  <GridContainer columns={12} withoutMargin={true}>
                    <GridItem
                      m={!isExpanded ? 12 : undefined}
                      l={largeGridItemSize}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <TextInput
                        id={'titleId'}
                        name={fieldNames.title}
                        formControl={{
                          label: t('Title'),
                        }}
                        placeholder={t('Type a title')}
                        width={'100%'}
                      />
                    </GridItem>
                    <GridItem
                      m={!isExpanded ? 12 : undefined}
                      l={largeGridItemSize}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <SelectInputSingleSelection
                        id={'frequencyId'}
                        name={fieldNames.frequency}
                        options={METRICS_FREQUENCY_LOOKUP}
                        placeholder={t('Select frequency')}
                        unknownItemText={t('Unknown frequency')}
                        formControl={{
                          label: t('Frequency'),
                        }}
                        width={'100%'}
                        disableOptionOnSelect={false}
                        onChange={(value: MetricFrequency) => {
                          onFieldChange(fieldNames.frequency, value)
                          onHandleUpdateMetricFrequency(value)
                        }}
                      />
                    </GridItem>
                    <GridItem m={12} rowSpacing={theme.sizes.spacing24}>
                      <SelectInputCategoriesSingleSelection
                        id={'assigneeId'}
                        name={fieldNames.assigneeId}
                        options={meetingAttendeesAndOrgUsersLookup}
                        unknownItemText={t('Unknown owner')}
                        placeholder={t('Type or choose an owner')}
                        disabled={
                          values?.meetingIds.length === 0 ||
                          values?.meetingIds.includes(PERSONAL_MEETING_VALUE) ||
                          !canCreateMetricsInMeeting.allowed
                        }
                        tooltip={
                          !canCreateMetricsInMeeting.allowed
                            ? {
                                msg: canCreateMetricsInMeeting.message,
                                position: 'top center',
                              }
                            : values?.meetingIds.length === 0
                              ? {
                                  msg: t(
                                    'Please attach this {{metric}} to at least one meeting.',
                                    {
                                      metric: terms.metric.lowercaseSingular,
                                    }
                                  ),
                                  position: 'top center',
                                  type: 'light',
                                }
                              : values?.meetingIds.includes(
                                    PERSONAL_MEETING_VALUE
                                  )
                                ? {
                                    msg: t(
                                      'Personal {{metrics}} can only be assigned to yourself.',
                                      {
                                        metrics: terms.metric.lowercasePlural,
                                      }
                                    ),
                                    position: 'top center',
                                    type: 'light',
                                  }
                                : undefined
                        }
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
                      m={!isExpanded ? 12 : undefined}
                      l={largeGridItemSize}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <SelectInputSingleSelection<MetricUnits>
                        id={'unitsId'}
                        name={fieldNames.units}
                        options={
                          values?.progressiveTracking
                            ? METRICS_UNITS_LOOKUP.map((unit) => {
                                if (unit.value === 'YESNO') {
                                  return {
                                    ...unit,
                                    disabled: true,
                                    tooltip: {
                                      type: 'light',
                                      msg: t(
                                        'Revert to weekly tracking to enable'
                                      ),
                                      position: 'right center',
                                      offset: theme.sizes.spacing8,
                                    },
                                  }
                                } else {
                                  return unit
                                }
                              })
                            : METRICS_UNITS_LOOKUP
                        }
                        placeholder={t('Select units')}
                        unknownItemText={t('Unknown units')}
                        formControl={{
                          label: t('Units'),
                        }}
                        width={'100%'}
                        disableOptionOnSelect={false}
                        onChange={(value) => {
                          if (
                            (value === 'YESNO' && values?.units !== 'YESNO') ||
                            (value !== 'YESNO' && values?.units === 'YESNO')
                          ) {
                            onFieldChange('singleGoal', null)
                          }

                          if (value === 'YESNO') {
                            onFieldChange('showFormula', false)
                            onFieldChange('showCumulative', false)
                            onFieldChange('cumulativeDate', null)
                            onFieldChange('formula', null)
                          }

                          onFieldChange('units', value)
                          validateField('singleGoal')
                        }}
                      />
                    </GridItem>
                    <GridItem
                      m={!isExpanded ? 12 : undefined}
                      l={largeGridItemSize}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <SelectInputSingleSelection<MetricRules>
                        id={'ruleId'}
                        name={fieldNames.rule}
                        options={METRICS_RULES_LOOKUP}
                        placeholder={t('Select rule')}
                        formControl={{
                          label: t('Rule'),
                        }}
                        unknownItemText={t('Unknown rule')}
                        disabled={
                          values?.units === 'YESNO' ||
                          !canCreateMetricsInMeeting.allowed
                        }
                        disableOptionOnSelect={false}
                        tooltip={
                          !canCreateMetricsInMeeting.allowed
                            ? {
                                msg: canCreateMetricsInMeeting.message,
                                position: 'top center',
                              }
                            : values?.units === 'YESNO'
                              ? {
                                  msg: t(
                                    'Rule can only be equal to when units are Yes/No'
                                  ),
                                  position: 'top center',
                                  type: 'light',
                                }
                              : undefined
                        }
                        width={'100%'}
                        onChange={(value) => {
                          onFieldChange('rule', value)

                          validateField('singleGoal')
                          validateField('goalMin')
                          validateField('goalMax')
                        }}
                      />
                    </GridItem>
                    {values?.rule === 'BETWEEN' ? (
                      <>
                        <GridItem
                          m={!isExpanded ? 12 : undefined}
                          l={largeGridItemSize}
                          rowSpacing={theme.sizes.spacing24}
                        >
                          <TextInput
                            id={'goalMinId'}
                            name={fieldNames.goalMin}
                            formControl={{
                              label: t('Goal min'),
                              caption: values?.goalMin || '',
                            }}
                            placeholder={t('Choose a goal')}
                            width={'100%'}
                          />
                        </GridItem>
                        <GridItem
                          m={!isExpanded ? 12 : undefined}
                          l={largeGridItemSize}
                          rowSpacing={theme.sizes.spacing24}
                        >
                          <TextInput
                            id={'goalMaxId'}
                            name={fieldNames.goalMax}
                            formControl={{
                              label: t('Goal max'),
                              caption: values?.goalMax || '',
                            }}
                            placeholder={t('Choose a goal')}
                            width={'100%'}
                          />
                        </GridItem>
                      </>
                    ) : (
                      <GridItem
                        m={!isExpanded ? 12 : undefined}
                        l={values?.progressiveTracking ? largeGridItemSize : 12}
                        rowSpacing={theme.sizes.spacing24}
                        css={css`
                          padding-bottom: 0;
                        `}
                      >
                        <>
                          {values?.units === 'YESNO' ? (
                            <SelectInputSingleSelection
                              id={'singleGoalId'}
                              name={fieldNames.singleGoal}
                              options={METRICS_UNITS_YES_OR_NO_LOOKUP}
                              placeholder={t('Choose a goal')}
                              unknownItemText={t('Unknown goal')}
                              formControl={{
                                label: t('Goal'),
                                caption:
                                  values?.singleGoal === 'YES'
                                    ? t('Yes')
                                    : t('No'),
                              }}
                              disableOptionOnSelect={false}
                              width={'100%'}
                            />
                          ) : (
                            <TextInput
                              id={'singleGoalId'}
                              name={fieldNames.singleGoal}
                              formControl={{
                                label: t('Goal'),
                                caption: values?.singleGoal || '',
                              }}
                              placeholder={t('Choose a goal')}
                              width={'100%'}
                            />
                          )}
                        </>
                      </GridItem>
                    )}
                    {values?.progressiveTracking && (
                      <GridItem
                        m={!isExpanded ? 12 : undefined}
                        l={values?.rule === 'BETWEEN' ? 12 : largeGridItemSize}
                        rowSpacing={theme.sizes.spacing24}
                      >
                        <MetricProgressiveTrackingView
                          frequency={values?.frequency}
                          weekStartAndEndNumbersForLuxon={
                            weekStartAndEndNumbersForLuxon
                          }
                        />
                      </GridItem>
                    )}
                    <GridItem
                      m={12}
                      rowSpacing={theme.sizes.spacing24}
                      css={css`
                        padding-top: 0;
                      `}
                    >
                      <div
                        css={css`
                          display: flex;
                          justify-content: flex-end;
                        `}
                      >
                        <BtnText
                          onClick={() => {
                            onFieldChange(
                              'progressiveTracking',
                              !values?.progressiveTracking
                            )
                            validateField('progressiveTrackingTargetDate')
                          }}
                          disabled={
                            values?.units === 'YESNO' ||
                            !canCreateMetricsInMeeting.allowed
                          }
                          tooltip={
                            !canCreateMetricsInMeeting.allowed
                              ? {
                                  msg: canCreateMetricsInMeeting.message,
                                  position: 'top left',
                                }
                              : values?.units === 'YESNO'
                                ? {
                                    type: 'light',
                                    position: 'top center',
                                    msg: t(
                                      'Yes/No units cannot be tracked progressively.'
                                    ),
                                  }
                                : undefined
                          }
                          intent='tertiary'
                          width='noPadding'
                          ariaLabel={t('Change to progressive tracking')}
                        >
                          {!values?.progressiveTracking
                            ? t('Change to progressive tracking')
                            : t('Revert to {{frequency}} tracking', {
                                frequency:
                                  METRICS_FREQUENCY_LOOKUP.find(
                                    (item) => item.value === values?.frequency
                                  )?.text.toLowerCase() || '',
                              })}
                        </BtnText>
                      </div>
                    </GridItem>
                    <GridItem m={12} rowSpacing={theme.sizes.spacing24}>
                      <SelectInputMultipleSelection<Id>
                        id={fieldNames.meetingIds}
                        name={fieldNames.meetingIds}
                        options={meetingsLookup}
                        placeholder={t('Choose a meeting')}
                        unknownItemText={t('Unknown meeting')}
                        specialValue={PERSONAL_MEETING_VALUE}
                        formControl={{
                          label: t('Attach to meeting(s)'),
                        }}
                        width={'100%'}
                        onChange={(meetingIds) => {
                          onFieldChange('meetingIds', meetingIds)
                          if (
                            meetingIds.includes(PERSONAL_MEETING_VALUE) &&
                            currentUser?.id
                          ) {
                            onFieldChange('assigneeId', currentUser.id)
                          }
                        }}
                      />
                    </GridItem>
                    <GridItem m={12} rowSpacing={theme.sizes.spacing24}>
                      <NotesBox
                        id={'notesId'}
                        name={fieldNames.notesId}
                        formControl={{
                          label: t('Details'),
                        }}
                        disabled={!canCreateMetricsInMeeting.allowed}
                        text={''}
                        tooltip={
                          !canCreateMetricsInMeeting.allowed
                            ? {
                                msg: canCreateMetricsInMeeting.message,
                                position: 'top center',
                              }
                            : undefined
                        }
                        width={'100%'}
                        createNotes={onCreateNotes}
                      />
                    </GridItem>
                    <GridItem m={12} rowSpacing={theme.sizes.spacing24}>
                      <Text
                        type={'body'}
                        weight={'semibold'}
                        color={{ color: theme.colors.bodyTextDefault }}
                      >
                        {t('More options')}
                      </Text>
                      <BtnIcon
                        intent='naked'
                        size='lg'
                        iconProps={{
                          iconName: showMoreOptions
                            ? 'chevronUpIcon'
                            : 'chevronDownIcon',
                        }}
                        ariaLabel={t('show more options')}
                        tag={'span'}
                        onClick={() => {
                          setShowMoreOptions((current) => !current)
                        }}
                        css={css`
                          margin-left: ${(props) => props.theme.sizes.spacing4};
                          vertical-align: middle;
                        `}
                      />

                      {showMoreOptions && (
                        <div
                          css={css`
                            display: flex;
                            flex-flow: column nowrap;
                            padding-top: ${(props) =>
                              props.theme.sizes.spacing24};
                          `}
                        >
                          <CheckBoxInput
                            id={'showAverageId'}
                            name={fieldNames.showAverage}
                            disabled={!canCreateMetricsInMeeting.allowed}
                            tooltip={
                              !canCreateMetricsInMeeting.allowed
                                ? {
                                    msg: canCreateMetricsInMeeting.message,
                                    position: 'top left',
                                  }
                                : undefined
                            }
                            text={t('Show average')}
                            iconSize={'lg'}
                            css={css`
                              padding-bottom: ${values?.showAverage
                                ? css`
                                    ${(props) => props.theme.sizes.spacing8}
                                  `
                                : css`
                                    ${(props) => props.theme.sizes.spacing24}
                                  `};
                            `}
                          />
                          {values?.showAverage && (
                            <div
                              css={css`
                                display: inline-flex;
                                align-items: center;
                                padding-bottom: ${(props) =>
                                  props.theme.sizes.spacing24};
                              `}
                            >
                              <Text
                                type='body'
                                css={css`
                                  padding-right: ${(props) =>
                                    props.theme.sizes.spacing16};
                                `}
                              >
                                {t('Between')}
                              </Text>
                              <DatePickerInput
                                id={'averageDateId'}
                                name={fieldNames.averageDate}
                                showCaret={true}
                                width={'100%'}
                              />
                              <Text
                                type='body'
                                css={css`
                                  white-space: nowrap;
                                  padding-left: ${(props) =>
                                    props.theme.sizes.spacing16};
                                `}
                              >
                                {t('and today')}
                              </Text>
                            </div>
                          )}
                          <CheckBoxInput
                            id={'showCumulativeId'}
                            name={fieldNames.showCumulative}
                            text={t('Show cumulative sum')}
                            iconSize={'lg'}
                            css={css`
                              padding-bottom: ${values?.showCumulative
                                ? css`
                                    ${(props) => props.theme.sizes.spacing8}
                                  `
                                : css`
                                    ${(props) => props.theme.sizes.spacing24}
                                  `};
                            `}
                            disabled={
                              values?.units === 'YESNO' ||
                              !canCreateMetricsInMeeting.allowed
                            }
                            tooltip={
                              !canCreateMetricsInMeeting.allowed
                                ? {
                                    msg: canCreateMetricsInMeeting.message,
                                    position: 'top left',
                                  }
                                : values?.units === 'YESNO'
                                  ? {
                                      msg: t(
                                        'Yes/No goals cannot show cumulative'
                                      ),
                                      position: 'top left',
                                      type: 'light',
                                    }
                                  : undefined
                            }
                          />
                          {values?.showCumulative && (
                            <div
                              css={css`
                                display: inline-flex;
                                align-items: center;
                                padding-bottom: ${(props) =>
                                  props.theme.sizes.spacing24};
                              `}
                            >
                              <Text
                                type='body'
                                css={css`
                                  padding-right: ${(props) =>
                                    props.theme.sizes.spacing16};
                                `}
                              >
                                {t('Between')}
                              </Text>
                              <DatePickerInput
                                id={'cumulativeDateId'}
                                name={fieldNames.cumulativeDate}
                                showCaret={true}
                                width={'100%'}
                              />
                              <Text
                                type='body'
                                css={css`
                                  white-space: nowrap;
                                  padding-left: ${(props) =>
                                    props.theme.sizes.spacing16};
                                `}
                              >
                                {t('and today')}
                              </Text>
                            </div>
                          )}
                          <div
                            css={css`
                              display: flex;
                              justify-content: ${values?.showFormula
                                ? `space-between`
                                : `flex-start`};
                              align-items: center;
                            `}
                          >
                            <CheckBoxInput
                              id={'showFormulaId'}
                              name={fieldNames.showFormula}
                              text={t('Formula')}
                              iconSize={'lg'}
                              disabled={
                                values?.units === 'YESNO' ||
                                !canCreateMetricsInMeeting.allowed
                              }
                              tooltip={
                                !canCreateMetricsInMeeting.allowed
                                  ? {
                                      msg: canCreateMetricsInMeeting.message,
                                      position: 'top left',
                                    }
                                  : values?.units === 'YESNO'
                                    ? {
                                        msg: t(
                                          'Yes/no goals cannot have a formula'
                                        ),
                                        position: 'top left',
                                        type: 'light',
                                      }
                                    : undefined
                              }
                            />
                            {values?.showFormula && (
                              <BtnText
                                onClick={() => onFieldChange('formula', null)}
                                intent={'tertiaryTransparent'}
                                width='noPadding'
                                ariaLabel={t('clear all')}
                              >
                                <Text type={'body'} weight={'bold'}>
                                  {t('Clear all')}
                                </Text>
                              </BtnText>
                            )}
                          </div>
                          {values?.showFormula &&
                            nodesCollectionForMetricsFormulasLookup && (
                              <>
                                <div
                                  css={css`
                                    display: flex;
                                    align-items: center;
                                    margin-top: ${(props) =>
                                      props.theme.sizes.spacing8};
                                  `}
                                >
                                  <FormulaInput
                                    id={'formulaId'}
                                    name={fieldNames.formula}
                                    placeholder={t(
                                      'Start typing a {{metric}}/operator/number',
                                      {
                                        metric: terms.metric.lowercaseSingular,
                                      }
                                    )}
                                    options={metricsFormulasLookup}
                                    optionsNodesCollection={
                                      nodesCollectionForMetricsFormulasLookup
                                    }
                                    offsetFrequency={
                                      values?.frequency || 'WEEKLY'
                                    }
                                  />
                                </div>

                                <FormulaInstructions
                                  showEditFormulaText={false}
                                />
                              </>
                            )}
                        </div>
                      )}
                    </GridItem>
                    <FormFieldArray<{
                      parentFormValues: ICreateMetricFormValues
                      arrayFieldName: typeof fieldNames.customGoals
                    }>
                      name={fieldNames.customGoals}
                      validation={{
                        rule: formFieldArrayValidators.string({
                          additionalRules: [required()],
                          defaultValue: values?.rule,
                        }),
                        singleGoalValue: formFieldArrayValidators.string({
                          additionalRules: [
                            getMetricsFormFieldArrayCustomGoalsSingleGoalMaxNumberValidationRule(),
                            getMetricsFormFieldArrayCustomGoalsSingleGoalFormattingValidationRule(),
                          ],
                          optional: true,
                        }),
                        minGoalValue: formFieldArrayValidators.string({
                          additionalRules: [
                            getMetricsFormFieldArrayCustomGoalsMinMaxGoalMaxNumberValidationRule(),
                            getMetricsFormFieldArrayCustomGoalsMinMaxGoalFormattingValidationRule(),
                          ],
                          optional: true,
                        }),
                        maxGoalValue: formFieldArrayValidators.string({
                          additionalRules: [
                            getMetricsFormFieldArrayCustomGoalsMinMaxGoalMaxNumberValidationRule(),
                            getMetricsFormFieldArrayCustomGoalsMinMaxGoalFormattingValidationRule(),
                          ],
                          optional: true,
                        }),
                        startDate: formFieldArrayValidators.number({
                          additionalRules: [required()],
                          errorMessage: t('Please enter a valid date'),
                        }),
                        endDate: formFieldArrayValidators.number({
                          additionalRules: [required()],
                          errorMessage: t('Please enter a valid date'),
                        }),
                      }}
                    >
                      {({
                        values: fieldArrayValues,
                        fieldArrayPropNames,
                        onRemoveFieldArrayItem,
                        onAddFieldArrayItem,
                        generateFieldName,
                        onFieldChange,
                      }) => (
                        <GridItem m={12} rowSpacing={theme.sizes.spacing24}>
                          <>
                            <div
                              css={css`
                                display: flex;
                                justify-content: space-between;
                              `}
                            >
                              <Text
                                type={'body'}
                                weight={'semibold'}
                                color={{ color: theme.colors.bodyTextDefault }}
                              >
                                {t('Custom goals')}
                              </Text>
                              <BtnText
                                onClick={() => {
                                  onAddFieldArrayItem(0)
                                }}
                                disabled={!canCreateMetricsInMeeting.allowed}
                                tooltip={
                                  !canCreateMetricsInMeeting.allowed
                                    ? {
                                        msg: canCreateMetricsInMeeting.message,
                                        position: 'top left',
                                      }
                                    : undefined
                                }
                                intent='tertiary'
                                width='noPadding'
                                ariaLabel={t('Add custom goal')}
                                iconProps={{
                                  iconName: 'plusIcon',
                                  iconSize: 'xs',
                                }}
                              >
                                {t('Add custom goal')}
                              </BtnText>
                            </div>
                            {(fieldArrayValues as Array<IMetricCustomGoal>).map(
                              (item, index) => (
                                <MetricCustomGoalView
                                  key={index}
                                  isLastItem={
                                    index === fieldArrayValues.length - 1
                                  }
                                  largeGridItemSize={largeGridItemSize}
                                  isDrawerExpanded={!!isExpanded}
                                  fieldArrayPropNames={fieldArrayPropNames}
                                  deleteDisabled={canCreateMetricsInMeeting}
                                  isExpandedOnOpen={true}
                                  values={values}
                                  frequency={values?.frequency || 'WEEKLY'}
                                  item={item}
                                  index={index}
                                  currentUser={currentUser}
                                  onFieldChange={onFieldChange}
                                  generateFieldName={generateFieldName}
                                  onRemoveFieldArrayItem={
                                    onRemoveFieldArrayItem
                                  }
                                />
                              )
                            )}
                          </>
                        </GridItem>
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
