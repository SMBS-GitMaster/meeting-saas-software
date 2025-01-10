import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css, useTheme } from 'styled-components'

import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import {
  TBusinessPlanParentPageType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  Card,
  Icon,
  Menu,
  SwitchInput,
  Text,
  TextEllipsis,
  TextInputSmall,
  Tooltip,
  toREM,
  useResizeObserver,
} from '@mm/core-web/ui'

import { useAction, useComputed, useObservable } from '../../performance/mobx'
import {
  EBusinessPlanIssueListColumnSize,
  IBusinessPlanListCollection,
  IBusinessPlanTileData,
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import {
  BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
  BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS,
} from '../constants'
import {
  getRecordOfBusinessPlanTileTypeToDefaultTileTitle,
  getRecordOfIssueColumnsToSelectedItemText,
} from '../lookups'

interface IBusinessPlanHeaderProps {
  getData: () => Pick<
    IBusinessPlanViewData,
    | 'pageState'
    | 'getCurrentUserPermissions'
    | 'isLoadingFirstSubscription'
    | 'v3BusinessPlanId'
    | 'businessPlan'
  >
  getTileData: () => IBusinessPlanTileData
  getActions: () => Pick<
    IBusinessPlanViewActions,
    | 'onHandleHideTile'
    | 'onHandleDuplicateTile'
    | 'onHandleMoveTileToOtherPage'
    | 'onHandleRenameTile'
    | 'onHandleEditBusinessPlanGoalOptionsMenuItems'
    | 'onHandleUpdateIssueListColumnSize'
  >
  getIsEditingDisabled: () => boolean
  renderScrollOverflowIndicator: boolean
  // Note: in some cases, we want different permissions for menu items in the header. If this is passed in we use this permission check,
  // if not, we use the getIsEditingDisabled check.
  getIsEditingDisabledForMenuItemsInHeader?: () => boolean
  isPdfPreview: boolean
  renderIssueColumnMenu?: boolean
  renderMenuOptions?: {
    move?: boolean
    hide?: boolean
    duplicate?: boolean
    goalOptions?: {
      showOwner: boolean
      showNumberedList: boolean
      goalCustomTerm: string
      getListCollection: () => Maybe<IBusinessPlanListCollection>
    }
  }
  className?: string
}

export const BusinessPlanTileHeader = observer(
  (props: IBusinessPlanHeaderProps) => {
    const componentState = useObservable({
      businessPlanHeaderEl: null as Maybe<HTMLDivElement>,
      isEditingTitle: false,
    })

    const headerTitleRef = React.createRef<HTMLDivElement>()

    const observableResizeState = useResizeObserver(
      componentState.businessPlanHeaderEl
    )

    const diResolver = useDIResolver()
    const theme = useTheme()
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    const {
      className,
      getData,
      getTileData,
      getActions,
      getIsEditingDisabled,
      getIsEditingDisabledForMenuItemsInHeader,
      isPdfPreview,
      renderMenuOptions,
      renderIssueColumnMenu,
      renderScrollOverflowIndicator,
    } = props

    const getResponsiveSize = useComputed(
      () => {
        if (!observableResizeState.ready) return 'UNKNOWN'
        if (observableResizeState.width < 500) return 'SMALL'
        return 'LARGE'
      },
      { name: 'businessPlanTileHeader_getResponsiveSize' }
    )

    const pageToMoveTo: TBusinessPlanParentPageType =
      getData().pageState.parentPageType === 'FF' ? 'STF' : 'FF'

    const title =
      getTileData().title ||
      getRecordOfBusinessPlanTileTypeToDefaultTileTitle({ diResolver })[
        getTileData().tileType
      ]

    const memoizedTitleFormValues = useMemo(() => {
      return {
        title,
      }
    }, [title])

    const listCollectionForGoalOptionsMenu =
      renderMenuOptions?.goalOptions?.getListCollection()
    const memoizedListCollectionGoalMenuOptions = useMemo(() => {
      return {
        showOwner: !!listCollectionForGoalOptionsMenu?.showOwner,
        showNumberedList: !!listCollectionForGoalOptionsMenu?.isNumberedList,
      }
    }, [
      listCollectionForGoalOptionsMenu?.showOwner,
      listCollectionForGoalOptionsMenu?.isNumberedList,
    ])

    const getIsEditingDisabledForMenuItems = useComputed(
      () => {
        if (getIsEditingDisabledForMenuItemsInHeader) {
          return getIsEditingDisabledForMenuItemsInHeader()
        } else {
          return getIsEditingDisabled()
        }
      },
      { name: 'businessPlanTileHeader_getIsEditingDisabledForMenuItems' }
    )

    const onHandleClickOutsideTitle = useAction(() => {
      componentState.isEditingTitle = false
    })

    const setBusinessPlanHeaderEl = useAction((el: Maybe<HTMLDivElement>) => {
      componentState.businessPlanHeaderEl = el
    })

    const onHandleSetIsEditingTitle = useAction(() => {
      componentState.isEditingTitle = true
    })

    return (
      <Card.Header
        ref={setBusinessPlanHeaderEl}
        className={className}
        css={css`
          padding: 0 ${theme.sizes.spacing8};
          background-color: ${theme.colors
            .businessPlanHeaderCardBackgroundColor};
          position: sticky;
          top: 0;
          z-index: 1;

          @media print {
            background-color: ${theme.colors
              .businessPlanHeaderCardBackgroundColor} !important;

            /* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
            -webkit-print-color-adjust: exact;
            /* stylelint-enable value-no-vendor-prefix, property-no-vendor-prefix */
          }

          ${getData().pageState.renderPDFStyles &&
          css`
            background-color: ${theme.colors
              .businessPlanHeaderCardBackgroundColor} !important;

            /* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
            -webkit-print-color-adjust: exact;
            /* stylelint-enable value-no-vendor-prefix, property-no-vendor-prefix */
          `}
        `}
        renderLeft={
          <EditForm
            isLoading={getData().isLoadingFirstSubscription}
            disabled={getIsEditingDisabled()}
            values={memoizedTitleFormValues as { title: string }}
            validation={
              {
                title: formValidators.string({
                  additionalRules: [
                    required(),
                    maxLength({
                      maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
                    }),
                  ],
                }),
              } satisfies GetParentFormValidation<{ title: string }>
            }
            sendDiffs={false}
            onSubmit={async (values) => {
              await getActions().onHandleRenameTile({
                title: values.title,
                tileId: getTileData().id,
              })
            }}
          >
            {({ fieldNames }) => (
              <div
                ref={headerTitleRef}
                css={css`
                  max-width: calc(
                    100% -
                      ${getTileData().tileType === 'ISSUES'
                        ? toREM(200)
                        : toREM(48)}
                  );
                  display: inline-flex;
                  align-items: center;
                `}
              >
                <TextInputSmall
                  name={fieldNames.title}
                  id={`bpCardTileTitleField`}
                  outsideClickProps={{
                    clickOutsideRef: headerTitleRef,
                    onClickOutside: () => onHandleClickOutsideTitle(),
                  }}
                  editModeStylesIntention='tertiary'
                  height={toREM(26)}
                  textStyles={{
                    type: isPdfPreview ? 'h4' : 'h3',
                    weight: 'semibold',
                  }}
                  isEditing={componentState.isEditingTitle}
                  width={'fit-content'}
                  interiorPadding={0}
                  onFocus={onHandleSetIsEditingTitle}
                  css={css`
                    max-height: ${toREM(26)};
                    max-width: 100%;
                  `}
                />
              </div>
            )}
          </EditForm>
        }
        renderRight={
          getIsEditingDisabledForMenuItems() ||
          !renderMenuOptions ? undefined : (
            <div
              css={css`
                display: inline-flex;
              `}
            >
              {renderIssueColumnMenu && (
                <Menu
                  maxWidth={toREM(330)}
                  content={(close) => (
                    <>
                      <Menu.Item
                        onClick={(e) => {
                          getActions().onHandleUpdateIssueListColumnSize(
                            EBusinessPlanIssueListColumnSize.One
                          )
                          close(e)
                        }}
                      >
                        <Text type={'body'}>{t('One column')}</Text>
                      </Menu.Item>
                      <Menu.Item
                        onClick={(e) => {
                          getActions().onHandleUpdateIssueListColumnSize(
                            EBusinessPlanIssueListColumnSize.Two
                          )
                          close(e)
                        }}
                      >
                        <Text type={'body'}>{t('Two columns')}</Text>
                      </Menu.Item>
                      <Menu.Item
                        onClick={(e) => {
                          getActions().onHandleUpdateIssueListColumnSize(
                            EBusinessPlanIssueListColumnSize.Three
                          )
                          close(e)
                        }}
                      >
                        <Text type={'body'}>{t('Three columns')}</Text>
                      </Menu.Item>
                      <Menu.Item
                        onClick={(e) => {
                          getActions().onHandleUpdateIssueListColumnSize(
                            EBusinessPlanIssueListColumnSize.Four
                          )
                          close(e)
                        }}
                      >
                        <Text type={'body'}>{t('Four columns')}</Text>
                      </Menu.Item>
                    </>
                  )}
                >
                  {({ isOpen }) => {
                    return (
                      <div
                        data-html2canvas-ignore
                        className={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
                        css={css`
                          align-items: center;
                          display: inline-flex;
                          cursor: pointer;
                          flex: row nowrap;
                          margin-right: ${theme.sizes.spacing16};
                        `}
                      >
                        <Icon
                          iconName='columnIcon'
                          iconSize='md2'
                          css={css`
                            margin-right: ${theme.sizes.spacing4};
                          `}
                        />
                        {getResponsiveSize() === 'LARGE' && (
                          <TextEllipsis
                            lineLimit={1}
                            type='body'
                            weight='semibold'
                            color={{
                              color:
                                theme.colors
                                  .businessPlanIssueColumnSelectedItemMenuText,
                            }}
                            css={css`
                              text-align: left;
                              margin-right: ${theme.sizes.spacing4};
                            `}
                          >
                            {
                              getRecordOfIssueColumnsToSelectedItemText()[
                                getData().pageState.issueListColumnSize
                              ]
                            }
                          </TextEllipsis>
                        )}
                        <Icon
                          iconName={
                            isOpen ? 'chevronUpIcon' : 'chevronDownIcon'
                          }
                          iconSize='lg'
                        />
                      </div>
                    )
                  }}
                </Menu>
              )}
              {renderScrollOverflowIndicator &&
                !getIsEditingDisabled() &&
                getData().pageState.renderPDFPreview &&
                isPdfPreview && (
                  <div
                    data-html2canvas-ignore
                    css={css`
                      margin-right: ${theme.sizes.spacing8};

                      @media print {
                        display: none;
                      }
                    `}
                  >
                    <Tooltip
                      msg={t('Resize this tile to avoid scroll')}
                      position={'top center'}
                      maxWidth={260}
                    >
                      <span data-html2canvas-ignore>
                        <Icon
                          iconName={'warningIcon'}
                          iconSize={'lg'}
                          iconColor={{
                            color:
                              theme.colors.businessPlanScrollWarningIconColor,
                          }}
                        />
                      </span>
                    </Tooltip>
                  </div>
                )}
              {!getData().pageState.renderPDFStyles && (
                <Menu
                  position='bottom right'
                  content={(close) => (
                    <>
                      {renderMenuOptions.move && (
                        <Menu.Item
                          onClick={(e) => {
                            getActions().onHandleMoveTileToOtherPage({
                              tileId: getTileData().id,
                              newParentPageType: pageToMoveTo,
                              isCoreValuesTile:
                                getTileData().tileType === 'CORE_VALUES',
                            })
                            close(e)
                          }}
                        >
                          <div
                            css={css`
                              display: flex;
                              justify-content: flex-start;
                              align-items: center;
                            `}
                          >
                            <Text type={'body'}>
                              {t('Move section to other page')}
                            </Text>
                          </div>
                        </Menu.Item>
                      )}
                      {renderMenuOptions.duplicate && (
                        <Menu.Item
                          onClick={(e) => {
                            getActions().onHandleDuplicateTile(getTileData().id)
                            close(e)
                          }}
                        >
                          <div
                            css={css`
                              display: flex;
                              justify-content: flex-start;
                              align-items: center;
                            `}
                          >
                            <Text type={'body'}>{t('Duplicate tile')}</Text>
                          </div>
                        </Menu.Item>
                      )}
                      {renderMenuOptions.hide && (
                        <Menu.Item
                          disabled={
                            getTileData().tileType === 'CORE_VALUES' &&
                            getData().businessPlan?.isMainOrgBusinessPlan({
                              v3BusinessPlanId: getData().v3BusinessPlanId,
                            })
                          }
                          tooltip={
                            getTileData().tileType === 'CORE_VALUES' &&
                            getData().businessPlan?.isMainOrgBusinessPlan({
                              v3BusinessPlanId: getData().v3BusinessPlanId,
                            })
                              ? {
                                  msg: t('Cannot hide main plan {{cv}}', {
                                    cv: terms.coreValues.plural,
                                  }),
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            getActions().onHandleHideTile({
                              tileId: getTileData().id,
                              tileType: getTileData().tileType,
                            })
                            close(e)
                          }}
                        >
                          <div
                            css={css`
                              display: flex;
                              justify-content: flex-start;
                              align-items: center;
                            `}
                          >
                            <Text type={'body'}>{t('Hide tile')}</Text>
                          </div>
                        </Menu.Item>
                      )}
                      {renderMenuOptions.goalOptions &&
                        renderMenuOptions.goalOptions.getListCollection() && (
                          <>
                            <Menu.Divider />
                            <Menu.Item tag={'div'}>
                              <div
                                css={css`
                                  display: flex;
                                  justify-content: flex-start;
                                  align-items: center;
                                `}
                              >
                                <Text type={'body'} weight='semibold'>
                                  {t('{{goal}} options', {
                                    goal: renderMenuOptions.goalOptions
                                      .goalCustomTerm,
                                  })}
                                </Text>
                              </div>
                            </Menu.Item>

                            <EditForm
                              isLoading={getData().isLoadingFirstSubscription}
                              values={
                                memoizedListCollectionGoalMenuOptions as {
                                  showOwner: boolean
                                  showNumberedList: boolean
                                }
                              }
                              disabled={getIsEditingDisabled()}
                              validation={
                                {
                                  showOwner: formValidators.boolean({
                                    additionalRules: [required()],
                                  }),
                                  showNumberedList: formValidators.boolean({
                                    additionalRules: [required()],
                                  }),
                                } satisfies GetParentFormValidation<{
                                  showOwner: boolean
                                  showNumberedList: boolean
                                }>
                              }
                              onSubmit={async (values) => {
                                const listCollectionId =
                                  renderMenuOptions.goalOptions?.getListCollection()
                                    ?.id

                                if (!listCollectionId) {
                                  return
                                }

                                await getActions().onHandleEditBusinessPlanGoalOptionsMenuItems(
                                  {
                                    listCollectionId,
                                    values,
                                  }
                                )
                              }}
                            >
                              {({ values, fieldNames, onFieldChange }) => {
                                return (
                                  <>
                                    {renderMenuOptions.goalOptions
                                      ?.showNumberedList && (
                                      <Menu.Item>
                                        <div
                                          css={css`
                                            display: flex;
                                            justify-content: flex-start;
                                            align-items: center;
                                          `}
                                        >
                                          <SwitchInput
                                            id={`goalOptionsMenu_listCollections_showNumberedList`}
                                            name={fieldNames.showNumberedList}
                                            size={'default'}
                                            disabled={getIsEditingDisabled()}
                                            text={t('Numbered list')}
                                            value={!!values?.showNumberedList}
                                            onChange={(value) =>
                                              onFieldChange(
                                                fieldNames.showNumberedList,
                                                value
                                              )
                                            }
                                          />
                                        </div>
                                      </Menu.Item>
                                    )}
                                    {renderMenuOptions.goalOptions
                                      ?.showOwner && (
                                      <Menu.Item>
                                        <div
                                          css={css`
                                            display: flex;
                                            justify-content: flex-start;
                                            align-items: center;
                                          `}
                                        >
                                          <SwitchInput
                                            id={`goalOptionsMenu_listCollections_showOwner`}
                                            name={fieldNames.showOwner}
                                            disabled={getIsEditingDisabled()}
                                            size={'default'}
                                            text={t('Owner/Who')}
                                            value={!!values?.showOwner}
                                            onChange={(value) =>
                                              onFieldChange(
                                                fieldNames.showOwner,
                                                value
                                              )
                                            }
                                          />
                                        </div>
                                      </Menu.Item>
                                    )}
                                  </>
                                )
                              }}
                            </EditForm>
                          </>
                        )}
                    </>
                  )}
                >
                  <BtnIcon
                    className={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
                    intent='naked'
                    size='lg'
                    iconProps={{
                      iconName: 'moreVerticalIcon',
                    }}
                    ariaLabel={t('more options')}
                    tag={'span'}
                  />
                </Menu>
              )}
            </div>
          )
        }
      />
    )
  }
)
