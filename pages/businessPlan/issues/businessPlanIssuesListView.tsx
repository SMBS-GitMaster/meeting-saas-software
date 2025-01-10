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
  AvatarPlaceholder,
  BtnIcon,
  Icon,
  Menu,
  SelectInputCategoriesSingleSelection,
  Text,
  TextEllipsis,
  TextInputAutoExpansion,
  renderListOption,
  renderSelectedOptionSmallAvatarNoTextAndApplyPdfGenerationHack,
  shouldOptionBeIncludedInFilteredOptions,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'

import { useComputed } from '../../performance/mobx'
import { BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS } from '../constants'
import { getEmptyIssueColumnCells } from '../utils'
import { BusinessPlanIssueListLayout } from './businessPlanIssuesListLayout'
import {
  IBusinessPlanIssuesFormValues,
  IBusinessPlanIssuesListViewProps,
} from './businessPlanIssuesListTypes'

export const BusinessPlanIssuesListView = observer(
  function BusinessPlanIssuesListView(props: IBusinessPlanIssuesListViewProps) {
    const theme = useTheme()
    const terms = useBloomCustomTerms()

    const { t } = useTranslation()

    const { isPdfPreview, getData, getActions, className } = props

    const issueListItems = getData().getIssueListItems()

    const memoizedIssueListFormValues = useMemo(() => {
      return { issues: issueListItems }
    }, [issueListItems])

    const getNumEmptyGridCellsIssues = useComputed(
      () => {
        return getEmptyIssueColumnCells({
          currentColumnSize:
            getData().getBusinessPlanData().pageState.issueListColumnSize,
          totalNumIssues: getData().getIssueListItems().length,
        })
      },
      {
        name: `businessPlanIssuesListView_getNumEmptyGridCellsIssues`,
      }
    )

    return (
      <>
        <EditForm
          isLoading={getData().isLoading}
          disabled={getData().getIsEditingDisabled()}
          values={memoizedIssueListFormValues as IBusinessPlanIssuesFormValues}
          validation={
            {
              issues: formValidators.arrayOfNodes({
                additionalRules: [],
              }),
            } satisfies GetParentFormValidation<IBusinessPlanIssuesFormValues>
          }
          onSubmit={async (values) => {
            const meetingId = getData().meetingId

            if (!meetingId) return

            await getActions().onHandleEditBusinessPlanIssues({
              meetingId,
              values,
            })
          }}
        >
          {({ fieldNames }) => {
            return (
              <div className={className}>
                <FormFieldArray<{
                  parentFormValues: IBusinessPlanIssuesFormValues
                  arrayFieldName: typeof fieldNames.issues
                }>
                  name={fieldNames.issues}
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
                                      {t('You have no {{issues}}', {
                                        issues: terms.longTermIssues.plural,
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
                                  ariaLabel={t('Create a {{issue}}', {
                                    issue: terms.longTermIssue.singular,
                                  })}
                                  tag='button'
                                  tooltip={{
                                    msg: t('Create a {{issue}}', {
                                      issue: terms.longTermIssue.singular,
                                    }),
                                  }}
                                  disabled={getData().getIsEditingDisabled()}
                                  onClick={() => {
                                    getActions().onCreateIssueRequest({
                                      meetingId: getData().meetingId,
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
                          <BusinessPlanIssueListLayout
                            isPdfPreview={isPdfPreview}
                            issueListColumnSize={
                              getData().getBusinessPlanData().pageState
                                .issueListColumnSize
                            }
                            issuesToDisplay={getData().getIssueListItems()}
                            renderEmptyGridCellsIssues={
                              getNumEmptyGridCellsIssues() !== 0
                            }
                          >
                            {values.map((item, index) => {
                              return (
                                <React.Fragment key={item.id}>
                                  <div
                                    css={css`
                                      display: flex;
                                      flex-direction: column;
                                      align-items: center;
                                      padding: ${theme.sizes.spacing12} 0;
                                      min-height: ${toREM(32)};

                                      .business-plan-list-hover-options {
                                        visibility: hidden;
                                      }

                                      .selectInput__caretWrapper,
                                      .selectInput__iconWrapper {
                                        display: none;
                                      }

                                      &:hover,
                                      &:focus,
                                      &:focus-within {
                                        background-color: ${theme.colors
                                          .businessPlanTileItemBackgroundColorHover};

                                        ${!getData().getIsEditingDisabled() &&
                                        css`
                                          .business-plan-list-hover-options {
                                            visibility: visible;
                                          }

                                          .selectInput__caretWrapper,
                                          .selectInput__iconWrapper {
                                            display: inline-flex;
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
                                        align-items: center;
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
                                              padding-right: ${theme.sizes
                                                .spacing16};
                                            `}
                                          >
                                            {`${index + 1}${t('.')}`}
                                          </Text>
                                        )}
                                        {getData().listCollection.showOwner && (
                                          <SelectInputCategoriesSingleSelection
                                            id={'editIssueAttachToOwnerId'}
                                            name={generateFieldName({
                                              id: item.id,
                                              propName:
                                                fieldArrayPropNames.ownerId,
                                            })}
                                            placeholder={() => (
                                              <AvatarPlaceholder size={'s'} />
                                            )}
                                            options={props
                                              .getData()
                                              .getMeetingAttendeesAndOrgUsersLookupOptions()}
                                            unknownItemText={t('Unknown owner')}
                                            dropdownMenuWidth={toREM(243)}
                                            width={'fit-content'}
                                            renderInternalSearchbar={{
                                              placeholder: t('Search by name'),
                                            }}
                                            renderListOption={renderListOption}
                                            renderSelectedOption={
                                              renderSelectedOptionSmallAvatarNoTextAndApplyPdfGenerationHack
                                            }
                                            shouldOptionBeIncludedInFilteredOptions={
                                              shouldOptionBeIncludedInFilteredOptions
                                            }
                                            renderSecondarySelectedItemStyling={
                                              true
                                            }
                                            disableOptionOnSelect={true}
                                            css={css`
                                              width: fit-content;
                                              margin-right: ${theme.sizes
                                                .spacing16};

                                              .selectInput__iconWrapper {
                                                position: relative;
                                                top: unset;
                                                right: unset;
                                                width: ${toREM(24)};
                                              }

                                              .selectInput__inputWrapper {
                                                padding: 0;
                                              }

                                              .singleInput__selectionWrapper {
                                                display: inline-flex;
                                                height: ${toREM(32)};
                                                padding: ${theme.sizes
                                                  .spacing4};

                                                ${!getData().getIsEditingDisabled() &&
                                                css`
                                                  &:hover,
                                                  &:focus,
                                                  &:focus-within {
                                                    background-color: ${theme
                                                      .colors
                                                      .businessPlanAvatarMenuBackgroundColorHover};
                                                  }
                                                `}
                                              }

                                              * input {
                                                display: none;
                                                background-color: transparent !important;
                                              }
                                            `}
                                          />
                                        )}
                                        <TextInputAutoExpansion
                                          name={generateFieldName({
                                            id: item.id,
                                            propName: fieldArrayPropNames.title,
                                          })}
                                          id={'businessPlanIssueListItem-title'}
                                          width={'100%'}
                                          placeholder={t('Type details here')}
                                          textStyles={{ type: 'body' }}
                                        />
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
                                                    msg: t(
                                                      'Open details drawer'
                                                    ),
                                                    position: 'left center',
                                                  }}
                                                  onClick={(e) => {
                                                    getActions().onEditIssueRequest(
                                                      {
                                                        issueId: item.id,
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
                                                  tooltip={{
                                                    msg: t(
                                                      'Send to short term {{issues}}',
                                                      {
                                                        issues:
                                                          terms.issue
                                                            .lowercasePlural,
                                                      }
                                                    ),
                                                    position: 'left center',
                                                  }}
                                                  onClick={(e) => {
                                                    getActions().onMoveIssueToShortTerm(
                                                      { issueId: item.id }
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
                                                      iconName={'forwardIcon'}
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
                                                    getActions().onCreateIssueRequest(
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
                                  </div>
                                </React.Fragment>
                              )
                            })}
                          </BusinessPlanIssueListLayout>
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
