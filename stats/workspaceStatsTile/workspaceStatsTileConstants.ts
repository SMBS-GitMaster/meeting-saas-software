import { DateTime } from 'luxon'

import {
  getEndOfThisMonthDateTimeUTC,
  getEndOfThisQuarterDateTimeUTC,
  getEndOfThisWeekDateTimeUTC,
  getEndOfTodayDateTimeUTC,
  getStartOfThisMonthDateTimeUTC,
  getStartOfThisQuarterDateTimeUTC,
  getStartOfThisWeekDateTimeUTC,
  getStartOfTodayDateTimeUTC,
} from '@mm/core/date'
import { i18n } from '@mm/core/i18n'

import {
  IBloomNodeCompletionStatBucket,
  IBloomNodeCompletionStatsQueryResponse,
  TWorkspaceStatsTileGroupByFilter,
  TWorkspaceStatsTileSelectedDateRangeFilter,
  TWorkspaceStatsTileSelectedNodeFilter,
} from '@mm/core-bloom'

import { BloomCustomTerms } from '@mm/core-bloom/customTerms'

import { IMMTheme, WEIGHT_TEXT_TO_CSS, toREM } from '@mm/core-web/ui'

import {
  IWorkspaceStatsTileNodeFilterLookupItem,
  IWorkspaceStatsTileStatsData,
} from './workspaceStatsTileTypes'

export const DATE_RANGE_FILTER_TO_LABEL_MAP: Record<
  TWorkspaceStatsTileSelectedDateRangeFilter,
  string
> = {
  WEEK: `${i18n.t('1 {{week}}', { week: 'week' })}`,
  MONTH: `${i18n.t('1 {{month}}', { month: 'month' })}`,
  QUARTER: `${i18n.t('1 {{quarter}}', { quarter: 'quarter' })}`,
  SIX_MONTHS: `${i18n.t('6 {{months}}', { months: 'months' })}`,
  YTD: `${i18n.t('{{ytd}}', { ytd: 'YTD' })}`,
  YEAR: `${i18n.t('1 {{year}}', { year: 'year' })}`,
  ALL: `${i18n.t('{{all}}', { all: 'All' })}`,
}

export const DATE_RANGE_FILTER_TO_LABEL_MAP_MOBILE: Record<
  TWorkspaceStatsTileSelectedDateRangeFilter,
  string
> = {
  WEEK: `${i18n.t('1{{weekShort}}', { weekShort: 'W' })}`,
  MONTH: `${i18n.t('1{{monthShort}}', { monthShort: 'M' })}`,
  QUARTER: `${i18n.t('1{{quarterShort}}', { quarterShort: 'Q' })}`,
  SIX_MONTHS: `${i18n.t('6{{monthShort}}', { monthShort: 'M' })}`,
  YTD: `${i18n.t('{{ytd}}', { ytd: 'YTD' })}`,
  YEAR: `${i18n.t('1{{yearShort}}', { yearShort: 'Y' })}`,
  ALL: `${i18n.t('{{all}}', { all: 'All' })}`,
}

export const getWorkspaceStatsTileNodeFilterLookup = (opts: {
  selectedNodes: Array<TWorkspaceStatsTileSelectedNodeFilter>
  terms: BloomCustomTerms
}): Record<
  TWorkspaceStatsTileSelectedNodeFilter,
  IWorkspaceStatsTileNodeFilterLookupItem
> => {
  const selectedNodeFiltersMap = opts.selectedNodes.reduce(
    (acc, selectedNode) => {
      acc[selectedNode] = selectedNode
      return acc
    },
    {} as Record<
      TWorkspaceStatsTileSelectedNodeFilter,
      TWorkspaceStatsTileSelectedNodeFilter
    >
  )

  return {
    TODOS: {
      text: i18n.t('{{todos}} completed', { todos: opts.terms.todo.plural }),
      isEnabled: 'TODOS' in selectedNodeFiltersMap,
    },
    ISSUES: {
      text: i18n.t('{{issues}} solved', { issues: opts.terms.issue.plural }),
      isEnabled: 'ISSUES' in selectedNodeFiltersMap,
    },
    GOALS: {
      text: i18n.t('{{goals}} completed', { goals: opts.terms.goal.plural }),
      isEnabled: 'GOALS' in selectedNodeFiltersMap,
    },
    MILESTONES: {
      text: i18n.t('{{milestones}} completed', {
        milestones: opts.terms.milestone.plural,
      }),
      isEnabled: 'MILESTONES' in selectedNodeFiltersMap,
    },
  }
}

