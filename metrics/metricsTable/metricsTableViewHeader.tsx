import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'
import { keys } from '@mm/core/typeHelpers'

import {
  type TWorkspaceType,
  getMetricEditPermissionsTooltipText,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Clickable,
  Icon,
  Menu,
  SwitchInput,
  Text,
  TextEllipsis,
  Tooltip, // toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import { BloomPageEmptyStateTooltipProvider } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateTooltipProvider'

import { RecordOfColumnMenuNameToDisplayValue } from './metricsTableConstants'
import {
  IMetricsTableViewActionHandlers,
  IMetricsTableViewData,
  TMetricsTableResponsiveSize,
} from './metricsTableTypes'

export interface IMetricsTableHeaderViewLeftProps {
  getData: () => {
    meeting: IMetricsTableViewData['meeting']
    meetingPageName: string
    metricsTableSelectedTab: IMetricsTableViewData['metricsTableSelectedTab']
    getCurrentUserPermissions: IMetricsTableViewData['getCurrentUserPermissions']
    pageType: IMetricsTableViewData['pageType']
  }
}

export const MetricsTableHeaderViewLeft = observer(
  (props: IMetricsTableHeaderViewLeftProps) => {
    const { getData } = props

    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const theme = useTheme()
    const { openOverlazy } = useOverlazyController()

    const canAddExistingMetricsToMeeting =
      getData().getCurrentUserPermissions().canAddExistingMetricsToMeeting

    return (
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        {getData().pageType === 'MEETING' ? (
          <TextEllipsis
            type='h3'
            lineLimit={1}
            wordBreak={true}
            weight={'semibold'}
            color={{ color: theme.colors.bodyTextDefault }}
            css={css`
              margin-right: ${theme.sizes.spacing8};
            `}
          >
            {getData().meetingPageName}
          </TextEllipsis>
        ) : (
          <TextEllipsis
            type='h3'
            weight='semibold'
            lineLimit={1}
            wordBreak={true}
            css={css`
              margin-right: ${theme.sizes.spacing8};
            `}
          >
            {`${t('{{metrics}}:', { metrics: terms.metric.plural })} ${
              getData().meeting.name
            }`}
          </TextEllipsis>
        )}

        <BloomPageEmptyStateTooltipProvider emptyStateId='pageTitlePlusIcon'>
          {(tooltipProps) => (
            <Menu
              position='top left'
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={(e) => {
                      openOverlazy('CreateMetricDrawer', {
                        meetingId: getData().meeting.id,
                        frequency: getData().metricsTableSelectedTab,
                      })
                      close(e)
                    }}
                  >
                    <Text type='body'>
                      {t('Create a new {{metric}}', {
                        metric: terms.metric.lowercaseSingular,
                      })}
                    </Text>
                  </Menu.Item>
                  <Menu.Item
                    disabled={!canAddExistingMetricsToMeeting.allowed}
                    tooltip={
                      !canAddExistingMetricsToMeeting.allowed
                        ? {
                            msg: canAddExistingMetricsToMeeting.message,
                            position: 'right center',
                          }
                        : undefined
                    }
                    onClick={(e) => {
                      openOverlazy('AddExistingMetricsModal', {
                        currentMeetingId: getData().meeting.id,
                      })
                      close(e)
                    }}
                  >
                    <Text type='body'>
                      {t('Add existing {{metrics}}', {
                        metrics: terms.metric.lowercasePlural,
                      })}
                    </Text>
                  </Menu.Item>
                </>
              )}
            >
              <BtnIcon
                intent='naked'
                size='lg'
                iconProps={{
                  iconName: 'plusIcon',
                  iconSize: 'lg',
                  iconColor:
                    tooltipProps?.isOpen || tooltipProps?.isHover
                      ? {
                          color: theme.colors.pageEmptyStateOnHoverBtn,
                        }
                      : undefined,
                }}
                tooltip={tooltipProps}
                onClick={() => null}
                ariaLabel={t('Add {{metric}}', {
                  metric: terms.metric.lowercaseSingular,
                })}
                tag={'button'}
              />
            </Menu>
          )}
        </BloomPageEmptyStateTooltipProvider>
      </div>
    )
  }
)

type FormValues = {
  goal: boolean
  owner: boolean
  cumulative: boolean
  average: boolean
}

