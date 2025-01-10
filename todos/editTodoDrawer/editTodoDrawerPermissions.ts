import {
  PermissionCheckResult,
  UserPermissionType,
  getCanCreateIssuesInMeeting,
  getCanEditTodosInMeeting,
} from '@mm/core-bloom'

interface IGetEditTodoDrawerPermissionsResponse {
  canEditTodosInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
}

export const getEditTodoDrawerPermissions = (opts: {
  isCurrentUserPersonalTodo: boolean
  currentUserPermissions: Maybe<UserPermissionType>
}): IGetEditTodoDrawerPermissionsResponse => {
  if (opts.isCurrentUserPersonalTodo) {
    return {
      canEditTodosInMeeting: { allowed: true },
      canCreateIssuesInMeeting: { allowed: true },
    }
  } else {
    return {
      canEditTodosInMeeting: getCanEditTodosInMeeting(
        opts.currentUserPermissions
      ),
      canCreateIssuesInMeeting: getCanCreateIssuesInMeeting(
        opts.currentUserPermissions
      ),
    }
  }
}
