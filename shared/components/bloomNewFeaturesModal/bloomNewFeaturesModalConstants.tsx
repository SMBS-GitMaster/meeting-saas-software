import React from 'react'
import { css } from 'styled-components'

import { i18n } from '@mm/core/i18n'
import { keys } from '@mm/core/typeHelpers'

import { BloomCustomTerms } from '@mm/core-bloom'

import { toREM } from '@mm/core-web/ui'

import { HomePageWelcomeScreen } from '@mm/bloom-web/pages/Home/homePageWelcomeScreen'

import AgendaSectionsImg from './bloomNewFeaturesAssets/agendaSections.png'
import AttendanceImg from './bloomNewFeaturesAssets/attendance.png'
import BigPlusButtonImg from './bloomNewFeaturesAssets/bigPlusButton.png'
import CellNotesImg from './bloomNewFeaturesAssets/cellNotes.png'
import CollapseSideNavigationImg from './bloomNewFeaturesAssets/collapseSideNavigation.png'
import CustomGoalsImg from './bloomNewFeaturesAssets/customGoals.png'
import DailyMetricsImg from './bloomNewFeaturesAssets/dailyMetrics.png'
import DragAndDropMetricsImg from './bloomNewFeaturesAssets/dragAndDropMetrics.png'
import EnhancedChartsImg from './bloomNewFeaturesAssets/enhancedCharts.png'
import IcebreakerImg from './bloomNewFeaturesAssets/iceBreaker.png'
import MeetingNotesImg from './bloomNewFeaturesAssets/meetingNotes.png'
import MeetingNotesInSummaryImg from './bloomNewFeaturesAssets/meetingNotesInSummary.png'
import MeetingSectionImg from './bloomNewFeaturesAssets/meetingSection.png'
import MergeIssuesImg from './bloomNewFeaturesAssets/mergeIssues.png'
import MetricDividersImg from './bloomNewFeaturesAssets/metricDividers.png'
import MetricTypesImg from './bloomNewFeaturesAssets/metricTypes.png'
import MilestoneViewsImg from './bloomNewFeaturesAssets/milestoneViews.png'
import MinimizableWindowImg from './bloomNewFeaturesAssets/minimizableWindow.png'
import PreviewAndEditImg from './bloomNewFeaturesAssets/previewAndEdit.png'
import ProgressiveTrackingImg from './bloomNewFeaturesAssets/progressiveTracking.png'
import QuickHeadlinesImg from './bloomNewFeaturesAssets/quickHeadlines.png'
import QuickTodoImg from './bloomNewFeaturesAssets/quickToDo.png'
import RecentlySolvedIssuesImg from './bloomNewFeaturesAssets/recentlySolvedIssues.png'
import SortOptionsImg from './bloomNewFeaturesAssets/sortOptions.png'
import StarVotingImg from './bloomNewFeaturesAssets/starVoting.png'
import WrittenFeedbackImg from './bloomNewFeaturesAssets/writtenFeedback.png'
import YesNoMetricsImg from './bloomNewFeaturesAssets/yesNoMetrics.png'
import {
  INewFeatureLookup,
  TBloomNewFeatureModalFeature,
  TBloomNewFeatureModalNavSection,
} from './bloomNewFeaturesModalTypes'

export function getSectionToLabelMap(terms: BloomCustomTerms) {
  const SECTION_TO_LABEL_MAP: Record<TBloomNewFeatureModalNavSection, string> =
    {
      GETTING_STARTED: i18n.t('Getting started'),
      CHECK_IN: terms.checkIn.singular,
      GOALS: terms.goal.plural,
      METRICS: terms.metric.plural,
      HEADLINES: terms.headline.plural,
      TO_DOS: terms.todo.plural,
      ISSUES: terms.issue.plural,
      WRAP_UP: terms.wrapUp.singular,
    }

  return SECTION_TO_LABEL_MAP
}