export const getWorkspaceStatsTileSelectedNodeTerm = (
  nodeFilter: TWorkspaceStatsTileSelectedNodeFilter,
  terms: BloomCustomTerms
) => {
  const termsMap = {
    GOALS: i18n.t('{{goalPlural}}', { goalPlural: terms.goal.plural }),
    ISSUES: i18n.t('{{issuePlural}}', { issuePlural: terms.issue.plural }),
    MILESTONES: i18n.t('{{milestonePlural}}', {
      milestonePlural: terms.milestone.plural,
    }),
    TODOS: i18n.t('{{todoPlural}}', { todoPlural: terms.todo.plural }),
  }

  return termsMap[nodeFilter]
}

export const getNodeStatsQueryOptsForDateRange = (opts: {
  selectedDateRange: TWorkspaceStatsTileSelectedDateRangeFilter
}) => {
  const startOfToday = getStartOfTodayDateTimeUTC()
  const endOfToday = getEndOfTodayDateTimeUTC()

  const startOfThisWeek = getStartOfThisWeekDateTimeUTC()
  const endOfThisWeek = getEndOfThisWeekDateTimeUTC()

  const startOfThisMonth = getStartOfThisMonthDateTimeUTC()
  const endOfThisMonth = getEndOfThisMonthDateTimeUTC()

  const startOfThisQuarter = getStartOfThisQuarterDateTimeUTC()
  const endOfThisQuarter = getEndOfThisQuarterDateTimeUTC()

  let startDate: Maybe<number> = 0
  let endDate: number = 0
  let groupBy: TWorkspaceStatsTileGroupByFilter = 'DAY'

  switch (opts.selectedDateRange) {
    case 'WEEK':
      startDate = startOfToday.minus({ days: 6 }).toSeconds()
      endDate = endOfToday.toSeconds()
      groupBy = 'DAY'
      break

    case 'MONTH':
      startDate = startOfThisWeek.minus({ weeks: 3 }).toSeconds()
      endDate = endOfThisWeek.toSeconds()
      groupBy = 'WEEK'
      break

    case 'QUARTER':
      startDate = startOfThisQuarter.toSeconds()
      endDate = endOfThisQuarter.toSeconds()
      groupBy = 'WEEK'
      break

    case 'SIX_MONTHS':
      startDate = startOfThisMonth.minus({ months: 5 }).toSeconds()
      endDate = endOfThisMonth.toSeconds()
      groupBy = 'MONTH'
      break

    case 'YTD':
      startDate = DateTime.now().setZone('UTC').startOf('year').toSeconds()
      endDate = endOfThisMonth.toSeconds()
      groupBy = 'MONTH'
      break

    case 'YEAR':
      startDate = startOfThisMonth.minus({ months: 12 }).toSeconds()
      endDate = endOfThisMonth.toSeconds()
      groupBy = 'MONTH'
      break

    case 'ALL':
      startDate = null
      endDate = endOfThisMonth.toSeconds()
      groupBy = 'MONTH'
      break
  }

  return {
    startDate,
    endDate,
    groupBy,
  }
}

export const getStatsGraphLabelsForDateRangeFilter = (opts: {
  selectedDateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  timestampBuckets: IBloomNodeCompletionStatBucket[]
}) => {
  switch (opts.selectedDateRange) {
    case 'WEEK':
      return opts.timestampBuckets.map((timestamp) =>
        DateTime.fromSeconds(timestamp.bucketDate).toUTC().toFormat('dd MMM')
      )

    case 'MONTH':
    case 'QUARTER':
      return opts.timestampBuckets.map((timestamp) =>
        DateTime.fromSeconds(timestamp.bucketDate).toUTC().toFormat('dd MMM')
      )

    case 'SIX_MONTHS':
    case 'YTD':
      return opts.timestampBuckets.map((timestamp) =>
        DateTime.fromSeconds(timestamp.bucketDate).toUTC().toFormat('MMM')
      )

    case 'YEAR':
    case 'ALL':
      return opts.timestampBuckets.map((timestamp) =>
        DateTime.fromSeconds(timestamp.bucketDate).toUTC().toFormat('MMM yyyy')
      )
  }
}

