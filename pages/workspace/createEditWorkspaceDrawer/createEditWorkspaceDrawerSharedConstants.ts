import type { TWorkspaceTileType } from '@mm/core-bloom'

import { IMMThemeSingleColorIcons } from '@mm/core-web/ui'

export const TILE_TYPE_TO_ICON_MAP: Record<
  TWorkspaceTileType,
  keyof IMMThemeSingleColorIcons
> = {
  DIRECT_REPORT_STATS: 'statsIcon',
  MANAGE: 'directReportIcon',
  MEETING_GOALS: 'goalIcon',
  MEETING_HEADLINES: 'headlineIcon',
  MEETING_ISSUES: 'issuesIcon',
  MEETING_METRICS: 'searchDataIcon',
  MEETING_NOTES: 'notepadIcon',
  MEETING_STATS: 'statsIcon',
  MEETING_TODOS: 'toDoCompleteIcon',
  PERSONAL_GOALS: 'goalIcon',
  PERSONAL_METRICS: 'searchDataIcon',
  PERSONAL_NOTES: 'notepadIcon',
  PERSONAL_TODOS: 'toDoCompleteIcon',
  PROCESSES: 'processesIcon',
  ROLES: 'roleIcon',
  USER_PROFILE: 'userIcon',
  VALUES: 'valuesIcon',
}
