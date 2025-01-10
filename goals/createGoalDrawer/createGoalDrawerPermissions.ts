import {
  PermissionCheckResult,
  UserPermissionType,
  getCanCreateGoalsInMeeting,
} from '@mm/core-bloom'

export const getCreateGoalDrawerPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isPersonalGoal: boolean
  noMeetingIsSpecified: boolean
}): {
  canCreateGoalsInMeeting: PermissionCheckResult
} => {
  if (opts.isPersonalGoal || opts.noMeetingIsSpecified) {
    return {
      canCreateGoalsInMeeting: { allowed: true },
    }
  } else {
    return {
      canCreateGoalsInMeeting: getCanCreateGoalsInMeeting(
        opts.currentUserPermissions
      ),
    }
  }
}
