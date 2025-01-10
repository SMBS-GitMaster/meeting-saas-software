import React, { useCallback, useMemo, useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  getEndOfMonthSecondsSinceEpochUTC,
  getEndOfQuarterSecondsSinceEpochUTC,
  getShortDateDisplay,
  getStartOfMonthSecondsSinceEpochUTC,
  getStartOfQuarterSecondsSinceEpochUTC,
} from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { GenerateArrayFieldName, OnFieldChange } from '@mm/core/forms'

import { PermissionCheckResult } from '@mm/core-bloom'

import {
  IMetricCustomGoal,
  METRICS_RULES_LOOKUP,
  METRICS_UNITS_YES_OR_NO_LOOKUP,
  MetricFrequency,
  MetricRules,
  getMetricsEndDateMonthsLookup,
  getMetricsEndDateQuartersLookup,
  getMetricsStartDateMonthsLookup,
  getMetricsStartDateQuartersLookup,
} from '@mm/core-bloom/metrics'
import { METRIC_RULE_TO_SIGN_MAP } from '@mm/core-bloom/metrics/constants'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  GridContainer,
  GridItem,
  SelectInputSingleSelection,
  Text,
  TextInput,
  WeekRangePickerInput,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { IEditMetricFormValues } from '../editMetricDrawer/editMetricDrawerTypes'
import { MetricCustomGoalMonthsOrQuartersPickerView } from './metricCustomGoalMonthsOrQuartersPickerView'

interface IMetricCustomGoalViewProps {
  values: Record<string, any> | null
  isDrawerExpanded: boolean
  largeGridItemSize: number
  deleteDisabled: PermissionCheckResult
  fieldArrayPropNames: { [TKey in keyof Omit<IMetricCustomGoal, 'id'>]: TKey }
  isLastItem: boolean
  isExpandedOnOpen: boolean
  frequency: MetricFrequency
  item: IMetricCustomGoal
  index: number
  currentUser: Maybe<{ id: Id }>
  onFieldChange: OnFieldChange<IEditMetricFormValues['customGoals'][number]>
  generateFieldName: GenerateArrayFieldName<
    IEditMetricFormValues['customGoals'][number]
  >
  onRemoveFieldArrayItem: (id: Id) => void
}

