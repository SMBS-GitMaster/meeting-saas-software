import { i18n } from '@mm/core/i18n'

import { EBusinessPlanIssueListColumnSize } from '../businessPlanTypes'

export const getRecordOfIssueColumnsToSelectedItemText = () => {
  return {
    [EBusinessPlanIssueListColumnSize.One]: i18n.t('1 Column'),
    [EBusinessPlanIssueListColumnSize.Two]: i18n.t('2 Columns'),
    [EBusinessPlanIssueListColumnSize.Three]: i18n.t('3 Columns'),
    [EBusinessPlanIssueListColumnSize.Four]: i18n.t('4 Columns'),
  }
}
