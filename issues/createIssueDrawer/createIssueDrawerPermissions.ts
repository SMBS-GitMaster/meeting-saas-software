import {
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanCreateIssuesInUniversalAdd,
} from '@mm/core-bloom'

export const getCreateIssueDrawerPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isUniversalAdd?: boolean
}) => {
  return {
    canCreateIssues: opts.isUniversalAdd
      ? getCanCreateIssuesInUniversalAdd(opts.currentUserPermissions)
      : getCanCreateIssuesInMeeting(opts.currentUserPermissions),
  }
}
