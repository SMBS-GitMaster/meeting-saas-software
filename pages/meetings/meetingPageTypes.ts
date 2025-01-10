import { type Id, NodesCollection } from '@mm/gql'

import {
  PermissionCheckResult,
  type TMeetingType,
  type TWorkspaceType,
  UserAvatarColorType,
} from '@mm/core-bloom'
import {
  EMeetingPageType,
  IOngoingMeetingPageTimers,
  TMeetingCheckInType,
} from '@mm/core-bloom'

import { ICheckInSectionActionHandlers } from '@mm/bloom-web/checkIn'
import { IExternalPageSectionActions } from '@mm/bloom-web/externalPage/externalPageSectionTypes'

import { IMeetingAgendaActionHandlers } from './agenda/agendaCardTypes'

// 'ARCHIVE' and 'ADVANCED_SETTINGS' do not display in the tabs' options, but they are valid tabs
export type TMeetingTab =
  | 'MEETING'
  | 'WORKSPACE'
  | 'ARCHIVE'
  | 'EDIT'
  | 'ADVANCED_SETTINGS'

export interface IMeetingPageContainerProps {
  children: (props: IMeetingPageViewProps) => JSX.Element
}
export interface IMeetingPageViewProps {
  getData: () => IMeetingPageViewData
  getActionHandlers: () => IMeetingPageViewActionHandlers
}
export interface IMeetingPageViewPageData {
  id: Id
  pageType: EMeetingPageType
  expectedDurationS: number
  pageName: string
  externalPageUrl: Maybe<string>
  noteboxPadId: Maybe<Id>
  subheading: Maybe<string>
  checkIn: Maybe<{
    checkInType: TMeetingCheckInType
    iceBreaker: string
    isAttendanceVisible: boolean
  }>
  timer: {
    timeLastPaused: Maybe<number>
    timeLastStarted: number
    timePreviouslySpentS: Maybe<number>
    timeSpentPausedS: number
  }
}

export interface IMeetingInstanceAttendee {
  attendee: {
    id: Id
    fullName: string
    firstName: string
    lastName: string
    avatar: Maybe<string>
  }
  rating: Maybe<number>
  notesText: Maybe<string>
}

