import { i18n } from '@mm/core/i18n'

import {
  BloomCustomTerms,
  EMeetingPageType,
  MetricFrequency,
} from '@mm/core-bloom'

import emptyGoalImg from './bloomPageEmptyStateAssets/emptyGoals.png'
import emptyHeadlineImg from './bloomPageEmptyStateAssets/emptyHeadlines.png'
import emptyIssueImg from './bloomPageEmptyStateAssets/emptyIssues.png'
import emptyMetricImg from './bloomPageEmptyStateAssets/emptyMetrics.png'
import emptyTodoImg from './bloomPageEmptyStateAssets/emptyTodos.png'
import { IBloomPageEmptyState } from './bloomPageEmptyStateTypes'

export function getEmptyStateDataForMetricTable(opts: {
  terms: BloomCustomTerms
  metricsTableSelectedTab: MetricFrequency
}): IBloomPageEmptyState {
  const TITLE_TEXT_BY_SELECTED_TAB_MAP: Record<MetricFrequency, string> = {
    DAILY: i18n.t('You have no active daily {{metrics}}.', {
      metrics: opts.terms.metric.lowercasePlural,
    }),
    WEEKLY: i18n.t('You have no active weekly {{metrics}}.', {
      metrics: opts.terms.metric.lowercasePlural,
    }),
    MONTHLY: i18n.t('You have no active monthly {{metrics}}.', {
      metrics: opts.terms.metric.lowercasePlural,
    }),
    QUARTERLY: i18n.t('You have no active quarterly {{metrics}}.', {
      metrics: opts.terms.metric.lowercasePlural,
    }),
  }

  return {
    pageType: EMeetingPageType.Metrics,
    emptyPageData: {
      img: emptyMetricImg,
      title: TITLE_TEXT_BY_SELECTED_TAB_MAP[opts.metricsTableSelectedTab],
      btnText: i18n.t('Show me where to add {{metrics}}', {
        metrics: opts.terms.metric.lowercasePlural,
      }),
    },
    tooltipsData: {
      externalMenuContent: null,
      navPlusBtn: null,
      pageTitlePlusIcon: {
        disabled: false,
        text: i18n.t('Add a {{metric}} here', {
          metric: opts.terms.metric.lowercaseSingular,
        }),
      },
      quickCreation: null,
    },
  }
}

