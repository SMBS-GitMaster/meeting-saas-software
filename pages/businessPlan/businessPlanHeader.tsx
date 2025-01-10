import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css, useTheme } from 'styled-components'

import { formatWithZerosUserLocale, getSimpleTimeDisplay } from '@mm/core/date'
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
  BtnText,
  CheckBoxInput,
  Clickable,
  Icon,
  Menu,
  SearchInput,
  SwitchInputCustomOptions,
  Text,
  TextEllipsis,
  TextInputSmall,
  toREM,
  useResizeObserver,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { HEADER_HEIGHT } from '../layout/consts'
import { BloomHeader } from '../layout/header/bloomHeader'
import { useAction, useComputed, useObservable } from '../performance/mobx'
import {
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
  TBusinessPlanMode,
} from './businessPlanTypes'
import {
  BLOOM_BUSINESS_PLAN_SUB_HEADER_HEIGHT,
  BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
  BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS,
  TOTAL_COUNT_TO_SHOW_SEARCH_BP_LISTS,
} from './constants'
import {
  getParentPageTypesLookup,
  getRecordOfBusinessPlanTileTypeToDefaultTileTitle,
} from './lookups'

interface IBusinessPlanHeaderProps {
  getData: () => Pick<
    IBusinessPlanViewData,
    | 'businessPlan'
    | 'getCurrentUserBusinessPlansAndSharedOrgPlans'
    | 'getCurrentUserPermissions'
    | 'getHiddenTiles'
    | 'getTotalCountOfAllBusinessPlans'
    | 'isLoadingFirstSubscription'
    | 'mainOrgBusinessPlan'
    | 'pageState'
    | 'v3BusinessPlanId'
  >
  getActions: () => Pick<
    IBusinessPlanViewActions,
    | 'onHandleNavigateToBusinessPlan'
    | 'onHandleEnterPDFPreview'
    | 'onHandleRestoreHiddenTile'
    | 'onHandleSaveBusinessPlanTitle'
    | 'onHandleSetBusinessPlanMode'
    | 'onHandleShareBusinessPlan'
    | 'onHandleSetCurrentParentPage'
    | 'onHandleSetSearchTermForSharedAndUnsharedPlans'
  >
}

interface IPresentationModeSwitchProps {
  getData: () => Pick<IBusinessPlanViewData, 'pageState'>
  getActions: () => Pick<
    IBusinessPlanViewActions,
    'onHandleSetBusinessPlanMode'
  >
}

interface IStickyBusinessPlanTabProps {
  activeTab: TBusinessPlanParentPageType
  tabs: Array<{
    text: string
    value: TBusinessPlanParentPageType
  }>
  getResponsiveSize: () => 'UNKNOWN' | 'XSMALL' | 'SMALL' | 'LARGE'
  onChange: (tab: TBusinessPlanParentPageType) => void
}

