import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'
import { queryDefinition, useSubscription } from '@mm/gql'

import { addOrRemoveWeeks } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  MetricFrequency,
  getInitialMetricScoreTimestampValuesForTable,
  getMetricsTableDateRanges,
  getNumericStringValueFromTextValueForMetricYesNoUnits,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomUserNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useBloomMetricMutations } from '@mm/core-bloom/metrics/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { useTheme } from '@mm/core-web/ui'

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
import { useMeetingColorController } from '@mm/bloom-web/shared'

import {
  METRIC_TABLE_FILTER_BY_TAB,
  METRIC_TABLE_SORT_SCORE_BY_VALUE,
} from '../metricsTableConstants'
import { type IMetricsTableViewData } from '../metricsTableTypes'
import {
  LUXON_WEEKDAY_NUMBER_SATURDAY,
  LUXON_WEEKDAY_NUMBER_SUNDAY,
} from './personalMetricsTableConstants'
import {
  type IPersonalMetricTableMeetingItem,
  type IPersonalMetricsTableContainerProps,
  type IPersonalMetricsTableViewActions,
  type IPersonalMetricsTableViewData,
} from './personalMetricsTableTypes'

export const PersonalMetricsTableContainer = observer(
  function PersonalMetricsTableContainer(
    props: IPersonalMetricsTableContainerProps
  ) {
    const authenticatedBloomUserNode = useAuthenticatedBloomUserQueryDefinition
    const diResolver = useDIResolver()
    const meetingColorController = useMeetingColorController()
    const theme = useTheme()
    const userNode = useBloomUserNode()
    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { createMetricScore, editMetricScore } = useBloomMetricMutations()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { openOverlazy } = useOverlazyController()
    const { t } = useTranslation()

    const pageState = useObservable<{
      columnDisplayValues: Record<
        keyof IMetricsTableViewData['metricTableColumnToIsVisibleSettings'],
        boolean
      >
      metricsDateRangeStartAndEndTimestamp: {
        startDate: number
        endDate: number
      }
      selectedFrequencyTab: MetricFrequency
    }>({
      columnDisplayValues: {
        goal: true,
        cumulative: true,
        average: true,
        owner: true,
      },
      metricsDateRangeStartAndEndTimestamp:
        getInitialMetricScoreTimestampValuesForTable({
          diResolver,
          frequency: 'WEEKLY',
          startOfWeek: 'Sunday',
        }),
      selectedFrequencyTab: 'WEEKLY',
    })

    const isCurrentUser = props.userId === null

    const isExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    // If reverse metrics get added for this table
    // we need to update this sort param
    const metricTableScoreSortParams =
      METRIC_TABLE_SORT_SCORE_BY_VALUE['TIMESTAMP_ASC']

    const metricsTableScoreTimestampFilterValues =
      pageState.selectedFrequencyTab === 'WEEKLY'
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

    const getMetricScoreDateRanges = useComputed(
      () => {
        return getMetricsTableDateRanges({
          frequency: pageState.selectedFrequencyTab,
          startDate: pageState.metricsDateRangeStartAndEndTimestamp.startDate,
          endDate: pageState.metricsDateRangeStartAndEndTimestamp.endDate,
          metricsTableScoreSortByValue: 'TIMESTAMP_ASC',
          weekStartAndEndNumbersForLuxon: {
            weekdayStartNumber: LUXON_WEEKDAY_NUMBER_SUNDAY,
            weekdayEndNumber: LUXON_WEEKDAY_NUMBER_SATURDAY,
          },
        })
      },
      {
        name: `PersonalMetricsTableContainer-getMetricScoreDateRanges-${props.workspaceTileId}`,
      }
    )

    // const getMetricScoreDateRanges = useComputed(
    //   () => {
    //     return getMetricsTableDateRanges({
    //       frequency: pageState.metricsTableSelectedTab,
    //       startDate: pageState.metricsDateRangeStartAndEndTimestamp.startDate,
    //       endDate: pageState.metricsDateRangeStartAndEndTimestamp.endDate,
    //       metricsTableScoreSortByValue: getMetricsTableScoreSortByValue(),
    //       weekStartAndEndNumbersForLuxon:
    //         subscription2().data.meeting?.startAndEndOfWeekNumbersForLuxon({
    //           weekStart: subscription1().data.currentUser.orgSettings.weekStart,
    //         }) ||
    //         subscription1().data.currentUser.orgSettings
    //           .startAndEndOfWeekNumbersForLuxon,
    //     })
    //   },
    //   { name: 'metricsTableContainer-getMetricScoreDateRanges' }
    // )

    const personalMetricsSub = useSubscription(
      {
        currentUser: props.userId
          ? queryDefinition({
              def: userNode,
              target: { id: props.userId },
              useSubOpts: {
                doNotSuspend: true,
              },
              map: ({ id, metrics }) => ({
                id,
                metrics: metrics({
                  filter: {
                    and: [
                      {
                        archived: false,
                        ...METRIC_TABLE_FILTER_BY_TAB[
                          pageState.selectedFrequencyTab
                        ],
                      },
                    ],
                  },
                  sort: { indexInTable: 'asc' },
                  map: ({
                    id,
                    title,
                    archived,
                    singleGoalValue,
                    minGoalValue,
                    maxGoalValue,
                    indexInTable,
                    units,
                    rule,
                    frequency,
                    formula,
                    notesId,
                    dateCreated,
                    assignee,
                    meetings,
                    metricData,
                    scoresNonPaginated,
                    customGoals,
                  }) => ({
                    id,
                    title,
                    archived,
                    singleGoalValue,
                    minGoalValue,
                    maxGoalValue,
                    indexInTable,
                    units,
                    rule,
                    frequency,
                    formula,
                    notesId,
                    dateCreated,
                    assignee: assignee({
                      map: ({ id, firstName, lastName, fullName }) => ({
                        id,
                        firstName,
                        lastName,
                        fullName,
                      }),
                    }),
                    meetings: meetings({
                      map: ({ id, name, currentMeetingAttendee }) => ({
                        id,
                        name,
                        currentMeetingAttendee: currentMeetingAttendee({
                          map: ({ permissions }) => ({ permissions }),
                        }),
                      }),
                    }),
                    metricData,
                    scores: scoresNonPaginated({
                      filter: {
                        and: [metricsTableScoreTimestampFilterValues],
                      },
                      sort: { ...metricTableScoreSortParams },
                      map: ({ value, timestamp, id, notesText }) => ({
                        value,
                        timestamp,
                        id,
                        notesText,
                      }),
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
              }),
            })
          : authenticatedBloomUserNode({
              useSubOpts: {
                doNotSuspend: true,
              },
              map: ({ id, metrics }) => ({
                id,
                metrics: metrics({
                  filter: {
                    and: [
                      {
                        archived: false,
                        ...METRIC_TABLE_FILTER_BY_TAB[
                          pageState.selectedFrequencyTab
                        ],
                      },
                    ],
                  },
                  sort: { indexInTable: 'asc' },
                  map: ({
                    id,
                    title,
                    archived,
                    singleGoalValue,
                    minGoalValue,
                    maxGoalValue,
                    indexInTable,
                    units,
                    rule,
                    frequency,
                    formula,
                    notesId,
                    dateCreated,
                    assignee,
                    meetings,
                    metricData,
                    scoresNonPaginated,
                    customGoals,
                  }) => ({
                    id,
                    title,
                    archived,
                    singleGoalValue,
                    minGoalValue,
                    maxGoalValue,
                    indexInTable,
                    units,
                    rule,
                    frequency,
                    formula,
                    notesId,
                    dateCreated,
                    assignee: assignee({
                      map: ({ id, firstName, lastName, fullName }) => ({
                        id,
                        firstName,
                        lastName,
                        fullName,
                      }),
                    }),
                    meetings: meetings({
                      map: ({ id, name, currentMeetingAttendee }) => ({
                        id,
                        name,
                        currentMeetingAttendee: currentMeetingAttendee({
                          map: ({ permissions }) => ({ permissions }),
                        }),
                      }),
                    }),
                    metricData,
                    scores: scoresNonPaginated({
                      filter: {
                        and: [metricsTableScoreTimestampFilterValues],
                      },
                      sort: { ...metricTableScoreSortParams },
                      map: ({ value, timestamp, id, notesText }) => ({
                        value,
                        timestamp,
                        id,
                        notesText,
                      }),
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
              }),
            }),
      },
      {
        subscriptionId: `PersonalMetricsTableContainer-${props.workspaceTileId}`,
      }
    )

    const personalMetricsCountsSub = useSubscription(
      {
        currentUser: props.userId
          ? queryDefinition({
              def: userNode,
              target: { id: props.userId },
              useSubOpts: {
                doNotSuspend: true,
              },
              map: ({ metrics }) => ({
                dailyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'DAILY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
                weeklyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'WEEKLY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
                monthlyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'MONTHLY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
                quarterlyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'QUARTERLY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
            })
          : authenticatedBloomUserNode({
              useSubOpts: {
                doNotSuspend: true,
              },
              map: ({ metrics }) => ({
                dailyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'DAILY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
                weeklyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'WEEKLY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
                monthlyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'MONTHLY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
                quarterlyMetricsTotalCount: metrics({
                  map: ({ id, archived, frequency, meetings }) => ({
                    id,
                    archived,
                    frequency,
                    meetings: meetings({
                      map: ({ id }) => ({
                        id,
                      }),
                    }),
                  }),
                  filter: {
                    and: [
                      {
                        archived: false,
                        frequency: 'QUARTERLY',
                      },
                    ],
                  },
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
            }),
      },
      {
        subscriptionId: `PersonalMetricsTableContainer-personalMetricCountsSub-${props.workspaceTileId}`,
      }
    )

    const getMetricCountByFrequency = useComputed(
      () => {
        if (isCurrentUser) {
          const dailyTotal =
            personalMetricsCountsSub().data.currentUser?.dailyMetricsTotalCount
              .totalCount ?? 0
          const weeklyTotal =
            personalMetricsCountsSub().data.currentUser?.weeklyMetricsTotalCount
              .totalCount ?? 0
          const monthlyTotal =
            personalMetricsCountsSub().data.currentUser
              ?.monthlyMetricsTotalCount.totalCount ?? 0
          const quarterlyTotal =
            personalMetricsCountsSub().data.currentUser
              ?.quarterlyMetricsTotalCount.totalCount ?? 0

          const currentUserTotalCounts: Record<MetricFrequency, number> = {
            DAILY: dailyTotal,
            WEEKLY: weeklyTotal,
            MONTHLY: monthlyTotal,
            QUARTERLY: quarterlyTotal,
          }
          return currentUserTotalCounts
        } else {
          const dailyTotal =
            personalMetricsCountsSub().data.currentUser?.dailyMetricsTotalCount.nodes.filter(
              (m) => m.meetings.nodes.length !== 0
            ).length ?? 0
          const weeklyTotal =
            personalMetricsCountsSub().data.currentUser?.weeklyMetricsTotalCount.nodes.filter(
              (m) => m.meetings.nodes.length !== 0
            ).length ?? 0
          const monthlyTotal =
            personalMetricsCountsSub().data.currentUser?.monthlyMetricsTotalCount.nodes.filter(
              (m) => m.meetings.nodes.length !== 0
            ).length ?? 0
          const quarterlyTotal =
            personalMetricsCountsSub().data.currentUser?.quarterlyMetricsTotalCount.nodes.filter(
              (m) => m.meetings.nodes.length !== 0
            ).length ?? 0

          const otherUsersTotalCounts: Record<MetricFrequency, number> = {
            DAILY: dailyTotal,
            WEEKLY: weeklyTotal,
            MONTHLY: monthlyTotal,
            QUARTERLY: quarterlyTotal,
          }
          return otherUsersTotalCounts
        }
      },
      {
        name: `metricsTableContainer-getTotalCountData-${props.workspaceTileId}`,
      }
    )

    const metricsByMeeting = useComputed(
      () => {
        const currentUser = personalMetricsSub().data.currentUser
        const colorsByMeetingId = meetingColorController.meetingColorByMeetingId
        const metricsByIdMap: Record<Id, IPersonalMetricTableMeetingItem> = {}

        currentUser?.metrics.nodes.forEach((metricDatum) => {
          if (metricDatum.meetings.nodes.length === 0 && isCurrentUser) {
            if ('PERSONAL' in metricsByIdMap) {
              metricsByIdMap['PERSONAL'].metrics.push(metricDatum)
            } else {
              metricsByIdMap['PERSONAL'] = {
                // Id field is hardcoded as needed for the sticky table so it is repeated here.
                // But wanted to not cause confusion between a meetingId and any metric ids so
                // kept meetingId field.
                id: 'PERSONAL',
                meetingId: 'PERSONAL',
                meetingName: 'PERSONAL',
                meetingColor:
                  theme.colors.workspacePersonalTilePersonalItemsColor,
                metrics: [metricDatum],
                permissionsForMeeting: {
                  admin: true,
                  edit: true,
                  view: true,
                },
              }
            }
          } else {
            metricDatum.meetings.nodes.forEach((meeting) => {
              if (meeting.id in metricsByIdMap) {
                metricsByIdMap[meeting.id].metrics.push(metricDatum)
              } else {
                metricsByIdMap[meeting.id] = {
                  id: meeting.id,
                  meetingId: meeting.id,
                  meetingName: meeting.name,
                  meetingColor: colorsByMeetingId[meeting.id],
                  metrics: [metricDatum],
                  permissionsForMeeting:
                    meeting.currentMeetingAttendee.permissions,
                }
              }
            })
          }
        })

        Object.keys(metricsByIdMap).forEach((meetingId) => {
          metricsByIdMap[meetingId].metrics = metricsByIdMap[
            meetingId
          ].metrics.sort((a, b) => a.dateCreated - b.dateCreated)
        })

        return Object.values(metricsByIdMap).sort((a, b) => {
          if (a.meetingName === 'PERSONAL' && b.meetingName !== 'PERSONAL') {
            return -1
          } else {
            return a.meetingName.localeCompare(b.meetingName)
          }
        })
      },
      {
        name: `PersonalMetricsTableContainer-metricsByMeeting-${props.workspaceTileId}`,
      }
    )

    const onDeleteTile: IPersonalMetricsTableViewActions['onDeleteTile'] =
      useAction(async () => {
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
      })

    const onSetMetricFrequencyTab: IPersonalMetricsTableViewActions['onSetMetricFrequencyTab'] =
      useAction((newTab) => {
        pageState.selectedFrequencyTab = newTab

        switch (newTab) {
          case 'DAILY': {
            const dailyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: newTab,
                diResolver,
                startOfWeek: 'Sunday',
              })
            pageState.metricsDateRangeStartAndEndTimestamp = dailyTimestamps
            return
          }
          case 'WEEKLY': {
            const weeklyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: newTab,
                diResolver,
                startOfWeek: 'Sunday',
              })
            pageState.metricsDateRangeStartAndEndTimestamp = weeklyTimestamps
            return
          }
          case 'MONTHLY': {
            const monthlyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: newTab,
                diResolver,
                startOfWeek: 'Sunday',
              })
            pageState.metricsDateRangeStartAndEndTimestamp = monthlyTimestamps
            return
          }
          case 'QUARTERLY': {
            const quarterlyTimestamps =
              getInitialMetricScoreTimestampValuesForTable({
                frequency: newTab,
                diResolver,
                startOfWeek: 'Sunday',
              })
            pageState.metricsDateRangeStartAndEndTimestamp = quarterlyTimestamps
            return
          }
          default:
            throw new UnreachableCaseError(newTab as never)
        }
      })

    const handleUpdateMetricScore: IPersonalMetricsTableViewActions['handleUpdateMetricScore'] =
      useAction(async (values) => {
        try {
          const scoreValue = values.value
            ? getNumericStringValueFromTextValueForMetricYesNoUnits({
                value: values.value,
                metricUnits: values.metricUnits,
                diResolver,
              })
            : null

          if (values.scoreId) {
            await editMetricScore({ id: values.scoreId, value: scoreValue })
          } else {
            if (scoreValue) {
              await createMetricScore({
                value: scoreValue,
                timestamp: values.timestamp,
                metricId: values.metricId,
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
      })

    const onSetColumnDisplay: IPersonalMetricsTableViewActions['onSetColumnDisplay'] =
      useAction((opts) => {
        pageState.columnDisplayValues = {
          ...pageState.columnDisplayValues,
          [opts.column]: opts.isShowing,
        }
      })

    const getData = useComputed(
      () => {
        const data: IPersonalMetricsTableViewData = {
          currentUserId: personalMetricsSub().data.currentUser?.id || 0,
          columnDisplayValues: pageState.columnDisplayValues,
          getMetricScoreDateRanges,
          isLoading: personalMetricsSub().querying,
          meetingMetrics: metricsByMeeting(),
          metricsDateRangeStartAndEndTimestamp:
            pageState.metricsDateRangeStartAndEndTimestamp,
          metricTotalCountByFrequency: getMetricCountByFrequency(),
          selectedFrequencyTab: pageState.selectedFrequencyTab,
          workspaceTileId: props.workspaceTileId,
          isCurrentUser,
        }
        return data
      },
      {
        name: `PersonalMetricsTableContainer-getData-${props.workspaceTileId}`,
      }
    )

    const getActions = useComputed(
      () => {
        const actions: IPersonalMetricsTableViewActions = {
          handleUpdateMetricScore,
          onDeleteTile,
          onSetColumnDisplay,
          onSetMetricFrequencyTab,
        }
        return actions
      },
      {
        name: `PersonalMetricsTableContainer-getActions-${props.workspaceTileId}`,
      }
    )

    const PersonalMetricsTableView = (
      <props.children data={getData} actions={getActions} />
    )

    if (isExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {PersonalMetricsTableView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return PersonalMetricsTableView
    }
  }
)
