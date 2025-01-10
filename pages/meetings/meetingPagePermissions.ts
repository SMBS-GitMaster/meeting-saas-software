import {
  UserPermissionType,
  getCanAddExistingMetricsToMeeting,
  getCanCreateGoalsInMeeting,
  getCanCreateIssuesInMeeting,
  getCanCreateMeetingPagesInMeeting,
  getCanCreateMetricDividersInMeeting,
  getCanCreateMetricsTabsInMeeting,
  getCanCreateTodosInMeeting,
  getCanEditAgendaPrintExportSavePdfInMeeting,
  getCanEditAttendeesInMeeting,
  getCanEditCheckInInMeeting,
  getCanEditExternalLinkInMeeting,
  getCanEditGoalsInMeeting,
  getCanEditIssuesInMeeting,
  getCanEditMeetingPagesInMeeting,
  getCanEditTodosInMeeting,
  getCanPerformEditActionsForMetricsInMeeting,
  getCanReverseMetricsInMeeting,
  getCurrentUserIsMeetingLeaderInMeeting,
} from '@mm/core-bloom'

export const getMeetingPagePermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  currentUserIsLeader: boolean
  currentUserIsMeetingAdmin: boolean
}) => {
  const { currentUserPermissions, currentUserIsLeader } = opts

  return {
    canEditIssuesInMeeting: getCanEditIssuesInMeeting(currentUserPermissions),
    canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
      currentUserPermissions
    ),
    canCreateTodosInMeeting: getCanCreateTodosInMeeting(currentUserPermissions),
    canEditGoalsInMeeting: getCanEditGoalsInMeeting(currentUserPermissions),
    canCreateGoalsInMeeting: getCanCreateGoalsInMeeting(currentUserPermissions),
    canEditTodosInMeeting: getCanEditTodosInMeeting(currentUserPermissions),
    canEditAgendaPrintExportSavePdfInMeeting:
      getCanEditAgendaPrintExportSavePdfInMeeting(currentUserPermissions),
    canEditMeetingPagesInMeeting: getCanEditMeetingPagesInMeeting(
      currentUserPermissions
    ),
    canCreateMeetingPagesInMeeting: getCanCreateMeetingPagesInMeeting(
      currentUserPermissions
    ),
    currentUserIsMeetingLeader:
      getCurrentUserIsMeetingLeaderInMeeting(currentUserIsLeader),
    canEditAttendeesInMeeting: getCanEditAttendeesInMeeting(
      currentUserPermissions
    ),
    canReverseMetricsInMeeting: getCanReverseMetricsInMeeting(
      currentUserPermissions
    ),
    canCreateMetricDividersInMeeting: getCanCreateMetricDividersInMeeting(
      currentUserPermissions
    ),
    canEditCheckInInMeeting: getCanEditCheckInInMeeting(currentUserPermissions),
    canEditExternalLinkInMeeting: getCanEditExternalLinkInMeeting(
      currentUserPermissions
    ),
    canAddExistingMetricsToMeeting: getCanAddExistingMetricsToMeeting(
      currentUserPermissions
    ),
    canPerformEditActionsForMetricsInMeeting:
      getCanPerformEditActionsForMetricsInMeeting(currentUserPermissions),
    canCreateMetricsTabsInMeeting: getCanCreateMetricsTabsInMeeting(
      currentUserPermissions
    ),
    currentUserIsMeetingAdmin: opts.currentUserIsMeetingAdmin,
  }
}