export function getFeatureToFeatureLookupMap(
  terms: BloomCustomTerms
): Record<TBloomNewFeatureModalFeature, INewFeatureLookup> {
  return {
    WELCOME: {
      value: 'WELCOME',
      text: i18n.t('Welcome'),
    },
    COLLAPSE_SIDE_NAV: {
      value: 'COLLAPSE_SIDE_NAV',
      text: i18n.t('Collapse side navigation'),
    },
    MINIMIZABLE_WINDOW: {
      value: 'MINIMIZABLE_WINDOW',
      text: i18n.t('Minimizable window'),
    },
    MEETING_NOTES: {
      value: 'MEETING_NOTES',
      text: i18n.t('Meeting notes'),
    },
    BIG_PLUS_BUTTON: {
      value: 'BIG_PLUS_BUTTON',
      text: i18n.t('Big plus button'),
    },
    AGENDA_SECTIONS: {
      value: 'AGENDA_SECTIONS',
      text: i18n.t('Agenda sections'),
    },
    MEETING_SECTION: {
      value: 'MEETING_SECTION',
      text: i18n.t('Meeting section'),
    },
    PREVIEW_AND_EDIT: {
      value: 'PREVIEW_AND_EDIT',
      text: i18n.t('Preview & edit'),
    },
    ATTENDANCE: {
      value: 'ATTENDANCE',
      text: i18n.t('Attendance'),
    },
    ICE_BREAKER: {
      value: 'ICE_BREAKER',
      text: i18n.t('Ice breaker questions'),
    },
    MILESTONE_VIEWS: {
      value: 'MILESTONE_VIEWS',
      text: i18n.t('{{milestone}} views', {
        milestone: terms.goal.singular,
      }),
    },
    METRIC_TYPES: {
      value: 'METRIC_TYPES',
      text: i18n.t('{{metric}} tabs', { metric: terms.metric.singular }),
    },
    DAILY_METRICS: {
      value: 'DAILY_METRICS',
      text: i18n.t('Daily {{metrics}}', {
        metrics: terms.metric.lowercasePlural,
      }),
    },
    METRIC_DIVIDERS: {
      value: 'METRIC_DIVIDERS',
      text: i18n.t('{{metric}} dividers', { metric: terms.metric.singular }),
    },
    DRAG_AND_DROP_METRICS: {
      value: 'DRAG_AND_DROP_METRICS',
      text: i18n.t('Drag and drop organization'),
    },
    YES_NO_METRICS: {
      value: 'YES_NO_METRICS',
      text: i18n.t('New tracking units'),
    },
    CELL_NOTES: {
      value: 'CELL_NOTES',
      text: i18n.t('Cell notes'),
    },
    PROGRESSIVE_TRACKING: {
      value: 'PROGRESSIVE_TRACKING',
      text: i18n.t('Progressive tracking'),
    },
    ENHANCED_CHARTS: {
      value: 'ENHANCED_CHARTS',
      text: i18n.t('Enhanced charts'),
    },
    CUSTOM_GOALS: {
      value: 'CUSTOM_GOALS',
      text: i18n.t('Custom goals'),
    },
    QUICK_HEADLINES: {
      value: 'QUICK_HEADLINES',
      text: i18n.t('Quick {{headlines}}', {
        headlines: terms.headline.lowercasePlural,
      }),
    },
    SORT_OPTIONS: {
      value: 'SORT_OPTIONS',
      text: i18n.t('Sort options'),
    },
    QUICK_TO_DO: {
      value: 'QUICK_TO_DO',
      text: i18n.t('Quick {{todo}}', {
        todo: terms.todo.lowercaseSingular,
      }),
    },
    MERGE_ISSUES: {
      value: 'MERGE_ISSUES',
      text: i18n.t('Merge {{issues}}', { issues: terms.issue.lowercasePlural }),
    },
    RECENTLY_SOLVED_ISSUES: {
      value: 'RECENTLY_SOLVED_ISSUES',
      text: i18n.t('Recently solved {{issues}}', {
        issues: terms.issue.lowercasePlural,
      }),
    },
    STAR_VOTING: {
      value: 'STAR_VOTING',
      text: i18n.t('Star voting'),
    },
    WRITTEN_FEEDBACK: {
      value: 'WRITTEN_FEEDBACK',
      text: i18n.t('Written feedback'),
    },
    MEETING_NOTES_IN_SUMMARY: {
      value: 'MEETING_NOTES_IN_SUMMARY',
      text: i18n.t('Meeting notes in summary'),
    },
  }
}

