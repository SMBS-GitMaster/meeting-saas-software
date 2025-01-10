import {
  UserPermissionType,
  getCanEditExternalLinkInMeeting,
} from '@mm/core-bloom'

export const getExternalPageSectionPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditExternalLinkInMeeting: getCanEditExternalLinkInMeeting(
      currentUserPermissions
    ),
  }
}
