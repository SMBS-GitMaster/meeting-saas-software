import {
  IMeetingWorkspaceTile,
  IPersonalWorkspaceTile,
} from '../workspacePageTypes'

export const isMeetingWorkspace = (
  workspace: IPersonalWorkspaceTile | IMeetingWorkspaceTile | null
): workspace is IMeetingWorkspaceTile => {
  return workspace
    ? (workspace as IMeetingWorkspaceTile).meetingId !== undefined
    : false
}
