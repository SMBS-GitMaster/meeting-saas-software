export type TBloomNewFeatureModalNavSection =
  | 'GETTING_STARTED'
  | 'CHECK_IN'
  | 'GOALS'
  | 'METRICS'
  | 'HEADLINES'
  | 'TO_DOS'
  | 'ISSUES'
  | 'WRAP_UP'

export type TBloomNewFeatureModalFeature =
  | 'WELCOME'
  | 'COLLAPSE_SIDE_NAV'
  | 'MINIMIZABLE_WINDOW'
  | 'MEETING_NOTES'
  | 'BIG_PLUS_BUTTON'
  | 'AGENDA_SECTIONS'
  | 'MEETING_SECTION'
  | 'PREVIEW_AND_EDIT'
  | 'ATTENDANCE'
  | 'ICE_BREAKER'
  | 'MILESTONE_VIEWS'
  | 'METRIC_TYPES'
  | 'DAILY_METRICS'
  | 'METRIC_DIVIDERS'
  | 'DRAG_AND_DROP_METRICS'
  | 'YES_NO_METRICS'
  | 'CELL_NOTES'
  | 'PROGRESSIVE_TRACKING'
  | 'ENHANCED_CHARTS'
  | 'CUSTOM_GOALS'
  | 'QUICK_HEADLINES'
  | 'SORT_OPTIONS'
  | 'QUICK_TO_DO'
  | 'MERGE_ISSUES'
  | 'RECENTLY_SOLVED_ISSUES'
  | 'STAR_VOTING'
  | 'WRITTEN_FEEDBACK'
  | 'MEETING_NOTES_IN_SUMMARY'

export interface INewFeatureLookup {
  value: TBloomNewFeatureModalFeature
  text: string
}
