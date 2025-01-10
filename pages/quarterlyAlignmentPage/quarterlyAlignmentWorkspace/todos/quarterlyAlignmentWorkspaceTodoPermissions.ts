import {
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditTodosInMeeting,
} from '@mm/core-bloom'

export const getQuaterlyAlignmentWorkspaceTodoPermissions = (
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
