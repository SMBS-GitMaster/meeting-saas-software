import {
  UserPermissionType,
  getCanEditAttendeesInMeeting,
  getCanEditMeetingAdvancedSettings,
} from '@mm/core-bloom'

export const getAttendeeMangementModalPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditAttendeesInMeeting: getCanEditAttendeesInMeeting(
      currentUserPermissions
    ),
    canViewAdvancedSettingsInMeeting: getCanEditMeetingAdvancedSettings(
      currentUserPermissions
    ),
  }
}