export const getStatsTileDataFromQueryResponse = (opts: {
  selectedDateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  queryResponse: IBloomNodeCompletionStatsQueryResponse
}): IWorkspaceStatsTileStatsData => {
  const { nodeCompletionStats } = opts.queryResponse

  const dateRangeLabels = getStatsGraphLabelsForDateRangeFilter({
    selectedDateRange: opts.selectedDateRange,
    timestampBuckets: nodeCompletionStats.goals,
  })

  const goals = nodeCompletionStats.goals.map((g) => g.bucketValue)
  const issues = nodeCompletionStats.issues.map((i) => i.bucketValue)
  const milestones = nodeCompletionStats.milestones.map((m) => m.bucketValue)
  const todos = nodeCompletionStats.todos.map((t) => t.bucketValue)

  return {
    goals,
    issues,
    milestones,
    todos,
    dateRangeLabels,
  }
}

export const getGraphBaseSettings = (opts: {
  selectedDateRange: TWorkspaceStatsTileSelectedDateRangeFilter
  dateRangeLabels: string[]
  theme: IMMTheme
  graphHeight: Maybe<number>
  terms: BloomCustomTerms
}) => {
  let X_AXIS_MAX: Maybe<number> = null

  if (opts.selectedDateRange === 'ALL') {
    X_AXIS_MAX =
      opts.dateRangeLabels.length < 10 ? opts.dateRangeLabels.length - 1 : 10
  }

  const GRAPH_BASE_SETTINGS: Highcharts.Options = {
    boost: {
      allowForce: true,
    },
    chart: {
      reflow: false,
      type: 'line',
      height: opts.graphHeight,
      panning: {
        enabled: true,
      },
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    title: {
      text: undefined,
    },
    tooltip: {
      shared: true,
      backgroundColor: opts.theme.colors.cardBackgroundColor,
      borderRadius: 12,
      borderColor: opts.theme.colors.cardBorderColor,
      useHTML: true,
      formatter: function formatter() {
        const baseTextStyles = `
          color: ${opts.theme.colors.bodyTextDefault};
          font-family: ${opts.theme.fontFamily};
          font-size: ${opts.theme.sizes.bodyText};          
          line-height: ${opts.theme.sizes.bodyLineHeight};
        `

        const headerTextStyles = `
          ${baseTextStyles}          
          font-weight: ${WEIGHT_TEXT_TO_CSS['semibold']};          
        `

        const nodeToEndTextMap: Record<string, string> = {
          [opts.terms.goal.plural]: i18n.t('completed'),
          [opts.terms.issue.plural]: i18n.t('solved'),
          [opts.terms.milestone.plural]: i18n.t('completed'),
          [opts.terms.todo.plural]: i18n.t('completed'),
        }

        const headerText = `<span style="${headerTextStyles}">${this.x}</span>`
        let tooltipBody = ``

        if (this.points) {
          this.points.forEach((point) => {
            const coloredDotStyles = `
              background-color: ${point.series.color};
              border-radius: 50%;
              display: inline-block;
              height: ${toREM(8)};
              margin-right: ${toREM(4)};
              width: ${toREM(8)};
            `

            tooltipBody += `
              <br/>
              <span style="${coloredDotStyles}"></span>
              <span style="${baseTextStyles}">       
                ${point.y}              
                ${point.series.name}
                ${' '}
                ${nodeToEndTextMap[point.series.name]}
              </span>`
          })
        }

        return `
          <div>
            ${headerText}
            ${tooltipBody}
          </div>
        `
      },
    },
    xAxis: {
      title: {
        text: '',
      },
      categories: opts.dateRangeLabels,
      minPadding: 0,
      maxPadding: 0,
      max: X_AXIS_MAX,
      scrollbar: {
        enabled:
          opts.selectedDateRange === 'ALL' && opts.dateRangeLabels.length > 9,
        barBackgroundColor: opts.theme.colors.dropdownScrollThumbColor,
        barBorderRadius: 5,
        barBorderWidth: 0,
        buttonArrowColor: 'white',
        buttonBackgroundColor: 'white',
        buttonBorderColor: 'white',
        height: 12,
        margin: 10,
        rifleColor: opts.theme.colors.dropdownScrollThumbColor,
        trackBackgroundColor: opts.theme.colors.dropdownScrollBackgroundColor,
        trackBorderRadius: 5,
      },
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        style: {
          fontWeight: 'bold',
        },
      },
    },
  }

  return GRAPH_BASE_SETTINGS
}

export const GRAPH_MARKER_BASE_SETTINGS = {
  enabled: true,
  lineWidth: 1,
  radius: 3,
  symbol: 'circle',
}

export const DEFAULT_STATS: IWorkspaceStatsTileStatsData = {
  goals: [],
  issues: [],
  milestones: [],
  todos: [],
  dateRangeLabels: [],
}