export interface IMetricsTableHeaderViewRightProps {
  getData: () => {
    isLoading: boolean
    meetingId: Id
    workspaceTileId: Maybe<Id>
    workspaceType: TWorkspaceType
    metricsTableSelectedTab: IMetricsTableViewData['metricsTableSelectedTab']
    preventEditingUnownedMetrics: boolean
    getAllMetricsHaveDividers: IMetricsTableViewData['getAllMetricsHaveDividers']
    getCurrentUserPermissions: IMetricsTableViewData['getCurrentUserPermissions']
    getMetricsHaveCumulativeData: IMetricsTableViewData['getMetricsHaveCumulativeData']
    getMetricsHaveAverageData: IMetricsTableViewData['getMetricsHaveAverageData']
    metricTableColumnToIsVisibleSettings: IMetricsTableViewData['metricTableColumnToIsVisibleSettings']
    pageType: IMetricsTableViewData['pageType']
  }
  responsiveSize: TMetricsTableResponsiveSize
  isExpandedOnWorkspacePage: boolean
  handleSwitchMetricsTableSortByValue: IMetricsTableViewActionHandlers['handleSwitchMetricsTableSortByValue']
  handleCreateMetricDivider: IMetricsTableViewActionHandlers['handleCreateMetricDivider']
  handleUpdateMetricTableColumnToIsVisibleSettings: IMetricsTableViewActionHandlers['handleUpdateMetricTableColumnToIsVisibleSettings']
  onDeleteTile: IMetricsTableViewActionHandlers['onDeleteTile']
}

