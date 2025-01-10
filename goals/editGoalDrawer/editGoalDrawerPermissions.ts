import {
  PermissionCheckResult,
  UserPermissionType,
  getCanArchiveGoalInMeeting,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditGoalsInMeeting,
  getCanEditGoalsMeetingInMeeting,
  getCanEditGoalsOwnerInMeeting,
} from '@mm/core-bloom'

interface IGetEditGoalDrawerPermissionsResponse {
  canEditGoalsInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
  canCreateTodosInMeeting: PermissionCheckResult
  canEditGoalsOwnerInMeeting: PermissionCheckResult
  canEditGoalsMeetingInMeeting: PermissionCheckResult
  canArchiveGoalInMeeting: PermissionCheckResult
}

export const getEditGoalDrawerPermissions = (opts: {
  isCurrentUserOwner: boolean
  currentUserPermissions: Maybe<UserPermissionType>
  isPersonalGoal: boolean
}): IGetEditGoalDrawerPermissionsResponse => {
  const { currentUserPermissions, isCurrentUserOwner } = opts

  if (opts.isPersonalGoal) {
    return {
      canEditGoalsInMeeting: { allowed: true },
      canCreateIssuesInMeeting: { allowed: true },
      canCreateTodosInMeeting: { allowed: true },
      canEditGoalsOwnerInMeeting: { allowed: true },
      canEditGoalsMeetingInMeeting: { allowed: true },
      canArchiveGoalInMeeting: { allowed: true },
    }
  } else {
    return {
      canEditGoalsInMeeting: getCanEditGoalsInMeeting(currentUserPermissions),
      canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
        currentUserPermissions
      ),
      canCreateTodosInMeeting: getCanCreateTodosInMeeting(
        currentUserPermissions
      ),
      canEditGoalsOwnerInMeeting: getCanEditGoalsOwnerInMeeting(
        currentUserPermissions
      ),
      canEditGoalsMeetingInMeeting: getCanEditGoalsMeetingInMeeting(
        currentUserPermissions
      ),
      canArchiveGoalInMeeting: getCanArchiveGoalInMeeting({
        currentUserPermissions,
        isCurrentUserOwner,
      }),
    }
  }
}
