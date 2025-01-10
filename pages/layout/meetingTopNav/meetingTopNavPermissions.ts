import {
  UserPermissionType,
  getCanCreateBusinessPlan,
  getCanEditMeetingAdvancedSettings,
} from '@mm/core-bloom'

export const getTopNavPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isOrgAdmin: boolean
}) => {
  const { currentUserPermissions, isOrgAdmin } = opts

  return {
    canEditMeetingAdvancedSettings: getCanEditMeetingAdvancedSettings(
      currentUserPermissions
    ),
    canAttachBusinessPlanToMeeting: getCanCreateBusinessPlan({
      currentUserPermissions,
      isOrgAdmin,
    }),
  }
}
