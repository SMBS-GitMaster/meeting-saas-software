import React, { useCallback, useMemo } from 'react'
import styled, { css } from 'styled-components'

import { useTimeController } from '@mm/core/date'
import { FormContext, FormFieldArrayContext } from '@mm/core/forms'

import { PermissionCheckResult, useBloomCustomTerms } from '@mm/core-bloom'

import {
  GOAL_MILESTONE_COLOR_INTENTION_TO_ICON_NAME,
  IGoalMilestone,
  getGoalMilestoneColorIntention,
} from '@mm/core-bloom/goals'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  CheckBoxInput,
  DatePickerInput,
  GridItem,
  TextInput,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

export const GoalsDrawerMilestoneEntry = React.forwardRef<
  HTMLDivElement,
  IGoalMilestone & {
    deleteDisabled: PermissionCheckResult
    fieldArrayPropNames: {
      [TKey in keyof Omit<IGoalMilestone, 'id'>]: TKey
    }
    onDelete?: () => void
  }
>((props, ref) => {
  const formContext = React.useContext(FormContext)
  const formFieldArrayContext = React.useContext(FormFieldArrayContext)
  const context = formFieldArrayContext || formContext
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { t } = useTranslation()

  const { id, milestoneDueDate, milestoneCompleted } = props

  const isWarningDatePickerIntention = useMemo(() => {
    const colorIntention = getGoalMilestoneColorIntention({
      completed: milestoneCompleted,
      dueDate: milestoneDueDate,
      secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
    })
    return colorIntention === 'warning'
  }, [milestoneCompleted, milestoneDueDate, getSecondsSinceEpochUTC])

  const getMilestoneColorIntentionInfo = useCallback(
    (opts: { completed: boolean; dueDate?: number }) => {
      const { completed, dueDate } = opts

      const colorIntention = getGoalMilestoneColorIntention({
        completed,
        dueDate: dueDate ?? milestoneDueDate,
        secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
      })

      return {
        iconName: GOAL_MILESTONE_COLOR_INTENTION_TO_ICON_NAME[colorIntention],
      }
    },
    [milestoneDueDate, getSecondsSinceEpochUTC]
  )

  const handleTrashClick = () => {
    context.onRemoveFieldArrayItem(props.id)
    if (props.onDelete) props.onDelete()
  }
  return (
    <StyledEntryWrapper>
      <div
        ref={ref}
        css={css`
          margin: ${theme.sizes.spacing8} ${theme.sizes.spacing8} 0 0;
        `}
      >
        <CheckBoxInput
          id={`milestoneCompleted_${id}`}
          name={context.generateFieldName({
            id: props.id,
            propName: props.fieldArrayPropNames.milestoneCompleted,
          })}
          filterIcon={false}
          checkboxIntention={'callbackIntent'}
          onCalculateCheckboxIntention={getMilestoneColorIntentionInfo}
        />
      </div>

      <GridItem
        m={5}
        withoutXPadding={true}
        css={css`
          padding: 0;
          flex-grow: 2;
        `}
      >
        <div
          css={css`
            margin-right: ${theme.sizes.spacing8};
            max-width: 100%;
          `}
        >
          <TextInput
            name={context.generateFieldName({
              id: props.id,
              propName: props.fieldArrayPropNames.milestoneTitle,
            })}
            id={'milestoneTitle'}
            placeholder={terms.milestone.singular}
            width={'100%'}
          />
        </div>
      </GridItem>

      <div
        css={css`
          flex-grow: 1;
        `}
      >
        <DatePickerInput
          id={'milestoneDueDate'}
          name={context.generateFieldName({
            id: props.id,
            propName: props.fieldArrayPropNames.milestoneDueDate,
          })}
          width={'100%'}
          warning={isWarningDatePickerIntention}
          showCaret={true}
        />
      </div>

      <div
        css={css`
          margin-top: ${theme.sizes.spacing4};
        `}
      >
        <BtnIcon
          intent='tertiaryTransparent'
          size='md'
          iconProps={{
            iconSize: 'lg',
            iconName: 'trashIcon',
          }}
          css={css`
            padding: 0;
            justify-content: flex-end;
          `}
          ariaLabel={t('Remove {{milestone}}', {
            milestone: terms.milestone.lowercaseSingular,
          })}
          tag={'span'}
          onClick={handleTrashClick}
          disabled={!props.deleteDisabled.allowed}
          tooltip={
            !props.deleteDisabled.allowed
              ? {
                  msg: props.deleteDisabled.message,
                  position: 'top left',
                }
              : {
                  msg: t('Delete'),
                  position: 'top center',
                  offset: `${toREM(-4)}`,
                }
          }
        />
      </div>
    </StyledEntryWrapper>
  )
})

const StyledEntryWrapper = styled.div`
  display: flex;
  flex-flow: wrap;
  align-content: center;
  width: 100%;
  margin-bottom: ${(props) => props.theme.sizes.spacing8};

  .react-datepicker__input-container input {
    padding: ${(props) => `${props.theme.sizes.spacing8} !important`};
    padding-left: ${(props) => `${props.theme.sizes.spacing16} !important`};
  }
`
GoalsDrawerMilestoneEntry.displayName = 'GoalsDrawerMilestoneEntry'
