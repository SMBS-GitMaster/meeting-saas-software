import { type Id } from '@mm/gql'

import {
  PermissionCheckResult,
  UserAvatarColorType,
  UserPermissionType,
} from '@mm/core-bloom'

export type TAttendeeTabs = 'ADD_ATTENDEE' | 'VIEW_ATTENDEE'

export interface IAttendeeData {
  id: Id
  fullName: string
  firstName: string
  lastName: string
  avatar: Maybe<string>
  userAvatarColor: UserAvatarColorType
  isPresent: boolean
}

export interface IAttendeeManagementModalProps {
  meetingId: Id
}

export interface ICurrentAttendeeListEntryProps {
  currentUserPermissions: Maybe<UserPermissionType>
  currentUserId: Maybe<Id>
  attendee: IAttendeeData
  isOnlyOneAttendeeLeftInMeeting: boolean
  isMeetingLeader: boolean
  canEditAttendeesInMeeting: PermissionCheckResult
  isMeetingOngoing: boolean
  onLeaderUpdated(opts: { newLeaderId: Id }): void
  onAttendeeRemoved(opts: { attendeeId: Id }): void
}
