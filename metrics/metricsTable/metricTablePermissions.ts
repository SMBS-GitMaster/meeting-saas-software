import {
  BloomCustomTerms,
  UserPermissionType,
  getCanAddExistingMetricsToMeeting,
  getCanCreateIssuesInMeeting,
  getCanCreateMetricDividersInMeeting,
  getCanCreateMetricsTabsInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditMetricDividersInMeeting,
  getCanEditMetricsInMeeting,
  getCanPerformEditActionsForMetricsInMeeting,
  getCanReverseMetricsInMeeting,
} from '@mm/core-bloom'

export const getMetricTablePermissions = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canReverseMetricsInMeeting: getCanReverseMetricsInMeeting(
      currentUserPermissions
    ),
    canCreateMetricDividersInMeeting: getCanCreateMetricDividersInMeeting(
      currentUserPermissions
    ),
    canCreateMetricsTabsInMeeting: getCanCreateMetricsTabsInMeeting(
      currentUserPermissions
    ),
    canAddExistingMetricsToMeeting: getCanAddExistingMetricsToMeeting(
      currentUserPermissions
    ),
    canEditMetricDividersInMeeting: getCanEditMetricDividersInMeeting(
      currentUserPermissions
    ),
    canPerformEditActionsForMetricsInMeeting:
      getCanPerformEditActionsForMetricsInMeeting(currentUserPermissions),
  }
}

export const getMetricSpecificPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isCurrentUserOwner: boolean
  preventEditingUnownedMetrics: boolean
  terms: BloomCustomTerms
}) => {
  const {
    currentUserPermissions,
    isCurrentUserOwner,
    preventEditingUnownedMetrics,
    terms,
  } = opts

  return {
    canEditMetricsInMeeting: getCanEditMetricsInMeeting({
      currentUserPermissions,
      isCurrentUserOwner,
      preventEditingUnownedMetrics,
      terms,
    }),
  }
}
