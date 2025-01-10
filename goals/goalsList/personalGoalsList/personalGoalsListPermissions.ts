import { UserPermissionType, getCanEditGoalsInMeeting } from '@mm/core-bloom'

export const getMeetingGoalListPermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canEditGoalsInMeeting: getCanEditGoalsInMeeting(currentUserPermissions),
  }
}
