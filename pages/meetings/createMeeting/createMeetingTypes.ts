import { type Id } from '@mm/gql'

import {
  TMeetingAgendaType,
  TMeetingType,
  UserAvatarColorType,
} from '@mm/core-bloom'

export interface ICreateMeetingViewProps {
  data: ICreateMeetingContainerData
  getActionHandlers: () => ICreateMeetingActionHandlers
}

export interface ICreateMeetingContainerProps {
  children: (props: ICreateMeetingViewProps) => JSX.Element
}

export interface ICreateMeetingContainerData {
  userOpts: () => Array<{
    value: Id
    metadata: {
      firstName: string
      lastName: string
      fullName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
    }
  }>
  currentUser: () => {
    value: Id
    metadata: {
      firstName: string
      lastName: string
      fullName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
      isOrgAdmin: boolean
    }
  }
}

export interface ICreateMeetingActionHandlers {
  onCreateMeeting: (values: ICreateMeetingProps) => Promise<void>
}

export interface ICreateMeetingProps {
  meetingName: string
  meetingType: TMeetingType
  showBusinessPlan: boolean
  agendaType: TMeetingAgendaType
  meetingAttendees: Array<{
    id: Id
    permissions: string
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }>
  meetingAttendeesIds: Array<Id>
  meetingMembersIds: Array<Id>
  meetingMembers: Array<{
    id: Id
    permissions: string
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }>
}
