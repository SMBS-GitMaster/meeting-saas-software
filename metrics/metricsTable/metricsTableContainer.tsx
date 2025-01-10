import { observer } from 'mobx-react'
import React, { useCallback, useEffect } from 'react'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { addOrRemoveWeeks } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  ChartableMetricUnits,
  MetricFrequency,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingMutations,
  useBloomMeetingNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import {
  getInitialMetricScoreTimestampValuesForTable,
  getMetricsTableDateRanges,
  getNumericStringValueFromTextValueForMetricYesNoUnits,
} from '@mm/core-bloom/metrics/computed'
import { useBloomMetricMutations } from '@mm/core-bloom/metrics/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'

import {
  TabData,
  useMetricsTabsController,
} from '../metricsTabs/metricsTabsController'
import { getMetricTablePermissions } from './metricTablePermissions'
import {
  DEFAULT_METRIC_DIVIDER_SIZE,
  METRIC_TABLE_FILTER_BY_TAB,
  METRIC_TABLE_SORT_SCORE_BY_VALUE,
  RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT,
} from './metricsTableConstants'
import {
  IMetricsTableContainerProps,
  IMetricsTableViewActionHandlers,
} from './metricsTableTypes'

export const MetricsTableContainer = observer(function MetricsTableContainer(
  props: IMetricsTableContainerProps
) {
  const { meetingId } = props

  const diResolver = useDIResolver()
  const terms = useBloomCustomTerms()
  const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
  const { editMeeting } = useBloomMeetingMutations()
  const {
    createMetricScore,
    editMetricScore,
    deleteMetricDivider,
    createMetricDivider,
    editMetricDivider,
    sortAndReorderMetrics,
  } = useBloomMetricMutations()
  const {
    displayMetricsTabs,
    hideMetricsTabs,
    onChartMetricClickedFromTable,
    getActiveTab,
    allTabs,
    isTabData,
    getActiveTabPermissions,
    updateFrequency,
  } = useMetricsTabsController()
  const { editWorkspaceTile } = useBloomWorkspaceMutations()
  const { openOverlazy, closeOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const { checkIfEmbeddedDrawerIsAvailable } = useDrawerController()

  const subscription1 = useSubscription(
    {
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({ reverseMetrics, startOfWeekOverride }) => ({
          reverseMetrics,
          startOfWeekOverride,
        }),
        target: { id: meetingId },
      }),
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ orgSettings }) => ({
          orgSettings: orgSettings({ map: ({ weekStart }) => ({ weekStart }) }),
        }),
      }),
    },
    {
      subscriptionId: `MetricsTableContainer-query1-${meetingId}`,
    }
  )

  const getMetricsTableScoreSortByValue = useComputed(
    () => {
      return subscription1().data.meeting.reverseMetrics
        ? 'TIMESTAMP_DESC'
        : 'TIMESTAMP_ASC'
    },
    { name: 'metricsTableContainer-metricsTableScoreSortByValue' }
  )

  const pageState = useObservable(() => ({
    metricsTableSelectedTab: 'WEEKLY' as MetricFrequency,
    metricTableColumnToIsVisibleSettings: {
      owner: true,
      goal: true,
      cumulative: true,
      average: true,
    },
    metricsDateRangeStartAndEndTimestamp:
      getInitialMetricScoreTimestampValuesForTable({
        frequency: 'WEEKLY',
        diResolver,
        startOfWeek:
          subscription1().data.meeting.startOfWeekOverride ||
          subscription1().data.currentUser.orgSettings.weekStart,
      }),
  }))

  const pageType = props.pageType || 'MEETING'

  const isExpandedOnWorkspacePage =
    activeFullScreenTileId !== null &&
    activeFullScreenTileId === props.workspaceTileId

  const metricTableFilterParams =
    METRIC_TABLE_FILTER_BY_TAB[pageState.metricsTableSelectedTab]

  const metricTableScoreSortParams =
    METRIC_TABLE_SORT_SCORE_BY_VALUE[getMetricsTableScoreSortByValue()]

  const metricsTableScoreTimestampFilterValues =
    pageState.metricsTableSelectedTab === 'WEEKLY'
      ? {
          timestamp: {
            // padding the start date by a week to ensure we get the previous week's data
            // this is because when creating a weekly score when using a custom weekly start date of Tuesday, for example,
            // the mutation uses the previous Sunday as the timestamp for that score
            // to ensure compatiblity with v1
            // omitting this padding causes the score on the week to the far right in the metrics table to not be displayed
            // when the week start is not Sunday
            gte: addOrRemoveWeeks({
              secondsSinceEpochUTC:
                pageState.metricsDateRangeStartAndEndTimestamp.startDate,
              weeks: -1,
            }),
            lte: pageState.metricsDateRangeStartAndEndTimestamp.endDate,
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
        map: ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          settings,
        }) => ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          settings: settings({ map: ({ timezone }) => ({ timezone }) }),
        }),
      }),
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({
          meetingType,
          name,
          metrics,
          preventEditingUnownedMetrics,
          highlightPreviousWeekForMetrics,
          metricTableWidthDragScrollPct,
          metricTableColumnToIsVisibleSettings,
          currentMeetingAttendee,
        }) => ({
          meetingType,
          name,
          metricTableWidthDragScrollPct,
          preventEditingUnownedMetrics,
          highlightPreviousWeekForMetrics,
          metricTableColumnToIsVisibleSettings:
            metricTableColumnToIsVisibleSettings({
              map: ({ owner, goal, cumulative, average }) => ({
                owner,
                goal,
                cumulative,
                average,
              }),
            }),
          metrics: metrics({
            filter: {
              and: [
                {
                  archived: false,
                  ...metricTableFilterParams,
                },
              ],
            },
            sort: { indexInTable: 'asc' },
            map: ({
              title,
              archived,
              singleGoalValue,
              minGoalValue,
              maxGoalValue,
              id,
              indexInTable,
              units,
              rule,
              frequency,
              assignee,
              formula,
              metricData,
              metricDivider,
              scoresNonPaginated,
              customGoals,
              notesId,
            }) => ({
              title,
              archived,
              singleGoalValue,
              minGoalValue,
              maxGoalValue,
              id,
              indexInTable,
              units,
              rule,
              frequency,
              formula,
              metricDivider: metricDivider({
                map: ({ height, title, id, indexInTable }) => ({
                  height,
                  title,
                  id,
                  indexInTable,
                }),
              }),
              metricData,
              notesId,
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
              scores: scoresNonPaginated({
                map: ({ value, timestamp, id, notesText }) => ({
                  value,
                  timestamp,
                  id,
                  notesText,
                }),
                filter: {
                  and: [metricsTableScoreTimestampFilterValues],
                },
                sort: { ...metricTableScoreSortParams },
              }),
              customGoals: customGoals({
                sort: { startDate: 'asc' },
                map: ({
                  singleGoalValue,
                  maxGoalValue,
                  minGoalValue,
                  startDate,
                  endDate,
                  rule,
                }) => ({
                  singleGoalValue,
                  maxGoalValue,
                  minGoalValue,
                  startDate,
                  endDate,
                  rule,
                }),
              }),
            }),
          }),
          currentMeetingAttendee: currentMeetingAttendee({
            map: ({ permissions }) => ({
              permissions: permissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
          }),
        }),
        target: { id: meetingId },
      }),
    },
    {
      subscriptionId: `MetricsTableContainer-query2-${meetingId}`,
    }
  )

  const subscription3 = useSubscription(
    {
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({ metrics }) => ({
          weeklyMetricsTotalCount: metrics({
            filter: {
              and: [
                {
                  archived: false,
                  frequency: 'WEEKLY',
                },
              ],
            },
            map: ({ id, archived, frequency }) => ({
              id,
              archived,
              frequency,
            }),
            pagination: {
              includeTotalCount: true,
            },
          }),
          monthlyMetricsTotalCount: metrics({
            filter: {
              and: [
                {
                  archived: false,
                  frequency: 'MONTHLY',
                },
              ],
            },
            map: ({ id, archived, frequency }) => ({
              id,
              archived,
              frequency,
            }),
            pagination: {
              includeTotalCount: true,
            },
          }),
          quarterlyMetricsTotalCount: metrics({
            filter: {
              and: [
                {
                  archived: false,
                  frequency: 'QUARTERLY',
                },
              ],
            },
            map: ({ id, archived, frequency }) => ({
              id,
              archived,
              frequency,
            }),
            pagination: {
              includeTotalCount: true,
            },
          }),
          dailyMetricsTotalCount: metrics({
            filter: {
              and: [
                {
                  archived: false,
                  frequency: 'DAILY',
                },
              ],
            },
            map: ({ id, archived, frequency }) => ({
              id,
              archived,
              frequency,
            }),
            pagination: {
              includeTotalCount: true,
            },
          }),
        }),
        target: { id: meetingId },
        useSubOpts: { doNotSuspend: true },
      }),
    },
    {
      subscriptionId: `MetricsTableContainer-query3-notSuspendedData-${meetingId}`,
    }
  )

  const getCurrentUserPermissions = useComputed(
    () => {
      return getMetricTablePermissions(
        subscription2().data.meeting?.currentMeetingAttendee.permissions ?? null
      )
    },
    { name: 'metricsTableContainer-getCurrentUserPermissions' }
  )

  const getMetricsHaveCumulativeData = useComputed(
    () => {
      return subscription2().data.meeting.metrics.nodes.some(
        (metric) => metric.metricData?.cumulativeData
      )
    },
    { name: 'metricsTableContainer-metricsHaveCumulativeData' }
  )

  const getMetricsHaveAverageData = useComputed(
    () => {
      return subscription2().data.meeting.metrics.nodes.some(
        (metric) => metric.metricData?.averageData
      )
    },
    {
      name: 'metricsTableContainer-metricsHaveAverageData',
    }
  )

  const getAllMetricsHaveDividers = useComputed(
    () => {
      return subscription2().data.meeting.metrics.nodes.every(
        (metric) => metric.metricDivider
      )
    },
    { name: 'metricsTableContainer-getAllMetricsHaveDividers' }
  )

  const getMetricScoreDateRanges = useComputed(
    () => {
      return getMetricsTableDateRanges({
        frequency: pageState.metricsTableSelectedTab,
        startDate: pageState.metricsDateRangeStartAndEndTimestamp.startDate,
        endDate: pageState.metricsDateRangeStartAndEndTimestamp.endDate,
        metricsTableScoreSortByValue: getMetricsTableScoreSortByValue(),
        weekStartAndEndNumbersForLuxon:
          subscription2().data.meeting?.startAndEndOfWeekNumbersForLuxon({
            weekStart: subscription1().data.currentUser.orgSettings.weekStart,
          }) ||
          subscription1().data.currentUser.orgSettings
            .startAndEndOfWeekNumbersForLuxon,
      })
    },
    { name: 'metricsTableContainer-getMetricScoreDateRanges' }
  )

  const handleSetMetricsDateRangeStartAndEndTimestamp = useAction(
    (opts: { startDate: number; endDate: number }) => {
      pageState.metricsDateRangeStartAndEndTimestamp = opts
    }
  )

  const handleUpdateMetricTableColumnToIsVisibleSettings: IMetricsTableViewActionHandlers['handleUpdateMetricTableColumnToIsVisibleSettings'] =
    useAction(({ goal, owner, cumulative, average }) => {
      // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1871
      pageState.metricTableColumnToIsVisibleSettings = {
        owner,
        goal,
        cumulative,
        average,
      }
      // Notes on transaction: we need to update the meeting node property metricTableColumnToIsVisibleSettings with the new settings.
      // mutation name: editMeeting
    })

  const handleUpdateMetricsTableSelectedTab = useAction(
    (tab: MetricFrequency) => {
      pageState.metricsTableSelectedTab = tab
    }
  )

  const handleUpdateMetricTableWidthDragScrollPct: IMetricsTableViewActionHandlers['handleUpdateMetricTableWidthDragScrollPct'] =
    useCallback(() => {
      // use editMeeting metricTableWidthDragScrollPct
      return
    }, [])

  const handleSetMetricsTableSelectedTab: IMetricsTableViewActionHandlers['handleSetMetricsTableSelectedTab'] =
    useCallback(
      (tab) => {
        handleUpdateMetricsTableSelectedTab(tab)
        switch (tab) {
          case 'DAILY': {
            const dailyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: tab,
                diResolver,
                startOfWeek:
                  subscription1().data.meeting.startOfWeekOverride ||
                  subscription1().data.currentUser.orgSettings.weekStart,
              })
            handleUpdateMetricsTableSelectedTab(tab)
            updateFrequency(tab)
            return handleSetMetricsDateRangeStartAndEndTimestamp(
              dailyTimestamps
            )
          }
          case 'WEEKLY': {
            const weeklyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: tab,
                diResolver,
                startOfWeek:
                  subscription1().data.meeting.startOfWeekOverride ||
                  subscription1().data.currentUser.orgSettings.weekStart,
              })
            handleUpdateMetricsTableSelectedTab(tab)
            updateFrequency(tab)
            return handleSetMetricsDateRangeStartAndEndTimestamp(
              weeklyTimestamps
            )
          }
          case 'MONTHLY': {
            const monthlyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: tab,
                diResolver,
                startOfWeek:
                  subscription1().data.meeting.startOfWeekOverride ||
                  subscription1().data.currentUser.orgSettings.weekStart,
              })
            handleUpdateMetricsTableSelectedTab(tab)
            updateFrequency(tab)
            return handleSetMetricsDateRangeStartAndEndTimestamp(
              monthlyTimestamps
            )
          }
          case 'QUARTERLY': {
            const quarterlyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: tab,
                diResolver,
                startOfWeek:
                  subscription1().data.meeting.startOfWeekOverride ||
                  subscription1().data.currentUser.orgSettings.weekStart,
              })
            handleUpdateMetricsTableSelectedTab(tab)
            updateFrequency(tab)
            return handleSetMetricsDateRangeStartAndEndTimestamp(
              quarterlyTimestamps
            )
          }
          default:
            throw new UnreachableCaseError(tab as never)
        }
      },
      [
        handleUpdateMetricsTableSelectedTab,
        handleSetMetricsDateRangeStartAndEndTimestamp,
        diResolver,
        updateFrequency,
      ]
    )

  const handleSwitchMetricsTableSortByValue: IMetricsTableViewActionHandlers['handleSwitchMetricsTableSortByValue'] =
    useCallback(() => {
      try {
        // @MEIDA_REQUESTED_TODO - look at the scope of subscription1().data.meeting.reverseMetrics not refiring when its
        // extracted into a const outside of this useCallback.
        // const reverseMetrics = subscription1().data.meeting.reverseMetrics -> does not work.
        editMeeting({
          meetingId,
          reverseMetrics: !subscription1().data.meeting.reverseMetrics,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to switch direction'),
          error: new UserActionError(error),
        })
      }
    }, [
      editMeeting,
      openOverlazy,
      meetingId,
      t,
      subscription1().data.meeting.reverseMetrics,
    ])

  const handlePrintMetricsTable: IMetricsTableViewActionHandlers['handlePrintMetricsTable'] =
    useCallback(() => {
      // @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1139
      console.log(
        '@TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1139: handlePrintMetricTable'
      )
    }, [])

  const handleMetricsTableDragSort: IMetricsTableViewActionHandlers['handleMetricsTableDragSort'] =
    useCallback(
      async (opts) => {
        try {
          const { id, type } = opts

          if (type === 'DIVIDER') {
            // useSortable hook converts the id to a string, BE needs a number so we convert here.
            const idAsNumber = Number(id)
            if (isNaN(idAsNumber)) {
              return throwLocallyLogInProd(
                diResolver,
                new Error(
                  `Invalid id passed into handleMetricsTableDragSort for a metric divider. Invalid id: ${id}`
                )
              )
            }
            await editMetricDivider({
              id: idAsNumber,
              metricId: opts.newMetricToAttachToId,
            })
          } else {
            await sortAndReorderMetrics({
              id: id,
              meetingId: props.meetingId,
              sortOrder: opts.newIndex,
            })
          }
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Failed to drag sort.`),
            error: new UserActionError(error),
          })
        }
      },
      [props.meetingId, openOverlazy, sortAndReorderMetrics, t]
    )

  const handleUpdateMetricScore: IMetricsTableViewActionHandlers['handleUpdateMetricScore'] =
    useCallback(
      async ({ value, timestamp, metricId, scoreId, metricUnits }) => {
        try {
          const scoreValue = value
            ? getNumericStringValueFromTextValueForMetricYesNoUnits({
                value,
                metricUnits,
                diResolver,
              })
            : null

          if (scoreId) {
            await editMetricScore({ id: scoreId, value: scoreValue })
          } else {
            if (scoreValue) {
              await createMetricScore({
                value: scoreValue,
                timestamp,
                metricId,
              })
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
      [openOverlazy, t, createMetricScore, editMetricScore, diResolver]
    )

  const handleDeleteMetricDivider: IMetricsTableViewActionHandlers['handleDeleteMetricDivider'] =
    useCallback(
      async (dividerId) => {
        try {
          await deleteMetricDivider({ id: dividerId })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Failed to delete divider.`),
            error: new UserActionError(error),
          })
        }
      },
      [deleteMetricDivider, openOverlazy, t]
    )

  const handleCreateMetricDivider: IMetricsTableViewActionHandlers['handleCreateMetricDivider'] =
    useCallback(
      async (opts) => {
        try {
          await createMetricDivider({
            ...opts,
            height:
              RECORD_OF_METRIC_DIVIDER_SIZE_TO_HEIGHT[
                DEFAULT_METRIC_DIVIDER_SIZE
              ],
            meetingId,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Failed to create divider.`),
            error: new UserActionError(error),
          })
        }
      },
      [createMetricDivider, meetingId, openOverlazy, t]
    )

  const handleEditMetricDivider: IMetricsTableViewActionHandlers['handleEditMetricDivider'] =
    useCallback(
      async (opts) => {
        try {
          await editMetricDivider(opts)
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Failed to edit divider.`),
            error: new UserActionError(error),
          })
        }
      },
      [editMetricDivider, meetingId, openOverlazy, t]
    )

  const displayMetricsTabsActionHandler = useCallback(() => {
    displayMetricsTabs({
      userId: subscription2().data.currentUser.id,
      meetingId,
      frequency: pageState.metricsTableSelectedTab,
    })
  }, [
    displayMetricsTabs,
    meetingId,
    pageState.metricsTableSelectedTab,
    subscription2().data.currentUser.id,
  ])

  const handleChartButtonClick = useCallback(
    (opts: {
      metric: {
        id: Id
        units: ChartableMetricUnits
        title: string
        frequency: MetricFrequency
      }
    }) => {
      onChartMetricClickedFromTable({
        metric: opts.metric,
        userId: subscription2().data.currentUser.id,
        terms,
      })
    },
    [onChartMetricClickedFromTable, subscription2().data.currentUser.id, terms]
  )

  const onDeleteTile: IMetricsTableViewActionHandlers['onDeleteTile'] =
    useAction(async () => {
      if (props.workspaceTileId) {
        try {
          await editWorkspaceTile({
            id: props.workspaceTileId,
            meetingId: null,
            archived: true,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue deleting the tile`),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    })

  useEffect(() => {
    if (checkIfEmbeddedDrawerIsAvailable()) {
      const metricId = subscription2().data.meeting?.metrics.nodes.length
        ? subscription2().data.meeting?.metrics.nodes[0].id
        : null

      if (!metricId) {
        return closeOverlazy({ type: 'Drawer' })
      }

      openOverlazy('EditMetricDrawer', {
        meetingId,
        metricId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTotalCountDataQuarterly = useComputed(
    () => {
      return (
        subscription3().data.meeting?.quarterlyMetricsTotalCount.totalCount ?? 0
      )
    },
    { name: 'metricsTableContainer-getTotalCountData-quarterly' }
  )

  const getTotalCountDataMonthly = useComputed(
    () => {
      return (
        subscription3().data.meeting?.monthlyMetricsTotalCount.totalCount ?? 0
      )
    },
    { name: 'metricsTableContainer-getTotalCountData-monthly' }
  )

  const getTotalCountDataWeekly = useComputed(
    () => {
      return (
        subscription3().data.meeting?.weeklyMetricsTotalCount.totalCount ?? 0
      )
    },
    { name: 'metricsTableContainer-getTotalCountData-weekly' }
  )

  const getTotalCountDataDaily = useComputed(
    () => {
      return (
        subscription3().data.meeting?.dailyMetricsTotalCount.totalCount ?? 0
      )
    },
    { name: 'metricsTableContainer-getTotalCountData-daily' }
  )

  const getData = useComputed(
    () => {
      return {
        meetingPageName: props.getPageToDisplayData()?.pageName ?? '',
        getCurrentUserPermissions,
        highlightPreviousWeekForMetrics:
          subscription2().data.meeting.highlightPreviousWeekForMetrics,
        preventEditingUnownedMetrics:
          subscription2().data.meeting.preventEditingUnownedMetrics,
        currentUser: subscription2().data.currentUser,
        currentUserPermissions:
          subscription2().data.meeting?.currentMeetingAttendee.permissions ??
          null,
        isScoreTableReversed:
          getMetricsTableScoreSortByValue() === 'TIMESTAMP_DESC',
        metricTableColumnToIsVisibleSettings: {
          goal: pageState.metricTableColumnToIsVisibleSettings.goal,
          owner: pageState.metricTableColumnToIsVisibleSettings.owner,
          cumulative: getMetricsHaveCumulativeData()
            ? pageState.metricTableColumnToIsVisibleSettings.cumulative
            : false,
          average: getMetricsHaveAverageData()
            ? pageState.metricTableColumnToIsVisibleSettings.average
            : false,
        },
        metricTableWidthDragScrollPct:
          subscription2().data.meeting.metricTableWidthDragScrollPct,
        isLoading: subscription2().querying,
        meeting: subscription2().data.meeting,
        metricsTableSelectedTab: pageState.metricsTableSelectedTab,
        metrics: subscription2().data.meeting.metrics,
        trackedMetrics: isTabData(getActiveTab())
          ? (getActiveTab() as TabData).trackedMetrics.nodes
          : [],
        weekStart:
          subscription1().data.meeting.startOfWeekOverride ||
          subscription1().data.currentUser.orgSettings.weekStart,
        allTabs,
        getActiveTab,
        getAllMetricsHaveDividers,
        getMetricScoreDateRanges,
        metricsDateRangeStartAndEndTimestamp:
          pageState.metricsDateRangeStartAndEndTimestamp,
        getMetricsHaveCumulativeData,
        getMetricsHaveAverageData,
        totalCountData: {
          WEEKLY: getTotalCountDataWeekly(),
          MONTHLY: getTotalCountDataMonthly(),
          QUARTERLY: getTotalCountDataQuarterly(),
          DAILY: getTotalCountDataDaily(),
        },
        pageType,
        workspaceType: props.workspaceType || 'MEETING',
        workspaceTileId: props.workspaceTileId,
        isExpandedOnWorkspacePage,
      }
    },
    {
      name: 'metricsTableContainer-getData',
    }
  )

  const getActionHandlers = useComputed(
    () => {
      return {
        isTabData,
        getActiveTabPermissions,
        handleSetMetricsTableSelectedTab,
        handleSwitchMetricsTableSortByValue,
        handleCreateMetricDivider,
        handleEditMetricDivider,
        handlePrintMetricsTable,
        handleMetricsTableDragSort,
        handleUpdateMetricScore,
        displayMetricsTabs: displayMetricsTabsActionHandler,
        hideMetricsTabs,
        handleChartButtonClick,
        handleUpdateMetricTableColumnToIsVisibleSettings,
        handleDeleteMetricDivider,
        handleUpdateMetricTableWidthDragScrollPct,
        onDeleteTile,
      }
    },
    { name: 'metricsTableContainer-getActionHandlers' }
  )

  const MetricsTableView = (
    <props.children getData={getData} getActionHandlers={getActionHandlers} />
  )

  if (isExpandedOnWorkspacePage) {
    return (
      <WorkspaceFullScreenTilePortal>
        {MetricsTableView}
      </WorkspaceFullScreenTilePortal>
    )
  } else {
    return MetricsTableView
  }
})
