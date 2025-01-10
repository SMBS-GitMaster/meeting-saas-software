import { UserPermissionType, getCanCreateIssuesInMeeting } from '@mm/core-bloom'

export const getMergeIssueDrawerPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
  }
}
