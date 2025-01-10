import {
  UserPermissionType,
  getCanCreateMeetingNotesInMeeting,
  getCanEditMeetingNotesInMeeting,
} from '@mm/core-bloom'

export const getMeetingNotesTilePermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canCreateNotes: getCanCreateMeetingNotesInMeeting(currentUserPermissions),
    canEditNotes: getCanEditMeetingNotesInMeeting(currentUserPermissions),
  }
}
