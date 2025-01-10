import { i18n } from '@mm/core/i18n'

import { TQuarterlyAlignmentWorkspaceTabType } from '../quarterlyAlignmentWorkspaceTypes'

export const QUATERLY_ALIGNMENT_WORKSPACE_TABS: Array<{
  value: TQuarterlyAlignmentWorkspaceTabType
  text: string
}> = [
  { value: 'PRIORITIES', text: i18n.t('Priorities') },
  { value: 'R&R', text: i18n.t('R&R') },
  { value: 'CULTURE', text: i18n.t('Culture') },
]
