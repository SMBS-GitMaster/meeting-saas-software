import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  getStartOfDaySecondsSinceEpochUTC,
  useTimeController,
} from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  formFieldArrayValidators,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { PERSONAL_MEETING_VALUE, useBloomCustomTerms } from '@mm/core-bloom'

import {
  METRICS_FREQUENCY_LOOKUP,
  METRICS_RULES_LOOKUP,
  METRICS_UNITS_LOOKUP,
  METRICS_UNITS_YES_OR_NO_LOOKUP,
  MetricRules,
  MetricUnits,
  MetricUnitsYesNo,
} from '@mm/core-bloom/metrics'
import {
  getMetricProgressiveTrackingTargetDateHasBeenReached,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
} from '@mm/core-bloom/metrics/computed'

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
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
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
} from '../drawersShared/commonFormValidations'
import { MetricCustomGoalView } from '../drawersShared/metricCustomGoalView'
import { FormulaInstructions } from '../drawersShared/metricFormulaInstructions'
import { MetricProgressiveTrackingView } from '../drawersShared/metricProgressiveTrackingView'
import { FormulaInput } from '../formula'
import {
  IEditMetricDrawerViewProps,
  IEditMetricFormValues,
} from './editMetricDrawerTypes'

const EDIT_METRIC_DRAWER_ID = 'EditMetricDrawer'