export interface IMeetingPageViewData {
  isLoading: boolean
  tab: TMeetingTab
  checkInConstants: {
    classicCheckinTitle: string
    iceBreakers: string[]
    tipOfTheWeek: string
  }
  currentUser: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    numViewedNewFeatures: number
    currentOrgId: number
    currentOrgName: string
    isOrgAdmin: boolean
    settings: {
      timezone: Maybe<string>
    }
    permissions: {
      currentUserIsMeetingLeader: PermissionCheckResult
      canCreateIssuesInMeeting: PermissionCheckResult
      canEditIssuesInMeeting: PermissionCheckResult
      canCreateTodosInMeeting: PermissionCheckResult
      canEditTodosInMeeting: PermissionCheckResult
      canEditAgendaPrintExportSavePdfInMeeting: PermissionCheckResult
      canEditMeetingPagesInMeeting: PermissionCheckResult
      canCreateMeetingPagesInMeeting: PermissionCheckResult
      canEditAttendeesInMeeting: PermissionCheckResult
      canReverseMetricsInMeeting: PermissionCheckResult
      canCreateMetricDividersInMeeting: PermissionCheckResult
      canEditCheckInInMeeting: PermissionCheckResult
      canEditExternalLinkInMeeting: PermissionCheckResult
      canAddExistingMetricsToMeeting: PermissionCheckResult
      canPerformEditActionsForMetricsInMeeting: PermissionCheckResult
      currentUserIsMeetingAdmin: boolean
    }
  }
  meeting: {
    id: Id
    name: string
    scheduledEndTime: number
    scheduledStartTime: number
    orgId: number
    orgName: string
    userOrgId: number
    currentMeetingInstance: Maybe<{
      id: Id
      leaderId: Id
      isPaused: boolean
      currentPageId: Maybe<Id>
      meetingStartTime: number
      tangentAlertTimestamp: number
    }>
    meetingType: TMeetingType
    meetingPages: NodesCollection<{
      TItemType: {
        id: Id
        pageType: EMeetingPageType
        pageName: string
        expectedDurationS: number
        externalPageUrl: Maybe<string>
        timer: IOngoingMeetingPageTimers
        checkIn: Maybe<{
          checkInType: TMeetingCheckInType
          iceBreaker: string
          isAttendanceVisible: boolean
        }>
      }
      TIncludeTotalCount: true
    }>
    meetingAttendees: NodesCollection<{
      TItemType: {
        id: Id
        fullName: string
        firstName: string
        lastName: string
        avatar: Maybe<string>
        userAvatarColor: UserAvatarColorType
        isPresent: boolean
        isUsingV3: boolean
        hasSubmittedVotes: boolean
      }
      TIncludeTotalCount: false
    }>
  }
  currentMeetingPage: Maybe<IMeetingPageViewPageData>
  agendaData: {
    currentMeetingLeader: Maybe<{
      id: Id
      fullName: string
      firstName: string
      lastName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
    }>
    currentUserPage: Maybe<Id>
    isCurrentUserAMeetingAttendee: boolean
    isFollowingLeader: boolean
    meetingPagesFilteredByCurrentMeetingPages: Array<{
      text: string
      value: EMeetingPageType
    }>
    setIsFollowingLeader: (isFollowingLeader: boolean) => void
    meetingPageNavigationStatus:
      | {
          disabled: true
          message: string
        }
      | {
          disabled: false
          message: null
        }
  }
  orgUsers: NodesCollection<{
    TItemType: {
      id: Id
      fullName: string
      firstName: string
      lastName: string
      avatar: string | null
      userAvatarColor: UserAvatarColorType
    }
    TIncludeTotalCount: false
  }>
  workspaceHomeId: Maybe<Id>
}

export interface IMeetingPageViewActionHandlers {
  onUpdateCheckIn: ICheckInSectionActionHandlers['onUpdateCheckIn']
  onUpdateIceBreakerQuestion: ICheckInSectionActionHandlers['onUpdateIceBreakerQuestion']
  onStartMeeting: IMeetingAgendaActionHandlers['onStartMeeting']
  onUpdateMeetingPageOrder: IMeetingAgendaActionHandlers['onUpdateMeetingPageOrder']
  onAddAgendaSectionToMeeting: IMeetingAgendaActionHandlers['onAddAgendaSectionToMeeting']
  onUpdateAgendaSections: IMeetingAgendaActionHandlers['onUpdateAgendaSections']
  onMeetingPaused: IMeetingAgendaActionHandlers['onMeetingPaused']
  onCreateNotes: (opts: { notes: string }) => Promise<string>
  handleNextPage: () => void
  handlePrevPage: () => void
  onSetCurrentPage: (opts: { newPageId: Id; currentPageId: Id }) => void
  onImportAgenda: IMeetingAgendaActionHandlers['onImportAgenda']
  onCheckIfUrlIsEmbeddable: IExternalPageSectionActions['onCheckIfUrlIsEmbeddable']
  onUpdateExternalLink: IExternalPageSectionActions['onUpdateExternalLink']
  tangentClicked: () => Promise<void>
  onHandleSaveAgendaAsPdf: IMeetingAgendaActionHandlers['onHandleSaveAgendaAsPdf']
  onHandlePrintAgenda: IMeetingAgendaActionHandlers['onHandlePrintAgenda']
  onUpdateUserNewFeatureViewCount: () => Promise<void>
  onConcludeMeeting: () => Promise<void>
  setActiveTab: (tab: TMeetingTab) => void
  onUpdateMeetingLeader: (opts: {
    newLeaderId: Id
    currentPageId: Id
    meetingInstanceId: Id
  }) => Promise<void>
  onSetPrimaryWorkspace: (opts: {
    workspaceType: TWorkspaceType
    meetingOrWorkspaceId: Id
  }) => Promise<void>
}
