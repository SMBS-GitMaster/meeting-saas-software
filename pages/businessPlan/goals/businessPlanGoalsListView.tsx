import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  Icon,
  Menu,
  SelectInputCategoriesSingleSelection,
  Text,
  TextEllipsis,
  TextInputAutoExpansion,
  renderListOption,
  renderSelectedOptionSmallAvatarWithSemiboldTextWeightAndApplyPdfGenerationHacks,
  shouldOptionBeIncludedInFilteredOptions,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'

import {
  BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
  BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS,
} from '../constants'
import {
  IBusinessPlanGoalsFormValues,
  IBusinessPlanGoalsListViewProps,
} from './businessPlanGoalsListTypes'

export const BusinessPlanGoalsListView = observer(
  function BusinessPlanGoalsListView(props: IBusinessPlanGoalsListViewProps) {
    const theme = useTheme()
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    const { isPdfPreview, getData, getActions, className } = props

    const goalListItems = getData().getGoalListItems()
    const listCollectionTitle =
      getData().listCollection.title || getData().titlePlaceholder

    const memoizedGoalListFormValues = useMemo(() => {
      return { title: listCollectionTitle, goals: goalListItems }
    }, [goalListItems, listCollectionTitle])

    return (
      <>
        <EditForm
          isLoading={getData().isLoading}
          disabled={getData().getIsEditingDisabled()}
          values={memoizedGoalListFormValues as IBusinessPlanGoalsFormValues}
          validation={
            {
              title: formValidators.string({
                additionalRules: [
                  maxLength({
                    maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
                  }),
                  required(),
                ],
              }),
              goals: formValidators.arrayOfNodes({
                additionalRules: [],
              }),
            } satisfies GetParentFormValidation<IBusinessPlanGoalsFormValues>
          }
          onSubmit={async (values) => {
            const meetingId = getData().meetingId
            if (!meetingId) return

            await getActions().onHandleEditBusinessPlanGoalsListCollection({
              listCollectionId: getData().listCollection.id,
              meetingId,
              values,
            })
          }}
        >
          {({ fieldNames }) => {
            return (
              <div className={className}>
                <div
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                    padding: ${theme.sizes.spacing4} 0 ${theme.sizes.spacing4}
                      ${theme.sizes.spacing24};
                    min-height: ${toREM(32)};
                    max-width: 100%;

                    ${isPdfPreview &&
                    css`
                      padding: 0 0 0 ${theme.sizes.spacing24};
                    `}

                    ${getData().getBusinessPlanData().pageState
                      .businessPlanMode === 'EDIT' &&
                    css`
                      &:hover,
                      &:focus,
                      &:focus-within {
                        background-color: ${theme.colors
                          .businessPlanTileItemBackgroundColorHover};
                      }
                    `}
                  `}
                >
                  <TextInputAutoExpansion
                    name={fieldNames.title}
                    id={'businessPlanGoals-title'}
                    width={'fit-content'}
                    placeholder={getData().titlePlaceholder}
                    renderSecondaryStyles={true}
                    textStyles={{ type: 'body', weight: 'semibold' }}
                  />
                </div>
                <FormFieldArray<{
                  parentFormValues: IBusinessPlanGoalsFormValues
                  arrayFieldName: typeof fieldNames.goals
                }>
                  name={fieldNames.goals}
                  validation={{
                    title: formValidators.string({
                      additionalRules: [
                        required(),
                        maxLength({
                          maxLength: MEETING_TITLES_CHAR_LIMIT,
                        }),
                      ],
                    }),
                    ownerId: formValidators.stringOrNumber({
                      additionalRules: [required()],
                    }),
                  }}
                >
                  {({
                    values,
                    fieldArrayPropNames,
                    onRemoveFieldArrayItem,
                    generateFieldName,
                  }) => {
                    return (
                      <>
                        {values.length === 0 ? (
                          <>
                            <div
                              css={css`
                                width: 100%;
                                display: flex;
                                justify-content: center;
                                align-items: flex-start;
                                padding-top: ${theme.sizes.spacing24};
                              `}
                            >
                              {getData().getIsEditingDisabled() ? (
                                <TextEllipsis lineLimit={2} wordBreak={true}>
                                  <>
                                    <Icon
                                      iconName={'infoCircleSolid'}
                                      iconSize={'md'}
                                      css={css`
                                        margin-right: ${theme.sizes.spacing8};
                                        margin-bottom: ${toREM(2)};
                                      `}
                                    />
                                    <Text
                                      type='body'
                                      weight='normal'
                                      fontStyle='italic'
                                      color={{
                                        color: theme.colors.captionTextColor,
                                      }}
                                    >
                                      {t('You have no {{qg}}', {
                                        qg: terms.quarterlyGoals.plural,
                                      })}
                                    </Text>
                                  </>
                                </TextEllipsis>
                              ) : (
                                <BtnIcon
                                  className={
                                    BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS
                                  }
                                  iconProps={{
                                    iconName: 'plusCircleOutline',
                                  }}
                                  size='lg'
                                  intent='naked'
                                  ariaLabel={t('create a {{qg}}', {
                                    qg: terms.quarterlyGoals.singular,
                                  })}
                                  tag='button'
                                  tooltip={{
                                    msg: t('Create a {{qg}}', {
                                      qg: terms.quarterlyGoals.singular,
                                    }),
                                  }}
                                  disabled={getData().getIsEditingDisabled()}
                                  onClick={() => {
                                    getActions().onCreateGoalRequest({
                                      meetingId: getData().meetingId || null,
                                    })
                                  }}
                                  css={css`
                                    margin-right: ${(props) =>
                                      props.theme.sizes.spacing12};

                                    ${getData().getBusinessPlanData().pageState
                                      .renderPDFStyles &&
                                    css`
                                      display: none;
                                    `}
                                  `}
                                />
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {values.map((item, index) => {
                              return (
                                <React.Fragment key={item.id}>
                                  <div
                                    css={css`
                                      display: flex;
                                      flex-direction: column;
                                      align-items: flex-start;
                                      padding: ${theme.sizes.spacing8} 0;
                                      min-height: ${toREM(32)};

                                      .business-plan-list-hover-options,
                                      .selectInput__caretWrapper {
                                        visibility: hidden;
                                      }

                                      &:hover,
                                      &:focus,
                                      &:focus-within {
                                        background-color: ${theme.colors
                                          .businessPlanTileItemBackgroundColorHover};

                                        ${!getData().getIsEditingDisabled() &&
                                        css`
                                          .business-plan-list-hover-options,
                                          .selectInput__caretWrapper {
                                            visibility: visible;
                                          }
                                        `}
                                      }

                                      ${isPdfPreview &&
                                      css`
                                        padding: 0;
                                      `}
                                    `}
                                  >
                                    <div
                                      css={css`
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: flex-start;
                                        width: 100%;
                                      `}
                                    >
                                      <div
                                        css={css`
                                          display: inline-flex;
                                          align-items: center;
                                          justify-content: flex-start;
                                          flex-grow: 1;
                                          max-width: calc(100% - ${toREM(24)});
                                          width: calc(100% - ${toREM(24)});
                                          padding-left: ${theme.sizes
                                            .spacing24};

                                          ${!getData().listCollection
                                            .showOwner &&
                                          css`
                                            align-items: flex-start;
                                          `}
                                        `}
                                      >
                                        {getData().listCollection
                                          .isNumberedList && (
                                          <Text
                                            type={'body'}
                                            weight={'semibold'}
                                            css={css`
                                              width: ${toREM(24)};
                                              height: ${toREM(21)};
                                              display: flex;
                                              justify-content: center;
                                              align-items: flex-start;
                                            `}
                                          >
                                            {`${index + 1}${t('.')}`}
                                          </Text>
                                        )}
                                        {getData().listCollection.showOwner ? (
                                          <SelectInputCategoriesSingleSelection
                                            id={'editGoalAttachToOwnerId'}
                                            name={generateFieldName({
                                              id: item.id,
                                              propName:
                                                fieldArrayPropNames.ownerId,
                                            })}
                                            placeholder={t('Select Owner')}
                                            options={props
                                              .getData()
                                              .getMeetingAttendeesAndOrgUsersLookupOptions()}
                                            unknownItemText={t('Unknown owner')}
                                            width={'100%'}
                                            renderInternalSearchbar={{
                                              placeholder: t('Search by name'),
                                            }}
                                            renderListOption={renderListOption}
                                            renderSelectedOption={
                                              renderSelectedOptionSmallAvatarWithSemiboldTextWeightAndApplyPdfGenerationHacks
                                            }
                                            shouldOptionBeIncludedInFilteredOptions={
                                              shouldOptionBeIncludedInFilteredOptions
                                            }
                                            renderSecondarySelectedItemStyling={
                                              true
                                            }
                                            disableOptionOnSelect={true}
                                            css={css`
                                              width: 100%;
                                            `}
                                          />
                                        ) : (
                                          <TextInputAutoExpansion
                                            name={generateFieldName({
                                              id: item.id,
                                              propName:
                                                fieldArrayPropNames.title,
                                            })}
                                            id={
                                              'businessPlanGoalListItem-title'
                                            }
                                            width={'100%'}
                                            placeholder={t('Type details here')}
                                            textStyles={{ type: 'body' }}
                                          />
                                        )}
                                      </div>

                                      {!getData().getIsEditingDisabled() && (
                                        <div
                                          className={
                                            'business-plan-list-hover-options'
                                          }
                                        >
                                          <Menu
                                            minWidthRems={1}
                                            position='right center'
                                            content={(close) => (
                                              <>
                                                <Menu.Item
                                                  css={css`
                                                    padding: 0;
                                                    width: ${toREM(40)};
                                                  `}
                                                  tooltip={{
                                                    position: 'right center',
                                                    msg: t(
                                                      'Open details drawer'
                                                    ),
                                                  }}
                                                  onClick={(e) => {
                                                    getActions().onEditGoalRequest(
                                                      {
                                                        goalId: item.id,
                                                      }
                                                    )
                                                    close(e)
                                                  }}
                                                >
                                                  <div
                                                    css={css`
                                                      display: flex;
                                                      justify-content: center;
                                                      align-items: center;
                                                      width: 100%;
                                                    `}
                                                  >
                                                    <Icon
                                                      iconName={
                                                        'slideDrawerIcon'
                                                      }
                                                      iconSize={'lg'}
                                                    />
                                                  </div>
                                                </Menu.Item>
                                                <Menu.Item
                                                  css={css`
                                                    padding: 0;
                                                    width: ${toREM(40)};
                                                  `}
                                                  onClick={(e) => {
                                                    getActions().onHandleCreateContextAwareIssueFromBusinessPlan(
                                                      {
                                                        text: item.title || '',
                                                        goalId: item.id,
                                                      }
                                                    )
                                                    close(e)
                                                  }}
                                                >
                                                  <div
                                                    css={css`
                                                      display: flex;
                                                      justify-content: center;
                                                      align-items: center;
                                                      width: 100%;
                                                    `}
                                                  >
                                                    <Icon
                                                      iconName={
                                                        'contextAwareIssueIcon'
                                                      }
                                                      iconSize={'lg'}
                                                    />
                                                  </div>
                                                </Menu.Item>
                                                <Menu.Item
                                                  css={css`
                                                    padding: 0;
                                                    width: ${toREM(40)};
                                                  `}
                                                  onClick={(e) => {
                                                    getActions().onCreateGoalRequest(
                                                      {
                                                        meetingId:
                                                          getData().meetingId,
                                                      }
                                                    )
                                                    close(e)
                                                  }}
                                                >
                                                  <div
                                                    css={css`
                                                      display: flex;
                                                      justify-content: center;
                                                      align-items: center;
                                                      width: 100%;
                                                    `}
                                                  >
                                                    <Icon
                                                      iconName={
                                                        'plusCircleOutline'
                                                      }
                                                      iconSize={'lg'}
                                                    />
                                                  </div>
                                                </Menu.Item>
                                                <Menu.Item
                                                  css={css`
                                                    padding: 0;
                                                    width: ${toREM(40)};
                                                  `}
                                                  onClick={(e) => {
                                                    close(e)
                                                    onRemoveFieldArrayItem(
                                                      item.id
                                                    )
                                                  }}
                                                >
                                                  <div
                                                    css={css`
                                                      display: flex;
                                                      justify-content: center;
                                                      align-items: center;
                                                      width: 100%;
                                                    `}
                                                  >
                                                    <Icon
                                                      iconName={'trashIcon'}
                                                      iconSize={'lg'}
                                                    />
                                                  </div>
                                                </Menu.Item>
                                              </>
                                            )}
                                          >
                                            <BtnIcon
                                              intent='naked'
                                              size='lg'
                                              iconProps={{
                                                iconName: 'moreVerticalIcon',
                                              }}
                                              ariaLabel={t('more options')}
                                              tag={'span'}
                                            />
                                          </Menu>
                                        </div>
                                      )}
                                    </div>
                                    {getData().listCollection.showOwner && (
                                      <div
                                        css={css`
                                          display: inline-flex;
                                          align-items: flex-start;
                                          justify-content: flex-start;
                                          flex-grow: 1;
                                          max-width: calc(100% - ${toREM(24)});
                                          width: calc(100% - ${toREM(24)});
                                          padding: ${theme.sizes.spacing10} 0 0
                                            ${theme.sizes.spacing24};

                                          ${isPdfPreview &&
                                          css`
                                            padding: 0 0 0
                                              ${theme.sizes.spacing24};
                                          `}
                                        `}
                                      >
                                        <TextInputAutoExpansion
                                          name={generateFieldName({
                                            id: item.id,
                                            propName: fieldArrayPropNames.title,
                                          })}
                                          id={'businessPlanGoalListItem-title'}
                                          width={'100%'}
                                          placeholder={t('Type details here')}
                                          textStyles={{ type: 'body' }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </React.Fragment>
                              )
                            })}
                          </>
                        )}
                      </>
                    )
                  }}
                </FormFieldArray>
              </div>
            )
          }}
        </EditForm>
      </>
    )
  }
)
