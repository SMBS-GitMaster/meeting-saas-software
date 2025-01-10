import {
  UserPermissionType,
  getCanCreateHeadlinesInMeeting,
} from '@mm/core-bloom'

export const getCopyHeadlineToMeetingsModalPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canCreateHeadlinesInMeeting: getCanCreateHeadlinesInMeeting(
      currentUserPermissions
    ),
  }
}
