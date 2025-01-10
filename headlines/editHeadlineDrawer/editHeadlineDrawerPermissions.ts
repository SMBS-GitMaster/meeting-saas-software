import {
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditHeadlinesInMeeting,
} from '@mm/core-bloom'

export const getEditHeadlineDrawerPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditHeadlinesInMeeting: getCanEditHeadlinesInMeeting(
      currentUserPermissions
    ),

    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
  }
}
