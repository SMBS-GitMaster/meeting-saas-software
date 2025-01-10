import type { ICreateWorkspaceDrawerMeetingSubState } from './createWorkspaceDrawerTypes'

export const CREATE_WORKSPACE_NEW_MEETING_SUB_STATE: Omit<
  ICreateWorkspaceDrawerMeetingSubState,
  'meetingId' | 'meetingName'
> = {
  isExpanded: true,
  numTilesSelected: 0,
  tiles: {
    MEETING_GOALS: false,
    MEETING_TODOS: false,
    MEETING_HEADLINES: false,
    MEETING_ISSUES: false,
    MEETING_METRICS: false,
    MEETING_NOTES: false,
    MEETING_STATS: false,
  },
}