export const BusinessPlanHeader = observer(
  (props: IBusinessPlanHeaderProps) => {
    const componentState = useObservable({
      businessPlanHeaderEl: null as Maybe<HTMLDivElement>,
      isEditingTitle: false,
    })

    const diResolver = useDIResolver()
    const headerTitleRef = React.createRef<HTMLDivElement>()
    const observableResizeState = useResizeObserver(
      componentState.businessPlanHeaderEl
    )
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const { getData, getActions } = props

    const getResponsiveSize = useComputed(
      () => {
        if (!observableResizeState.ready) return 'UNKNOWN'
        if (observableResizeState.width < 400) return 'XSMALL'
        if (observableResizeState.width < 950) return 'SMALL'
        return 'LARGE'
      },
      { name: 'businessPlanHeader_getResponsiveSize()' }
    )

    const title = getData().businessPlan?.title
    const memoizedTitleFormValues = useMemo(() => {
      return {
        title,
      }
    }, [title])

    const isShared = !!getData().businessPlan?.isShared
    const memoizedIsSharedFormValues = useMemo(() => {
      return {
        isShared,
      }
    }, [isShared])

    const setBusinessPlanHeaderEl = useAction((el: Maybe<HTMLDivElement>) => {
      componentState.businessPlanHeaderEl = el
    })

    const onHandleClickOutsideTitle = useAction(() => {
      componentState.isEditingTitle = false
    })

    const onHandleClearSearchTerm = useAction(() => {
      getActions().onHandleSetSearchTermForSharedAndUnsharedPlans('')
    })

    const onHandleSetIsEditingTitle = useAction(() => {
      componentState.isEditingTitle = true
    })

    return (
      <>
        <BloomHeader
          ref={setBusinessPlanHeaderEl}
          universalAddClassName={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
          css={css`
            @media print {
              .bloomHeader_title_class {
                width: 100%;
              }
            }
          `}
          title={
            <>
              {getData().businessPlan && (
                <div
                  css={css`
                    display: inline-flex;
                    align-items: center;
                    max-width: 100%;
                  `}
                >
                  <EditForm
                    isLoading={getData().isLoadingFirstSubscription}
                    disabled={
                      getData().pageState.businessPlanMode !== 'EDIT' ||
                      !getData().getCurrentUserPermissions().canEditBusinessPlan
                        .allowed
                    }
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
                      const businessPlanId = getData().businessPlan?.id
                      if (!businessPlanId) return

                      await getActions().onHandleSaveBusinessPlanTitle({
                        title: values.title,

                        businessPlanId,
                      })
                    }}
                  >
                    {({ fieldNames }) => (
                      <div
                        ref={headerTitleRef}
                        css={css`
                          max-width: 100%;
                          display: inline-flex;
                          align-items: center;
                        `}
                      >
                        <TextInputSmall
                          name={fieldNames.title}
                          id={`bpTitleField_${getData().businessPlan?.id}`}
                          outsideClickProps={{
                            clickOutsideRef: headerTitleRef,
                            onClickOutside: () => onHandleClickOutsideTitle(),
                          }}
                          editModeStylesIntention='secondary'
                          height={toREM(32)}
                          textStyles={{ type: 'h2', weight: 'semibold' }}
                          isEditing={componentState.isEditingTitle}
                          onFocus={onHandleSetIsEditingTitle}
                          width={'fit-content'}
                          interiorPadding={0}
                          css={css`
                            max-width: 100%;
                            max-height: ${toREM(34)};

                            .contentEditable {
                              position: relative;
                              z-index: ${(props) =>
                                props.theme.zIndices.topNav};
                            }
                          `}
                        />
                      </div>
                    )}
                  </EditForm>
                  <Menu
                    position='bottom left'
                    css={css`
                      overflow-y: auto;
                      max-height: ${toREM(500)};
                    `}
                    minWidthRems={21}
                    onClose={onHandleClearSearchTerm}
                    content={(close) => (
                      <>
                        {getData().getTotalCountOfAllBusinessPlans() >=
                          TOTAL_COUNT_TO_SHOW_SEARCH_BP_LISTS && (
                          <Menu.Item
                            tag={'div'}
                            onClick={() => {
                              null
                            }}
                            css={css`
                              padding: ${theme.sizes.spacing8};
                            `}
                          >
                            <SearchInput
                              id={'searchInput_bpListsMenu'}
                              name={'searchInput_bpListsMenu'}
                              width={'100%'}
                              placeholder={t('Search by plan title')}
                              onSearch={
                                getActions()
                                  .onHandleSetSearchTermForSharedAndUnsharedPlans
                              }
                            />
                          </Menu.Item>
                        )}
                        {getData().mainOrgBusinessPlan &&
                          getData().v3BusinessPlanId && (
                            <>
                              <Menu.Item
                                isSectionHeader={true}
                                onClick={() => {
                                  null
                                }}
                              >
                                <TextEllipsis
                                  lineLimit={1}
                                  type={'body'}
                                  weight={'semibold'}
                                >
                                  {t('Org {{bp}}', {
                                    bp: terms.businessPlan.lowercaseSingular,
                                  })}
                                </TextEllipsis>
                              </Menu.Item>

                              <Menu.Item
                                onClick={(e) => {
                                  const businessPlanId =
                                    getData().mainOrgBusinessPlan?.id
                                  if (!businessPlanId) return

                                  getActions().onHandleNavigateToBusinessPlan({
                                    businessPlanId,
                                  })
                                  close(e)
                                }}
                              >
                                <div
                                  css={css`
                                    display: flex;
                                    align-items: center;
                                    justify-content: flex-start;
                                  `}
                                >
                                  <TextEllipsis
                                    lineLimit={1}
                                    type={'body'}
                                    css={css`
                                      text-align: start;
                                    `}
                                  >
                                    {getData().mainOrgBusinessPlan?.title}
                                  </TextEllipsis>
                                </div>
                              </Menu.Item>
                            </>
                          )}
                        {getData().getCurrentUserBusinessPlansAndSharedOrgPlans()
                          .currentUsersBusinessPlans.length > 0 && (
                          <>
                            <Menu.Item
                              isSectionHeader={true}
                              onClick={() => {
                                null
                              }}
                            >
                              <TextEllipsis
                                lineLimit={2}
                                type={'body'}
                                css={css`
                                  text-align: left;
                                `}
                              >
                                <Text type={'body'} weight={'semibold'}>
                                  {getData().getCurrentUserBusinessPlansAndSharedOrgPlans()
                                    .currentUsersBusinessPlans.length === 1
                                    ? t('Your plan')
                                    : t('Your plans')}
                                </Text>{' '}
                                <Text
                                  type={'body'}
                                  weight={'normal'}
                                  fontStyle='italic'
                                >
                                  {getData().getCurrentUserPermissions()
                                    .isOrgAdmin
                                    ? t('(meetings you attend or administrate)')
                                    : t('(meetings you attend)')}
                                </Text>
                              </TextEllipsis>
                            </Menu.Item>
                            {getData()
                              .getCurrentUserBusinessPlansAndSharedOrgPlans()
                              .currentUsersBusinessPlans.map((businessPlan) => {
                                return (
                                  <Menu.Item
                                    key={businessPlan.id}
                                    onClick={(e) => {
                                      getActions().onHandleNavigateToBusinessPlan(
                                        {
                                          businessPlanId: businessPlan.id,
                                        }
                                      )
                                      close(e)
                                    }}
                                  >
                                    <div
                                      css={css`
                                        display: flex;
                                        align-items: center;
                                        justify-content: flex-start;
                                      `}
                                    >
                                      <TextEllipsis
                                        lineLimit={1}
                                        type={'body'}
                                        css={css`
                                          text-align: start;
                                        `}
                                      >
                                        {businessPlan.isShared && (
                                          <Icon
                                            iconName={'businessPlanShareIcon'}
                                            iconSize={'lg'}
                                            css={css`
                                              margin-right: ${theme.sizes
                                                .spacing4};
                                            `}
                                          />
                                        )}
                                        {businessPlan.title}
                                      </TextEllipsis>
                                    </div>
                                  </Menu.Item>
                                )
                              })}
                          </>
                        )}

                        {getData().getCurrentUserBusinessPlansAndSharedOrgPlans()
                          .sharedOrgPlans.length > 0 && (
                          <>
                            <Menu.Item
                              isSectionHeader={true}
                              onClick={() => {
                                null
                              }}
                            >
                              <TextEllipsis
                                lineLimit={1}
                                type={'body'}
                                css={css`
                                  text-align: left;
                                `}
                              >
                                <Text type={'body'} weight={'semibold'}>
                                  {getData().getCurrentUserBusinessPlansAndSharedOrgPlans()
                                    .sharedOrgPlans.length === 1
                                    ? t('Shared plan')
                                    : t('Shared plans')}
                                </Text>{' '}
                                <Text
                                  type={'body'}
                                  weight={'normal'}
                                  fontStyle='italic'
                                >
                                  {t('(by other departments)')}
                                </Text>
                              </TextEllipsis>
                            </Menu.Item>
                            {getData()
                              .getCurrentUserBusinessPlansAndSharedOrgPlans()
                              .sharedOrgPlans.map((businessPlan) => {
                                return (
                                  <Menu.Item
                                    key={businessPlan.id}
                                    onClick={(e) => {
                                      getActions().onHandleNavigateToBusinessPlan(
                                        {
                                          businessPlanId: businessPlan.id,
                                        }
                                      )
                                      close(e)
                                    }}
                                  >
                                    <div
                                      css={css`
                                        display: flex;
                                        align-items: center;
                                        justify-content: flex-start;
                                      `}
                                    >
                                      <TextEllipsis
                                        lineLimit={1}
                                        type={'body'}
                                        css={css`
                                          text-align: start;
                                        `}
                                      >
                                        {businessPlan.title}
                                      </TextEllipsis>
                                    </div>
                                  </Menu.Item>
                                )
                              })}
                          </>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            openOverlazy('CreateBusinessPlanModal', {})
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
                            <TextEllipsis
                              lineLimit={1}
                              type={'body'}
                              weight={'semibold'}
                              color={{
                                color:
                                  theme.colors
                                    .businessPlanAddABusinessPlanItemButtonColor,
                              }}
                              css={css`
                                display: flex;
                                align-items: center;
                              `}
                            >
                              <>
                                <Icon
                                  iconName={'plusIcon'}
                                  iconSize={'md'}
                                  iconColor={{
                                    color:
                                      theme.colors
                                        .businessPlanAddABusinessPlanItemButtonColor,
                                  }}
                                  css={css`
                                    margin-right: ${theme.sizes.spacing4};
                                  `}
                                />
                                {t('Add a {{bp}}', {
                                  bp: terms.businessPlan.singular,
                                })}
                              </>
                            </TextEllipsis>
                          </div>
                        </Menu.Item>
                      </>
                    )}
                  >
                    <BtnIcon
                      intent='naked'
                      size='lg'
                      className={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
                      iconProps={{
                        iconName: 'chevronDownIcon',
                      }}
                      ariaLabel={t('View {{bp}}', {
                        bp: terms.businessPlan.lowercasePlural,
                      })}
                      tag={'span'}
                    />
                  </Menu>
                </div>
              )}
            </>
          }
          middleSection={
            getData().businessPlan &&
            getData().getCurrentUserPermissions().canEditBusinessPlan.allowed &&
            getResponsiveSize() === 'LARGE' ? (
              <div
                className={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `}
              >
                <PresentationModeSwitch
                  getData={getData}
                  getActions={getActions}
                />
              </div>
            ) : undefined
          }
          rightSection={
            <>
              {getData().businessPlan && (
                <div
                  className={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
                  css={css`
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    margin-right: ${theme.sizes.spacing6};
                  `}
                >
                  {getResponsiveSize() === 'LARGE' &&
                    getData().getCurrentUserPermissions().canEditBusinessPlan
                      .allowed && (
                      <TextEllipsis
                        lineLimit={1}
                        type={'small'}
                        color={{ color: theme.colors.autosaveText }}
                        css={css`
                          margin-right: ${theme.sizes.spacing16};
                        `}
                      >
                        <Text type={'small'} color={{ color: 'unset' }}>
                          {t('Saved on')}
                        </Text>{' '}
                        <Text
                          type={'small'}
                          color={{ color: 'unset' }}
                          weight={'semibold'}
                        >
                          {formatWithZerosUserLocale({
                            secondsSinceEpochUTC:
                              getData().businessPlan?.dateLastModified || 0,
                          })}
                        </Text>{' '}
                        <Text type={'small'} color={{ color: 'unset' }}>
                          {t('at')}
                        </Text>{' '}
                        <Text
                          type={'small'}
                          color={{ color: 'unset' }}
                          weight={'semibold'}
                        >
                          {getSimpleTimeDisplay({
                            secondsSinceEpochUTC:
                              getData().businessPlan?.dateLastModified || 0,
                          })}
                        </Text>
                      </TextEllipsis>
                    )}

                  <Menu
                    position='bottom right'
                    minWidthRems={9}
                    content={(close) => (
                      <>
                        {getData().getCurrentUserPermissions()
                          .canEditBusinessPlan.allowed && (
                          <Menu.Item
                            onClick={(e) => {
                              close(e)
                              getActions().onHandleEnterPDFPreview()
                            }}
                          >
                            <div
                              css={css`
                                display: flex;
                                justify-content: flex-start;
                                align-items: center;
                              `}
                            >
                              <Icon
                                iconSize={'lg'}
                                iconName={'downloadIcon'}
                                css={css`
                                  margin-right: ${theme.sizes.spacing8};
                                `}
                              />
                              <Text type={'body'}>{t('PDF')}</Text>
                            </div>
                          </Menu.Item>
                        )}
                        {/*
                        // @BLOOM_TODO_BUSINESS_PLAN - not mvp 
                         <Menu.Item
                          onClick={(e) => {
                            getActions().onHandleDownloadPDF({
                              businessPlanId: getData().businessPlan?.id || '',
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
                            <Icon
                              iconSize={'lg'}
                              iconName={'downloadIcon'}
                              css={css`
                                margin-right: ${theme.sizes.spacing8};
                              `}
                            />
                            <Text type={'body'}>{t('Download PDF')}</Text>
                          </div>
                        </Menu.Item> */}

                        {getData().getCurrentUserPermissions()
                          .canEditBusinessPlan.allowed && (
                          <>
                            <Menu.Item
                              tag={'div'}
                              tooltip={
                                getData().getHiddenTiles().length === 0
                                  ? {
                                      msg: t('No tiles hidden'),
                                      position: 'top center',
                                    }
                                  : undefined
                              }
                              onClick={() => {
                                return null
                              }}
                              css={css`
                                border-top: ${theme.sizes.smallSolidBorder}
                                  ${theme.colors.menuBorderColor};
                              `}
                            >
                              <div
                                css={css`
                                  display: flex;
                                  justify-content: flex-start;
                                  align-items: center;
                                `}
                              >
                                <Text
                                  type={'body'}
                                  weight={'semibold'}
                                  color={
                                    getData().getHiddenTiles().length === 0
                                      ? {
                                          color:
                                            theme.colors.textPrimaryDisabled,
                                        }
                                      : undefined
                                  }
                                >
                                  {t('Restore hidden tiles')}
                                </Text>
                              </div>
                            </Menu.Item>

                            {getData()
                              .getHiddenTiles()
                              .map((hiddenTile) => {
                                return (
                                  <Menu.Item
                                    key={hiddenTile.id}
                                    onClick={(e) => {
                                      getActions().onHandleRestoreHiddenTile({
                                        tileId: hiddenTile.id,
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
                                      <TextEllipsis
                                        lineLimit={1}
                                        type={'body'}
                                        css={css`
                                          text-align: start;
                                        `}
                                      >
                                        {hiddenTile.title ||
                                          getRecordOfBusinessPlanTileTypeToDefaultTileTitle(
                                            { diResolver }
                                          )[hiddenTile.tileType]}
                                      </TextEllipsis>
                                    </div>
                                  </Menu.Item>
                                )
                              })}
                            {getData().getCurrentUserPermissions()
                              .canEditBusinessPlan.allowed && (
                              <Menu.Item
                                tag={'div'}
                                onClick={() => {
                                  return null
                                }}
                                tooltip={{
                                  msg: getData().businessPlan?.isMainOrgBusinessPlan(
                                    {
                                      v3BusinessPlanId:
                                        getData().v3BusinessPlanId,
                                    }
                                  )
                                    ? t('This plan is the main org plan')
                                    : !getData().getCurrentUserPermissions()
                                          .canEditBusinessPlan.allowed
                                      ? (
                                          getData().getCurrentUserPermissions()
                                            .canEditBusinessPlan as {
                                            allowed: false
                                            message: string
                                          }
                                        ).message
                                      : undefined,
                                  position: 'top center',
                                }}
                                css={css`
                                  align-items: flex-start;
                                  border-top: ${theme.sizes.smallSolidBorder}
                                    ${theme.colors.menuBorderColor};
                                `}
                              >
                                <div
                                  css={css`
                                    display: flex;
                                    justify-content: flex-start;
                                    flex-direction: column;
                                    align-items: flex-start;
                                    height: 100%;
                                  `}
                                >
                                  <EditForm
                                    isLoading={
                                      getData().isLoadingFirstSubscription
                                    }
                                    values={memoizedIsSharedFormValues}
                                    disabled={
                                      !getData().getCurrentUserPermissions()
                                        .canEditBusinessPlan.allowed ||
                                      getData().businessPlan?.isMainOrgBusinessPlan(
                                        {
                                          v3BusinessPlanId:
                                            getData().v3BusinessPlanId,
                                        }
                                      )
                                    }
                                    validation={
                                      {
                                        isShared: formValidators.boolean({
                                          additionalRules: [required()],
                                        }),
                                      } satisfies GetParentFormValidation<{
                                        isShared: boolean
                                      }>
                                    }
                                    sendDiffs={false}
                                    onSubmit={async (values) => {
                                      return await getActions().onHandleShareBusinessPlan(
                                        {
                                          businessPlanId:
                                            getData().businessPlan?.id || '',
                                          isShared: values.isShared,
                                        }
                                      )
                                    }}
                                  >
                                    {({ values, fieldNames }) => {
                                      if (!values) {
                                        return null
                                      }
                                      return (
                                        <>
                                          <CheckBoxInput
                                            id='shareBusinessPlan'
                                            name={fieldNames.isShared}
                                            text={
                                              <TextEllipsis
                                                type='body'
                                                weight={'semibold'}
                                                lineLimit={1}
                                                color={
                                                  getData().businessPlan?.isMainOrgBusinessPlan(
                                                    {
                                                      v3BusinessPlanId:
                                                        getData()
                                                          .v3BusinessPlanId,
                                                    }
                                                  )
                                                    ? {
                                                        color:
                                                          theme.colors
                                                            .textPrimaryDisabled,
                                                      }
                                                    : undefined
                                                }
                                              >
                                                {t('Share plan with org')}
                                              </TextEllipsis>
                                            }
                                            inputType='toggle'
                                          />
                                          {!values.isShared ? (
                                            <Text type={'body'}>
                                              {t(
                                                'Your plan is currently visible to meeting attendees and org admins. Sharing it will make it public to your entire organization.'
                                              )}
                                            </Text>
                                          ) : (
                                            <Text type={'body'}>
                                              {t(
                                                'Your plan is currently visible to your entire organization.'
                                              )}
                                            </Text>
                                          )}
                                        </>
                                      )
                                    }}
                                  </EditForm>
                                </div>
                              </Menu.Item>
                            )}
                            {getData().getCurrentUserPermissions()
                              .isOrgAdmin && (
                              <Menu.Item
                                onClick={(e) => {
                                  openOverlazy(
                                    'AdminBusinessPlanSettingsModal',
                                    {}
                                  )
                                  close(e)
                                }}
                                css={css`
                                  border-top: ${theme.sizes.smallSolidBorder}
                                    ${theme.colors.menuBorderColor};
                                `}
                              >
                                <div
                                  css={css`
                                    display: flex;
                                    justify-content: center;
                                    width: 100%;
                                  `}
                                >
                                  <TextEllipsis
                                    lineLimit={1}
                                    type={'body'}
                                    weight={'semibold'}
                                  >
                                    {t('Select Org {{bp}}', {
                                      bp: terms.businessPlan.singular,
                                    })}
                                  </TextEllipsis>
                                </div>
                              </Menu.Item>
                            )}
                          </>
                        )}
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
            </>
          }
          subHeader={
            getData().businessPlan &&
            getData().getCurrentUserPermissions().canEditBusinessPlan.allowed &&
            (getResponsiveSize() === 'SMALL' ||
              getResponsiveSize() === 'XSMALL')
              ? {
                  content: (
                    <div
                      className={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
                      css={css`
                        display: flex;
                        align-items: center;
                        justify-content: flex-start;
                        padding: 0 ${theme.sizes.spacing8};
                      `}
                    >
                      <PresentationModeSwitch
                        getData={getData}
                        getActions={getActions}
                      />
                    </div>
                  ),
                  adjustedTopNavTotalHeight:
                    BLOOM_BUSINESS_PLAN_SUB_HEADER_HEIGHT + HEADER_HEIGHT,
                }
              : undefined
          }
          defaultPropsForDrawers={{
            meetingId: getData().businessPlan?.meetingId || null,
          }}
        />
        {getData().businessPlan && (
          <StickyBusinessPlanResponsiveTabs
            tabs={getParentPageTypesLookup(diResolver)}
            activeTab={getData().pageState.parentPageType}
            getResponsiveSize={getResponsiveSize}
            onChange={(tab) =>
              getActions().onHandleSetCurrentParentPage(
                tab as TBusinessPlanParentPageType
              )
            }
          />
        )}
      </>
    )
  }
)

const StickyBusinessPlanResponsiveTabs = observer(
  (props: IStickyBusinessPlanTabProps) => {
    const theme = useTheme()
    const { t } = useTranslation()

    const { activeTab, tabs, getResponsiveSize, onChange } = props
    const activeTabText = tabs.find((tab) => tab.value === activeTab)?.text

    return (
      <div
        css={css`
          position: sticky;
          top: ${getResponsiveSize() === 'SMALL' ||
          getResponsiveSize() === 'XSMALL'
            ? BLOOM_BUSINESS_PLAN_SUB_HEADER_HEIGHT + HEADER_HEIGHT
            : HEADER_HEIGHT}px;
          z-index: ${(props) => props.theme.zIndices.topNavSubheaderContent};
          width: 100%;
          min-height: ${toREM(32)};
          background-color: ${(props) =>
            props.theme.colors.bodyBackgroundColor};
          padding: 0 ${(props) => props.theme.sizes.spacing24};
          display: flex;
          gap: ${({ theme }) => theme.sizes.spacing32};
          align-items: flex-end;

          .menu_button_business_plan_tabs {
            min-height: ${toREM(32)};

            &:hover,
            &:focus,
            &:focus-visible,
            &:active {
              border: none !important;
              text-decoration: none;
            }
          }
        `}
      >
        {getResponsiveSize() === 'LARGE' || getResponsiveSize() === 'SMALL' ? (
          <>
            {tabs.map((tab) => (
              <Clickable key={tab.value} clicked={() => onChange(tab.value)}>
                <div
                  data-html2canvas-ignore
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-end;
                    height: ${toREM(32)};

                    ${tab.value === activeTab
                      ? css`
                          border-bottom: ${({ theme }) =>
                              theme.sizes.smallSolidBorder}
                            ${({ theme }) =>
                              theme.colors.cardActiveTabBorderColor};
                        `
                      : css`
                          border-bottom: ${({ theme }) =>
                              theme.sizes.smallSolidBorder}
                            transparent;

                          @media print {
                            display: none;
                          }
                        `}
                  `}
                >
                  <TextEllipsis
                    lineLimit={1}
                    weight='semibold'
                    type='h3'
                    color={
                      tab.value !== activeTab
                        ? { color: theme.colors.cardInactiveTabTextColor }
                        : { color: theme.colors.bodyTextDefault }
                    }
                  >
                    {tab.text}
                  </TextEllipsis>
                </div>
              </Clickable>
            ))}
          </>
        ) : (
          <Menu
            position='bottom left'
            content={(close) => (
              <>
                {tabs.map((tab) => (
                  <Menu.Item
                    key={tab.value}
                    onClick={(e) => {
                      close(e)
                      onChange(tab.value)
                    }}
                  >
                    <Text type={'body'}>{tab.text}</Text>
                  </Menu.Item>
                ))}
              </>
            )}
          >
            <BtnText
              className={'menu_button_business_plan_tabs'}
              intent='tertiaryTransparent'
              ariaLabel={t('Open tab menu')}
              width={'noPadding'}
              onClick={() => null}
            >
              <Text
                weight='semibold'
                type='h3'
                color={{ color: theme.colors.bodyTextDefault }}
                css={css`
                  display: flex;
                  align-items: flex-end;
                  height: ${toREM(32)};

                  border-bottom: ${({ theme }) => theme.sizes.smallSolidBorder}
                    ${({ theme }) => theme.colors.cardActiveTabBorderColor};
                `}
              >
                {activeTabText || ''}
              </Text>
            </BtnText>
          </Menu>
        )}
      </div>
    )
  }
)

