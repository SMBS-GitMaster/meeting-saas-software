import React, { useState } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { GenerateArrayFieldName } from '@mm/core/forms'

import {
  IMeetingLookup,
  PERSONAL_MEETING_VALUE,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  CheckBoxInput,
  Clickable,
  Icon,
  TextEllipsis,
  Tooltip,
  toREM,
} from '@mm/core-web/ui'

import { ICreateGoalFormValues } from './createGoalDrawer/createGoalDrawerTypes'

export type TGoalDepartmentPlanEntry = {
  addToDepartmentPlan: boolean
  id: Id
}

export function GoalsDrawerDepartmentPlanView(props: {
  currentMeetingsLookup: Array<IMeetingLookup>
  fieldArrayPropNames: {
    [TKey in keyof Omit<TGoalDepartmentPlanEntry, 'id'>]: TKey
  }
  values: Array<TGoalDepartmentPlanEntry>
  generateFieldName: GenerateArrayFieldName<
    ICreateGoalFormValues['addToDepartmentPlans'][number]
  >
}) {
  const [showDepartmentPlans, setShowDepartmentPlans] = useState(true)

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const {
    currentMeetingsLookup,
    fieldArrayPropNames,
    values,
    generateFieldName,
  } = props

  const renderOneOptionText = values.length <= 1

  const isPersonalGoal =
    values.length === 1 && values[0].id === PERSONAL_MEETING_VALUE

  return (
    <>
      {!values.length || isPersonalGoal ? (
        <div
          css={css`
            padding-bottom: ${(props) => props.theme.sizes.spacing8};
          `}
        >
          <Tooltip
            msg={t('You must attach this goal to a meeting.')}
            position={'top left'}
            offset={toREM(4)}
          >
            <span>
              <CheckBoxInput
                id='createGoalAttachToDepartmentPlans'
                name={'createGoalAttachToDepartmentPlansDisabledItem'}
                disableFormContext={true}
                disabled={true}
                text={
                  <TextEllipsis
                    lineLimit={1}
                    wordBreak={true}
                    type='body'
                    weight={'normal'}
                    css={css`
                      color: ${(props) =>
                        props.theme.colors.textPrimaryDisabled};
                      padding-left: ${(props) => props.theme.sizes.spacing4};
                    `}
                  >
                    {t('Add to {{businessPlan}}', {
                      businessPlan: terms.businessPlan.singular,
                    })}
                  </TextEllipsis>
                }
                css={css`
                  justify-content: flex-end;
                `}
              />
            </span>
          </Tooltip>
        </div>
      ) : (
        <>
          {!renderOneOptionText && (
            <Clickable
              clicked={() => {
                setShowDepartmentPlans((current) => !current)
              }}
              css={css`
                padding-bottom: ${(props) => props.theme.sizes.spacing8};
                vertical-align: middle;
              `}
            >
              <div
                css={css`
                  display: inline-flex;
                  align-items: center;
                `}
              >
                <TextEllipsis
                  lineLimit={1}
                  wordBreak={true}
                  type='body'
                  weight={'normal'}
                  css={css`
                    padding-right: ${(props) => props.theme.sizes.spacing8};
                  `}
                >
                  {t('Add to {{businessPlans}}', {
                    businessPlans: terms.businessPlan.plural,
                  })}
                </TextEllipsis>
                <Icon
                  iconSize='lg'
                  iconName={
                    showDepartmentPlans ? 'chevronUpIcon' : 'chevronDownIcon'
                  }
                />
              </div>
            </Clickable>
          )}

          {(showDepartmentPlans || renderOneOptionText) && (
            <>
              {values.map((meetingAndPlanItem, index) => {
                const isLastItem = index === values.length - 1
                const meetingName =
                  currentMeetingsLookup.find((meeting) => {
                    return meeting.value === meetingAndPlanItem.id
                  })?.text ?? t('Unknown meeting')

                return (
                  <div
                    key={meetingAndPlanItem.id}
                    css={css`
                      ${!isLastItem &&
                      css`
                        padding-bottom: ${(props) =>
                          props.theme.sizes.spacing8};
                      `}
                    `}
                  >
                    <CheckBoxInput
                      id='createGoalAttachToDepartmentPlans'
                      name={generateFieldName({
                        id: meetingAndPlanItem.id,
                        propName: fieldArrayPropNames.addToDepartmentPlan,
                      })}
                      text={
                        <TextEllipsis
                          lineLimit={1}
                          wordBreak={true}
                          type='body'
                          weight={'normal'}
                          css={css`
                            ${renderOneOptionText
                              ? css`
                                  padding-left: ${(props) =>
                                    props.theme.sizes.spacing4};
                                `
                              : css`
                                  padding-left: ${(props) =>
                                    props.theme.sizes.spacing8};
                                `}
                          `}
                        >
                          {renderOneOptionText
                            ? t('Add to {{businessPlan}}', {
                                businessPlan: terms.businessPlan.singular,
                              })
                            : meetingName}
                        </TextEllipsis>
                      }
                      css={css`
                        justify-content: flex-end;
                      `}
                    />
                  </div>
                )
              })}
            </>
          )}
        </>
      )}
    </>
  )
}
