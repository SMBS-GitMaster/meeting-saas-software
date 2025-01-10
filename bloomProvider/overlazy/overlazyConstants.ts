import i18n from 'i18next'

import { BloomCustomTerms } from '@mm/core-bloom'

import { OVERLAZY_DRAWERS } from './overlazyComponents'

export function getRecordOfOverlazyDrawerIdToDrawerTitle(
  terms: BloomCustomTerms
) {
  const RecordOfOverlazyDrawerIdToDrawerTitle: Record<
    keyof typeof OVERLAZY_DRAWERS,
    string
  > = {
    CreateGoalDrawer: i18n.t('New {{goal}}', {
      goal: terms.goal.lowercaseSingular,
    }),
    EditGoalDrawer: i18n.t('Edit {{goal}}', {
      goal: terms.goal.lowercaseSingular,
    }),
    CreateHeadlineDrawer: i18n.t('New {{headline}}', {
      headline: terms.headline.lowercaseSingular,
    }),
    EditHeadlineDrawer: i18n.t('Edit {{headline}}', {
      headline: terms.headline.lowercaseSingular,
    }),
    CreateIssueDrawer: i18n.t('New {{issue}}', {
      issue: terms.issue.lowercaseSingular,
    }),
    EditIssueDrawer: i18n.t('Edit {{issue}}', {
      issue: terms.issue.lowercaseSingular,
    }),
    CreateTodoDrawer: i18n.t('New {{todo}}', {
      todo: terms.todo.lowercaseSingular,
    }),
    CreateWorkspaceDrawer: i18n.t('New workspace'),
    EditWorkspaceDrawer: i18n.t('Manage tiles'),
    EditTodoDrawer: i18n.t('Edit {{todo}}', {
      todo: terms.todo.lowercaseSingular,
    }),
    MergeIssuesDrawer: i18n.t('Merge {{issues}}', {
      issues: terms.issue.lowercasePlural,
    }),
    CreateMetricDrawer: i18n.t('Create {{metric}}', {
      metric: terms.metric.lowercaseSingular,
    }),
    EditMetricDrawer: i18n.t('Edit {{metric}}', {
      metric: terms.metric.lowercaseSingular,
    }),
    EditOrgChartSeatDrawer: i18n.t('Edit seat'),
    CreateOrgChartSeatDrawer: i18n.t('New seat'),
    ErrorDrawer: i18n.t('Error'),
  }

  return RecordOfOverlazyDrawerIdToDrawerTitle
}
