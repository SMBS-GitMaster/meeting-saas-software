import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
} from '@mm/core/forms'

import { EMeetingPageType, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Breadcrumb,
  Card,
  Clickable,
  FastList,
  Icon,
  Menu,
  QuickAddTextInput,
  Text,
  TextEllipsis,
  useRenderListItem,
  useResizeObserver,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import {
  BloomPageEmptyState,
  BloomPageEmptyStateTooltipProvider,
  getEmptyStateData,
} from '@mm/bloom-web/shared/components/bloomPageEmptyState'
import { SortBy } from '@mm/bloom-web/shared/components/sortBy'

import { HeadlinesListHeadlineEntry } from './headlinesListHeadlineEntry'
import {
  IHeadlinesListHeadlineData,
  IHeadlinesListViewProps,
  headlinesListSortingOptions,
} from './headlinesListTypes'

export const HeadlinesListView = observer(function HeadlinesListView(
  props: IHeadlinesListViewProps
) {
  const componentState = useObservable({
    headlineListEl: null as Maybe<HTMLDivElement>,
  })

  const terms = useBloomCustomTerms()
  const { fullScreenTile, minimizeTile } =
    useWorkspaceFullScreenTileController()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const observableResizeState = useResizeObserver(componentState.headlineListEl)

  const EMPTYSTATE_DATA = getEmptyStateData(terms)

  const { getData, getActions } = props

  const isWorkSpaceView = getData().pageType === 'WORKSPACE'

  const getResponsieSize = useComputed(
    () => {
      if (!observableResizeState.ready) return 'UNKNOWN'
      if (observableResizeState.width <= 400) return 'SMALL'
      if (observableResizeState.width <= 800) return 'MEDIUM'
      return 'LARGE'
    },
    { name: 'headlineListView-responsiveSize' }
  )

  const setHeadlinesListEl = useAction((el: Maybe<HTMLDivElement>) => {
    componentState.headlineListEl = el
  })

  const renderHeadlineListItem = useRenderListItem<IHeadlinesListHeadlineData>(
    (headline) => (
      <HeadlinesListHeadlineEntry
        key={headline.id}
        headline={headline}
        getData={getData}
        getActions={getActions}
        canCreateIssuesInMeeting={
          getData().getCurrentUserPermissions().canCreateIssuesInMeeting
        }
        canCreateTodosInMeeting={
          getData().getCurrentUserPermissions().canCreateTodosInMeeting
        }
        canEditHeadlinesInMeeting={
          getData().getCurrentUserPermissions().canEditHeadlinesInMeeting
        }
        responsiveSize={getResponsieSize()}
      />
    )
  )

  return (
    <>
      <Card ref={setHeadlinesListEl} className={props.className}>
        <Card.Header
          renderLeft={
            <div
              css={css`
                align-content: center;
                display: flex;
              `}
            >
              {!isWorkSpaceView ? (
                <Breadcrumb
                  fontType='h3'
                  steps={getData().getBreadcrumbs()}
                  showInProgressIndicator={false}
                  onBack={() => {
                    // NO-OP
                    return
                  }}
                />
              ) : (
                <TextEllipsis type='h3' lineLimit={1} wordBreak={true}>
                  {`${terms.headline.plural}: ${getData().meetingName}`}
                </TextEllipsis>
              )}
            </div>
          }
          renderRight={
            <div
              css={css`
                align-items: center;
                display: flex;
                margin-left: ${({ theme }) => theme.sizes.spacing12};
              `}
            >
              <SortBy
                sortingOptions={headlinesListSortingOptions}
                selected={getData().pageState.sortBy}
                showOnlyIcon={getResponsieSize() !== 'LARGE'}
                onChange={getActions().onSelectSorting}
              />
              <Menu
                content={(close) => (
                  <>
                    {isWorkSpaceView && (
                      <>
                        <Menu.Item
                          disabled={
                            !getData().getCurrentUserPermissions()
                              .canCreateHeadlinesInMeeting.allowed
                          }
                          tooltip={
                            !getData().getCurrentUserPermissions()
                              .canCreateHeadlinesInMeeting.allowed
                              ? {
                                  msg: (
                                    getData().getCurrentUserPermissions()
                                      .canCreateHeadlinesInMeeting as {
                                      allowed: false
                                      message: string
                                    }
                                  ).message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            openOverlazy('CreateHeadlineDrawer', {
                              meetingId: getData().meetingId,
                            })
                          }}
                        >
                          <Text type={'body'}>
                            {t('Create {{headline}}', {
                              headline: terms.headline.lowercaseSingular,
                            })}
                          </Text>
                        </Menu.Item>
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            const workspaceTileId = getData().workspaceTileId
                            if (workspaceTileId) {
                              fullScreenTile(workspaceTileId)
                            }
                          }}
                        >
                          <Text type={'body'}>{t('View in full screen')}</Text>
                        </Menu.Item>
                        {getData().workspaceType === 'PERSONAL' && (
                          <Menu.Item
                            onClick={(e) => {
                              close(e)
                              getActions().onDeleteTile()
                            }}
                          >
                            <Text type={'body'}>{t('Delete tile')}</Text>
                          </Menu.Item>
                        )}
                      </>
                    )}
                    {!isWorkSpaceView && (
                      <>
                        <Menu.Item
                          disabled={
                            !getData().getCurrentUserPermissions()
                              .canEditHeadlinesInMeeting.allowed
                          }
                          tooltip={
                            !getData().getCurrentUserPermissions()
                              .canEditHeadlinesInMeeting.allowed
                              ? {
                                  msg: (
                                    getData().getCurrentUserPermissions()
                                      .canEditHeadlinesInMeeting as {
                                      allowed: false
                                      message: string
                                    }
                                  ).message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            getActions().onPrint()
                          }}
                        >
                          <Text type={'body'}>{t('Print')}</Text>
                        </Menu.Item>
                        <Menu.Item
                          disabled={
                            !getData().getCurrentUserPermissions()
                              .canCreateHeadlinesInMeeting.allowed
                          }
                          tooltip={
                            !getData().getCurrentUserPermissions()
                              .canCreateHeadlinesInMeeting.allowed
                              ? {
                                  msg: (
                                    getData().getCurrentUserPermissions()
                                      .canCreateHeadlinesInMeeting as {
                                      allowed: false
                                      message: string
                                    }
                                  ).message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            getActions().onUpload()
                          }}
                        >
                          <Text type={'body'}>{t('Upload')}</Text>
                        </Menu.Item>
                        {/* <Menu.Item
                          disabled={!canEditHeadlinesInMeeting.allowed}
                          tooltip={
                            !canEditHeadlinesInMeeting.allowed
                              ? {
                                  msg: canEditHeadlinesInMeeting.message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            getActions().onExport()
                          }}
                        >
                          <Text type={'body'}>{t('Export')}</Text>
                        </Menu.Item> */}
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            getActions().onOpenV1ArchiveViewInNewTab()
                          }}
                        >
                          <Text type={'body'}>
                            {t('Archived {{headline}}', {
                              headline: terms.headline.lowercasePlural,
                            })}
                          </Text>
                        </Menu.Item>
                      </>
                    )}
                  </>
                )}
              >
                <span>
                  <Clickable clicked={() => null}>
                    <Icon iconName='moreVerticalIcon' iconSize='lg' />
                  </Clickable>
                </span>
              </Menu>
              {getData().isExpandedOnWorkspacePage && (
                <Clickable clicked={() => minimizeTile()}>
                  <Icon
                    iconName='closeIcon'
                    iconSize='lg'
                    css={css`
                      margin-left: ${(prop) => prop.theme.sizes.spacing8};
                    `}
                  />
                </Clickable>
              )}
            </div>
          }
        >
          <CreateForm
            isLoading={false}
            values={{
              quickAddHeadlineTitle: '',
            }}
            validation={
              {
                quickAddHeadlineTitle: formValidators.string({
                  additionalRules: [
                    maxLength({
                      maxLength: MEETING_TITLES_CHAR_LIMIT,
                      customErrorMsg: t(
                        `Can't exceed {{maxLength}} characters`,
                        {
                          maxLength: MEETING_TITLES_CHAR_LIMIT,
                        }
                      ),
                    }),
                  ],
                }),
              } satisfies GetParentFormValidation<{
                quickAddHeadlineTitle: string
              }>
            }
            onSubmit={async (values) => {
              getActions().onQuickAddValueEnter(values.quickAddHeadlineTitle)
            }}
          >
            {({ fieldNames, hasError, onSubmit, onFieldChange }) => {
              return (
                <Card.SubHeader>
                  <BloomPageEmptyStateTooltipProvider emptyStateId='quickCreation'>
                    {(tooltipProps) => (
                      <QuickAddTextInput
                        enableValidationOnFocus
                        disabled={
                          !getData().getCurrentUserPermissions()
                            .canCreateHeadlinesInMeeting.allowed
                        }
                        tooltip={
                          !getData().getCurrentUserPermissions()
                            .canCreateHeadlinesInMeeting.allowed
                            ? {
                                msg: (
                                  getData().getCurrentUserPermissions()
                                    .canCreateHeadlinesInMeeting as {
                                    allowed: false
                                    message: string
                                  }
                                ).message,
                                position: 'top center',
                              }
                            : tooltipProps
                        }
                        id='headlines-list-view-quick-add-input'
                        placeholder={
                          getResponsieSize() === 'SMALL'
                            ? t('Quick {{headline}}', {
                                headline: terms.headline.lowercaseSingular,
                              })
                            : t('Create a quick {{headline}}', {
                                headline: terms.headline.lowercaseSingular,
                              })
                        }
                        name={fieldNames.quickAddHeadlineTitle}
                        onEnter={() => {
                          if (hasError) return
                          onSubmit()
                          onFieldChange('quickAddHeadlineTitle', '')
                        }}
                        instructions={
                          <>
                            {t('Press ')}
                            <strong>{t('enter ')}</strong>
                            {t('to add new {{headline}}', {
                              headline: terms.headline.lowercaseSingular,
                            })}
                          </>
                        }
                        isHover={tooltipProps?.isHover}
                      />
                    )}
                  </BloomPageEmptyStateTooltipProvider>
                </Card.SubHeader>
              )
            }}
          </CreateForm>
        </Card.Header>
        <Card.Body>
          {observableResizeState.loadingUI}
          {getResponsieSize() !== 'UNKNOWN' && (
            <FastList
              items={getData().headlines}
              memoizedRenderListItem={renderHeadlineListItem}
            />
          )}
          <BloomPageEmptyState
            show={!getData().headlines.length}
            emptyState={
              isWorkSpaceView
                ? EMPTYSTATE_DATA[EMeetingPageType.Headlines] || undefined
                : undefined
            }
            fillParentContainer={isWorkSpaceView}
          />
        </Card.Body>
      </Card>
    </>
  )
})
