import {
  UserPermissionType,
  getCanCreateHeadlinesInMeeting,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditHeadlinesInMeeting,
} from '@mm/core-bloom'

export const getHeadlinesListPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canCreateHeadlinesInMeeting: getCanCreateHeadlinesInMeeting(
      currentUserPermissions
    ),
    canEditHeadlinesInMeeting: getCanEditHeadlinesInMeeting(
      currentUserPermissions
    ),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
  }
}
