import {
  PermissionCheckResult,
  UserPermissionType,
  getCanCreateMetricsInMeeting,
} from '@mm/core-bloom'

interface IGetCreateMetricDrawerPermissionsResult {
  canCreateMetricsInMeeting: PermissionCheckResult
}

export const getCreateMetricDrawerPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isPersonalMetric: boolean
}): IGetCreateMetricDrawerPermissionsResult => {
  if (opts.isPersonalMetric) {
    return {
      canCreateMetricsInMeeting: { allowed: true },
    }
  } else {
    return {
      canCreateMetricsInMeeting: getCanCreateMetricsInMeeting(
        opts.currentUserPermissions
      ),
    }
  }
}
