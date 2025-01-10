import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { EMeetingPageType, TMeetingCheckInType } from '@mm/core-bloom'

import { Loading } from '@mm/core-web/ui'

import { MeetingGoalsList } from '@mm/bloom-web/goals/'
import { useBloomPageEmptyStateController } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateController'

import {
  IMeetingPageViewActionHandlers,
  IMeetingPageViewData,
} from '../meetingPageTypes'
import { CheckInSection } from './checkInSection'
import { ExternalPageMeetingSection } from './externalPageMeetingSection'
import { HeadlinesSection } from './headlinesSection'
import { IssuesSection } from './issuesSection'
import { MeetingStatsSection } from './meetingStats'
import { MetricsSection } from './metricsSection'
import { NotesBoxSection } from './notesBoxSection'
import { SpecialSessionsSection } from './specialSessionsSection'
import { TitlePageSection } from './titlePageSection'
import { TodosSection } from './todosSection'
import { WhiteboardSection } from './whiteboardSection'
import { WrapUpSection } from './wrapUpSection'

export interface IMeetingSectionRendererProps {
  isLoading: boolean
  getAgendaData: () => {
    agendaIsCollapsed: boolean
  }
  getPageToDisplayData: () => Maybe<{
    id: Id
    pageType: EMeetingPageType
    externalPageUrl: Maybe<string>
    noteboxPadId: Maybe<Id>
    subheading: Maybe<string>
    pageName: string
    checkIn: Maybe<{
      checkInType: TMeetingCheckInType
      iceBreaker: string
      isAttendanceVisible: boolean
    }>
  }>
  meeting: IMeetingPageViewData['meeting']
  currentUser: IMeetingPageViewData['currentUser']
  meetingAttendees: IMeetingPageViewData['meeting']['meetingAttendees']
  checkInConstants: IMeetingPageViewData['checkInConstants']
  orgUsers: IMeetingPageViewData['orgUsers']
  actionHandlers: IMeetingPageViewActionHandlers
}

export const MeetingSectionRenderer = observer(function MeetingSectionRenderer(
  props: IMeetingSectionRendererProps
) {
  const {
    isLoading,
    getAgendaData,
    getPageToDisplayData,
    meeting,
    meetingAttendees,
    currentUser,
    checkInConstants,
    actionHandlers,
  } = props

  const { onChangePage, pageData: emptyPageData } =
    useBloomPageEmptyStateController()

  const page = getPageToDisplayData()

  React.useEffect(() => {
    if (page && page.pageType !== emptyPageData?.pageType) {
      onChangePage(page.pageType)
    }
  }, [page, onChangePage, emptyPageData])

  function getComponentForPage(
    page: ReturnType<IMeetingSectionRendererProps['getPageToDisplayData']>
  ) {
    if (page == null) {
      return null
    }

    switch (page.pageType) {
      case EMeetingPageType.CheckIn:
        return page.checkIn ? (
          <CheckInSection
            data={{
              meetingPageName: page.pageName,
              meetingPageId: page.id,
              isLoading: isLoading,
              currentUser: currentUser,
              attendees: meetingAttendees.nodes,
              checkIn: {
                checkInType: page.checkIn.checkInType,
                iceBreakers: checkInConstants.iceBreakers,
                currentIceBreakerQuestion: page.checkIn.iceBreaker,
                classicCheckinTitle: checkInConstants.classicCheckinTitle,
                isAttendanceVisible: page.checkIn.isAttendanceVisible,
                tipOfTheWeek: checkInConstants.tipOfTheWeek,
              },
            }}
            actionHandlers={{
              onUpdateCheckIn: actionHandlers.onUpdateCheckIn,
              onUpdateIceBreakerQuestion:
                actionHandlers.onUpdateIceBreakerQuestion,
            }}
          />
        ) : null

      case EMeetingPageType.Todos:
        return (
          <TodosSection
            getPageToDisplayData={getPageToDisplayData}
            meetingId={meeting.id}
          />
        )

      case EMeetingPageType.Headlines:
        return (
          <HeadlinesSection
            getPageToDisplayData={getPageToDisplayData}
            meetingPageName={page.pageName}
            meetingId={meeting.id}
          />
        )

      case EMeetingPageType.Goals:
        return (
          <MeetingGoalsList
            getPageToDisplayData={getPageToDisplayData}
            meetingId={props.meeting.id}
            workspaceTileId={null}
          />
        )

      case EMeetingPageType.WrapUp:
        if (meeting.currentMeetingInstance) {
          return (
            <WrapUpSection
              onConclude={props.actionHandlers.onConcludeMeeting}
              getPageToDisplayData={getPageToDisplayData}
              meetingId={meeting.id}
            />
          )
        } else {
          return (
            <MeetingStatsSection
              meetingPageName={page.pageName}
              meetingId={meeting.id}
            />
          )
        }

      case EMeetingPageType.Issues:
        return (
          <IssuesSection
            workspaceTileId={null}
            getPageToDisplayData={getPageToDisplayData}
            meetingId={meeting.id}
            meetingType={meeting.meetingType}
          />
        )

      case EMeetingPageType.ExternalPage:
        return (
          <ExternalPageMeetingSection
            data={{
              page: page,
              isLoading: isLoading,
              currentUserPermissions: currentUser.permissions,
            }}
            actions={{
              onCheckIfUrlIsEmbeddable:
                props.actionHandlers.onCheckIfUrlIsEmbeddable,
              onUpdateExternalLink: props.actionHandlers.onUpdateExternalLink,
            }}
          />
        )

      case EMeetingPageType.Metrics:
        return (
          <MetricsSection
            getPageToDisplayData={getPageToDisplayData}
            meetingId={meeting.id}
          />
        )

      case EMeetingPageType.NotesBox:
        return (
          <NotesBoxSection
            data={{
              meetingPageName: page.pageName,
              meetingId: meeting.id,
              currentUser: currentUser,
              padId: page.noteboxPadId,
            }}
            actionHandlers={{
              onCheckIfUrlIsEmbeddable:
                props.actionHandlers.onCheckIfUrlIsEmbeddable,
            }}
          />
        )

      case EMeetingPageType.Whiteboard:
        return (
          <WhiteboardSection
            data={{
              meetingPageName: page.pageName,
              meetingId: meeting.id,
            }}
            actionHandlers={{
              onCheckIfUrlIsEmbeddable:
                props.actionHandlers.onCheckIfUrlIsEmbeddable,
            }}
          />
        )

      case EMeetingPageType.TitlePage:
        return (
          <TitlePageSection
            data={{
              meetingId: meeting.id,
              isLoading: isLoading,
              subheading: page.subheading,
              pageName: page.pageName,
              id: page.id,
              isMeetingOngoing: meeting.currentMeetingInstance !== null,
            }}
          />
        )

      case EMeetingPageType.Html:
        return (
          <SpecialSessionsSection
            getPageToDisplayData={getPageToDisplayData}
            getAgendaData={getAgendaData}
            meetingId={meeting.id}
            meetingType={meeting.meetingType}
          />
        )

      default:
        return null
    }
  }

  function renderLoading() {
    return (
      <div
        css={css`
          position: absolute;
          top: 50%;
          left: 50%;
        `}
      >
        <Loading showTitle={false} size='small' />
      </div>
    )
  }

  return (
    <React.Suspense fallback={renderLoading()}>
      {getComponentForPage(page)}
    </React.Suspense>
  )
})
