import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import { Portal } from 'react-portal'
import styled, { css, keyframes } from 'styled-components'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { addOrRemoveWeeks } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'
import { useDocument, useWindow } from '@mm/core/ssr'
import { usePreviousValue } from '@mm/core/ui/hooks'

import {
  MetricFrequency,
  MetricRules,
  MetricUnits,
  PermissionCheckResult,
  START_AND_END_WEEK_NUMBERS_FOR_LUXON_DEFAULT,
  TrackedMetricColorIntention,
  UNIT_TYPE_TO_DISPLAY_TEXT,
  UNIT_TYPE_TO_SYMBOL,
  WEEK_START_DEFAULT,
  WeekStartType,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomMetricsTabNode,
} from '@mm/core-bloom'

import {
  getInitialMetricScoreTimestampValuesForTab,
  getMetricsTableDateRanges,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
} from '@mm/core-bloom/metrics/computed'
import { useBloomMetricTabsMutations } from '@mm/core-bloom/metrics/metricsTabs/mutations'
import { useBloomMetricMutations } from '@mm/core-bloom/metrics/mutations'

import { Trans, useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  CheckBoxInput,
  Clickable,
  Icon,
  Menu,
  MetricsBadge,
  MetricsGraph,
  Text,
  TextInputSmall,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { POPUP_PORTAL_OUT_ID } from '@mm/bloom-web/pages/layout/consts'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'

import {
  getTrackedMetricColorIntentToBackgroundColorRecord,
  getTrackedMetricColorIntentToColorRecord,
} from '../constants'
import { METRIC_TABLE_SORT_SCORE_BY_VALUE } from '../metricsTable'
import {
  getMetricsRecordOfMetricIdToScoreData,
  handleSetMetricScoreDateRanges,
} from '../metricsTable/helpers'
import { getMetricsTabPermissions } from './metricsTabPermissions'
import { MetricsTabPopupPreviousRangeButton } from './metricsTabPopupPreviousRangeButton'
import { MetricsTabTable } from './metricsTabTable'
import { TabData, useMetricsTabsController } from './metricsTabsController'

// component that displays when the user clicks on a metrics tab
export const MetricsTabPopup = observer(function MetricsTabPopup(props: {
  tab: TabData | { newTab: true }
}) {
  const diResolver = useDIResolver()
  const document = useDocument()
  const window = useWindow()
  const terms = useBloomCustomTerms()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const {
    toggleActiveTabExpanded,
    dismissActiveTab,
    activeTabSessionInfo,
    moveActiveTab,
    setActiveTabForcedPosition,
    onDraggedToPositionAvailable,
    isTabData,
    isEmptyTab,
    deleteTabById,
    getActiveTab,
    meetingId,
  } = useMetricsTabsController()
  const { createMetricScore, editMetricScore } = useBloomMetricMutations()
  const {
    editMetricTab,
    removeMetricFromTab,
    removeAllMetricsFromTab,
    pinOrUnpinMetricTab,
  } = useBloomMetricTabsMutations()
  const popupContainerRef = React.createRef<HTMLDivElement>()

  const getFrequency = useComputed(
    () => {
      const activeTab = getActiveTab()
      return isTabData(activeTab) ? activeTab.frequency : 'WEEKLY'
    },
    { name: 'metricsTabPopup-frequency' }
  )

  const pageState = useObservable({
    isEditingTitle: false,
    movableAreaSize: {
      width: popupContainerRef.current?.clientWidth,
      height: popupContainerRef.current?.clientHeight,
    },
    metricsDateRangeStartAndEndTimestamp:
      getInitialMetricScoreTimestampValuesForTab({
        frequency: getFrequency(),
        diResolver,
      }),
  })

  const { width: movableAreaWidth, height: movableAreaHeight } =
    pageState.movableAreaSize

  const handleSetMoveableAreaSize = useAction(
    (opts: { width: number | undefined; height: number | undefined }) => {
      pageState.movableAreaSize = opts
    }
  )

  React.useEffect(() => {
    const popup = popupContainerRef.current
    if (!popup) return

    if (movableAreaWidth == null || movableAreaHeight == null) {
      handleSetMoveableAreaSize({
        width: popup.clientWidth,
        height: popup.clientHeight,
      })
      return
    }

    const onResize = () =>
      handleSetMoveableAreaSize({
        width: popup.clientWidth,
        height: popup.clientHeight,
      })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [
    handleSetMoveableAreaSize,
    popupContainerRef,
    movableAreaWidth,
    movableAreaHeight,
    window,
  ])

  const onDragEnd = React.useCallback(
    ({ x, y }) => {
      moveActiveTab({ x, y })
    },
    [moveActiveTab]
  )

  const onForcedReposition = React.useCallback(
    ({ x, y }) => {
      setActiveTabForcedPosition({ x, y })
    },
    [setActiveTabForcedPosition]
  )

  const tabNodeDef = useBloomMetricsTabNode()
  const meetingNodeDef = useBloomMeetingNode()
  const tabId = isTabData(props.tab) ? props.tab.id : null

  const subscription1 = useSubscription(
    {
      meeting: meetingId
        ? queryDefinition({
            def: meetingNodeDef,
            map: ({ reverseMetrics }) => ({
              reverseMetrics,
            }),
            target: { id: meetingId },
            useSubOpts: {
              doNotSuspend: true,
            },
          })
        : null,
    },
    {
      subscriptionId: `MetricsTabPopup-query1-${tabId || 'newTab'}`,
    }
  )

  const getMetricsTableScoreSortByValue = useComputed(
    () => {
      return !!subscription1().data.meeting?.reverseMetrics
        ? 'TIMESTAMP_DESC'
        : 'TIMESTAMP_ASC'
    },
    { name: 'metricsTabPopup-metricsTableScoreSortByValue' }
  )

  const metricTableScoreSortParams =
    METRIC_TABLE_SORT_SCORE_BY_VALUE[getMetricsTableScoreSortByValue()]

  // We can run into the situation where the quarter start/end overlaps a week with WEEKLY frequency.
  // To make sure that week is included in the score filters, we pad the weekly frequency by a week.
  const metricsTableScoreTimestampFilterValues =
    getFrequency() === 'WEEKLY'
      ? {
          timestamp: {
            gte: addOrRemoveWeeks({
              secondsSinceEpochUTC:
                pageState.metricsDateRangeStartAndEndTimestamp.startDate,
              weeks: -1,
            }),
            lte: addOrRemoveWeeks({
              secondsSinceEpochUTC:
                pageState.metricsDateRangeStartAndEndTimestamp.endDate,
              weeks: 1,
            }),
          },
        }
      : {
          timestamp: {
            gte: pageState.metricsDateRangeStartAndEndTimestamp.startDate,
            lte: pageState.metricsDateRangeStartAndEndTimestamp.endDate,
          },
        }

  const subscription2 = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ id, orgSettings }) => ({
          id,
          orgSettings: orgSettings({
            map: ({ weekStart }) => ({ weekStart }),
          }),
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
      meeting: meetingId
        ? queryDefinition({
            def: meetingNodeDef,
            target: { id: meetingId },
            map: ({
              startOfWeekOverride,
              currentMeetingAttendee,
              reverseMetrics,
              preventEditingUnownedMetrics,
              highlightPreviousWeekForMetrics,
            }) => ({
              startOfWeekOverride,
              preventEditingUnownedMetrics,
              reverseMetrics,
              highlightPreviousWeekForMetrics,
              currentMeetingAttendee: currentMeetingAttendee({
                map: ({ permissions }) => ({
                  permissions: permissions({
                    map: ({ view, edit, admin }) => ({ view, edit, admin }),
                  }),
                }),
              }),
            }),
            useSubOpts: {
              doNotSuspend: true,
            },
          })
        : null,
      tab: isTabData(props.tab)
        ? queryDefinition({
            def: tabNodeDef,
            map: ({
              isSharedToMeeting,
              isPinnedToTabBar,
              creator,
              frequency,
              trackedMetrics,
            }) => ({
              isSharedToMeeting,
              isPinnedToTabBar,
              creator: creator({
                map: ({ id }) => ({
                  id,
                }),
              }),
              frequency,
              trackedMetrics: trackedMetrics({
                map: ({ metric, color }) => ({
                  color,
                  metric: metric({
                    map: ({
                      id,
                      title,
                      rule,
                      units,
                      frequency,
                      singleGoalValue,
                      minGoalValue,
                      maxGoalValue,
                      metricDivider,
                      indexInTable,
                      formula,
                      assignee,
                      metricData,
                      notesId,
                      scoresNonPaginated,
                      customGoals,
                    }) => ({
                      id,
                      singleGoalValue,
                      minGoalValue,
                      maxGoalValue,
                      units,
                      frequency,
                      title,
                      rule,
                      notesId,
                      indexInTable,
                      metricDivider: metricDivider({
                        map: ({ id, title, height, indexInTable }) => ({
                          id,
                          title,
                          height,
                          indexInTable,
                        }),
                      }),
                      assignee: assignee({
                        map: ({
                          firstName,
                          lastName,
                          fullName,
                          avatar,
                          userAvatarColor,
                        }) => ({
                          firstName,
                          lastName,
                          fullName,
                          avatar,
                          userAvatarColor,
                        }),
                      }),
                      formula,
                      metricData,
                      scores: scoresNonPaginated({
                        map: ({ id, value, timestamp, notesText }) => ({
                          id,
                          value,
                          timestamp,
                          notesText,
                        }),
                        sort: metricTableScoreSortParams,
                        filter: {
                          and: [metricsTableScoreTimestampFilterValues],
                        },
                      }),
                      customGoals: customGoals({
                        sort: { startDate: 'asc' },
                        map: ({
                          startDate,
                          endDate,
                          rule,
                          singleGoalValue,
                          minGoalValue,
                          maxGoalValue,
                        }) => ({
                          startDate,
                          endDate,
                          rule,
                          singleGoalValue,
                          minGoalValue,
                          maxGoalValue,
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
            target: { id: props.tab.id },
            useSubOpts: {
              doNotSuspend: true,
            },
          })
        : null,
    },
    {
      subscriptionId: `MetricsTabPopup-query2-${tabId || 'newTab'}`,
    }
  )

  const currentTab = subscription2().data.tab
  const activeTab = getActiveTab()

  const getCurrentUserPermissions = useComputed(
    () => {
      const tab = subscription2().data.tab
      return getMetricsTabPermissions({
        isOwnerOfMetricTab: isTabData(tab)
          ? tab.creator.id === subscription2().data.currentUser?.id
          : true,
        isMetricTabShared: isTabData(tab) ? tab.isSharedToMeeting : false,
        currentUserPermissions:
          subscription2().data.meeting?.currentMeetingAttendee.permissions ??
          null,
      })
    },
    { name: 'metricsTabPopup-getCurrentUserPermissions' }
  )

  const getWeekStartData = useComputed(
    () => {
      return {
        orgStartAndEndOfWeekNumbersForLuxon:
          subscription2().data.currentUser?.orgSettings
            .startAndEndOfWeekNumbersForLuxon ||
          START_AND_END_WEEK_NUMBERS_FOR_LUXON_DEFAULT,
        orgSettingsWeekStart:
          subscription2().data.currentUser?.orgSettings.weekStart ||
          WEEK_START_DEFAULT,
        weekStartFromMeetingOrOrgSettings:
          subscription2().data.meeting?.startOfWeekOverride ||
          subscription2().data.currentUser?.orgSettings.weekStart ||
          WEEK_START_DEFAULT,
      }
    },
    { name: 'metricsTabPopup-getWeekStartData' }
  )

  const getMetricScoreDateRanges = useComputed(
    () => {
      const meetingFromSub2 = subscription2().data.meeting
      return getMetricsTableDateRanges({
        frequency: getFrequency(),
        startDate: pageState.metricsDateRangeStartAndEndTimestamp.startDate,
        endDate: pageState.metricsDateRangeStartAndEndTimestamp.endDate,
        metricsTableScoreSortByValue: getMetricsTableScoreSortByValue(),
        weekStartAndEndNumbersForLuxon: meetingFromSub2
          ? meetingFromSub2.startAndEndOfWeekNumbersForLuxon({
              weekStart: getWeekStartData().orgSettingsWeekStart,
            })
          : getWeekStartData().orgStartAndEndOfWeekNumbersForLuxon,
      })
    },
    { name: 'metricsTabPopup-getMetricScoreDateRanges' }
  )

  const getScoresForMetricScoreDateRangesWithNullForEmptyStrings = (props: {
    startOfWeek: WeekStartType
    scores: Array<{
      id: Id
      value: string
      timestamp: number
      notesText: Maybe<string>
      isTimestampWithinDateRange: (opts: {
        startDate: number
        endDate: number
        frequency: MetricFrequency
        startOfWeek: WeekStartType
      }) => boolean
    }>
  }) => {
    const { scores, startOfWeek } = props

    return getMetricScoreDateRanges().map((dateRange) => {
      const score = scores.find((score) =>
        score.isTimestampWithinDateRange({
          startDate: dateRange.start,
          endDate: dateRange.end,
          frequency: getFrequency(),
          startOfWeek,
        })
      )

      // v1 appears to create score nodes for every score cell regardless if the user had edited it or not.
      // They are set with the value as an empty string which was breaking highcharts since that expects
      // null values for points we should not plot. This check sets those values as null.
      return score && score.value
        ? score
        : { timestamp: dateRange.start, value: null }
    })
  }

  const getMetricsGraphDataWithNullValuesForMissingData = useComputed(
    () => {
      const tab = subscription2().data.tab
      return isTabData(tab)
        ? tab.trackedMetrics.nodes.map((trackedMetric) => {
            return {
              id: trackedMetric.id,
              title: trackedMetric.metric.title,
              color: trackedMetric.color,
              scores: getScoresForMetricScoreDateRangesWithNullForEmptyStrings({
                scores: trackedMetric.metric.scores,
                startOfWeek:
                  getWeekStartData().weekStartFromMeetingOrOrgSettings,
              }),
              currentGoal: trackedMetric.metric.goal,
              customGoals: trackedMetric.metric.customGoals.nodes.map(
                (customGoal) => ({
                  ...customGoal,
                  goal: customGoal.goal(trackedMetric.metric.units),
                })
              ),
            }
          })
        : []
    },
    { name: 'metricsTabPopup-getMetricsGraphDataWithNullValuesForMissingData' }
  )

  const getRecordOfMetricIdToMetricScoreData = useComputed(
    () => {
      const tab = subscription2().data.tab
      return isTabData(tab)
        ? getMetricsRecordOfMetricIdToScoreData({
            metrics: subscription2().data.tab?.trackedMetrics.nodes || [],
            metricScoreDateRanges: getMetricScoreDateRanges(),
            frequency: getFrequency(),
            startOfWeek: getWeekStartData().weekStartFromMeetingOrOrgSettings,
            currentUserId: subscription2().data.currentUser?.id ?? '',
            preventEditingUnownedMetrics:
              subscription2().data.meeting?.preventEditingUnownedMetrics ??
              false,
            currentUserPermissions:
              subscription2().data.meeting?.currentMeetingAttendee
                .permissions ?? null,
            highlightPreviousWeekForMetrics:
              subscription2().data.meeting?.highlightPreviousWeekForMetrics ??
              false,
            diResolver,
            sortDirection: getMetricsTableScoreSortByValue(),
          })
        : {}
    },
    { name: 'metricsTabPopup-getRecordOfMetricIdToMetricScoreData' }
  )

  const {
    canEditMetricTabInMeeting,
    canPerformDeleteActionsForMetricTabInMeeting,
  } = getCurrentUserPermissions()

  const handleSetMetricsDateRangeStartAndEndTimestamp = useAction(
    (opts: { startDate: number; endDate: number }) => {
      pageState.metricsDateRangeStartAndEndTimestamp = opts
    }
  )

  const handleSetIsEditingTitle = useAction((isEditing: boolean) => {
    pageState.isEditingTitle = isEditing
  })

  const onHandleClickOutsideTitle = React.useCallback(() => {
    handleSetIsEditingTitle(false)
  }, [handleSetIsEditingTitle])

  const onHandleSaveTitle = React.useCallback(
    async (title: string) => {
      try {
        const tab = subscription2().data.tab
        if (!tab) return
        await editMetricTab({
          id: tab.id,
          name: title,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error editing chart title.`),
          error: new UserActionError(e),
        })
      }
    },
    [editMetricTab, openOverlazy, t, subscription2().data.tab]
  )

  const onHandleDeleteMetricFromGraph = React.useCallback(
    async (trackedMetricId: Id) => {
      try {
        if (!tabId) return
        await removeMetricFromTab({
          trackedMetricId,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error removing {{metric}} from chart.`, {
            metric: terms.metric.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    },
    [tabId, openOverlazy, t, removeMetricFromTab, terms]
  )

  const onHandlePinOrUnpinMetricTab = React.useCallback(
    async (isPinnedToTabBar: boolean) => {
      try {
        const tab = subscription2().data.tab
        if (!tab) return
        await pinOrUnpinMetricTab({
          id: tab.id,
          isPinnedToTabBar,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error {{attach}} chart to tab bar.`, {
            attach: isPinnedToTabBar ? t(`attaching`) : t(`unattaching`),
          }),
          error: new UserActionError(e),
        })
      }
    },
    [subscription2().data.tab, openOverlazy, t, pinOrUnpinMetricTab]
  )

  const onHandleShareChartToMeeting = React.useCallback(
    async (shareToMeeting: boolean) => {
      try {
        const tab = subscription2().data.tab
        if (!tab || !subscription2().data.meeting) return
        await editMetricTab({
          id: tab.id,
          meetingId: subscription2().data.meeting?.id,
          isVisibleForTeam: shareToMeeting,
        })

        // automatically pin the tab when its no longer shared to the meeting
        if (!shareToMeeting && !tab.isPinnedToTabBar) {
          await onHandlePinOrUnpinMetricTab(true)
        }
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error sharing {{metric}} chart to meeting.`, {
            metric: terms.metric.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    },
    [
      subscription2().data.tab,
      subscription2().data.meeting,
      openOverlazy,
      t,
      editMetricTab,
      onHandlePinOrUnpinMetricTab,
      terms,
    ]
  )

  const onHandleClearAllMetricsFromTab = React.useCallback(async () => {
    try {
      if (!tabId) return
      await removeAllMetricsFromTab({
        metricsTabId: tabId,
      })
    } catch (e) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error removing all {{metrics}} from tab.`, {
          metrics: terms.metric.lowercasePlural,
        }),
        error: new UserActionError(e),
      })
    }
  }, [tabId, openOverlazy, t, removeAllMetricsFromTab, terms])

  const handleUpdateMetricScore = useCallback(
    async (props: {
      value: Maybe<string>
      timestamp: number
      metricId: Id
      scoreId?: Id
    }) => {
      // note: we do not need to convert YESNO metrics scores to 1 or 0 since charts do not allow YESNO units.
      const { value, timestamp, metricId, scoreId } = props

      try {
        if (scoreId) {
          await editMetricScore({ id: scoreId, value })
        } else {
          if (value) {
            await createMetricScore({ value, timestamp, metricId })
          }
        }
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Failed to update score.`),
          error: new UserActionError(e),
        })
      }
    },
    [openOverlazy, t, editMetricScore, createMetricScore]
  )

  const handleUpdateMetricChartDateRanges = useCallback(
    (props: {
      direction: 'FORWARD' | 'BACKWARD'
      frequency: MetricFrequency
    }) => {
      const { direction, frequency } = props
      handleSetMetricScoreDateRanges({
        direction,
        expandDateRanges: true,
        frequency,
        metricsDateRangeStartAndEndTimestamp:
          pageState.metricsDateRangeStartAndEndTimestamp,
        handleSetMetricsDateRangeStartAndEndTimestamp,
      })
    },
    [
      pageState.metricsDateRangeStartAndEndTimestamp,
      handleSetMetricsDateRangeStartAndEndTimestamp,
    ]
  )

  function getTabTitle() {
    if (isTabData(props.tab) && props.tab.name) return props.tab.name
    if (isTabData(props.tab) && props.tab.units)
      return UNIT_TYPE_TO_DISPLAY_TEXT[props.tab.units]
    return ''
  }

  const title = getTabTitle()

  function getGraphEmptyState() {
    if (isEmptyTab(props.tab)) {
      const icon = <Icon iconName='searchDataIcon' iconSize='xl' />
      return (
        <>
          <Trans>
            <Text
              type='h3'
              weight='normal'
              css={css`
                margin-bottom: ${(props) => props.theme.sizes.spacing12};
              `}
            >
              Click on any {icon} above to generate your chart.
            </Text>
          </Trans>

          <pre>
            <Trans>
              <Text type='h3' weight='normal'>
                You may add up to{' '}
              </Text>
              <Text type='h3' weight='semibold'>
                5
              </Text>
              <Text type='h3' weight='normal'>
                {' '}
                {terms.metric.lowercasePlural} to your chart
              </Text>
              .
            </Trans>
          </pre>
        </>
      )
    }

    if (isTabData(props.tab)) {
      return t('No data to display')
    }

    return t('Loading {{metric}} data...', {
      metric: terms.metric.lowercaseSingular,
    })
  }

  return (
    <Portal
      node={
        document.getElementById(POPUP_PORTAL_OUT_ID) as Maybe<HTMLDivElement>
      }
    >
      <div
        ref={popupContainerRef}
        css={css`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        `}
      >
        <MovablePopup
          getCurrentUserPermissions={getCurrentUserPermissions}
          lastDraggedTo={activeTabSessionInfo?.lastDraggedTo}
          lastForcefullyMovedTo={activeTabSessionInfo?.lastForcefullyMovedTo}
          movableAreaSize={pageState.movableAreaSize}
          expanded={!!activeTabSessionInfo?.expanded}
          onDragEnd={onDragEnd}
          onForcedReposition={onForcedReposition}
          onDraggedToPositionAvailable={onDraggedToPositionAvailable}
          title={title}
          isEditingTitle={pageState.isEditingTitle}
          isMetricTabSharedToMeeting={
            isTabData(activeTab) ? activeTab.isSharedToMeeting : false
          }
          isEmptyTab={isEmptyTab(activeTab)}
          onHandleClickOutsideTitle={onHandleClickOutsideTitle}
          onHandleSaveTitle={onHandleSaveTitle}
          onHandleShareChartToMeeting={onHandleShareChartToMeeting}
          onHandleClearAllMetricsFromTab={onHandleClearAllMetricsFromTab}
          actions={
            <>
              <ExpandButton
                onClick={toggleActiveTabExpanded}
                expanded={!!activeTabSessionInfo?.expanded}
              />
              <CloseButton onClick={dismissActiveTab} />
              <Menu
                content={(close) => (
                  <>
                    {isTabData(props.tab) && (
                      <>
                        {/* 
                        @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1879
                        <Menu.Item
                          onClick={(e) => {
                            openOverlazy('SaveMetricChartToWorkspaceModal', {})
                            close(e)
                          }}
                        >
                          <Text type={'body'}>{t('Save to workspaces')}</Text>
                        </Menu.Item> */}
                        <Menu.Item
                          disabled={
                            isTabData(activeTab)
                              ? activeTab.isSharedToMeeting &&
                                !canEditMetricTabInMeeting.allowed
                              : false
                          }
                          tooltip={
                            isTabData(activeTab)
                              ? activeTab.isSharedToMeeting &&
                                !canEditMetricTabInMeeting.allowed
                                ? {
                                    msg: canEditMetricTabInMeeting.message,
                                    position: 'right center',
                                  }
                                : undefined
                              : undefined
                          }
                          onClick={(e) => {
                            handleSetIsEditingTitle(true)
                            close(e)
                          }}
                        >
                          <Text type={'body'}>{t('Rename')}</Text>
                        </Menu.Item>
                      </>
                    )}
                    <Menu.Item
                      disabled={
                        !canPerformDeleteActionsForMetricTabInMeeting.allowed
                      }
                      tooltip={
                        !canPerformDeleteActionsForMetricTabInMeeting.allowed
                          ? {
                              msg: canPerformDeleteActionsForMetricTabInMeeting.message,
                              position: 'right center',
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        dismissActiveTab()
                        if (isTabData(activeTab)) {
                          deleteTabById(activeTab.id)
                        }

                        close(e)
                      }}
                    >
                      <Text type={'body'}>{t('Delete')}</Text>
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
                  ariaLabel={t('more chart options')}
                  tag={'span'}
                />
              </Menu>
            </>
          }
          content={
            <>
              <div
                css={css`
                  display: inline-flex;
                  width: 100%;
                  justify-content: ${isTabData(currentTab) &&
                  currentTab.trackedMetrics.nodes.length > 0
                    ? `flex-start`
                    : `center`};
                  overflow-x: auto;
                `}
              >
                {isTabData(currentTab) &&
                  currentTab.trackedMetrics.nodes.length > 0 && (
                    <MetricsTabPopupPreviousRangeButton
                      isChartReversed={
                        !!subscription1().data.meeting?.reverseMetrics
                      }
                      isLoading={subscription2().querying}
                      frequency={getFrequency()}
                      currentRangeTimestamp={
                        !!subscription1().data.meeting?.reverseMetrics
                          ? pageState.metricsDateRangeStartAndEndTimestamp
                              .endDate
                          : pageState.metricsDateRangeStartAndEndTimestamp
                              .startDate
                      }
                      direction={'BACKWARD'}
                      handleUpdateMetricChartDateRanges={
                        handleUpdateMetricChartDateRanges
                      }
                    />
                  )}
                <MetricsGraph
                  frequency={getFrequency()}
                  metrics={getMetricsGraphDataWithNullValuesForMissingData()}
                  reverseXAxis={!!subscription1().data.meeting?.reverseMetrics}
                  emptyState={getGraphEmptyState()}
                  yAxisPaddingPct={10}
                  units={isTabData(props.tab) ? props.tab.units : 'DOLLAR'}
                  UNIT_TYPE_TO_DISPLAY_TEXT={UNIT_TYPE_TO_DISPLAY_TEXT}
                  UNIT_TYPE_TO_SYMBOL={UNIT_TYPE_TO_SYMBOL}
                  getTrackedMetricColorIntentToColorRecord={
                    getTrackedMetricColorIntentToColorRecord
                  }
                  css={css`
                    width: ${!!activeTabSessionInfo?.expanded ? `100%` : `89%`};
                  `}
                />
                {isTabData(currentTab) &&
                  currentTab.trackedMetrics.nodes.length > 0 && (
                    <MetricsTabPopupPreviousRangeButton
                      isChartReversed={
                        !!subscription1().data.meeting?.reverseMetrics
                      }
                      isLoading={subscription2().querying}
                      frequency={getFrequency()}
                      currentRangeTimestamp={
                        !!subscription1().data.meeting?.reverseMetrics
                          ? pageState.metricsDateRangeStartAndEndTimestamp
                              .startDate
                          : pageState.metricsDateRangeStartAndEndTimestamp
                              .endDate
                      }
                      direction={'FORWARD'}
                      handleUpdateMetricChartDateRanges={
                        handleUpdateMetricChartDateRanges
                      }
                    />
                  )}
              </div>

              {isTabData(currentTab) &&
                subscription2().data.meeting &&
                (!!activeTabSessionInfo?.expanded ? (
                  <MetricsTabTable
                    getCurrentUserPermissions={getCurrentUserPermissions}
                    weekStart={
                      getWeekStartData().weekStartFromMeetingOrOrgSettings
                    }
                    isLoading={subscription2().querying}
                    trackedMetrics={currentTab.trackedMetrics.nodes}
                    meetingId={subscription2().data.meeting?.id || ''}
                    getRecordOfMetricIdToMetricScoreData={
                      getRecordOfMetricIdToMetricScoreData
                    }
                    tabId={currentTab.id}
                    handleUpdateMetricScore={handleUpdateMetricScore}
                    onHandleDeleteMetricFromGraph={
                      onHandleDeleteMetricFromGraph
                    }
                    handleClearAllMetricsFromChart={
                      onHandleClearAllMetricsFromTab
                    }
                  />
                ) : (
                  <>
                    <MetricsChartBadges
                      metrics={
                        currentTab?.trackedMetrics.nodes.map(
                          (trackedMetric) => {
                            const goal = trackedMetric.metric.goal

                            return {
                              id: trackedMetric.id,
                              title: trackedMetric.metric.title,
                              color: trackedMetric.color,
                              units: trackedMetric.metric.units,
                              rule: trackedMetric.metric.rule,
                              goal: isSingleValueMetricGoal(goal)
                                ? goal.valueFormatted
                                : isMinMaxMetricGoal(goal)
                                  ? `${goal.minData.minFormatted} - ${goal.maxData.maxFormatted}`
                                  : t('N/A'),
                              frequency: trackedMetric.metric.frequency,
                            }
                          }
                        ) || []
                      }
                      canPerformDeleteActionsForMetricTabInMeeting={
                        canPerformDeleteActionsForMetricTabInMeeting
                      }
                      onDeleteMetric={onHandleDeleteMetricFromGraph}
                    />
                  </>
                ))}
            </>
          }
        />
      </div>
    </Portal>
  )
})

const MovablePopup = observer(
  (props: {
    getCurrentUserPermissions: () => {
      canSharePersonalMetricsTabsToMeeting: PermissionCheckResult
      canEditMetricTabInMeeting: PermissionCheckResult
      canPerformDeleteActionsForMetricTabInMeeting: PermissionCheckResult
    }
    lastDraggedTo: { x: number; y: number } | null
    lastForcefullyMovedTo: { x: number; y: number } | null
    movableAreaSize: { width?: number; height?: number }
    expanded: boolean
    title: string
    isEditingTitle: boolean
    actions: React.ReactNode
    content: React.ReactNode
    isMetricTabSharedToMeeting: boolean
    isEmptyTab: boolean
    onHandleClickOutsideTitle: () => void
    onHandleSaveTitle: (title: string) => void
    onDragEnd: (endPosition: { x: number; y: number }) => void
    onForcedReposition: (endPosition: { x: number; y: number }) => void
    onDraggedToPositionAvailable: () => void
    onHandleShareChartToMeeting: (shareToMeeting: boolean) => void
    onHandleClearAllMetricsFromTab: () => void
  }) => {
    const document = useDocument()
    const popupRef = React.createRef<HTMLDivElement>()

    const {
      getCurrentUserPermissions,
      expanded,
      lastDraggedTo,
      lastForcefullyMovedTo,
      onForcedReposition,
      onDraggedToPositionAvailable,
      onDragEnd: propsDragEnd,
      movableAreaSize: { width: movableAreaWidth, height: movableAreaHeight },
      title,
      isEditingTitle,
      actions,
      content,
      isMetricTabSharedToMeeting,
      isEmptyTab,
      onHandleClickOutsideTitle,
      onHandleSaveTitle,
      onHandleShareChartToMeeting,
      onHandleClearAllMetricsFromTab,
    } = props

    const previouslyExpanded = usePreviousValue(expanded)
    const animate = previouslyExpanded !== expanded

    const { x: currentX, y: currentY } = {
      x: lastForcefullyMovedTo?.x ?? lastDraggedTo?.x ?? 0,
      y: lastForcefullyMovedTo?.y ?? lastDraggedTo?.y ?? 0,
    }

    // this handles the case where the movable area size changes
    React.useEffect(() => {
      // when going from non expanded to expanded for the first time,
      // the browser would report a popup width that was equal to the movable area width, including paddings, even though it should've been 100%
      // of the width not counting padding
      // what that causes is this forced reposition to execute, which causes a re-render of the parent component,
      // which in turn causes the animation when going from expanded to non expanded for the first time to not occur
      // this animate check prevents that, by preventing any forced reposition when the popup is expanding or contracting
      if (animate) return

      // when going from expanded to non expanded, the popup width is 100% of the movable area width
      // while this is happening, and without this early return, the code below calculates the best position for the popup
      // and decides that it's at x:0, since the popup width is equal to the movable area width
      // which causes it to not go back to the last position the user moved the popup to when the popup is non expanded
      // HOWEVER, this is not an ideal solution either, since with this check, if a user expands a popup, then resizes their window
      // to no longer fit the original popup position pre-expand, the popup will still return to its position pre-expand
      // even if that position does not necessarily fit within the movable area
      if (expanded) return

      const popup = popupRef.current
      // movable area has not yet rendered
      if (
        !popup ||
        movableAreaWidth == null ||
        movableAreaWidth === 0 ||
        movableAreaHeight == null ||
        movableAreaHeight === 0
      )
        return

      const width = popup.clientWidth
      const height = popup.clientHeight

      // returns true if popup fits within movableArea, at a given x and y position
      function tryPosition(position: {
        x: number
        y: number
      }):
        | { fits: true }
        | { fits: false; overflowRight: number; overflowBottom: number } {
        const overflowRight = Math.max(
          position.x + width - (movableAreaWidth as number),
          0
        )
        const overflowBottom = Math.max(
          position.y + height - (movableAreaHeight as number),
          0
        )

        if (overflowRight > 0 || overflowBottom > 0) {
          return {
            fits: false,
            overflowRight,
            overflowBottom,
          }
        }

        return { fits: true }
      }

      const lastDraggedPositionAttempt = lastDraggedTo
        ? tryPosition(lastDraggedTo)
        : null

      if (lastDraggedPositionAttempt?.fits) {
        // if the popup was forcefully moved and now fits in the last position it was dragged to
        if (lastForcefullyMovedTo != null) {
          onDraggedToPositionAvailable()
        }
        return
      } else if (lastDraggedTo && lastDraggedPositionAttempt?.fits === false) {
        // if the popup does not fit at the last dragged position
        const closestXToDesiredPosition =
          lastDraggedTo.x - lastDraggedPositionAttempt.overflowRight

        const closestYToDesiredPosition =
          lastDraggedTo.y - lastDraggedPositionAttempt.overflowBottom

        if (
          closestXToDesiredPosition !== lastForcefullyMovedTo?.x ||
          closestYToDesiredPosition !== lastForcefullyMovedTo?.y
        ) {
          onForcedReposition({
            x: closestXToDesiredPosition,
            y: closestYToDesiredPosition,
          })
        }
        return
      }
    }, [
      popupRef,
      onForcedReposition,
      movableAreaHeight,
      movableAreaWidth,
      lastDraggedTo,
      lastForcefullyMovedTo,
      onDraggedToPositionAvailable,
      animate,
      expanded,
    ])

    const onDragAreaMouseDown = React.useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        const popup = popupRef.current
        // movable area has not yet rendered
        if (
          !popup ||
          movableAreaWidth == null ||
          movableAreaWidth === 0 ||
          movableAreaHeight == null ||
          movableAreaHeight === 0
        )
          return

        const previousLeftStyle = popup.style.left
        const previousTopStyle = popup.style.top
        let previousPosition = { x: e.clientX, y: e.clientY }

        const onDrag = (e: MouseEvent) => {
          const { clientX: currentX, clientY: currentY } = e
          let left = popup.offsetLeft + (currentX - previousPosition.x)
          let top = popup.offsetTop + (currentY - previousPosition.y)
          previousPosition = { x: currentX, y: currentY }

          if (left + popup.clientWidth > movableAreaWidth) {
            left = movableAreaWidth - popup.clientWidth
          }

          if (left < 0) {
            left = 0
          }

          if (top + popup.clientHeight > movableAreaHeight) {
            top = movableAreaHeight - popup.clientHeight
          }

          if (top < 0) {
            top = 0
          }

          popup.style.left = `${left}px`
          popup.style.top = `${top}px`
        }

        const onDragEnd = () => {
          document.removeEventListener('mousemove', onDrag)
          document.removeEventListener('mouseup', onDragEnd)

          propsDragEnd({
            x: popup.offsetLeft,
            y: popup.offsetTop,
          })
          // removes the hardcoded styles after onDragEnd is called
          // at that point we hand over control back to the styled component's styles (which are based on props)
          // this prevents it from looking funky when the popup is expanded after being dragged
          popup.style.left = previousLeftStyle
          popup.style.top = previousTopStyle
        }

        document.addEventListener('mousemove', onDrag)
        document.addEventListener('mouseup', onDragEnd)
      },
      [popupRef, propsDragEnd, movableAreaHeight, movableAreaWidth, document]
    )

    return (
      <StyledPopup
        x={currentX}
        y={currentY}
        expanded={expanded}
        animate={animate}
        ref={popupRef}
      >
        <PopupHeader
          title={title}
          isEmptyTab={isEmptyTab}
          isExpanded={expanded}
          isMetricTabSharedToMeeting={isMetricTabSharedToMeeting}
          isEditingTitle={isEditingTitle}
          draggable={!expanded}
          getCurrentUserPermissions={getCurrentUserPermissions}
          actions={actions}
          onDragAreaMouseDown={onDragAreaMouseDown}
          onHandleShareChartToMeeting={onHandleShareChartToMeeting}
          onHandleClickOutsideTitle={onHandleClickOutsideTitle}
          onHandleSaveTitle={onHandleSaveTitle}
        />
        <PopupContent>{content}</PopupContent>
        {!expanded && (
          <PopupFooter
            isEmptyTab={isEmptyTab}
            getCurrentUserPermissions={getCurrentUserPermissions}
            isMetricTabSharedToMeeting={isMetricTabSharedToMeeting}
            onHandleShareChartToMeeting={onHandleShareChartToMeeting}
            onHandleClearAllMetricsFromTab={onHandleClearAllMetricsFromTab}
          />
        )}
      </StyledPopup>
    )
  }
)

const DEFAULT_POPUP_WIDTH = 616

function getExpand(opts: { starting: { x: number; y: number } }) {
  return keyframes`
    0% {
      left: ${opts.starting.x}px;
      top: ${opts.starting.y}px;
      transform: translateY(0);
      width: ${toREM(DEFAULT_POPUP_WIDTH)};
    }
    
    100% {
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
    }
  `
}

function getCollapse(opts: { ending: { x: number; y: number } }) {
  return keyframes`
  0% {
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
  }

  100% {
    left: ${opts.ending.x}px;
    top: ${opts.ending.y}px;
    transform: translateY(0);
    width: ${toREM(DEFAULT_POPUP_WIDTH)};
  }
`
}

const StyledPopup = styled.div<{
  y: number
  x: number
  expanded: boolean
  animate: boolean
}>`
  position: absolute;
  border-radius: ${({ theme }) => theme.sizes.br1};
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  /* the parent container has pointer-events set to none to allow clicking elements behind it, 
     so we need to set it to initial here */
  pointer-events: initial;
  box-shadow: ${({ theme }) => theme.sizes.bs4};
  background: ${({ theme }) => theme.colors.metricsTabPopupContentBackground};
  ${({ x, y, expanded, animate }) => {
    if (expanded) {
      return css`
        width: 100%;
        left: 0%;
        top: 50%;
        transform: translateY(-50%);
        animation: ${animate
          ? css`
              ${getExpand({ starting: { x, y } })} 400ms linear
            `
          : 'none'};
      `
    } else {
      return css`
        width: ${toREM(DEFAULT_POPUP_WIDTH)};
        top: ${y}px;
        left: ${x}px;
        transform: translateY(0);
        animation: ${animate
          ? css`
              ${getCollapse({ ending: { x, y } })} 400ms linear
            `
          : 'none'};
      `
    }
  }}
`

const PopupHeader = function PopupHeader(props: {
  title: string
  getCurrentUserPermissions: () => {
    canSharePersonalMetricsTabsToMeeting: PermissionCheckResult
    canEditMetricTabInMeeting: PermissionCheckResult
  }
  isExpanded: boolean
  isEmptyTab: boolean
  isMetricTabSharedToMeeting: boolean
  draggable: boolean
  isEditingTitle: boolean
  actions: React.ReactNode
  onHandleShareChartToMeeting: (shareToMeeting: boolean) => void
  onDragAreaMouseDown: (e: React.MouseEvent) => void
  onHandleClickOutsideTitle: () => void
  onHandleSaveTitle: (title: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  const permissionCheckForMakeChartPublic = props.isMetricTabSharedToMeeting
    ? props.getCurrentUserPermissions().canEditMetricTabInMeeting
    : props.getCurrentUserPermissions().canSharePersonalMetricsTabsToMeeting

  return (
    <StyledPopupHeader
      draggable={props.draggable && !props.isEditingTitle}
      onMouseDown={
        props.draggable && !props.isEditingTitle
          ? props.onDragAreaMouseDown
          : undefined
      }
    >
      <div
        css={css`
          display: inline-flex;
          align-items: center;
          max-width: 50%;
        `}
      >
        <HeaderTitle
          title={props.title}
          isEditingTitle={props.isEditingTitle}
          onHandleClickOutsideTitle={props.onHandleClickOutsideTitle}
          onHandleSaveTitle={props.onHandleSaveTitle}
        />
        {props.isExpanded && !props.isEmptyTab && (
          <div
            css={css`
              display: inline-flex;
              flex-wrap: no-wrap;
              align-items: center;
              flex-shrink: 0;
              margin-left: ${(props) => props.theme.sizes.spacing24};
            `}
          >
            <CheckBoxInput
              id={'metricsChartMakeChartPublicId'}
              name={'metricsChartMakeChartPublic'}
              inputType='toggle'
              disabled={!permissionCheckForMakeChartPublic.allowed}
              tooltip={
                !permissionCheckForMakeChartPublic.allowed
                  ? {
                      msg: permissionCheckForMakeChartPublic.message,
                      position: 'top left',
                    }
                  : undefined
              }
              value={props.isMetricTabSharedToMeeting}
              onChange={props.onHandleShareChartToMeeting}
            />
            <Icon
              iconName={'meetings'}
              iconSize={'xl'}
              css={css`
                margin-right: ${(props) => props.theme.sizes.spacing8};
              `}
            />
            <Text
              weight={'semibold'}
              type={'body'}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {t('Make chart public to meeting')}
            </Text>
          </div>
        )}
      </div>
      <div
        css={css`
          flex-shrink: 0;
        `}
      >
        {props.actions}
      </div>
    </StyledPopupHeader>
  )
}

const StyledPopupHeader = styled.div<{ draggable: boolean }>`
  background: ${({ theme }) => theme.colors.metricsTabPopupHeaderBackground};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.sizes.spacing8}
    ${theme.sizes.spacing16}`};
  ${({ draggable }) => draggable && `cursor: grab;`}
`

const PopupContent = function PopupContent(props: {
  children: React.ReactNode
}) {
  return <StyledPopupContent>{props.children}</StyledPopupContent>
}

const StyledPopupContent = styled.div`
  padding: ${({ theme }) => theme.sizes.spacing16};
  flex: 1;
  overflow-y: auto;
`

function HeaderTitle(props: {
  title: string
  isEditingTitle: boolean
  onHandleClickOutsideTitle: () => void
  onHandleSaveTitle: (title: string) => void
}) {
  const headerTitleRef = React.createRef<HTMLDivElement>()
  const {
    isEditingTitle,
    title,
    onHandleClickOutsideTitle,
    onHandleSaveTitle,
  } = props

  const memoizedTitleFormValues = useMemo(() => {
    return {
      metricTabTitle: title,
    }
  }, [title])

  return (
    <EditForm
      isLoading={false}
      values={memoizedTitleFormValues as { metricTabTitle: string }}
      validation={
        {
          metricTabTitle: formValidators.string({
            additionalRules: [required(), maxLength({ maxLength: 50 })],
          }),
        } satisfies GetParentFormValidation<{ metricTabTitle: string }>
      }
      sendDiffs={false}
      onSubmit={async (values) => {
        if (values.metricTabTitle) {
          onHandleSaveTitle(values.metricTabTitle)
        }
      }}
    >
      {({ fieldNames }) => (
        <div
          ref={headerTitleRef}
          css={css`
            width: 100%;
          `}
        >
          <TextInputSmall
            name={fieldNames.metricTabTitle}
            id={'metricTabTitleId'}
            outsideClickProps={{
              clickOutsideRef: headerTitleRef,
              onClickOutside: () => onHandleClickOutsideTitle(),
            }}
            height={toREM(20)}
            textStyles={{ type: 'h3', weight: 'semibold' }}
            isEditing={isEditingTitle}
            highlightInitialText={true}
            width={isEditingTitle ? 'fit-content' : '100%'}
            css={css`
              max-width: 100%;

              .contentEditable {
                line-height: unset;
              }
            `}
          />
        </div>
      )}
    </EditForm>
  )
}

function ExpandButton(props: { onClick: () => void; expanded: boolean }) {
  return (
    <Clickable
      {...props}
      css={css`
        margin-left: ${(prop) => prop.theme.sizes.spacing16};
      `}
      clicked={props.onClick}
    >
      {props.expanded ? (
        <Icon iconName='collapseIcon' iconSize='lg' />
      ) : (
        <Icon iconName='expandIcon' iconSize='lg' />
      )}
    </Clickable>
  )
}

function CloseButton(props: { onClick: () => void }) {
  return (
    <Clickable
      {...props}
      css={css`
        margin: 0 ${(prop) => prop.theme.sizes.spacing16};
      `}
      clicked={props.onClick}
    >
      <Icon iconName='closeIcon' iconSize='lg' />
    </Clickable>
  )
}

const MetricsChartBadges = (props: {
  metrics: Array<{
    id: Id
    title: string
    units: MetricUnits
    rule: MetricRules
    color: TrackedMetricColorIntention
    goal: string
    frequency: MetricFrequency
  }>
  canPerformDeleteActionsForMetricTabInMeeting: PermissionCheckResult
  onDeleteMetric: (metricId: Id) => void
}) => {
  const {
    metrics,
    onDeleteMetric,
    canPerformDeleteActionsForMetricTabInMeeting,
  } = props

  return (
    <div
      css={css`
        display: flex;
        flex-flow: row wrap;
        padding: ${(props) => props.theme.sizes.spacing16} 0 0 0;
      `}
    >
      {metrics.map((metric) => (
        <MetricsBadge
          key={metric.id}
          color={metric.color}
          title={metric.title}
          id={metric.id}
          goal={metric.goal}
          rule={metric.rule}
          frequency={metric.frequency}
          showGoalBadge={metrics.length === 1}
          getTrackedMetricColorIntentToColorRecord={
            getTrackedMetricColorIntentToColorRecord
          }
          getTrackedMetricColorIntentToBackgroundColorRecord={
            getTrackedMetricColorIntentToBackgroundColorRecord
          }
          canPerformDeleteActionsForMetricTabInMeeting={
            canPerformDeleteActionsForMetricTabInMeeting
          }
          onDeleteBadge={onDeleteMetric}
        />
      ))}
    </div>
  )
}

const PopupFooter = (props: {
  isEmptyTab: boolean
  getCurrentUserPermissions: () => {
    canSharePersonalMetricsTabsToMeeting: PermissionCheckResult
    canEditMetricTabInMeeting: PermissionCheckResult
    canPerformDeleteActionsForMetricTabInMeeting: PermissionCheckResult
  }
  isMetricTabSharedToMeeting: boolean
  onHandleShareChartToMeeting: (shareToMeeting: boolean) => void
  onHandleClearAllMetricsFromTab: () => void
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const {
    isMetricTabSharedToMeeting,
    getCurrentUserPermissions,
    onHandleShareChartToMeeting,
    onHandleClearAllMetricsFromTab,
  } = props

  const permissionCheckForMakeChartPublic = isMetricTabSharedToMeeting
    ? getCurrentUserPermissions().canEditMetricTabInMeeting
    : getCurrentUserPermissions().canSharePersonalMetricsTabsToMeeting

  const canPerformDeleteActionsForMetricTabInMeeting =
    getCurrentUserPermissions().canPerformDeleteActionsForMetricTabInMeeting

  return (
    <StyledPopupFooter>
      {props.isEmptyTab ? null : (
        <>
          <div
            css={css`
              display: inline-flex;
              align-items: center;
            `}
          >
            <CheckBoxInput
              id={'metricsChartMakeChartPublicId'}
              name={'metricsChartMakeChartPublic'}
              inputType='toggle'
              disabled={!permissionCheckForMakeChartPublic.allowed}
              tooltip={
                !permissionCheckForMakeChartPublic.allowed
                  ? {
                      msg: permissionCheckForMakeChartPublic.message,
                      position: 'top left',
                    }
                  : undefined
              }
              value={isMetricTabSharedToMeeting}
              onChange={onHandleShareChartToMeeting}
            />
            <Icon
              iconName={'meetings'}
              iconSize={'xl'}
              css={css`
                margin-right: ${(props) => props.theme.sizes.spacing8};
              `}
            />
            <Text
              weight={'semibold'}
              type={'body'}
              color={{ color: theme.colors.bodyTextDefault }}
            >
              {t('Make chart public to meeting')}
            </Text>
          </div>
          <BtnText
            disabled={!canPerformDeleteActionsForMetricTabInMeeting.allowed}
            tooltip={
              !canPerformDeleteActionsForMetricTabInMeeting.allowed
                ? {
                    msg: canPerformDeleteActionsForMetricTabInMeeting.message,
                    position: 'right center',
                  }
                : undefined
            }
            onClick={onHandleClearAllMetricsFromTab}
            intent='tertiaryTransparent'
            width='noPadding'
            ariaLabel={t('clear all')}
            css={css`
              align-self: flex-start;
            `}
          >
            {t('Clear all')}
          </BtnText>
        </>
      )}
    </StyledPopupFooter>
  )
}

const StyledPopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${toREM(40)};
  background: ${({ theme }) => theme.colors.metricsTabPopupFooterBackground};
  padding: ${({ theme }) =>
    `${theme.sizes.spacing10} ${theme.sizes.spacing16}`};
`

export default MetricsTabPopup