export const EditMetricDrawerView = observer(function EditMetricDrawerView(
  props: IEditMetricDrawerViewProps
) {
  const componentState = useObservable<{
    showMoreOptions: boolean
    showMetricFormula: boolean
  }>({
    showMoreOptions: false,
    showMetricFormula: !!props.getData().getMetric().formula,
  })

  const setShowMoreOptions = useAction(
    (showMoreOptions: boolean) =>
      (componentState.showMoreOptions = showMoreOptions)
  )

  const setShowMetricFormula = useAction(
    (showMetricFormula: boolean) =>
      (componentState.showMetricFormula = showMetricFormula)
  )

  const diResolver = useDIResolver()
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { openOverlazy, closeOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const showEmbeddedDrawer =
    props.getData().drawerIsRenderedInMeeting &&
    props.getData().drawerView === 'EMBEDDED'

  const getFormValues = useComputed(
    () => {
      const metric = props.getData().getMetric()
      return {
        title: metric.title,
        frequency: metric.frequency,
        owner: metric.assigneeId,
        units: metric.units,
        rule: metric.rule,
        singleGoal:
          metric.goal && isSingleValueMetricGoal(metric.goal)
            ? metric.goal.value
            : null,
        goalMin:
          metric.goal && isMinMaxMetricGoal(metric.goal)
            ? metric.goal.minData.min
            : null,
        goalMax:
          metric.goal && isMinMaxMetricGoal(metric.goal)
            ? metric.goal.maxData.max
            : null,
        meetingIds:
          metric.meetingIds.length === 0
            ? [PERSONAL_MEETING_VALUE]
            : metric.meetingIds,
        notesId: metric.notesId,
        createAnotherCheckedInDrawer: false,
        progressiveTrackingTargetDate: metric.progressiveDate,
        averageDate: metric.averageDate,
        cumulativeDate: metric.cumulativeDate,
        showAverage: metric.showAverage,
        showCumulative: metric.showCumulative,
        showFormula: componentState.showMetricFormula,
        formula: metric.formula,
        customGoals: (metric.customGoals?.nodes || []).map((customGoal) => {
          const goalInfoTypeForCustomGoal = customGoal.goal(metric.units)

          return {
            startDate: customGoal.startDate,
            endDate: customGoal.endDate,
            rule: customGoal.rule,
            singleGoalValue: isSingleValueMetricGoal(goalInfoTypeForCustomGoal)
              ? goalInfoTypeForCustomGoal.value
              : null,
            minGoalValue: isMinMaxMetricGoal(goalInfoTypeForCustomGoal)
              ? goalInfoTypeForCustomGoal.minData.min
              : null,
            maxGoalValue: isMinMaxMetricGoal(goalInfoTypeForCustomGoal)
              ? goalInfoTypeForCustomGoal.maxData.max
              : null,
            id: customGoal.id,
          }
        }),
      }
    },
    {
      name: 'EditMetricDrawerView_getFormValues',
    }
  )

  const handleUpdateShowMetricFormulaIfNeeded = useAction(
    (formulaFromFormState: Maybe<string>) => {
      const metric = props.getData().getMetric()
      if (
        !!formulaFromFormState &&
        !!metric.formula &&
        !componentState.showMetricFormula
      ) {
        setShowMetricFormula(true)
      }
    }
  )

  const currentUserId = props.getData().currentUser?.id

  const nodesCollectionForMetricsFormulasLookup =
    props.getData().nodesCollectionForMetricsFormulasLookup
  const metric = props.getData().getMetric()
  const {
    canEditMetricsInMeeting,
    canArchiveMetricsInMeeting,
    canCreateIssuesInMeeting,
    canCreateTodosInMeeting,
    canEditMetricsMeetingInMeeting,
  } = props.getData().getCurrentUserPermissions()

  return (
    <>
      <EditForm
        // this key helps the drawer rerender in embedded view when switching between items,
        // we use the id from props to prevent a rerender once the data loads.
        key={`${EDIT_METRIC_DRAWER_ID}_${props.getData().metricIdFromProps}`}
        isLoading={props.getData().isLoading}
        disabled={!canEditMetricsInMeeting.allowed}
        disabledTooltip={
          !canEditMetricsInMeeting.allowed
            ? {
                msg: canEditMetricsInMeeting.message,
                position: 'top center',
              }
            : undefined
        }
        values={getFormValues()}
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
            owner: formValidators.stringOrNumber({
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
            notesId: formValidators.string({
              additionalRules: [],
            }),
            createAnotherCheckedInDrawer: formValidators.boolean({
              additionalRules: [],
            }),
            progressiveTrackingTargetDate: formValidators.number({
              additionalRules: props.getData().getMetric().progressiveDate
                ? [required()]
                : [],
              optional: props.getData().getMetric().progressiveDate
                ? false
                : true,
            }),
            showAverage: formValidators.boolean({}),
            averageDate: formValidators.number({ optional: true }),
            showCumulative: formValidators.boolean({}),
            cumulativeDate: formValidators.number({ optional: true }),
            showFormula: formValidators.boolean({}),
            // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-987
            formula: formValidators.string({ optional: true }),
            customGoals: formValidators.arrayOfNodes({ additionalRules: [] }),
          } satisfies GetParentFormValidation<IEditMetricFormValues>
        }
        onSubmit={props.getActionHandlers().onUpdateMetric}
      >
        {({
          values,
          hasError,
          saveState,
          onResetForm,
          onFieldChange,
          validateField,
          fieldNames,
          onSetIsTouchedByFieldName,
          onClearIsFocusedByFieldName,
        }) => {
          const { progressiveDate, frequency } = props.getData().getMetric()
          const hasProgressiveTrackingTargetDateBeenReached =
            progressiveDate && values?.progressiveTrackingTargetDate
              ? getMetricProgressiveTrackingTargetDateHasBeenReached({
                  weekStartAndEndNumbersForLuxon: props
                    .getData()
                    .getWeekStartAndEndNumbersForLuxon(),
                  currentDate: getSecondsSinceEpochUTC(),
                  frequency,
                  progressiveTrackingTargetDate:
                    values?.progressiveTrackingTargetDate || progressiveDate,
                })
              : false

          return (
            <Drawer
              id={EDIT_METRIC_DRAWER_ID}
              type='edit'
              showEmbeddedDrawer={showEmbeddedDrawer}
              headerText={
                getRecordOfOverlazyDrawerIdToDrawerTitle(terms)[
                  EDIT_METRIC_DRAWER_ID
                ]
              }
              drawerBodyCustomXPadding={
                showEmbeddedDrawer
                  ? theme.sizes.spacing8
                  : theme.sizes.spacing24
              }
              drawerBodyCustomYPadding={theme.sizes.spacing12}
              footerText={t('Archive')}
              saveState={saveState}
              saveAndCloseDisabled={
                hasError || !canEditMetricsInMeeting.allowed
              }
              saveDisabledTooltip={
                !canEditMetricsInMeeting.allowed
                  ? {
                      msg: canEditMetricsInMeeting.message,
                      type: 'light',
                      position: 'top left',
                    }
                  : undefined
              }
              footerTextDisabled={!canArchiveMetricsInMeeting.allowed}
              footerTextDisabledTooltip={
                !canArchiveMetricsInMeeting.allowed
                  ? {
                      msg: canArchiveMetricsInMeeting.message,
                      type: 'light',
                      position: 'top left',
                    }
                  : undefined
              }
              drawerHasUnsavedChanges={
                hasError || saveState === 'unsaved' || saveState == 'saving'
              }
              onHandleCloseDrawerWithUnsavedChangesProtection={
                props.getActionHandlers()
                  .onHandleCloseDrawerWithUnsavedChangesProtection
              }
              closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
              footerActionTextClicked={
                props.getActionHandlers().onArchiveMetric
              }
              onResetForm={onResetForm}
              customSubHeaderContent={
                hasProgressiveTrackingTargetDateBeenReached
                  ? ({ isExpanded }) => (
                      <>
                        <div
                          css={css`
                            background-color: ${(props) =>
                              props.theme.colors
                                .truncateTextBannerBackgroundColor};
                            padding: ${(props) => props.theme.sizes.spacing8};
                            display: flex;
                            height: ${(props) => props.theme.sizes.spacing36};
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;

                            ${!isExpanded && showEmbeddedDrawer
                              ? css`
                                  ${theme.sizes.spacing16}
                                `
                              : css`
                                  ${theme.sizes.spacing40}
                                `};
                          `}
                        >
                          <Text
                            type={'body'}
                            color={{ color: theme.colors.bodyTextDefault }}
                            ellipsis={{ widthPercentage: 90 }}
                          >
                            {t(
                              `This {{metric}}'s completion date has passed. Would you like to archive this {{metric}}?`,
                              {
                                metric: terms.metric.lowercaseSingular,
                              }
                            )}
                          </Text>
                          <BtnText
                            onClick={props.getActionHandlers().onArchiveMetric}
                            intent='tertiaryTransparent'
                            width='noPadding'
                            ariaLabel={t('Archive {{metric}}', {
                              metric: terms.metric.lowercaseSingular,
                            })}
                          >
                            <Text type={'body'} weight={'semibold'}>
                              {t('Archive')}
                            </Text>
                          </BtnText>
                        </div>
                      </>
                    )
                  : undefined
              }
              customHeaderContent={({ drawerHeaderWidth }) => (
                <>
                  <CustomDrawerHeaderContent
                    meetingId={props.getData().meetingId}
                    drawerHeaderWidth={drawerHeaderWidth}
                    context={{
                      type: 'Metric',
                      title: metric.title,
                      ownerId: metric.assigneeId,
                      notesId: metric.notesId,
                      ownerFullName: metric.assigneeFullName,
                      rule: metric.rule,
                      units: metric.units,
                      goal: metric.goal,
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
                </>
              )}
            >
              {({ isExpanded }) => {
                const largeGridItemSize =
                  showEmbeddedDrawer && !isExpanded ? 12 : 6

                return (
                  <>
                    {!values ? (
                      <Loading size='small' />
                    ) : (
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
                            css={css`
                              .selectInput__iconWrapper {
                                top: 0;
                              }
                            `}
                            disabled={true}
                            tooltip={
                              !canEditMetricsInMeeting.allowed
                                ? {
                                    msg: canEditMetricsInMeeting.message,
                                    position: 'top center',
                                  }
                                : {
                                    msg: t('The frequency cannot be changed.'),
                                    type: 'light',
                                    position: 'top center',
                                    offset: theme.sizes.spacing4,
                                  }
                            }
                            width={'100%'}
                            disableOptionOnSelect={false}
                          />
                        </GridItem>

                        <GridItem m={12} rowSpacing={theme.sizes.spacing24}>
                          <SelectInputCategoriesSingleSelection
                            id={'ownerId'}
                            name={fieldNames.owner}
                            options={props
                              .getData()
                              .getMeetingAttendeesAndOrgUsersLookup()}
                            placeholder={t('Type or choose an owner')}
                            unknownItemText={t('Unknown owner')}
                            disabled={
                              values?.meetingIds.length === 0 ||
                              values?.meetingIds.includes(
                                PERSONAL_MEETING_VALUE
                              ) ||
                              !canEditMetricsInMeeting.allowed
                            }
                            css={css`
                              .selectInput__selectedOption {
                                padding-left: ${(props) =>
                                  props.theme.sizes.spacing20};
                              }

                              .selectInput__iconWrapper {
                                right: 0;
                              }
                            `}
                            tooltip={
                              !canEditMetricsInMeeting.allowed
                                ? {
                                    msg: canEditMetricsInMeeting.message,
                                    position: 'top center',
                                  }
                                : values?.meetingIds.length === 0
                                  ? {
                                      msg: t(
                                        'Please attach this {{metric}} to at least one meeting.',
                                        {
                                          metric:
                                            terms.metric.lowercaseSingular,
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
                                            metrics:
                                              terms.metric.lowercasePlural,
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
                            renderSelectedOption={
                              renderSelectedOptionSmallAvatar
                            }
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
                              values?.units === 'YESNO'
                                ? METRICS_UNITS_LOOKUP
                                : METRICS_UNITS_LOOKUP.filter(
                                    (item) => item.value !== 'YESNO'
                                  )
                            }
                            disabled={
                              values?.units === 'YESNO' ||
                              !canEditMetricsInMeeting.allowed
                            }
                            tooltip={
                              !canEditMetricsInMeeting.allowed
                                ? {
                                    msg: canEditMetricsInMeeting.message,
                                    position: 'top center',
                                  }
                                : undefined
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
                                (value === 'YESNO' &&
                                  values?.units !== 'YESNO') ||
                                (value !== 'YESNO' && values?.units === 'YESNO')
                              ) {
                                onFieldChange('singleGoal', null)
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
                            unknownItemText={t('Unknown rule')}
                            formControl={{
                              label: t('Rule'),
                            }}
                            disabled={
                              values?.units === 'YESNO' ||
                              !canEditMetricsInMeeting.allowed
                            }
                            width={'100%'}
                            disableOptionOnSelect={false}
                            tooltip={
                              !canEditMetricsInMeeting.allowed
                                ? {
                                    msg: canEditMetricsInMeeting.message,
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
                                onChange={(value) => {
                                  onFieldChange('goalMin', value)
                                }}
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
                                onChange={(value) => {
                                  onFieldChange('goalMax', value)
                                }}
                              />
                            </GridItem>
                          </>
                        ) : (
                          <GridItem
                            m={!isExpanded ? 12 : undefined}
                            l={metric.progressiveDate ? largeGridItemSize : 12}
                            rowSpacing={theme.sizes.spacing24}
                            css={css`
                              padding-bottom: 0;
                            `}
                          >
                            <>
                              {values?.units === 'YESNO' ? (
                                <SelectInputSingleSelection<MetricUnitsYesNo>
                                  id={'singleGoalId'}
                                  name={fieldNames.singleGoal}
                                  options={METRICS_UNITS_YES_OR_NO_LOOKUP}
                                  placeholder={t('Choose a goal')}
                                  unknownItemText={t('Unknown goal')}
                                  formControl={{
                                    label: t('Goal'),
                                    caption:
                                      values?.singleGoal?.toUpperCase() ===
                                      'YES'
                                        ? t('Yes')
                                        : t('No'),
                                  }}
                                  width={'100%'}
                                  disableOptionOnSelect={false}
                                  onChange={(value) => {
                                    onFieldChange('singleGoal', value)
                                  }}
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
                                  onChange={(value) => {
                                    onFieldChange('singleGoal', value)
                                  }}
                                />
                              )}
                            </>
                          </GridItem>
                        )}
                        {metric.progressiveDate && values?.frequency && (
                          <GridItem
                            m={!isExpanded ? 12 : undefined}
                            l={
                              values?.rule === 'BETWEEN'
                                ? 12
                                : largeGridItemSize
                            }
                            rowSpacing={theme.sizes.spacing24}
                          >
                            <MetricProgressiveTrackingView
                              frequency={values?.frequency}
                              weekStartAndEndNumbersForLuxon={props
                                .getData()
                                .getWeekStartAndEndNumbersForLuxon()}
                            />
                          </GridItem>
                        )}
                        <GridItem m={12} rowSpacing={theme.sizes.spacing24}>
                          <SelectInputMultipleSelection<Id>
                            id={fieldNames.meetingIds}
                            name={fieldNames.meetingIds}
                            unknownItemText={t('Unknown meeting')}
                            specialValue={PERSONAL_MEETING_VALUE}
                            disabled={!canEditMetricsMeetingInMeeting.allowed}
                            tooltip={
                              !canEditMetricsMeetingInMeeting.allowed
                                ? {
                                    msg: canEditMetricsMeetingInMeeting.message,
                                    position: 'top center',
                                  }
                                : undefined
                            }
                            css={css`
                              button {
                                margin-top: 0;
                              }
                            `}
                            options={props.getData().getMeetingsLookup()}
                            placeholder={t('Choose a meeting')}
                            formControl={{
                              label: t('Attach to meeting(s)'),
                            }}
                            width={'100%'}
                            onChange={(meetingIds) => {
                              onFieldChange('meetingIds', meetingIds)
                              if (
                                meetingIds.includes(PERSONAL_MEETING_VALUE) &&
                                currentUserId
                              ) {
                                onFieldChange('owner', currentUserId)
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
                            disabled={!canEditMetricsInMeeting.allowed}
                            text={props.getData().metricNoteText}
                            tooltip={
                              !canEditMetricsInMeeting.allowed
                                ? {
                                    msg: canEditMetricsInMeeting.message,
                                    position: 'top center',
                                  }
                                : undefined
                            }
                            width={'100%'}
                            createNotes={
                              props.getActionHandlers().onCreateNotes
                            }
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
                              iconName: componentState.showMoreOptions
                                ? 'chevronUpIcon'
                                : 'chevronDownIcon',
                            }}
                            ariaLabel={t('show more options')}
                            tag={'span'}
                            onClick={() => {
                              handleUpdateShowMetricFormulaIfNeeded(
                                values?.formula
                              )
                              setShowMoreOptions(
                                !componentState.showMoreOptions
                              )
                            }}
                            css={css`
                              margin-left: ${(props) =>
                                props.theme.sizes.spacing4};
                              vertical-align: middle;
                            `}
                          />

                          {componentState.showMoreOptions && (
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
                                text={t('Show average')}
                                iconSize={'lg'}
                                css={css`
                                  padding-bottom: ${values?.showAverage
                                    ? (props) => props.theme.sizes.spacing8
                                    : (props) => props.theme.sizes.spacing24};
                                `}
                                onChange={(value) => {
                                  onFieldChange('showAverage', value)
                                  onSetIsTouchedByFieldName(
                                    fieldNames.showAverage
                                  )
                                  // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2447
                                  onClearIsFocusedByFieldName(
                                    fieldNames.showAverage
                                  )
                                  if (value) {
                                    onFieldChange(
                                      'averageDate',
                                      getStartOfDaySecondsSinceEpochUTC(
                                        diResolver
                                      )
                                    )
                                  } else {
                                    onFieldChange('averageDate', null)
                                  }
                                }}
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
                                    ? (props) => props.theme.sizes.spacing8
                                    : (props) => props.theme.sizes.spacing24};
                                `}
                                onChange={(value) => {
                                  onFieldChange('showCumulative', value)
                                  onSetIsTouchedByFieldName(
                                    fieldNames.showCumulative
                                  )
                                  // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2447
                                  onClearIsFocusedByFieldName(
                                    fieldNames.showCumulative
                                  )
                                  if (value) {
                                    onFieldChange(
                                      'cumulativeDate',
                                      getStartOfDaySecondsSinceEpochUTC(
                                        diResolver
                                      )
                                    )
                                  } else {
                                    onFieldChange('cumulativeDate', null)
                                  }
                                }}
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
                                <span
                                  css={css`
                                    display: inline-flex;
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
                                      !canEditMetricsInMeeting.allowed
                                    }
                                    tooltip={
                                      !canEditMetricsInMeeting.allowed
                                        ? {
                                            msg: canEditMetricsInMeeting.message,
                                            position: 'top center',
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
                                    onChange={(value: boolean) => {
                                      if (value) {
                                        openOverlazy('ApplyFormulaModal', {})
                                      }
                                      onSetIsTouchedByFieldName(
                                        fieldNames.showFormula
                                      )
                                      // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2447
                                      onClearIsFocusedByFieldName(
                                        fieldNames.showFormula
                                      )
                                      onFieldChange('showFormula', value)
                                      setShowMetricFormula(value)
                                      if (!value) {
                                        onFieldChange('formula', null)
                                      }
                                    }}
                                  />
                                  {values?.showFormula && (
                                    <Text
                                      type={'small'}
                                      fontStyle={'italic'}
                                      color={{
                                        color: theme.colors.formulaCaptionColor,
                                      }}
                                      css={css`
                                        margin-left: ${(props) =>
                                          props.theme.sizes.spacing8};
                                      `}
                                    >
                                      {t(
                                        '(Uncheck formula to see previously entered data)'
                                      )}
                                    </Text>
                                  )}
                                </span>
                                {values?.showFormula && (
                                  <BtnText
                                    onClick={() =>
                                      onFieldChange('formula', null)
                                    }
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
                                            metric:
                                              terms.metric.lowercaseSingular,
                                          }
                                        )}
                                        options={props
                                          .getData()
                                          .getMetricsFormulasLookup()}
                                        optionsNodesCollection={
                                          nodesCollectionForMetricsFormulasLookup
                                        }
                                        offsetFrequency={
                                          values?.frequency || 'WEEKLY'
                                        }
                                      />
                                    </div>

                                    <FormulaInstructions
                                      showEditFormulaText={
                                        values?.formula !== metric.formula
                                      }
                                    />
                                  </>
                                )}
                            </div>
                          )}
                        </GridItem>
                        {metric.customGoals && (
                          <FormFieldArray<{
                            parentFormValues: IEditMetricFormValues
                            arrayFieldName: typeof fieldNames.customGoals
                          }>
                            name={fieldNames.customGoals}
                            validation={{
                              rule: formValidators.string({
                                additionalRules: [required()],
                                defaultValue: values?.rule || 'EQUAL_TO',
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
                              <GridItem
                                m={12}
                                rowSpacing={theme.sizes.spacing24}
                              >
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
                                      color={{
                                        color: theme.colors.bodyTextDefault,
                                      }}
                                    >
                                      {t('Custom goals')}
                                    </Text>
                                    <BtnText
                                      disabled={
                                        !canEditMetricsInMeeting.allowed
                                      }
                                      tooltip={
                                        !canEditMetricsInMeeting.allowed
                                          ? {
                                              msg: canEditMetricsInMeeting.message,
                                              position: 'top left',
                                            }
                                          : undefined
                                      }
                                      onClick={() => {
                                        onAddFieldArrayItem(0)
                                      }}
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
                                  {fieldArrayValues.map((item, index) => (
                                    <MetricCustomGoalView
                                      deleteDisabled={canEditMetricsInMeeting}
                                      fieldArrayPropNames={fieldArrayPropNames}
                                      key={item.id}
                                      isLastItem={
                                        index === fieldArrayValues.length - 1
                                      }
                                      largeGridItemSize={largeGridItemSize}
                                      isDrawerExpanded={!!isExpanded}
                                      isExpandedOnOpen={
                                        index === 0 &&
                                        fieldArrayValues.length >
                                          (metric?.customGoals?.nodes || [])
                                            .length
                                      }
                                      values={values}
                                      frequency={values?.frequency || 'WEEKLY'}
                                      item={item}
                                      index={index}
                                      onFieldChange={onFieldChange}
                                      currentUser={props.getData().currentUser}
                                      generateFieldName={generateFieldName}
                                      onRemoveFieldArrayItem={
                                        onRemoveFieldArrayItem
                                      }
                                    />
                                  ))}
                                </>
                              </GridItem>
                            )}
                          </FormFieldArray>
                        )}
                      </GridContainer>
                    )}
                  </>
                )
              }}
            </Drawer>
          )
        }}
      </EditForm>
    </>
  )
})
