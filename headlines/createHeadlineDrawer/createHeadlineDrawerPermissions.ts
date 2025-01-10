import {
  UserPermissionType,
  getCanCreateHeadlinesInMeeting,
  getCanCreateHeadlinesInUniversalAdd,
} from '@mm/core-bloom'

export const getCreateHeadlineDrawerPermissions = (opts: {
  currentUserPermissions: Maybe<UserPermissionType>
  isUniversalAdd?: boolean
}) => {
  return {
    canCreateHeadlines: opts.isUniversalAdd
      ? getCanCreateHeadlinesInUniversalAdd(opts.currentUserPermissions)
      : getCanCreateHeadlinesInMeeting(opts.currentUserPermissions),
  }
}
