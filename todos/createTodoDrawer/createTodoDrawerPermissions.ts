import {
  PermissionCheckResult,
  UserPermissionType,
  getCanCreateTodosInMeeting,
  getCanCreateTodosInUniversalAdd,
} from '@mm/core-bloom'

interface IGetCreateTodoDrawerPermissionsResponse {
  canCreateTodos: PermissionCheckResult
}

export const getCreateTodoDrawerPermissions = (opts: {
  isPersonalTodo: boolean
  currentUserPermissions: Maybe<UserPermissionType>
  isUniversalAdd?: boolean
}): IGetCreateTodoDrawerPermissionsResponse => {
  if (opts.isUniversalAdd) {
    return {
      canCreateTodos: getCanCreateTodosInUniversalAdd(
        opts.currentUserPermissions
      ),
    }
  } else if (opts.isPersonalTodo) {
    return {
      canCreateTodos: { allowed: true },
    }
  } else {
    return {
      canCreateTodos: getCanCreateTodosInMeeting(opts.currentUserPermissions),
    }
  }
}