export const MetricsTableHeaderViewRight = observer(
  ({
    getData,
    responsiveSize,
    // handleCreateMetricDivider,
    handleSwitchMetricsTableSortByValue,
    handleUpdateMetricTableColumnToIsVisibleSettings,
    onDeleteTile,
    isExpandedOnWorkspacePage,
  }: IMetricsTableHeaderViewRightProps) => {
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { fullScreenTile, minimizeTile } =
      useWorkspaceFullScreenTileController()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const canReverseMetricsInMeeting =
      getData().getCurrentUserPermissions().canReverseMetricsInMeeting

    const { METRIC_EDIT_PERMISSIONS_EDIT_METRICS_TOOLTIP_TEXT } =
      getMetricEditPermissionsTooltipText(terms)

    const metricTableColumnToIsVisibleSettings =
      getData().metricTableColumnToIsVisibleSettings
    const isLoading = getData().isLoading

    const workspaceTileId = getData().workspaceTileId

    const formValues = useMemo(() => {
      return isLoading
        ? null
        : {
            goal: metricTableColumnToIsVisibleSettings['goal'],
            owner: metricTableColumnToIsVisibleSettings['owner'],
            cumulative: metricTableColumnToIsVisibleSettings['cumulative'],
            average: metricTableColumnToIsVisibleSettings['average'],
          }
    }, [isLoading, metricTableColumnToIsVisibleSettings])

    const formValidation = useMemo(() => {
      return {
        goal: formValidators.boolean({
          additionalRules: [required()],
        }),
        owner: formValidators.boolean({
          additionalRules: [required()],
        }),
        cumulative: formValidators.boolean({
          additionalRules: [required()],
        }),
        average: formValidators.boolean({
          additionalRules: [required()],
        }),
      } satisfies GetParentFormValidation<FormValues>
    }, [])

    const onSubmitForm = useCallback(
      async (values: {
        owner: boolean
        goal: boolean
        cumulative: boolean
        average: boolean
      }) => {
        handleUpdateMetricTableColumnToIsVisibleSettings(values)
      },
      [handleUpdateMetricTableColumnToIsVisibleSettings]
    )

    return (
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        {(!getData().getCurrentUserPermissions()
          .canPerformEditActionsForMetricsInMeeting.allowed ||
          getData().preventEditingUnownedMetrics) && (
          <>
            {responsiveSize === 'L' && (
              <>
                <Icon
                  iconSize={'md'}
                  iconName={'infoCircleSolid'}
                  css={css`
                    margin-left: ${theme.sizes.spacing8};
                  `}
                />
                <TextEllipsis
                  type={'body'}
                  lineLimit={1}
                  weight={'normal'}
                  wordBreak={true}
                  color={{ color: theme.colors.captionTextColor }}
                  css={css`
                    margin-left: ${theme.sizes.spacing4};
                    padding-right: ${theme.sizes.spacing40};
                  `}
                >
                  {!getData().getCurrentUserPermissions()
                    .canPerformEditActionsForMetricsInMeeting.allowed
                    ? METRIC_EDIT_PERMISSIONS_EDIT_METRICS_TOOLTIP_TEXT
                    : t(
                        `You can only edit your ${terms.metric.lowercasePlural}.`
                      )}
                </TextEllipsis>
              </>
            )}
            {responsiveSize !== 'L' && (
              <Tooltip
                msg={
                  !getData().getCurrentUserPermissions()
                    .canPerformEditActionsForMetricsInMeeting.allowed
                    ? METRIC_EDIT_PERMISSIONS_EDIT_METRICS_TOOLTIP_TEXT
                    : t(
                        `You can only edit your ${terms.metric.lowercasePlural}.`
                      )
                }
              >
                <span
                  css={css`
                    align-items: center;
                    display: flex;
                    padding-left: ${theme.sizes.spacing12};
                    padding-right: ${theme.sizes.spacing12};
                  `}
                >
                  <Icon iconSize={'md'} iconName={'infoCircleSolid'} />
                </span>
              </Tooltip>
            )}
          </>
        )}
        {responsiveSize !== 'XS' && (
          <BtnIcon
            intent='naked'
            ariaLabel={t('Switch direction')}
            iconProps={{
              iconName: 'reverseIcon',
              iconSize: 'lg',
            }}
            disabled={!canReverseMetricsInMeeting.allowed}
            tooltip={
              !canReverseMetricsInMeeting.allowed
                ? {
                    msg: canReverseMetricsInMeeting.message,
                    position: 'top left',
                    offset: theme.sizes.spacing8,
                    type: 'light',
                  }
                : {
                    msg: t('Switch direction'),
                    position: 'top center',
                    offset: theme.sizes.spacing8,
                    type: 'light',
                  }
            }
            tag={'button'}
            css={css`
              margin-right: ${theme.sizes.spacing16};
            `}
            onClick={handleSwitchMetricsTableSortByValue}
          />
        )}
        {responsiveSize === 'L' && (
          <Menu
            position='bottom left'
            content={() => (
              <>
                <Menu.Item isSectionHeader={true}>
                  <Text
                    type='body'
                    weight='semibold'
                    css={css`
                      margin-bottom: ${theme.sizes.spacing8};
                    `}
                  >
                    {t('Show/Hide:')}
                  </Text>
                </Menu.Item>
                <Menu.Divider />
                <EditForm
                  isLoading={getData().isLoading}
                  values={formValues as FormValues}
                  validation={
                    formValidation as GetParentFormValidation<FormValues>
                  }
                  sendDiffs={false}
                  onSubmit={async (values) => {
                    await onSubmitForm(values as FormValues)
                  }}
                >
                  {({ values, onFieldChange }) => {
                    return (
                      <>
                        {keys((values || []) as NonNullable<typeof values>).map(
                          (columnItem, index) => {
                            const columnMenuItemText =
                              RecordOfColumnMenuNameToDisplayValue[columnItem]
                            const columnValue = values
                              ? values[columnItem]
                              : metricTableColumnToIsVisibleSettings[columnItem]
                            const isDisabled =
                              (columnItem === 'cumulative' &&
                                !getData().getMetricsHaveCumulativeData()) ||
                              (columnItem === 'average' &&
                                !getData().getMetricsHaveAverageData())

                            return (
                              <Menu.Item key={index}>
                                <SwitchInput
                                  id={`column_${columnItem}_${index}`}
                                  name={columnItem}
                                  size={'default'}
                                  disabled={isDisabled}
                                  text={columnMenuItemText}
                                  value={columnValue}
                                  onChange={(value) =>
                                    onFieldChange(columnItem, value)
                                  }
                                />
                              </Menu.Item>
                            )
                          }
                        )}
                      </>
                    )
                  }}
                </EditForm>
              </>
            )}
          >
            <span>
              <Icon
                iconName='openEyeIcon'
                iconSize='lg'
                css={css`
                  ${getData().pageType === 'WORKSPACE' &&
                  css`
                    margin-right: ${theme.sizes.spacing12};
                  `}
                `}
              />
            </span>
          </Menu>
        )}
        {/* TODO AIDAN comment this back in to put metric dividers back post deployment */}
        {/* {getData().pageType !== 'WORKSPACE' && (
          <>
            {responsiveSize === 'LARGE' && (
              <span
                css={css`
                  width: ${theme.sizes.spacing16};
                  height: 100%;
                `}
              />
            )}
            <Menu
              position='bottom left'
              minWidthRems={
                getData().getAllMetricsHaveDividers() ? 15 : undefined
              }
              content={(close) => (
                <>
                  <Menu.Item
                    disabled={
                      getData().getAllMetricsHaveDividers() ||
                      !getData().getCurrentUserPermissions()
                        .canCreateMetricDividersInMeeting.allowed
                    }
                    tooltip={
                      !getData().getCurrentUserPermissions()
                        .canCreateMetricDividersInMeeting.allowed
                        ? {
                            msg: (
                              getData().getCurrentUserPermissions()
                                .canCreateMetricDividersInMeeting as {
                                allowed: false
                                message: string
                              }
                            ).message,
                            position: 'left center',
                          }
                        : undefined
                    }
                    onClick={(e) => {
                      handleCreateMetricDivider({
                        frequency: getData().metricsTableSelectedTab,
                      })
                      close(e)
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        justify-content: center;
                      `}
                    >
                      <Text
                        type='body'
                        color={
                          getData().getAllMetricsHaveDividers()
                            ? {
                                color: theme.colors.textPrimaryDisabled,
                              }
                            : undefined
                        }
                      >
                        {t('Add divider')}
                      </Text>
                      {getData().getAllMetricsHaveDividers() && (
                        <div
                          css={css`
                            display: inline-flex;
                            margin-top: ${theme.sizes.spacing8};
                          `}
                        >
                          <Icon
                            iconName={'infoCircleSolid'}
                            iconSize='md'
                            iconColor={{
                              color: theme.colors.intentDisabledColor,
                            }}
                            css={css`
                              margin: ${theme.sizes.spacing4}
                                ${theme.sizes.spacing4} 0 0;
                            `}
                          />
                          <Text
                            type={'small'}
                            color={{
                              color: theme.colors.textPrimaryDisabled,
                            }}
                            css={css`
                              max-width: ${toREM(146)};
                            `}
                          >
                            {t('You have reached your max number of dividers')}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Menu.Item>
                </>
              )}
            >
              <BtnIcon
                intent='naked'
                size='sm'
                iconProps={{
                  iconName: 'moreVerticalIcon',
                  iconSize: 'lg',
                }}
                onClick={() => null}
                ariaLabel={t('More options')}
                tag={'button'}
              />
            </Menu>
          </>
        )} */}
        {getData().pageType === 'WORKSPACE' && (
          <>
            <Menu
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={(e) => {
                      openOverlazy('CreateMetricDrawer', {
                        meetingId: getData().meetingId,
                      })
                      close(e)
                    }}
                  >
                    <Text type={'body'}>{t('Create Metric')}</Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      close(e)
                      if (workspaceTileId) {
                        fullScreenTile(workspaceTileId)
                      }
                    }}
                  >
                    <Text type={'body'}>{t('View in full screen')}</Text>
                  </Menu.Item>
                  {responsiveSize === 'XS' && (
                    <Menu.Item
                      onClick={(e) => {
                        handleSwitchMetricsTableSortByValue()
                        close(e)
                      }}
                    >
                      <Text type={'body'}>{t('Switch sheet direction')}</Text>
                    </Menu.Item>
                  )}
                  {/* AIDAN TODO put this back post deployment to add metric dividers back */}
                  {/* <Menu.Item
                    disabled={
                      getData().getAllMetricsHaveDividers() ||
                      !getData().getCurrentUserPermissions()
                        .canCreateMetricDividersInMeeting.allowed
                    }
                    tooltip={
                      !getData().getCurrentUserPermissions()
                        .canCreateMetricDividersInMeeting.allowed
                        ? {
                            msg: (
                              getData().getCurrentUserPermissions()
                                .canCreateMetricDividersInMeeting as {
                                allowed: false
                                message: string
                              }
                            ).message,
                            position: 'left center',
                          }
                        : undefined
                    }
                    onClick={(e) => {
                      handleCreateMetricDivider({
                        frequency: getData().metricsTableSelectedTab,
                      })
                      close(e)
                    }}
                  >
                    <div
                      css={css`
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                      `}
                    >
                      <Text
                        type='body'
                        color={
                          getData().getAllMetricsHaveDividers()
                            ? {
                                color: theme.colors.textPrimaryDisabled,
                              }
                            : undefined
                        }
                      >
                        {t('Add divider')}
                      </Text>
                      {getData().getAllMetricsHaveDividers() && (
                        <div
                          css={css`
                            display: inline-flex;
                            margin-top: ${theme.sizes.spacing8};
                          `}
                        >
                          <Icon
                            iconName={'infoCircleSolid'}
                            iconSize='md'
                            iconColor={{
                              color: theme.colors.intentDisabledColor,
                            }}
                            css={css`
                              margin: ${theme.sizes.spacing4}
                                ${theme.sizes.spacing4} 0 0;
                            `}
                          />
                          <Text
                            type={'small'}
                            color={{
                              color: theme.colors.textPrimaryDisabled,
                            }}
                            css={css`
                              max-width: ${toREM(146)};
                            `}
                          >
                            {t('You have reached your max number of dividers')}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Menu.Item> */}
                  {getData().workspaceType === 'PERSONAL' && (
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        onDeleteTile()
                      }}
                    >
                      <Text type={'body'}>{t('Delete tile')}</Text>
                    </Menu.Item>
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
            {isExpandedOnWorkspacePage && (
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
          </>
        )}
      </div>
    )
  }
)
