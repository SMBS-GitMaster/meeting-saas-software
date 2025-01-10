import {
  BloomCustomTerms,
  PermissionCheckResult,
  UserPermissionType,
  getCanArchiveMetricsInMeeting,
  getCanCreateIssuesInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditMetricsInMeeting,
  getCanEditMetricsMeetingInMeeting,
} from '@mm/core-bloom'

interface IGetEditMetricDrawerPermissionsResult {
  canEditMetricsInMeeting: PermissionCheckResult
  canCreateTodosInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
  canEditMetricsMeetingInMeeting: PermissionCheckResult
  canArchiveMetricsInMeeting: PermissionCheckResult
}

export const getEditMetricDrawerPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isCurrentUserOwner: boolean
  preventEditingUnownedMetrics: boolean
  terms: BloomCustomTerms
  isPersonalMetric: boolean
}): IGetEditMetricDrawerPermissionsResult => {
  const {
    currentUserPermissions,
    isCurrentUserOwner,
    preventEditingUnownedMetrics,
    terms,
  } = opts

  if (opts.isPersonalMetric) {
    return {
      canEditMetricsInMeeting: { allowed: true },
      canCreateTodosInMeeting: { allowed: true },
      canCreateIssuesInMeeting: { allowed: true },
      canEditMetricsMeetingInMeeting: { allowed: true },
      canArchiveMetricsInMeeting: { allowed: true },
    }
  }

  return {
    canEditMetricsInMeeting: getCanEditMetricsInMeeting({
      currentUserPermissions,
      isCurrentUserOwner,
      preventEditingUnownedMetrics,
      terms,
    }),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canEditMetricsMeetingInMeeting: getCanEditMetricsMeetingInMeeting({
      currentUserPermissions,
      isCurrentUserOwner,
      preventEditingUnownedMetrics,
      terms,
    }),
    canArchiveMetricsInMeeting: getCanArchiveMetricsInMeeting({
      currentUserPermissions,
      isCurrentUserOwner,
      preventEditingUnownedMetrics,
      terms,
    }),
  }
}
