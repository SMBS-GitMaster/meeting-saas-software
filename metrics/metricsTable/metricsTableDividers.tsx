import { observer } from 'mobx-react'
import React, { useCallback, useMemo, useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { addOrRemoveWeeks, useTimeController } from '@mm/core/date'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
} from '@mm/core/forms'

import { MetricDividerSizes } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  Icon,
  Menu,
  SelectDividerHeightInputSelection,
  Text,
  TextEllipsis,
  TextInput,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import {
  DEFAULT_METRIC_DIVIDER_SIZE,
  DIVIDER_HEIGHT_TO_ICON_OFFSET,
  METRIC_TABLE_SCORE_CELL_WIDTH,
  METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN,
  RECORD_OF_METRIC_DIVIDER_HEIGHT_TO_SIZE,
  RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT,
} from './metricsTableConstants'
import {
  IMetricsTableViewActionHandlers,
  IMetricsTableViewData,
  MetricTableColumnOptions,
} from './metricsTableTypes'

export const METRIC_DIVIDER_MENU_BUTTON_CLASS =
  'drag_metric_divider_menu_button'
export const METRIC_DIVIDER_SORT_ICON_CLASS = 'drag_metric_divider_sort_icon'

export const MetricsTableMetadataTableDivider = observer(
  (props: {
    divider: {
      height: number
      title: string
      id: Id
    }
    getAreColumnsCollapsed: () => boolean
    getData: () => {
      isLoading: boolean
      getCurrentUserPermissions: IMetricsTableViewData['getCurrentUserPermissions']
    }
    getColumnVisibility: () => Record<MetricTableColumnOptions, boolean>
    handleDeleteMetricDivider: IMetricsTableViewActionHandlers['handleDeleteMetricDivider']
    handleEditMetricDivider: IMetricsTableViewActionHandlers['handleEditMetricDivider']
  }) => {
    const [highlightRowWhileMenuOpen, setHighlightRowWhileMenuOpen] =
      useState<boolean>(false)

    const theme = useTheme()
    const { t } = useTranslation()

    const {
      divider: { height, title, id },
      getAreColumnsCollapsed,
      getData,
      getColumnVisibility,
      handleDeleteMetricDivider,
      handleEditMetricDivider,
    } = props

    const dividerHeightIntention =
      RECORD_OF_METRIC_DIVIDER_HEIGHT_TO_SIZE[height] ??
      DEFAULT_METRIC_DIVIDER_SIZE
    const dividerIconOffset =
      DIVIDER_HEIGHT_TO_ICON_OFFSET[dividerHeightIntention]
    const renderTitleWithinDivider = title && dividerHeightIntention !== 'SMALL'

    const getColumnSpan = useComputed(
      () => {
        return Object.keys(getColumnVisibility() || []).filter(
          (columnOption) => {
            // drag column is always rendered
            // returning true here ensures that the drag column is always counted
            // otherwise the divider within metadata table will not span the correct number of columns
            if (columnOption === 'drag') return true

            return getColumnVisibility()[
              columnOption as MetricTableColumnOptions
            ]
          }
        ).length
      },
      {
        name: 'MetricTableDividers.getColumnSpan',
      }
    )

    const memoizedFormValues = useMemo(() => {
      return { height: dividerHeightIntention, title }
    }, [dividerHeightIntention, title])

    const onHandleSubmit = useCallback(
      async (opts: { height?: MetricDividerSizes; title?: string }) => {
        const { height, title } = opts

        return handleEditMetricDivider({
          height: height
            ? RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT[height]
            : undefined,
          title,
          id,
        })
      },
      [handleEditMetricDivider, id]
    )

    return (
      <td
        colSpan={getAreColumnsCollapsed() ? 7 : getColumnSpan()}
        css={css`
          position: relative;
          padding: 0;
          line-height: 0;
          height: ${toREM(height)};

          ${getData().getCurrentUserPermissions().canEditMetricDividersInMeeting
            .allowed &&
          css`
            cursor: grab;
          `}
        `}
      >
        {renderTitleWithinDivider && (
          <TextEllipsis
            type={'caption'}
            lineLimit={1}
            weight={'semibold'}
            color={{
              color: theme.colors.metricsTableDividerTextColorDefault,
            }}
            css={css`
              padding-left: ${theme.sizes.spacing24};

              &:hover,
              &:focus {
                color: ${theme.colors.metricsTableDividerTextColorHover};
              }
            `}
          >
            {title.toUpperCase()}
          </TextEllipsis>
        )}

        {getData().getCurrentUserPermissions().canEditMetricDividersInMeeting
          .allowed && (
          <Icon
            iconName={'doubleArrowDragIcon'}
            className={METRIC_DIVIDER_SORT_ICON_CLASS}
            iconSize={'lg'}
            css={css`
              position: absolute;
              right: 50%;
              top: -${toREM(dividerIconOffset)};
              z-index: ${(props) =>
                props.theme.zIndices.metricsTableMetadataHeaderContent};
            `}
          />
        )}

        <div
          className={METRIC_DIVIDER_MENU_BUTTON_CLASS}
          css={css`
            .metric_divider_menu_button_icon {
              position: absolute;
              right: -${toREM(12)};
              top: -${toREM(dividerIconOffset)};
              border-radius: ${theme.sizes.br3};
              box-sizing: border-box;
              background-color: ${theme.colors
                .metricsTableDividerBackgroundColorHover};
              border: ${theme.sizes.smallSolidBorder}
                ${theme.colors.metricsTableDividerIconBorderColor};
              width: ${toREM(24)};
              height: ${toREM(24)};
              z-index: ${(props) =>
                props.theme.zIndices
                  .metricsTableMetadataHeaderContent} !important;
            }
          `}
        >
          <Menu
            position='bottom left'
            minWidthRems={12}
            maxWidth={toREM(190)}
            onClose={() => setHighlightRowWhileMenuOpen(false)}
            content={(close) => (
              <>
                <Menu.Item
                  tag={'div'}
                  css={css`
                    padding: 0;
                  `}
                  onClick={() => {
                    null
                  }}
                >
                  <div
                    css={css`
                      width: 100%;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                    `}
                  >
                    <div
                      css={css`
                        height: ${toREM(40)};
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        border-bottom: ${theme.sizes.smallSolidBorder}
                          ${theme.colors.dividerStrokeDefault};
                        padding: 0 ${theme.sizes.spacing16};
                      `}
                    >
                      <Text type={'body'} weight={'semibold'}>
                        {t('Divider')}
                      </Text>
                    </div>
                    <EditForm
                      isLoading={getData().isLoading}
                      disabled={
                        !getData().getCurrentUserPermissions()
                          .canEditMetricDividersInMeeting.allowed
                      }
                      disabledTooltip={
                        !getData().getCurrentUserPermissions()
                          .canEditMetricDividersInMeeting.allowed
                          ? {
                              msg: (
                                getData().getCurrentUserPermissions()
                                  .canEditMetricDividersInMeeting as {
                                  allowed: false
                                  message: string
                                }
                              ).message,
                            }
                          : undefined
                      }
                      values={memoizedFormValues}
                      validation={
                        {
                          height: formValidators.string({
                            additionalRules: [],
                          }),
                          title: formValidators.string({
                            additionalRules: [maxLength({ maxLength: 250 })],
                          }),
                        } satisfies GetParentFormValidation<{
                          height: MetricDividerSizes
                          title: string
                        }>
                      }
                      onSubmit={onHandleSubmit}
                    >
                      {({ fieldNames, values }) => {
                        return (
                          <>
                            <div
                              css={css`
                                width: 100%;
                                padding: ${theme.sizes.spacing8}
                                  ${theme.sizes.spacing16}
                                  ${theme.sizes.spacing16}
                                  ${theme.sizes.spacing16};
                              `}
                            >
                              <SelectDividerHeightInputSelection
                                id={'dividerHeight'}
                                name={fieldNames.height}
                                placeholder={t('Select size')}
                                unknownItemText={t('Unknown size')}
                                formControl={{
                                  label: (
                                    <Text type={'body'} weight={'normal'}>
                                      {t('Size')}
                                    </Text>
                                  ),
                                }}
                                width={'100%'}
                              />
                            </div>

                            {values?.height === 'SMALL' ? (
                              <div
                                css={css`
                                  display: flex;
                                  flex-direction: column;
                                  width: 100%;
                                  padding: ${theme.sizes.spacing8}
                                    ${theme.sizes.spacing16}
                                    ${theme.sizes.spacing16}
                                    ${theme.sizes.spacing16};
                                  border-bottom: ${theme.sizes.smallSolidBorder}
                                    ${theme.colors.dividerStrokeDefault};
                                `}
                              >
                                <Text
                                  type={'body'}
                                  weight={'normal'}
                                  color={{
                                    color: theme.colors.textPrimaryDisabled,
                                  }}
                                >
                                  {t('Title')}
                                </Text>
                                <div
                                  css={css`
                                    display: inline-flex;
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
                                    {t(
                                      'Only medium and large size support titles.'
                                    )}
                                  </Text>
                                </div>
                              </div>
                            ) : (
                              <div
                                css={css`
                                  width: 100%;
                                  padding: 0 ${theme.sizes.spacing16}
                                    ${theme.sizes.spacing16}
                                    ${theme.sizes.spacing16};
                                  border-bottom: ${theme.sizes.smallSolidBorder}
                                    ${theme.colors.dividerStrokeDefault};
                                `}
                              >
                                <TextInput
                                  name={fieldNames.title}
                                  id={'dividerTitle'}
                                  formControl={{
                                    label: (
                                      <Text type={'body'} weight={'normal'}>
                                        {t('Title')}
                                      </Text>
                                    ),
                                  }}
                                  width={'100%'}
                                  placeholder={t('Type a title')}
                                />
                              </div>
                            )}
                          </>
                        )
                      }}
                    </EditForm>
                  </div>
                </Menu.Item>

                <Menu.Item
                  disabled={
                    !getData().getCurrentUserPermissions()
                      .canEditMetricDividersInMeeting.allowed
                  }
                  tooltip={
                    !getData().getCurrentUserPermissions()
                      .canEditMetricDividersInMeeting.allowed
                      ? {
                          msg: (
                            getData().getCurrentUserPermissions()
                              .canEditMetricDividersInMeeting as {
                              allowed: false
                              message: string
                            }
                          ).message,
                        }
                      : undefined
                  }
                  onClick={async (e) => {
                    handleDeleteMetricDivider(id)
                    close(e)
                  }}
                >
                  <Text type={'body'}>{t('Delete divider')}</Text>
                </Menu.Item>
              </>
            )}
          >
            <BtnIcon
              ariaLabel={t('divider options')}
              className={`metric_divider_menu_button_icon`}
              tag={'span'}
              intent={'naked'}
              iconProps={{
                iconName: 'moreVerticalIcon',
                iconSize: 'lg',
                iconColor: { color: theme.colors.buttonIconColor },
              }}
              onClick={() => {
                return (
                  !highlightRowWhileMenuOpen &&
                  setHighlightRowWhileMenuOpen(true)
                )
              }}
            />
          </Menu>
        </div>
      </td>
    )
  }
)

export const MetricsTableScoreTableDivider = observer(
  (props: {
    height: number
    getData: () => {
      highlightPreviousWeekForMetrics: IMetricsTableViewData['highlightPreviousWeekForMetrics']
      metricsTableSelectedTab: IMetricsTableViewData['metricsTableSelectedTab']
      getMetricScoreDateRanges: IMetricsTableViewData['getMetricScoreDateRanges']
    }
  }) => {
    const { height, getData } = props

    const dividerHeightIntention =
      RECORD_OF_METRIC_DIVIDER_HEIGHT_TO_SIZE[height] ??
      DEFAULT_METRIC_DIVIDER_SIZE

    return (
      <>
        {getData()
          .getMetricScoreDateRanges()
          .map((dateRange) => {
            return (
              <MetricsTableScoreTableDividerItem
                key={`metricTableScoresTableDivider_${dateRange.start}`}
                height={
                  RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT[
                    dividerHeightIntention
                  ]
                }
                getData={getData}
                dateRange={dateRange}
              />
            )
          })}
      </>
    )
  }
)

// Note: even though the divider does not display data, if the divider is at the top of the metric scores table
// it will collapse the layout if we do not set the same row widths for each td.
const MetricsTableScoreTableDividerItem = observer(
  (props: {
    dateRange: { start: number; end: number }
    height: number
    getData: () => {
      highlightPreviousWeekForMetrics: IMetricsTableViewData['highlightPreviousWeekForMetrics']
    }
  }) => {
    const { getSecondsSinceEpochUTC } = useTimeController()

    const { getData, height, dateRange } = props

    const currentDateTimeValue = getSecondsSinceEpochUTC()
    const highlightPreviousWeekForMetrics =
      getData().highlightPreviousWeekForMetrics
    const highlightedWeekIsWithinRange = useMemo(() => {
      if (highlightPreviousWeekForMetrics) {
        const previousWeekTimeValue = addOrRemoveWeeks({
          secondsSinceEpochUTC: currentDateTimeValue,
          weeks: -1,
        })
        return (
          previousWeekTimeValue >= dateRange.start &&
          previousWeekTimeValue <= dateRange.end
        )
      } else {
        return (
          currentDateTimeValue >= dateRange.start &&
          currentDateTimeValue <= dateRange.end
        )
      }
    }, [
      dateRange.start,
      dateRange.end,
      currentDateTimeValue,
      highlightPreviousWeekForMetrics,
    ])

    const width = highlightedWeekIsWithinRange
      ? METRIC_TABLE_SCORE_CELL_WIDTH_FOR_HIGHLIGHTED_COLUMN
      : METRIC_TABLE_SCORE_CELL_WIDTH

    return (
      <td
        css={css`
          position: relative;
          width: ${toREM(width)};
          max-width: ${toREM(width)};
          padding: 0;
          line-height: 0;
          height: ${toREM(height)};
        `}
      />
    )
  }
)
