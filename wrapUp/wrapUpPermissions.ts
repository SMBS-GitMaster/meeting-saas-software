import {
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditIssuesInMeeting,
  getCanEditMeetingConcludeActionsInMeeting,
  getCanEditTodosInMeeting,
} from '@mm/core-bloom'

export const getWrapUpPagePermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditTodosInMeeting: getCanEditTodosInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
    canEditIssuesInMeeting: getCanEditIssuesInMeeting(currentUserPermissions),
    canEditMeetingConcludeActionsInMeeting:
      getCanEditMeetingConcludeActionsInMeeting(currentUserPermissions),
  }
}