const PresentationModeSwitch = observer(
  (props: IPresentationModeSwitchProps) => {
    const theme = useTheme()
    const { t } = useTranslation()

    const { getData, getActions } = props

    return (
      <SwitchInputCustomOptions<TBusinessPlanMode>
        value={getData().pageState.businessPlanMode}
        name={'SwitchInputCustomOptionsBusinessPlan'}
        onChange={getActions().onHandleSetBusinessPlanMode}
        options={[
          {
            value: 'PRESENTATION',
            content: function renderContent() {
              return (
                <div
                  css={css`
                    padding: 0 ${theme.sizes.spacing16};
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                  `}
                >
                  <TextEllipsis
                    lineLimit={1}
                    weight={'semibold'}
                    type={'body'}
                    color={
                      getData().pageState.businessPlanMode === 'PRESENTATION'
                        ? { color: theme.colors.bodyTextDefault }
                        : {
                            color: theme.colors.topNavBarToggleTextInactive,
                          }
                    }
                  >
                    {t('Presentation mode')}
                  </TextEllipsis>
                </div>
              )
            },
          },
          {
            value: 'EDIT',
            content: function renderContent() {
              return (
                <div
                  css={css`
                    padding: 0 ${theme.sizes.spacing16};
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                  `}
                >
                  <TextEllipsis
                    lineLimit={1}
                    weight={'semibold'}
                    type={'body'}
                    color={
                      getData().pageState.businessPlanMode === 'EDIT'
                        ? { color: theme.colors.bodyTextDefault }
                        : {
                            color: theme.colors.topNavBarToggleTextInactive,
                          }
                    }
                  >
                    {t('Edit mode')}
                  </TextEllipsis>
                </div>
              )
            },
          },
        ]}
      />
    )
  }
)
