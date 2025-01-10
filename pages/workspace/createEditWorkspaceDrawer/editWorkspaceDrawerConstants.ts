import type { IEditWorkspaceDrawerMeetingSubState } from './editWorkspaceDrawerTypes'

export const EDIT_WORKSPACE_NEW_MEETING_SUB_STATE: Omit<
  IEditWorkspaceDrawerMeetingSubState,
  'meetingId' | 'meetingName'
> = {
  isExpanded: true,
  numTilesSelected: 0,
  tiles: {
    MEETING_GOALS: { tileId: null, isSelected: false },
    MEETING_TODOS: { tileId: null, isSelected: false },
    MEETING_HEADLINES: { tileId: null, isSelected: false },
    MEETING_ISSUES: { tileId: null, isSelected: false },
    MEETING_METRICS: { tileId: null, isSelected: false },
    MEETING_NOTES: { tileId: null, isSelected: false },
    MEETING_STATS: { tileId: null, isSelected: false },
  },
}
