import {
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanCreateMetricsTabsInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditMetricTabInMeeting,
  getCanPerformDeleteActionsForMetricTabInMeeting,
  getCanPinOrUnpinMetricsTabsInMeeting,
  getCanSharePersonalMetricsTabsToMeeting,
} from '@mm/core-bloom'

export const getMetricsTabPermissions = (opts: {
  isMetricTabShared: boolean
  isOwnerOfMetricTab: boolean
  currentUserPermissions: Maybe<UserPermissionType>
}) => {
  const { isMetricTabShared, isOwnerOfMetricTab, currentUserPermissions } = opts
  return {
    canSharePersonalMetricsTabsToMeeting:
      getCanSharePersonalMetricsTabsToMeeting(currentUserPermissions),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canEditMetricTabInMeeting: getCanEditMetricTabInMeeting({
      currentUserPermissions,
      isMetricTabShared,
      isOwnerOfMetricTab,
    }),
    canPerformDeleteActionsForMetricTabInMeeting:
      getCanPerformDeleteActionsForMetricTabInMeeting({
        currentUserPermissions,
        isMetricTabShared,
        isOwnerOfMetricTab,
      }),
  }
}

export const getCanUserDeleteMetricTab = (opts: {
  isMetricTabShared: boolean
  isOwnerOfMetricTab: boolean
  currentUserPermissions: Maybe<UserPermissionType>
}) => {
  const { isMetricTabShared, isOwnerOfMetricTab, currentUserPermissions } = opts

  return {
    canPerformDeleteActionsForMetricTabInMeeting:
      getCanPerformDeleteActionsForMetricTabInMeeting({
        currentUserPermissions,
        isMetricTabShared,
        isOwnerOfMetricTab,
      }),
  }
}

export const getCanCreateMetricsTabs = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canCreateMetricsTabsInMeeting: getCanCreateMetricsTabsInMeeting(
      currentUserPermissions
    ),
  }
}

export const getCanEditMetricTab = (opts: {
  isMetricTabShared: boolean
  isOwnerOfMetricTab: boolean
  currentUserPermissions: Maybe<UserPermissionType>
}) => {
  const { isMetricTabShared, isOwnerOfMetricTab, currentUserPermissions } = opts

  return {
    canEditMetricTabInMeeting: getCanEditMetricTabInMeeting({
      currentUserPermissions,
      isMetricTabShared,
      isOwnerOfMetricTab,
    }),
  }
}

export const getCanPinOrUnpinMetricsTabs = (
  currentUserPermissions: Maybe<UserPermissionType>
) => {
  return {
    canPinOrUnpinMetricsTabsInMeeting: getCanPinOrUnpinMetricsTabsInMeeting(
      currentUserPermissions
    ),
  }
}