export function getSectionToFeaturesMap(
  terms: BloomCustomTerms
): Record<TBloomNewFeatureModalNavSection, INewFeatureLookup[]> {
  const FEATURE_LOOKUP_MAP = getFeatureToFeatureLookupMap(terms)

  return {
    GETTING_STARTED: [
      FEATURE_LOOKUP_MAP['WELCOME'],
      FEATURE_LOOKUP_MAP['COLLAPSE_SIDE_NAV'],
      FEATURE_LOOKUP_MAP['MINIMIZABLE_WINDOW'],
      FEATURE_LOOKUP_MAP['MEETING_NOTES'],
      FEATURE_LOOKUP_MAP['BIG_PLUS_BUTTON'],
      FEATURE_LOOKUP_MAP['AGENDA_SECTIONS'],
      FEATURE_LOOKUP_MAP['MEETING_SECTION'],
      FEATURE_LOOKUP_MAP['PREVIEW_AND_EDIT'],
    ],
    CHECK_IN: [
      FEATURE_LOOKUP_MAP['ATTENDANCE'],
      FEATURE_LOOKUP_MAP['ICE_BREAKER'],
    ],
    GOALS: [FEATURE_LOOKUP_MAP['MILESTONE_VIEWS']],
    METRICS: [
      FEATURE_LOOKUP_MAP['METRIC_TYPES'],
      FEATURE_LOOKUP_MAP['DAILY_METRICS'],
      FEATURE_LOOKUP_MAP['METRIC_DIVIDERS'],
      FEATURE_LOOKUP_MAP['DRAG_AND_DROP_METRICS'],
      FEATURE_LOOKUP_MAP['YES_NO_METRICS'],
      FEATURE_LOOKUP_MAP['CELL_NOTES'],
      FEATURE_LOOKUP_MAP['PROGRESSIVE_TRACKING'],
      FEATURE_LOOKUP_MAP['ENHANCED_CHARTS'],
      FEATURE_LOOKUP_MAP['CUSTOM_GOALS'],
    ],
    HEADLINES: [
      FEATURE_LOOKUP_MAP['QUICK_HEADLINES'],
      FEATURE_LOOKUP_MAP['SORT_OPTIONS'],
    ],
    TO_DOS: [FEATURE_LOOKUP_MAP['QUICK_TO_DO']],
    ISSUES: [
      FEATURE_LOOKUP_MAP['MERGE_ISSUES'],
      FEATURE_LOOKUP_MAP['RECENTLY_SOLVED_ISSUES'],
      FEATURE_LOOKUP_MAP['STAR_VOTING'],
    ],
    WRAP_UP: [
      FEATURE_LOOKUP_MAP['WRITTEN_FEEDBACK'],
      FEATURE_LOOKUP_MAP['MEETING_NOTES_IN_SUMMARY'],
    ],
  }
}

export const FEATURE_TO_COMPONENT_MAP: Record<
  TBloomNewFeatureModalFeature,
  string | (() => React.ReactNode)
> = {
  WELCOME: () => (
    <HomePageWelcomeScreen
      css={css`
        padding: 0%;
        max-width: ${toREM(800)};
        padding-top: ${toREM(30)};
      `}
      noBorder
      noVector
      noButton
      noPaddingBT={true}
    />
  ),
  COLLAPSE_SIDE_NAV: CollapseSideNavigationImg,
  MINIMIZABLE_WINDOW: MinimizableWindowImg,
  MEETING_NOTES: MeetingNotesImg,
  BIG_PLUS_BUTTON: BigPlusButtonImg,
  AGENDA_SECTIONS: AgendaSectionsImg,
  MEETING_SECTION: MeetingSectionImg,
  PREVIEW_AND_EDIT: PreviewAndEditImg,
  ATTENDANCE: AttendanceImg,
  ICE_BREAKER: IcebreakerImg,
  MILESTONE_VIEWS: MilestoneViewsImg,
  METRIC_TYPES: MetricTypesImg,
  DAILY_METRICS: DailyMetricsImg,
  METRIC_DIVIDERS: MetricDividersImg,
  DRAG_AND_DROP_METRICS: DragAndDropMetricsImg,
  YES_NO_METRICS: YesNoMetricsImg,
  CELL_NOTES: CellNotesImg,
  PROGRESSIVE_TRACKING: ProgressiveTrackingImg,
  ENHANCED_CHARTS: EnhancedChartsImg,
  CUSTOM_GOALS: CustomGoalsImg,
  QUICK_HEADLINES: QuickHeadlinesImg,
  SORT_OPTIONS: SortOptionsImg,
  QUICK_TO_DO: QuickTodoImg,
  MERGE_ISSUES: MergeIssuesImg,
  RECENTLY_SOLVED_ISSUES: RecentlySolvedIssuesImg,
  STAR_VOTING: StarVotingImg,
  WRITTEN_FEEDBACK: WrittenFeedbackImg,
  MEETING_NOTES_IN_SUMMARY: MeetingNotesInSummaryImg,
}

export function getIndexedFeatureArray(terms: BloomCustomTerms) {
  const FEATURE_LOOKUP_MAP = getFeatureToFeatureLookupMap(terms)

  return Object.keys(FEATURE_LOOKUP_MAP).map(
    (feature) => feature as TBloomNewFeatureModalFeature
  )
}

export function getFeatureToSectionMap(terms: BloomCustomTerms) {
  const SECTION_TO_FEATURES_MAP = getSectionToFeaturesMap(terms)

  return keys(SECTION_TO_FEATURES_MAP).reduce(
    (acc, section) => {
      SECTION_TO_FEATURES_MAP[section].forEach((featureLookup) => {
        acc[featureLookup.value] = section
      })
      return acc
    },
    {} as Record<TBloomNewFeatureModalFeature, TBloomNewFeatureModalNavSection>
  )
}
