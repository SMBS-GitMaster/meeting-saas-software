import React, { useCallback, useMemo } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'

import {
  METRIC_RULE_TO_SIGN_MAP,
  PermissionCheckResult,
  TrackedMetricColorIntention,
  getMetricProgressiveBarWidth,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
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

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { getTrackedMetricColorIntentToColorRecord } from '../constants'
import { METRIC_PROGRESSIVE_BAR_WIDTH } from '../metricsTable/metricsTableConstants'
import { StyledMetricGoalProgressiveBar } from '../metricsTable/metricsTableStyles'
import { IMetricTableDataItem } from '../metricsTable/metricsTableTypes'
import {
  StyledMetadataTabTableItemWrapper,
  StyledMetadataTabTableRow,
} from './metricTabTableStyles'

export const MetricTabTableMetadataRow = (props: {
  meetingId: Id
  trackedMetric: {
    id: Id
    color: TrackedMetricColorIntention
    metric: IMetricTableDataItem
  }
  getCurrentUserPermissions: () => {
    canPerformDeleteActionsForMetricTabInMeeting: PermissionCheckResult
  }
  onHandleDeleteMetricFromGraph: (metricId: Id) => void
}) => {
  const { openOverlazy } = useOverlazyController()

  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const diResolver = useDIResolver()
  const {
    trackedMetric,
    meetingId,
    getCurrentUserPermissions,
    onHandleDeleteMetricFromGraph,
  } = props
  const metric = trackedMetric.metric

  const trackedMetricColorIntentToColorRecord =
    getTrackedMetricColorIntentToColorRecord(theme)
  const ruleSign = METRIC_RULE_TO_SIGN_MAP[metric.rule]
  const iconColor = trackedMetricColorIntentToColorRecord[trackedMetric.color]

  const canPerformDeleteActionsForMetricTabInMeeting =
    getCurrentUserPermissions().canPerformDeleteActionsForMetricTabInMeeting

  const goalText = useMemo(() => {
    return isSingleValueMetricGoal(metric.goal)
      ? metric.goal.valueFormatted
      : isMinMaxMetricGoal(metric.goal)
        ? `${metric.goal.minData.minFormatted} - ${metric.goal.maxData.maxFormatted}`
        : t('N/A')
  }, [metric.goal, t])

  const metricProgressiveBarWidth = useMemo(() => {
    return metric.metricData?.progressiveData
      ? getMetricProgressiveBarWidth({
          goal: metric.goal,
          progressiveData: metric.metricData.progressiveData,
          metricProgressiveBarWidth: METRIC_PROGRESSIVE_BAR_WIDTH,
          diResolver,
        })
      : 0
  }, [metric.metricData?.progressiveData, metric.goal, diResolver])

  const handleClickMetricTitle = useCallback(() => {
    openOverlazy('EditMetricDrawer', {
      meetingId,
      metricId: metric.id,
    })
  }, [meetingId, metric.id, openOverlazy])

  const handleDeleteMetricFromGraph = useCallback(() => {
    onHandleDeleteMetricFromGraph(trackedMetric.id)
  }, [onHandleDeleteMetricFromGraph, trackedMetric.id])

  return (
    <StyledMetadataTabTableRow>
      <StyledMetadataTabTableItemWrapper
        width={48}
        centerVertically={true}
        centerHorizontally={true}
        padding={'none'}
      >
        <BtnIcon
          intent='naked'
          size='lg'
          iconProps={{
            iconName: 'closeIcon',
            iconSize: 'md',
          }}
          disabled={!canPerformDeleteActionsForMetricTabInMeeting.allowed}
          tooltip={
            !canPerformDeleteActionsForMetricTabInMeeting.allowed
              ? {
                  msg: canPerformDeleteActionsForMetricTabInMeeting.message,
                  position: 'right center',
                }
              : undefined
          }
          onClick={handleDeleteMetricFromGraph}
          ariaLabel={t('Remove {{metric}} from chart', {
            metric: terms.metric.lowercaseSingular,
          })}
          tag={'span'}
        />
      </StyledMetadataTabTableItemWrapper>
      <StyledMetadataTabTableItemWrapper
        width={40}
        centerVertically={true}
        centerHorizontally={true}
        padding={'md'}
      >
        <UserAvatar
          avatarUrl={metric.assignee.avatar}
          firstName={metric.assignee.firstName}
          lastName={metric.assignee.lastName}
          userAvatarColor={metric.assignee.userAvatarColor}
          size={'s'}
        />
      </StyledMetadataTabTableItemWrapper>
      <StyledMetadataTabTableItemWrapper
        width={219}
        centerVertically={true}
        padding={'md'}
        css={css`
          width: 100%;
        `}
      >
        <Clickable clicked={handleClickMetricTitle}>
          <TextEllipsis
            type={'body'}
            lineLimit={2}
            tooltipProps={{
              position: 'top center',
              type: 'light',
            }}
            css={css`
              word-break: break-all;
              min-width: ${toREM(100)};
              background-color: ${(props) =>
                props.theme.colors.metricChartTableMetadatarowBackgroundColor};
              z-index: 1;
              position: relative;
              text-align: left;
            `}
            color={{ color: theme.colors.bodyTextDefault }}
          >
            {metric.title}
          </TextEllipsis>
        </Clickable>
      </StyledMetadataTabTableItemWrapper>

      <StyledMetadataTabTableItemWrapper
        width={98}
        centerVertically={true}
        padding={'sm'}
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
                position: 'right center',
                offset: theme.sizes.spacing8,
                type: 'light',
              }}
              color={{ color: theme.colors.bodyTextDefault }}
              css={css`
                word-break: break-all;
                margin-left: ${theme.sizes.spacing8};
              `}
            >
              {goalText}
            </TextEllipsis>
          </div>
        </Tooltip>
        {!!metric.metricData?.progressiveData && (
          <StyledMetricGoalProgressiveBar
            metricProgressiveBarWidth={metricProgressiveBarWidth}
          />
        )}
      </StyledMetadataTabTableItemWrapper>

      <StyledMetadataTabTableItemWrapper
        width={32}
        centerVertically={true}
        padding={'sm'}
      >
        <Icon
          iconSize={'lg'}
          iconName={'searchDataIcon'}
          iconColor={{ color: iconColor }}
          css={css`
            margin-right: ${theme.sizes.spacing8};
          `}
        />
      </StyledMetadataTabTableItemWrapper>

      <StyledMetadataTabTableItemWrapper
        width={98}
        showLeftBorder={true}
        padding={'sm'}
        centerVertically={true}
      >
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
      </StyledMetadataTabTableItemWrapper>

      <StyledMetadataTabTableItemWrapper
        width={98}
        showLeftBorder={true}
        padding={'sm'}
        centerVertically={true}
      >
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
      </StyledMetadataTabTableItemWrapper>
    </StyledMetadataTabTableRow>
  )
}