export function getEmptyStateData(
  terms: BloomCustomTerms
): Record<EMeetingPageType, Maybe<IBloomPageEmptyState>> {
  return {
    [EMeetingPageType.CheckIn]: {
      pageType: EMeetingPageType.CheckIn,
      emptyPageData: {
        img: null,
        title: null,
        btnText: i18n.t('Show me where to add attendees'),
      },
      tooltipsData: {
        externalMenuContent: {
          disabled: false,
          text: i18n.t('Add attendees here'),
        },
        navPlusBtn: null,
        pageTitlePlusIcon: null,
        quickCreation: null,
      },
    },
    [EMeetingPageType.ExternalPage]: null,
    [EMeetingPageType.NotesBox]: null,
    [EMeetingPageType.Whiteboard]: null,
    [EMeetingPageType.WrapUp]: null,
    [EMeetingPageType.TitlePage]: null,
    [EMeetingPageType.Html]: null,
    [EMeetingPageType.Todos]: {
      pageType: EMeetingPageType.Todos,
      emptyPageData: {
        img: emptyTodoImg,
        title: i18n.t('You have no active {{todos}}.', {
          todos: terms.todo.lowercasePlural,
        }),
        btnText: i18n.t('Show me where to add {{todos}}', {
          todos: terms.todo.lowercasePlural,
        }),
      },
      tooltipsData: {
        externalMenuContent: null,
        navPlusBtn: {
          disabled: false,
          text: i18n.t('Add a {{todo}} from here', {
            todo: terms.todo.lowercaseSingular,
          }),
        },
        pageTitlePlusIcon: null,
        quickCreation: {
          disabled: false,
          text: i18n.t('Add a quick {{todo}} from here', {
            todos: terms.todo.lowercaseSingular,
          }),
        },
      },
    },
    [EMeetingPageType.Metrics]: {
      pageType: EMeetingPageType.Metrics,
      emptyPageData: {
        img: emptyMetricImg,
        title: i18n.t('You have no active {{metrics}}.', {
          metrics: terms.metric.lowercasePlural,
        }),
        btnText: i18n.t('Show me where to add {{metrics}}', {
          metrics: terms.metric.lowercasePlural,
        }),
      },
      tooltipsData: {
        externalMenuContent: null,
        navPlusBtn: null,
        pageTitlePlusIcon: {
          disabled: false,
          text: i18n.t('Add a {{metric}} here', {
            metric: terms.metric.lowercaseSingular,
          }),
        },
        quickCreation: null,
      },
    },
    [EMeetingPageType.Goals]: {
      pageType: EMeetingPageType.Goals,
      emptyPageData: {
        img: emptyGoalImg,
        title: i18n.t('You have no active {{goals}}.', {
          goals: terms.goal.lowercasePlural,
        }),
        btnText: i18n.t('Show me where to add {{goals}}', {
          goals: terms.goal.lowercasePlural,
        }),
      },
      tooltipsData: {
        externalMenuContent: null,
        navPlusBtn: null,
        pageTitlePlusIcon: {
          disabled: false,
          text: i18n.t('Add a {{goal}} here', {
            goal: terms.goal.lowercaseSingular,
          }),
        },
        quickCreation: null,
      },
    },
    [EMeetingPageType.BP_Goals]: {
      pageType: EMeetingPageType.BP_Goals,
      emptyPageData: {
        img: emptyGoalImg,
        title: i18n.t('You have no active business plan {{goals}}.', {
          goals: terms.goal.lowercasePlural,
        }),
        btnText: i18n.t('Show me where to add business plan {{goals}}', {
          goals: terms.goal.lowercasePlural,
        }),
      },
      tooltipsData: {
        navPlusBtn: null,
        externalMenuContent: null,
        pageTitlePlusIcon: {
          disabled: false,
          text: i18n.t('Add a business plan {{goal}} here', {
            goal: terms.goal.lowercaseSingular,
          }),
        },
        quickCreation: null,
      },
    },
    [EMeetingPageType.Issues]: {
      pageType: EMeetingPageType.Issues,
      emptyPageData: {
        img: emptyIssueImg,
        title: i18n.t('You have no active {{issues}}.', {
          issues: terms.issue.lowercasePlural,
        }),
        btnText: i18n.t('Show me where to add {{issues}}', {
          issues: terms.issue.lowercasePlural,
        }),
      },
      tooltipsData: {
        externalMenuContent: null,
        navPlusBtn: {
          disabled: false,
          text: i18n.t('Add an {{issue}} from here', {
            issue: terms.issue.lowercaseSingular,
          }),
        },
        pageTitlePlusIcon: null,
        quickCreation: {
          disabled: false,
          text: i18n.t('Add a quick {{issue}} from here', {
            issue: terms.issue.lowercaseSingular,
          }),
        },
      },
    },
    [EMeetingPageType.Headlines]: {
      pageType: EMeetingPageType.Headlines,
      emptyPageData: {
        img: emptyHeadlineImg,
        title: i18n.t('You have no active {{headlines}}.', {
          headlines: terms.headline.lowercasePlural,
        }),
        btnText: i18n.t('Show me where to add {{headlines}}', {
          headlines: terms.headline.lowercasePlural,
        }),
      },
      tooltipsData: {
        externalMenuContent: null,
        navPlusBtn: {
          disabled: false,
          text: i18n.t('Add a {{headline}} from here', {
            headline: terms.headline.lowercaseSingular,
          }),
        },
        pageTitlePlusIcon: null,
        quickCreation: {
          disabled: false,
          text: i18n.t('Add a quick {{headline}} from here', {
            headline: terms.headline.lowercaseSingular,
          }),
        },
      },
    },
  }
}
