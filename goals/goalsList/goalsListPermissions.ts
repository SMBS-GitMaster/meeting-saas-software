import {
  UserPermissionType,
  getCanCreateGoalsInMeeting,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditGoalsInMeeting,
} from '@mm/core-bloom'

export const getGoalListPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditGoalsInMeeting: getCanEditGoalsInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
    canCreateGoalsInMeeting: getCanCreateGoalsInMeeting(currentUserPermissions),
  }
}
