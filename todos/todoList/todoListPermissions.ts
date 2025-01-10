import {
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditTodosInMeeting,
} from '@mm/core-bloom'

export const getTodoListPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditTodosInMeeting: getCanEditTodosInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
  }
}
