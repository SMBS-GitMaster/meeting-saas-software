import { DateTime } from 'luxon'
import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import { PermissionCheckResult } from '@mm/core-bloom'

import {
  GOAL_MILESTONE_COLOR_INTENTION_TO_ICON_NAME,
  getGoalMilestoneColorIntention,
} from '@mm/core-bloom/goals'

import { useTranslation } from '@mm/core-web/i18n'
import {
  CheckBoxInput,
  Clickable,
  DatePickerInput,
  Icon,
  Text,
  TextEllipsis,
  toREM,
} from '@mm/core-web/ui'

import type {
  IGoalsListMilestoneData,
  TGoalsListResponsiveSizes,
} from './goalsListSharedTypes'

interface IGoalsListMilestoneEntryProps {
  isLoading: boolean
  milestone: IGoalsListMilestoneData
  getResponsiveSize: () => TGoalsListResponsiveSizes
  canEditGoalsInMeeting: PermissionCheckResult
  getActionHandlers: () => {
    onUpdateMilestone: (
      opts: Partial<{
        id: Id
        completed: boolean
        dueDate: number
      }>
    ) => Promise<void>
  }
}

export const GoalsListMilestoneEntry = observer(
  function GoalsListMilestoneEntry(props: IGoalsListMilestoneEntryProps) {
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { t } = useTranslation()

    const memoizedMilestoneFormValues = useMemo(() => {
      return {
        dueDate: props.milestone.dueDate,
        completed: props.milestone.completed,
      } as {
        dueDate: number
        completed: boolean
      }
    }, [props.milestone.dueDate, props.milestone.completed])

    const getMilestoneColorIntentionInfo = useCallback(
      (opts: { completed: boolean; dueDate?: number }) => {
        const { completed, dueDate } = opts

        const colorIntention = getGoalMilestoneColorIntention({
          completed,
          dueDate: dueDate ?? props.milestone.dueDate,
          secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
        })

        return {
          iconName: GOAL_MILESTONE_COLOR_INTENTION_TO_ICON_NAME[colorIntention],
          intent: colorIntention,
        }
      },
      [props.milestone.dueDate, getSecondsSinceEpochUTC]
    )

    return (
      <EditForm
        isLoading={props.isLoading}
        disabled={!props.canEditGoalsInMeeting.allowed}
        disabledTooltip={
          !props.canEditGoalsInMeeting.allowed
            ? {
                msg: props.canEditGoalsInMeeting.message,
                type: 'light',
                position: 'top left',
              }
            : undefined
        }
        values={memoizedMilestoneFormValues}
        validation={
          {
            dueDate: formValidators.number({ additionalRules: [required()] }),
            completed: formValidators.boolean({
              additionalRules: [],
            }),
          } satisfies GetParentFormValidation<{
            dueDate: number
            completed: boolean
          }>
        }
        onSubmit={async (values) => {
          return await props.getActionHandlers().onUpdateMilestone({
            ...values,
            id: props.milestone.id,
          })
        }}
      >
        {({ values, fieldNames }) => {
          return (
            <>
              {values === null ? (
                <Text type='body'>{t('Loading...')}</Text>
              ) : (
                <div
                  css={css`
                    display: flex;
                    flex-direction: column;
                    padding-bottom: ${(prop) => prop.theme.sizes.spacing4};
                    padding-top: ${(prop) => prop.theme.sizes.spacing4};
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      justify-content: space-between;
                    `}
                  >
                    <div
                      css={css`
                        align-items: center;
                        display: flex;
                        justify-content: center;
                      `}
                    >
                      <CheckBoxInput
                        id={`milestoneCompleted_${props.milestone.id}`}
                        name={fieldNames.completed}
                        filterIcon={false}
                        checkboxIntention={'callbackIntent'}
                        onCalculateCheckboxIntention={
                          getMilestoneColorIntentionInfo
                        }
                      />
                      {props.getResponsiveSize() !== 'SMALL' && (
                        <TextEllipsis
                          lineLimit={2}
                          wordBreak={true}
                          decoration={
                            values[fieldNames.completed]
                              ? 'line-through'
                              : undefined
                          }
                          css={css`
                            align-items: center;
                            margin-left: ${(prop) => prop.theme.sizes.spacing8};
                          `}
                          type='body'
                        >
                          {props.milestone.title}
                        </TextEllipsis>
                      )}
                    </div>
                    <div
                      css={css`
                        flex: 0 0 ${toREM(98)};
                        margin-left: ${({ theme }) => theme.sizes.spacing16};
                        height: ${({ theme }) => theme.sizes.spacing40};
                        display: flex;
                        align-items: center;
                        min-width: ${toREM(105)};
                      `}
                    >
                      <DatePickerInput
                        id='dueDate'
                        name={fieldNames.dueDate}
                        isSkinny={true}
                        customInput={({ value, onClick }) => {
                          const dateValue = value as unknown as string

                          return (
                            <Clickable
                              css={css`
                                display: flex;
                                margin-left: auto;
                              `}
                              disabled={!props.canEditGoalsInMeeting.allowed}
                              tooltip={
                                !props.canEditGoalsInMeeting.allowed
                                  ? {
                                      msg: props.canEditGoalsInMeeting.message,
                                      type: 'light',
                                      position: 'top left',
                                    }
                                  : undefined
                              }
                              clicked={() => onClick && onClick()}
                            >
                              <div
                                css={css`
                                  display: inline-flex;
                                  flex-flow: row nowrap;
                                  align-items: center;
                                `}
                              >
                                <Text
                                  type='body'
                                  weight='semibold'
                                  color={
                                    getMilestoneColorIntentionInfo({
                                      completed: values[fieldNames.completed],
                                      dueDate: values[fieldNames.dueDate],
                                    }).intent === 'warning'
                                      ? { intent: 'warning' }
                                      : undefined
                                  }
                                >
                                  {props.getResponsiveSize() !== 'LARGE' &&
                                  dateValue
                                    ? DateTime.fromFormat(
                                        dateValue,
                                        'MM/dd/yyyy'
                                      ).toFormat('MM/dd/yy')
                                    : value}
                                </Text>
                                <Icon
                                  iconName='chevronDownIcon'
                                  iconColor={
                                    getMilestoneColorIntentionInfo({
                                      completed: values[fieldNames.completed],
                                      dueDate: values[fieldNames.dueDate],
                                    }).intent === 'warning'
                                      ? { intent: 'warning' }
                                      : undefined
                                  }
                                  iconSize='lg'
                                  css={`
                                    margin-top: ${toREM(2)};
                                  `}
                                />
                              </div>
                            </Clickable>
                          )
                        }}
                      />
                    </div>
                  </div>
                  {props.getResponsiveSize() === 'SMALL' && (
                    <div>
                      <TextEllipsis
                        lineLimit={2}
                        wordBreak={true}
                        decoration={
                          values[fieldNames.completed]
                            ? 'line-through'
                            : undefined
                        }
                        css={css`
                          align-items: center;
                        `}
                        type='body'
                      >
                        {props.milestone.title}
                      </TextEllipsis>
                    </div>
                  )}
                </div>
              )}
            </>
          )
        }}
      </EditForm>
    )
  }
)
