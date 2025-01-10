import {
  UserPermissionType,
  getCanEditAttendeesInMeeting,
  getCanEditCheckInInMeeting,
  getCurrentUserIsMeetingLeaderInMeeting,
} from '@mm/core-bloom'

export const getCheckInSectionPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isCurrentUserMeetingLeader: boolean
}) => {
  return {
    currentUserIsMeetingLeader: getCurrentUserIsMeetingLeaderInMeeting(
      opts.isCurrentUserMeetingLeader
    ),
    canEditAttendeesInMeeting: getCanEditAttendeesInMeeting(
      opts.currentUserPermissions
    ),
    canEditCheckInInMeeting: getCanEditCheckInInMeeting(
      opts.currentUserPermissions
    ),
  }
}