export const MetricCustomGoalView: React.FC<IMetricCustomGoalViewProps> = ({
  values,
  deleteDisabled,
  isLastItem,
  isDrawerExpanded,
  largeGridItemSize,
  isExpandedOnOpen,
  fieldArrayPropNames,
  item,
  frequency,
  index,
  onFieldChange,
  generateFieldName,
  onRemoveFieldArrayItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedOnOpen)

  const diResolver = useDIResolver()
  const theme = useTheme()
  const { t } = useTranslation()

  const currentCustomGoals = (values?.customGoals || [])
    .filter((goalItem: IMetricCustomGoal) => item.id !== goalItem.id)
    .map((goal: IMetricCustomGoal) => {
      return { startDate: goal.startDate, endDate: goal.endDate }
    })

  const shouldAddBottomPadding =
    (frequency === 'MONTHLY' || frequency === 'QUARTERLY') && isLastItem

  const getGoalText = useCallback(
    (value: string) => {
      if (value === 'YES') {
        return t('Yes')
      } else if (value === 'NO') {
        return t('No')
      } else {
        return value
      }
    },
    [t]
  )

  const goalText = useMemo(() => {
    if (item.rule === 'BETWEEN' && item.minGoalValue && item.maxGoalValue) {
      return `${METRIC_RULE_TO_SIGN_MAP[item.rule as MetricRules]} ${
        item.minGoalValue
      } - ${item.maxGoalValue}`
    } else if (item.singleGoalValue) {
      return `${
        METRIC_RULE_TO_SIGN_MAP[item.rule as MetricRules]
      } ${getGoalText(item.singleGoalValue)}`
    } else {
      return ''
    }
  }, [
    item.rule,
    item.minGoalValue,
    item.maxGoalValue,
    item.singleGoalValue,
    getGoalText,
  ])

  const currentGoalText = useMemo(() => {
    if (
      values &&
      values.rule === 'BETWEEN' &&
      values.goalMin &&
      values.goalMax
    ) {
      return `${METRIC_RULE_TO_SIGN_MAP[values.rule as MetricRules]} ${
        values.goalMin
      } - ${values.goalMax}`
    } else if (values && values.singleGoal) {
      return `${
        METRIC_RULE_TO_SIGN_MAP[values.rule as MetricRules]
      } ${getGoalText(values.singleGoal)}`
    } else {
      return ''
    }
    // eslint-disable-next-line
  }, [
    values,
    values?.rule,
    values?.goalMin,
    values?.goalMax,
    values?.singleGoal,
    getGoalText,
  ])

  const determineDatePickerByFrequency = (
    frequency: Maybe<MetricFrequency>
  ) => {
    switch (frequency) {
      case 'DAILY':
      case 'WEEKLY':
        return (
          <WeekRangePickerInput
            id={'metricCustomGoalWeeklyDateRangePicker'}
            renderAsGridItems={{
              m: !isDrawerExpanded ? 12 : undefined,
              l: largeGridItemSize,
              rowSpacing: theme.sizes.spacing24,
            }}
            startDateName={generateFieldName({
              id: item.id,
              propName: fieldArrayPropNames.startDate,
            })}
            endDateName={generateFieldName({
              id: item.id,
              propName: fieldArrayPropNames.endDate,
            })}
            startDateFormControl={{
              label: t('Start date'),
            }}
            endDateFormControl={{
              label: t('End date'),
            }}
            showCaret={true}
            width={'100%'}
            customGoalDatesToDisable={currentCustomGoals}
          />
        )
      case 'MONTHLY':
        return (
          <MetricCustomGoalMonthsOrQuartersPickerView
            startDateName={generateFieldName({
              id: item.id,
              propName: fieldArrayPropNames.startDate,
            })}
            endDateName={generateFieldName({
              id: item.id,
              propName: fieldArrayPropNames.endDate,
            })}
            startDateLookup={getMetricsStartDateMonthsLookup(diResolver)}
            endDateLookup={getMetricsEndDateMonthsLookup(diResolver)}
            startDateFormControl={{
              label: t('Month start'),
            }}
            endDateFormControl={{
              label: t('Month end'),
            }}
            startDateValue={item.startDate}
            endDateValue={item.endDate}
            customGoalDatesToDisable={currentCustomGoals}
            isDrawerExpanded={isDrawerExpanded}
            largeGridItemSize={largeGridItemSize}
            startDateScrollToItemValue={getStartOfMonthSecondsSinceEpochUTC(
              diResolver
            )}
            endDateScrollToItemValue={getEndOfMonthSecondsSinceEpochUTC(
              diResolver
            )}
            onFieldChange={onFieldChange}
          />
        )
      case 'QUARTERLY':
        return (
          <MetricCustomGoalMonthsOrQuartersPickerView
            startDateName={generateFieldName({
              id: item.id,
              propName: fieldArrayPropNames.startDate,
            })}
            endDateName={generateFieldName({
              id: item.id,
              propName: fieldArrayPropNames.endDate,
            })}
            startDateLookup={getMetricsStartDateQuartersLookup()}
            endDateLookup={getMetricsEndDateQuartersLookup()}
            startDateFormControl={{
              label: t('Quarter start'),
            }}
            endDateFormControl={{
              label: t('Quarter end'),
            }}
            startDateValue={item.startDate}
            endDateValue={item.endDate}
            customGoalDatesToDisable={currentCustomGoals}
            isDrawerExpanded={isDrawerExpanded}
            largeGridItemSize={largeGridItemSize}
            startDateScrollToItemValue={getStartOfQuarterSecondsSinceEpochUTC()}
            endDateScrollToItemValue={getEndOfQuarterSecondsSinceEpochUTC()}
            onFieldChange={onFieldChange}
          />
        )
      default:
        throw new UnreachableCaseError(frequency as never)
    }
  }

  return (
    <GridContainer
      columns={12}
      css={css`
        margin: ${(props) => props.theme.sizes.spacing16} 0 0 0;
        background-color: ${(props) =>
          props.theme.colors.metricCustomGoalBackgroundColor};
        padding: 0;
        overflow: visible !important;

        ${index === 0 &&
        css`
          margin: ${(props) => props.theme.sizes.spacing24} 0 0 0;
        `};

        ${shouldAddBottomPadding &&
        css`
          margin-bottom: ${toREM(200)};
        `}
      `}
    >
      <GridItem
        m={12}
        css={css`
          padding: 0 ${(props) => props.theme.sizes.spacing16} 0 0;
          background-color: ${(props) =>
            props.theme.colors.metricCustomGoalHeaderBackgroundColor};
        `}
      >
        <div
          css={css`
            display: flex;
            justify-content: space-between;
          `}
        >
          <div>
            <BtnIcon
              intent='tertiaryTransparent'
              size='md'
              iconProps={{
                iconName: isExpanded ? 'chevronUpIcon' : 'chevronDownIcon',
              }}
              ariaLabel={t('expand custom goal')}
              tag={'span'}
              onClick={() => {
                setIsExpanded((current) => !current)
              }}
            />
            {item.startDate && item.endDate ? (
              <Text
                type='body'
                weight='semibold'
                color={{ color: theme.colors.metricCustomGoalHeaderColor }}
              >
                {getShortDateDisplay({
                  secondsSinceEpochUTC: item.startDate,
                  userTimezone: 'utc',
                })}
                {t(' - ')}
                {getShortDateDisplay({
                  secondsSinceEpochUTC: item.endDate,
                  userTimezone: 'utc',
                })}
              </Text>
            ) : (
              <Text
                type='body'
                weight='semibold'
                color={{
                  color: theme.colors.bodyTextDefault,
                }}
              >
                {t('New custom goal')}
              </Text>
            )}
            {item?.rule && (
              <Text
                type='body'
                css={css`
                  margin-left: ${(props) => props.theme.sizes.spacing8};
                `}
                color={{
                  color: theme.colors.metricCustomGoalHeaderGoalTextColor,
                }}
              >
                {goalText}
              </Text>
            )}
          </div>

          {isExpanded && (
            <BtnIcon
              intent='tertiaryTransparent'
              size='md'
              iconProps={{
                iconName: 'trashIcon',
              }}
              disabled={!deleteDisabled.allowed}
              tooltip={
                !deleteDisabled.allowed
                  ? {
                      msg: deleteDisabled.message,
                      position: 'top left',
                    }
                  : {
                      msg: t('Delete custom goal'),
                      position: 'top center',
                      type: 'light',
                    }
              }
              ariaLabel={t('delete custom goal')}
              tag={'span'}
              onClick={() => {
                onRemoveFieldArrayItem(item.id)
              }}
            />
          )}
        </div>
      </GridItem>
      {isExpanded && (
        <div
          css={css`
            width: 100%;
            display: flex;
            flex-flow: wrap;
            padding: ${theme.sizes.spacing4} ${theme.sizes.spacing16};
          `}
        >
          <GridItem
            m={!isDrawerExpanded ? 12 : undefined}
            l={item.rule === 'BETWEEN' ? 12 : largeGridItemSize}
            rowSpacing={theme.sizes.spacing24}
          >
            <SelectInputSingleSelection
              id={'ruleId'}
              name={generateFieldName({
                id: item.id,
                propName: fieldArrayPropNames.rule,
              })}
              options={METRICS_RULES_LOOKUP}
              placeholder={t('Select rule')}
              unknownItemText={t('Unknown rule')}
              formControl={{
                label: t('Rule'),
              }}
              disabled={values?.units === 'YESNO' || !deleteDisabled.allowed}
              customDisabledColors={{
                textColor: theme.colors.metricCustomGoalDisabledTextColor,
                backgroundColor:
                  theme.colors.metricCustomGoalDisabledBackgroundColor,
              }}
              disableOptionOnSelect={false}
              tooltip={
                !deleteDisabled.allowed
                  ? {
                      msg: deleteDisabled.message,
                      position: 'top left',
                    }
                  : values?.units === 'YESNO'
                  ? {
                      msg: t('Rule can only be equal to when units are Yes/No'),
                      position: 'top center',
                      type: 'light',
                    }
                  : undefined
              }
              width={'100%'}
              onChange={(value) => {
                onFieldChange(
                  generateFieldName({
                    id: item.id,
                    propName: fieldArrayPropNames.rule,
                  }),
                  value
                )

                if (value === 'BETWEEN') {
                  onFieldChange(
                    generateFieldName({
                      id: item.id,
                      propName: fieldArrayPropNames.singleGoalValue,
                    }),
                    null
                  )
                  onFieldChange(
                    generateFieldName({
                      id: item.id,
                      propName: fieldArrayPropNames.maxGoalValue,
                    }),
                    null
                  )
                  onFieldChange(
                    generateFieldName({
                      id: item.id,
                      propName: fieldArrayPropNames.minGoalValue,
                    }),
                    null
                  )
                }
              }}
            />
          </GridItem>

          {item.rule === 'BETWEEN' ? (
            <>
              <GridItem
                m={!isDrawerExpanded ? 12 : undefined}
                l={largeGridItemSize}
                rowSpacing={theme.sizes.spacing24}
              >
                <TextInput
                  id={'minGoalValueId'}
                  name={generateFieldName({
                    id: item.id,
                    propName: fieldArrayPropNames.minGoalValue,
                  })}
                  formControl={{
                    label: t('Goal min'),
                    subCaption: `${t('current goal: ')}${currentGoalText}`,
                  }}
                  placeholder={t('Choose a goal')}
                  width={'100%'}
                  onChange={(value) => {
                    onFieldChange(
                      generateFieldName({
                        id: item.id,
                        propName: fieldArrayPropNames.minGoalValue,
                      }),
                      value
                    )
                    onFieldChange(
                      generateFieldName({
                        id: item.id,
                        propName: fieldArrayPropNames.singleGoalValue,
                      }),
                      value
                    )
                  }}
                />
              </GridItem>
              <GridItem
                m={!isDrawerExpanded ? 12 : undefined}
                l={largeGridItemSize}
                rowSpacing={theme.sizes.spacing24}
              >
                <TextInput
                  id={'maxGoalValueId'}
                  name={generateFieldName({
                    id: item.id,
                    propName: fieldArrayPropNames.maxGoalValue,
                  })}
                  formControl={{
                    label: t('Goal max'),
                    subCaption: `${t('current goal: ')}${currentGoalText}`,
                  }}
                  placeholder={t('Choose a goal')}
                  width={'100%'}
                />
              </GridItem>
            </>
          ) : (
            <GridItem
              m={!isDrawerExpanded ? 12 : undefined}
              l={largeGridItemSize}
              rowSpacing={theme.sizes.spacing24}
              css={css`
                ${item.rule === 'BETWEEN' &&
                css`
                  padding-right: 0;
                `}
              `}
            >
              <>
                {values?.units === 'YESNO' ? (
                  <SelectInputSingleSelection
                    id={'singleGoalValueId'}
                    name={generateFieldName({
                      id: item.id,
                      propName: fieldArrayPropNames.singleGoalValue,
                    })}
                    options={METRICS_UNITS_YES_OR_NO_LOOKUP}
                    placeholder={t('Choose a goal')}
                    unknownItemText={t('Unknown goal')}
                    formControl={{
                      label: t('Goal'),
                      subCaption: `${t('current goal: ')}${currentGoalText}`,
                    }}
                    disableOptionOnSelect={false}
                    width={'100%'}
                  />
                ) : (
                  <TextInput
                    id={'singleGoalValue'}
                    name={generateFieldName({
                      id: item.id,
                      propName: fieldArrayPropNames.singleGoalValue,
                    })}
                    formControl={{
                      label: t('Goal'),
                      subCaption: `${t('current goal: ')}${currentGoalText}`,
                    }}
                    placeholder={t('Choose a goal')}
                    width={'100%'}
                  />
                )}
              </>
            </GridItem>
          )}

          {determineDatePickerByFrequency(frequency)}
        </div>
      )}
    </GridContainer>
  )
}
