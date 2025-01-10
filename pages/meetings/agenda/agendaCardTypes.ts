import { type Id, NodesCollection } from '@mm/gql'

import { FormValuesForSubmit } from '@mm/core/forms'

import { PermissionCheckResult, UserAvatarColorType } from '@mm/core-bloom'
import { EMeetingPageType, IOngoingMeetingPageTimers } from '@mm/core-bloom'

import {
  IMeetingPageViewActionHandlers,
  IMeetingPageViewPageData,
} from '../meetingPageTypes'
import { AgendaSectionFormValues } from './agendaSections'

export interface IMeetingPage {
  id: Id
  pageType: EMeetingPageType
  expectedDurationS: number
  pageName: string
  timer: IOngoingMeetingPageTimers
}

export interface IMeetingAgendaViewData {
  meetingId: Id
  isLoading: boolean
  agendaIsCollapsed: boolean
  meetingPageNavigationStatus:
    | { disabled: false; message: null }
    | { disabled: true; message: string }
  currentUser: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    isOrgAdmin: boolean
    settings: {
      timezone: Maybe<string>
    }
    permissions: {
      currentUserIsMeetingLeader: PermissionCheckResult
      canEditAgendaPrintExportSavePdfInMeeting: PermissionCheckResult
      canEditMeetingPagesInMeeting: PermissionCheckResult
      canCreateMeetingPagesInMeeting: PermissionCheckResult
      canEditAttendeesInMeeting: PermissionCheckResult
      currentUserIsMeetingAdmin: boolean
    }
  }
  currentMeetingLeader: Maybe<{
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }>
  meetingAttendees: NodesCollection<{
    TItemType: {
      id: Id
      fullName: string
      firstName: string
      lastName: string
      avatar: string | null
      userAvatarColor: UserAvatarColorType
      isPresent: boolean
    }
    TIncludeTotalCount: false
  }>
  meetingPages: NodesCollection<{
    TItemType: IMeetingPage
    TIncludeTotalCount: true
  }>
  meetingPagesFilteredByCurrentMeetingPages: Array<{
    text: string
    value: EMeetingPageType
  }>
  currentMeetingInstance: Maybe<{
    id: Id
    leaderId: Id
    isPaused: boolean
    currentPageId: Maybe<Id>
    meetingStartTime: number
  }>
  isCurrentUserAMeetingAttendee: boolean
  isFollowingLeader: boolean
  activePageId: Id
  expectedMeetingDurationFromAgendaInMinutes: number
  scheduledMeetingStartTime: number
  scheduledMeetingEndTime: number
  pageToDisplay: Maybe<IMeetingPageViewPageData>
  setAgendaIsCollapsed: (isCollapsed: boolean) => void
  setIsFollowingLeader: (isFollowingLeader: boolean) => void
}
export interface IMeetingAgendaActionHandlers {
  onStartMeeting: () => Promise<void>
  onUpdateMeetingPageOrder: (opts: {
    newIndex: number
    oldIndex: number
    meetingPageId: Id
  }) => Promise<void>
  onUpdateAgendaSections: (
    values: Partial<
      FormValuesForSubmit<AgendaSectionFormValues, true, 'agendaSections'>
    >
  ) => Promise<void>
  onAddAgendaSectionToMeeting: (opts: {
    pageType: EMeetingPageType
    pageName: string
  }) => Promise<void>
  onUpdateMeetingLeader: IMeetingPageViewActionHandlers['onUpdateMeetingLeader']
  onImportAgenda(opts: { meetingId: Id; file?: File }): void
  handleNextPage: () => void
  handlePrevPage: () => void
  onSetCurrentUserPage: IMeetingPageViewActionHandlers['onSetCurrentPage']
  onMeetingPaused: () => void
  tangentClicked: () => Promise<void>
  onHandlePrintAgenda: () => void
  onHandleSaveAgendaAsPdf: () => void
}

export interface IMeetingAgendaViewProps {
  getData: () => IMeetingAgendaViewData
  expectedMeetingDurationFromAgendaInMinutes: number
  meetingNotesStickToElementRef: React.MutableRefObject<
    Maybe<HTMLDivElement> | undefined
  >
  className?: string
  getActionHandlers: () => IMeetingAgendaActionHandlers
}

export interface IMeetingAgendaContainerProps {
  children: (props: IMeetingAgendaViewProps) => JSX.Element
  className?: string
}
