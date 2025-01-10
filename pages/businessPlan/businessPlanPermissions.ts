import {
  UserPermissionType,
  getCanCreateBusinessPlan,
  getCanEditBusinessPlan,
} from '@mm/core-bloom'

export const getBusinessPlanPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isOrgAdmin: boolean
}) => {
  const { currentUserPermissions, isOrgAdmin } = opts

  return {
    canCreateBusinessPlan: getCanCreateBusinessPlan({
      currentUserPermissions,
      isOrgAdmin,
    }),
    canEditBusinessPlan: getCanEditBusinessPlan({
      currentUserPermissions,
      isOrgAdmin,
    }),
    isOrgAdmin,
  }
}
