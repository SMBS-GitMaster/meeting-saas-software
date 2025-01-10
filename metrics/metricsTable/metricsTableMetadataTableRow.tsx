import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { useDIResolver } from '@mm/core/di/resolver'

import { TrackedMetricColorIntention } from '@mm/core-bloom'
import {
  METRIC_RULE_TO_SIGN_MAP,
  getMetricProgressiveBarWidth,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { Trans, useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Clickable,
  Icon,
  Text,
  Tooltip,
  UserAvatar,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import {
  TabData,
  useMetricsTabsController,
} from '../metricsTabs/metricsTabsController'
import {
  ChartButtonDisabledReason,
  getMetricsTableRowState,
} from './getMetricsTableRowState'
import { getMetricDisabledStateAndTooltipForChartingMetric } from './helpers'
import {
  METRIC_DRAGGABLE_ELEMENT_CLASS,
  METRIC_PROGRESSIVE_BAR_WIDTH,
} from './metricsTableConstants'
import { StyledMetricGoalProgressiveBar } from './metricsTableStyles'
import {
  IMetricTableDataItem,
  IMetricsTableViewData,
  TMetricsTableResponsiveSize,
} from './metricsTableTypes'
import { IPersonalMetricTableDataItem } from './personalMetricsTable/personalMetricsTableTypes'

export const MetricsRowDraggableHandler = observer(
  function MetricsRowDraggableHandler(props: {
    metric: IMetricTableDataItem
    hide: boolean
  }) {
    const theme = useTheme()

    return (
      <span
        id={`metricTableDraggable_${props.metric.id}`}
        className={METRIC_DRAGGABLE_ELEMENT_CLASS}
        css={css`
          display: inline-block;
          height: 100%;
          cursor: ${props.hide ? 'inherit' : 'grab'};
        `}
      >
        <Icon
          iconName='dragIcon'
          iconSize='lg'
          css={css`
            margin-top: ${theme.sizes.spacing12};
            ${props.hide &&
            css`
              visibility: hidden;
            `}
          `}
        />
      </span>
    )
  }
)

export const MetricsRowOwnerAvatar = observer(
  function MetricsRowOwnerAvatar(props: { metric: IMetricTableDataItem }) {
    const theme = useTheme()
    const metric = props.metric
    return (
      <UserAvatar
        avatarUrl={metric.assignee.avatar}
        firstName={metric.assignee.firstName}
        lastName={metric.assignee.lastName}
        userAvatarColor={metric.assignee.userAvatarColor}
        size={'s'}
        adornments={{ tooltip: true }}
        css={css`
          padding-left: ${theme.sizes.spacing4};
        `}
      />
    )
  }
)

const ROW_TITLE_WIDTH_BY_RESPONSIVE_SIZE: Record<
  TMetricsTableResponsiveSize,
  number
> = {
  UNKNOWN: 120,
  XS: 120,
  S: 120,
  M: 220,
  L: 320,
}

export const MetricsRowTitle = observer(function MetricsRowTitle(props: {
  metric: IMetricTableDataItem | IPersonalMetricTableDataItem
  onClick: () => void
  getColumnsAreCollapsed: () => boolean
  getResponsiveSize: () => TMetricsTableResponsiveSize
  displayGoalInTooltip: boolean
  getGoalText: () => string
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const {
    metric,
    onClick,
    getColumnsAreCollapsed,
    displayGoalInTooltip,
    getResponsiveSize,
    getGoalText,
  } = props

  const getMaxWidth = useComputed(
    () => {
      return getColumnsAreCollapsed()
        ? toREM(120)
        : toREM(ROW_TITLE_WIDTH_BY_RESPONSIVE_SIZE[getResponsiveSize()])
    },
    {
      name: 'MetricsRowTitle_getMaxWidth',
    }
  )

  return (
    <Clickable
      clicked={onClick}
      css={css`
        vertical-align: middle;
      `}
    >
      <TextEllipsis
        type={'body'}
        wordBreak={true}
        lineLimit={2}
        tooltipProps={{
          position: getColumnsAreCollapsed() ? 'right center' : 'top center',
          type: 'light',
        }}
        css={css`
          text-align: left;
          width: max-content;
          white-space: normal;
          max-width: ${getMaxWidth()};
        `}
        color={{ color: theme.colors.bodyTextDefault }}
        overrideChildrenTooltipMsg={
          displayGoalInTooltip ? (
            <>
              <Text
                type={'body'}
                weight={'semibold'}
                wordBreak={true}
                color={{
                  color: theme.colors.tooltipLightFontColor,
                }}
              >
                {metric.title}
              </Text>
              <br />
              <Text
                type={'body'}
                weight={'normal'}
                wordBreak={true}
                color={{
                  color: theme.colors.tooltipLightFontColor,
                }}
              >
                <>
                  {t('Goal: ')}
                  {getGoalText()}
                </>
              </Text>
            </>
          ) : (
            <Text
              type={'body'}
              weight={'semibold'}
              wordBreak={true}
              color={{
                color: theme.colors.tooltipLightFontColor,
              }}
            >
              {metric.title}
            </Text>
          )
        }
      >
        {metric.title}
      </TextEllipsis>
    </Clickable>
  )
})

export const MetricsRowGoal = observer(function MetricsRowGoal(props: {
  metric: IMetricTableDataItem | IPersonalMetricTableDataItem
  getGoalText: () => string
}) {
  const theme = useTheme()
  const { metric, getGoalText } = props
  const { t } = useTranslation()
  const diResolver = useDIResolver()

  const getComputedMetricProgressiveBarWidth = useComputed(
    () => {
      return metric.metricData?.progressiveData
        ? getMetricProgressiveBarWidth({
            goal: metric.goal,
            progressiveData: metric.metricData?.progressiveData,
            metricProgressiveBarWidth: METRIC_PROGRESSIVE_BAR_WIDTH,
            diResolver,
          })
        : 0
    },
    {
      name: 'MetricsRowGoal-metricProgressiveBarWidth',
    }
  )

  const ruleSign = METRIC_RULE_TO_SIGN_MAP[metric.rule]

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      <Tooltip
        position={'top center'}
        msg={
          metric.metricData?.progressiveData
            ? t('Progressive tracking enabled')
            : undefined
        }
        type={'light'}
        offset={toREM(4)}
      >
        <div
          css={css`
            width: 100%;
            display: inline-flex;

            ${metric.metricData?.progressiveData &&
            css`
              padding-bottom: ${toREM(2)};
            `}
          `}
        >
          <Text type={'body'} color={{ color: theme.colors.bodyTextDefault }}>
            {ruleSign}
          </Text>
          <TextEllipsis
            type={'body'}
            lineLimit={1}
            tooltipProps={{
              position: 'right top',
              offset: theme.sizes.spacing8,
              type: 'light',
            }}
            color={{ color: theme.colors.bodyTextDefault }}
            css={css`
              word-break: break-all;
              margin-left: ${theme.sizes.spacing8};
            `}
          >
            {getGoalText()}
          </TextEllipsis>
        </div>
      </Tooltip>
      {!!metric.metricData?.progressiveData && (
        <StyledMetricGoalProgressiveBar
          metricProgressiveBarWidth={getComputedMetricProgressiveBarWidth()}
        />
      )}
    </div>
  )
})

export const MetricsTableRowChartButton = observer(
  function MetricsTableRowChartButton(props: {
    metric: IMetricTableDataItem
    trackedColor: TrackedMetricColorIntention | undefined
    onClick: () => void
    getActiveTab: () => Maybe<TabData | { newTab: true }>
    getCurrentUser: () => IMetricsTableViewData['currentUser']
    getCurrentUserPermissions: IMetricsTableViewData['getCurrentUserPermissions']
  }) {
    const theme = useTheme()
    const {
      onClick,
      trackedColor,
      getActiveTab,
      metric,
      getCurrentUser,
      getCurrentUserPermissions,
    } = props
    const { t } = useTranslation()
    const terms = useBloomCustomTerms()
    const { isTabData, getActiveTabPermissions } = useMetricsTabsController()

    const activeTab = getActiveTab()
    const isSharedToMeetingTab = isTabData(activeTab)
      ? activeTab.isSharedToMeeting
      : false

    const isMetricAlreadyCharted = isTabData(activeTab)
      ? !!activeTab.trackedMetrics.nodes.find(
          (trackedMetric) => trackedMetric.metric.id === metric.id
        )
      : false

    const chartButtonDisabledMessageByReason: Record<
      ChartButtonDisabledReason,
      React.ReactNode
    > = useMemo(
      () => ({
        YES_NO_METRIC: t('Yes/no {{metrics}} cannot be viewed on charts.', {
          metrics: terms.metric.lowercasePlural,
        }),
        UNIT_TYPE_MISMATCH: (
          <Trans>
            This {terms.metric.lowercaseSingular} is a different unit type than
            the one charted.
            <br />
            Close the active chart to see this {terms.metric.lowercaseSingular}.
          </Trans>
        ),
        MAX_METRICS_TRACKED: (
          <Trans>
            Charts have a maximum of 5 {terms.metric.lowercasePlural}.
            <br />
            Make a new chart by clicking the chart icon{' '}
            <Icon
              iconName='addGraph'
              iconSize='md'
              iconColor={{
                color: theme.colors.tooltipDarkFontColor,
              }}
            />{' '}
            at the bottom
          </Trans>
        ),
      }),
      [t, theme.colors.tooltipDarkFontColor, terms]
    )

    const getStateForRow = useComputed(
      () => {
        return getMetricsTableRowState({
          metric,
          activeTab: getActiveTab(),
          userId: getCurrentUser().id,
        })
      },
      { name: 'MetricsTableRowChartButton-stateForRow' }
    )

    const { disabledStateForChartingMetric, tooltipForChartingMetric } =
      getMetricDisabledStateAndTooltipForChartingMetric({
        isMetricAlreadyCharted,
        isSharedToMeetingTab,
        canPerformDeleteActionsForMetricTabInMeeting:
          getActiveTabPermissions()
            .canPerformDeleteActionsForMetricTabInMeeting,
        canEditMetricTabInMeeting:
          getActiveTabPermissions().canEditMetricTabInMeeting,
        canCreateMetricsTabsInMeeting:
          getCurrentUserPermissions().canCreateMetricsTabsInMeeting,
        stateForRow: getStateForRow(),
        chartButtonDisabledMessageByReason,
      })

    const chartIconBackgroundByTrackedColorIntention: Record<
      TrackedMetricColorIntention,
      string
    > = {
      COLOR1: theme.colors.metricsTableChartIconColor1,
      COLOR2: theme.colors.metricsTableChartIconColor2,
      COLOR3: theme.colors.metricsTableChartIconColor3,
      COLOR4: theme.colors.metricsTableChartIconColor4,
      COLOR5: theme.colors.metricsTableChartIconColor5,
    }

    const chartIconColor = disabledStateForChartingMetric
      ? theme.colors.metricsTableChartIconDisabledColor
      : trackedColor
        ? chartIconBackgroundByTrackedColorIntention[trackedColor]
        : theme.colors.iconDefault

    return (
      <BtnIcon
        intent='naked'
        size='lg'
        iconProps={{
          iconName: 'searchDataIcon',
          iconSize: 'lg',
          iconColor: {
            color: chartIconColor,
          },
        }}
        disabled={disabledStateForChartingMetric}
        tooltip={tooltipForChartingMetric}
        onClick={onClick}
        ariaLabel={t('Add metric to chart')}
        tag={'span'}
        css={css`
          margin-right: ${theme.sizes.spacing8};
        `}
      />
    )
  }
)

export const MetricsRowCumulative = observer(
  function MetricsRowCumulative(props: {
    metric: IMetricTableDataItem | IPersonalMetricTableDataItem
  }) {
    const theme = useTheme()
    const { metric } = props
    return (
      <>
        {metric.metricData?.cumulativeData && metric.formattedCumulative && (
          <TextEllipsis
            type={'body'}
            lineLimit={1}
            tooltipProps={{
              position: 'right center',
              offset: theme.sizes.spacing8,
              type: 'light',
            }}
            color={{ color: theme.colors.bodyTextDefault }}
            css={css`
              word-break: break-all;
            `}
          >
            {metric.formattedCumulative}
          </TextEllipsis>
        )}
      </>
    )
  }
)

export const MetricsRowAverage = observer(function MetricsRowAverage(props: {
  metric: IMetricTableDataItem | IPersonalMetricTableDataItem
}) {
  const theme = useTheme()
  const { metric } = props
  return (
    <>
      {metric.metricData?.averageData && metric.formattedAverage && (
        <TextEllipsis
          type={'body'}
          lineLimit={1}
          tooltipProps={{
            position: 'right center',
            offset: toREM(8),
            type: 'light',
          }}
          color={{ color: theme.colors.bodyTextDefault }}
          css={css`
            word-break: break-all;
          `}
        >
          {metric.formattedAverage}
        </TextEllipsis>
      )}
    </>
  )
})
