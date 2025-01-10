import {
  UserPermissionType,
  getCanCreateTodosInMeeting,
  getCanEditIssuesInMeeting,
} from '@mm/core-bloom'

export const getEditIssueDrawerPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditIssuesInMeeting: getCanEditIssuesInMeeting(currentUserPermissions),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
  }
}
