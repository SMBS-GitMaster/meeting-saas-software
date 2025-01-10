import { Id } from '@mm/gql'

import {
  BloomCustomTerms,
  ContextAwareNodeType,
  IContextAwareItemNodeTypeAndFromOpts,
  MetricFrequency,
  MetricGoalInfoType,
  MetricRules,
  MetricUnits,
  TBusinessPlanParentPageType,
} from '@mm/core-bloom'

import { GoalStatus } from '@mm/core-bloom/goals'

export interface IContextAwareBannerProps
  extends IContextAwareItemNodeTypeAndFromOpts {
  customXPadding?: string
}

export function getContextAwareNodeTypes(terms: BloomCustomTerms) {
  const ContextAwareNodeTypes: Record<ContextAwareNodeType, string> = {
    'Goal': terms.goal.singular,
    'Metric': terms.metric.singular,
    'Issue': terms.issue.singular,
    'To-do': terms.todo.singular,
    'Headline': terms.headline.singular,
    'BusinessPlanCoreValues': terms.coreValues.singular,
    'BusinessPlanCoreFocus': terms.focus.singular,
    'BusinessPlanBhag': terms.bhag.singular,
    'BusinessPlanStrategy': terms.marketingStrategy.singular,
    'BusinessPlanVisionThreeYear': terms.threeYearVision.singular,
    'BusinessPlanVisionOneYear': terms.oneYearGoals.singular,
    'BusinessPlanQuarterlyGoals': terms.quarterlyGoals.singular,
    'BusinessPlanQuarterlyGoalsMeasurables': terms.quarterlyGoals.singular,
  }
  return ContextAwareNodeTypes
}

export type TCreateContextAwareItemOpts =
  | TCreateContextAwareMeetingItemOpts
  | TCreateContextAwareBusinessPlanItemOpts

export type TCreateContextAwareMeetingItemOpts =
  | IContextAwareItemFromMetricOpts
  | IContextAwareItemFromGoalOpts
  | IContextAwareItemFromHeadlineOpts
  | IContextAwareItemFromTodoOpts
  | IContextAwareItemFromIssueOpts

export type TCreateContextAwareBusinessPlanItemOpts =
  | IContextAwareItemFromBusinessPlanCoreValuesOpts
  | IContextAwareItemFromBusinessPlanCoreFocusOpts
  | IContentAwareItemFromBusinessPlanBhagOpts
  | IContextAwareItemFromBusinessPlanStrategyOpts
  | IContextAwareItemFromBusinessPlanVisionThreeYearOpts
  | IContextAwareItemFromBusinessPlanVisionOneYearOpts
  | IContextAwareItemFromBusinessPlanGoalsOpts
  | IContextAwareItemFromBusinessPlanQuarterlyGoalsMeasurables

interface IContextAwareItemUniversalProps {
  title: string
}

interface IContextAwareItemSharedMeetingItemProps {
  notesId: Id
  ownerId: Id
  ownerFullName: string
}

export interface IContextAwareItemFromIssueOpts
  extends IContextAwareItemUniversalProps,
    IContextAwareItemSharedMeetingItemProps {
  type: 'Issue'
}

export interface IContextAwareItemFromTodoOpts
  extends IContextAwareItemUniversalProps,
    IContextAwareItemSharedMeetingItemProps {
  type: 'To-do'
  notesId: Id
  ownerId: Id
  ownerFullName: string
}

export interface IContextAwareItemFromHeadlineOpts
  extends IContextAwareItemUniversalProps,
    IContextAwareItemSharedMeetingItemProps {
  type: 'Headline'
  notesId: Id
  ownerId: Id
  ownerFullName: string
}

export interface IContextAwareItemFromMetricOpts
  extends IContextAwareItemUniversalProps,
    IContextAwareItemSharedMeetingItemProps {
  type: 'Metric'
  rule: MetricRules
  units: MetricUnits
  goal: MetricGoalInfoType
  metricScoreData?: {
    metricFrequency: MetricFrequency
    formattedScoreValue: Maybe<string>
    cellNotes: Maybe<string>
    dateRange: string
    year: number
  }
  notesId: Id
  ownerId: Id
  ownerFullName: string
}

export interface IContextAwareItemFromGoalOpts
  extends IContextAwareItemUniversalProps,
    IContextAwareItemSharedMeetingItemProps {
  type: 'Goal'
  status: GoalStatus
  dateCreated: number
  dueDate: number
  notesId: Id
  ownerId: Id
  ownerFullName: string
}

export interface IContextAwareItemFromBusinessPlanCoreValuesOpts
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanCoreValues'
  businessPlanPage: TBusinessPlanParentPageType
}

export interface IContextAwareItemFromBusinessPlanCoreFocusOpts
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanCoreFocus'
  businessPlanPage: TBusinessPlanParentPageType
  tile: string
}

export interface IContentAwareItemFromBusinessPlanBhagOpts
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanBhag'
  businessPlanPage: TBusinessPlanParentPageType
  tile: string
}

export interface IContextAwareItemFromBusinessPlanStrategyOpts
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanStrategy'
  businessPlanPage: TBusinessPlanParentPageType
  tile: string
}

export interface IContextAwareItemFromBusinessPlanVisionThreeYearOpts
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanVisionThreeYear'
  businessPlanPage: TBusinessPlanParentPageType
  tile: string
}

export interface IContextAwareItemFromBusinessPlanVisionOneYearOpts
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanVisionOneYear'
  businessPlanPage: TBusinessPlanParentPageType
  tile: string
}

export interface IContextAwareItemFromBusinessPlanGoalsOpts
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanQuarterlyGoals'
  businessPlanPage: TBusinessPlanParentPageType
  tile: string
  owner: string
}

export interface IContextAwareItemFromBusinessPlanQuarterlyGoalsMeasurables
  extends IContextAwareItemUniversalProps {
  type: 'BusinessPlanQuarterlyGoalsMeasurables'
  businessPlanPage: TBusinessPlanParentPageType
  tile: string
}
