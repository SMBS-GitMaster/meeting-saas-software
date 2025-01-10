import {
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditIssuesInMeeting,
  getCanStarVoteForIssuesInMeeting,
  getCurrentUserIsMeetingLeaderInMeeting,
} from '@mm/core-bloom'

export const getIssueListPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isCurrentUserMeetingLeader: boolean
}) => {
  const { currentUserPermissions, isCurrentUserMeetingLeader } = opts

  return {
    currentUserIsMeetingLeader: getCurrentUserIsMeetingLeaderInMeeting(
      isCurrentUserMeetingLeader
    ),
    canEditIssuesInMeeting: getCanEditIssuesInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
    canStarVoteForIssuesInMeeting: getCanStarVoteForIssuesInMeeting(
      currentUserPermissions
    ),
  }
}
