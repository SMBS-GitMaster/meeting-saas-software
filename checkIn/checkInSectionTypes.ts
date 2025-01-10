import { type Id } from '@mm/gql'

import { FormValuesForSubmit } from '@mm/core/forms'

import { PermissionCheckResult, UserAvatarColorType } from '@mm/core-bloom'
import { TMeetingCheckInType } from '@mm/core-bloom'

export type TCheckInResponsiveSizes =
  | 'XSMALL'
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'UNKNOWN'

export interface ICheckInSectionFormValues {
  checkInType: TMeetingCheckInType
  isAttendanceVisible: boolean
  attendees: Array<{
    id: Id
    firstName: string
    lastName: string
    avatar: Maybe<string>
    isPresent: boolean
    userAvatarColor: UserAvatarColorType
  }>
}

export interface ICheckInSectionViewData {
  isLoading: boolean
  meetingPageId: Id
  meetingPageName: string
  currentUser: {
    permissions: {
      canEditAttendeesInMeeting: PermissionCheckResult
      currentUserIsMeetingLeader: PermissionCheckResult
      canEditCheckInInMeeting: PermissionCheckResult
    }
  }
  checkIn: {
    checkInType: TMeetingCheckInType
    currentIceBreakerQuestion: string
    iceBreakers: string[]
    classicCheckinTitle: string
    isAttendanceVisible: boolean
    tipOfTheWeek: string
  }
  attendees: Array<{
    id: Id
    fullName: string
    firstName: string
    lastName: string
    avatar: string | null
    userAvatarColor: UserAvatarColorType
    isPresent: boolean
  }>
}

export interface ICheckInSectionActionHandlers {
  onUpdateCheckIn: (opts: {
    meetingPageId: Id
    values: Partial<
      FormValuesForSubmit<ICheckInSectionFormValues, true, 'attendees'>
    >
  }) => Promise<void>
  onUpdateIceBreakerQuestion: (opts: {
    meetingPageId: Id
    iceBreakerQuestion: string
  }) => void
}

export interface ICheckInSectionViewProps {
  data: ICheckInSectionViewData
  actionHandlers: ICheckInSectionActionHandlers
  className?: string
}

export interface ICheckInSectionContainerProps {
  meetingPageId: string
  meetingPageName: string
  children: (props: ICheckInSectionViewProps) => JSX.Element
  className?: string
}
