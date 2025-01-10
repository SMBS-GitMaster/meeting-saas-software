import { observer } from 'mobx-react'
import React from 'react'

import { CLASSIC_CHECK_IN_TITLE, ICEBREAKER_QUESTIONS } from '@mm/core-bloom'

import { useCurrentRoute } from '@mm/core-web/router'

import { useComputed } from '../performance/mobx'
import { useMeetingPageEffects } from './meetingPageEffects'
import { useMeetingPageMutations } from './meetingPageMutations'
import { useMeetingPageStates } from './meetingPageStates'
import {
  IMeetingPageContainerProps,
  type TMeetingTab,
} from './meetingPageTypes'

export const MeetingPageContainer = observer(function MeetingPageContainer(
  props: IMeetingPageContainerProps
) {
  const getMeetingPageState = useMeetingPageStates()

  const getCurrentRoute = useCurrentRoute<
    Record<string, unknown>,
    { meetingId: string; tab: TMeetingTab; showSwitchOrgSuccess: string }
  >()

  const getMeetingPageMutationsOpts = useComputed(
    () => ({
      getMeetingPages: getMeetingPageState().getMeetingPages,
      currentMeetingInstanceOptimisticState:
        getMeetingPageState().currentMeetingInstanceOptimisticState,
      currentUser: getMeetingPageState().currentUser,
      optimisticPageTimeLastStarted:
        getMeetingPageState().optimisticPageTimeLastStarted,
      optimisticPageIdState: getMeetingPageState().optimisticPageIdState,
      isMeetingOngoing: getMeetingPageState().isMeetingOngoing,
      isCurrentUserLeader: getMeetingPageState().isCurrentUserLeader,
      isFollowingLeader: getMeetingPageState().isFollowingLeader,
      setCurrentUserPageId: getMeetingPageState().setCurrentUserPageId,
      canEditCheckInInMeeting:
        getMeetingPageState().currentUserWithMemoizedPermissions.permissions
          .canEditCheckInInMeeting,
      meetingId: getMeetingPageState().meeting?.id,
    }),
    {
      name: 'MeetingPageContainer.getMeetingPageMutationsOpts',
    }
  )

  const {
    onMeetingPaused,
    onCreateNotes,
    onUpdateLastViewedTimestamp,
    onStartMeeting,
    onUpdateIceBreakerQuestion,
    onTangentClicked,
    onUpdateCheckIn,
    onUpdateExternalLink,
    onSetCurrentPage,
    onUpdateMeetingPageOrder,
    onUpdateAgendaSections,
    onImportAgenda,
    onAddAgendaSectionToMeeting,
    onHandlePrintAgenda,
    onHandleSaveAgendaAsPdf,
    onCheckIfUrlIsEmbeddable,
    onUpdateUserNewFeatureViewCount,
    onConcludeMeeting,
    onUpdateMeetingLeader,
    onSetPrimaryWorkspace,
  } = useMeetingPageMutations(getMeetingPageMutationsOpts)

  useMeetingPageEffects({
    meetingId: getMeetingPageState().meeting?.id,
    meetingTab: getCurrentRoute().urlParams?.tab ?? null,
    showSwitchOrgSuccess:
      getCurrentRoute().urlParams?.showSwitchOrgSuccess === 'true',
    currentUser: getMeetingPageState().currentUser,
    meeting: getMeetingPageState().meeting,
    getCurrentUserPageId: getMeetingPageState().getCurrentUserPageId,
    getCurrentMeetingIstance: () =>
      getMeetingPageState().currentMeetingInstanceOptimisticState.get(),
    previousLeaderId: getMeetingPageState().previousLeaderId || null,
    isCurrentUserLeader: getMeetingPageState().isCurrentUserLeader,
    currentMeetingLeader: getMeetingPageState().currentMeetingLeader || null,
    setIsFollowingLeader: getMeetingPageState().setIsFollowingLeader,
    isFollowingLeader: getMeetingPageState().isFollowingLeader,
    setCurrentUserPageId: getMeetingPageState().setCurrentUserPageId,
    onUpdateLastViewedTimestamp,
  })

  const handleNextPage = () => {
    if (
      getMeetingPageState().meeting &&
      getMeetingPageState().pageToDisplayIndex != null
    ) {
      const isCurrentPageLastPage =
        getMeetingPageState().meeting?.meetingPages.nodes.length - 1 ===
        getMeetingPageState().pageToDisplayIndex
      const currentPageId =
        getMeetingPageState().meeting?.meetingPages.nodes[
          getMeetingPageState().pageToDisplayIndex
        ]?.id

      const nextPageToUse = isCurrentPageLastPage
        ? getMeetingPageState().meeting?.meetingPages.nodes[0]
        : getMeetingPageState().meeting?.meetingPages.nodes[
            getMeetingPageState().pageToDisplayIndex + 1
          ]

      if (
        getMeetingPageState().isMeetingOngoing &&
        getMeetingPageState().isCurrentUserLeader
      ) {
        onSetCurrentPage({
          newPageId: nextPageToUse.id,
          currentPageId,
        })
      } else if (
        !getMeetingPageState().isMeetingOngoing ||
        !getMeetingPageState().isFollowingLeader
      ) {
        getMeetingPageState().setCurrentUserPageId(nextPageToUse.id)
      }
    }
  }

  const handlePrevPage = () => {
    if (
      getMeetingPageState().meeting &&
      getMeetingPageState().pageToDisplayIndex != null
    ) {
      const isCurrentPageFirstPage =
        getMeetingPageState().pageToDisplayIndex === 0
      const lastPageIndex =
        getMeetingPageState().meeting?.meetingPages.nodes.length - 1
      const currentPageId =
        getMeetingPageState().meeting?.meetingPages.nodes[
          getMeetingPageState().pageToDisplayIndex
        ]?.id

      const nextPageToUse = isCurrentPageFirstPage
        ? getMeetingPageState().meeting?.meetingPages.nodes[lastPageIndex]
        : getMeetingPageState().meeting?.meetingPages.nodes[
            getMeetingPageState().pageToDisplayIndex - 1
          ]

      if (
        getMeetingPageState().isMeetingOngoing &&
        getMeetingPageState().isCurrentUserLeader
      ) {
        onSetCurrentPage({
          newPageId: nextPageToUse.id,
          currentPageId,
        })
      } else if (
        !getMeetingPageState().isMeetingOngoing ||
        !getMeetingPageState().isFollowingLeader
      ) {
        getMeetingPageState().setCurrentUserPageId(nextPageToUse.id)
      }
    }
  }

  const getData = useComputed(
    () => ({
      tab: getMeetingPageState().tab,
      isLoading: getMeetingPageState().querying,
      checkInConstants: {
        classicCheckinTitle: CLASSIC_CHECK_IN_TITLE,
        iceBreakers: ICEBREAKER_QUESTIONS,
        tipOfTheWeek: getMeetingPageState().tipOfTheWeek,
      },
      currentUser: getMeetingPageState().currentUserWithMemoizedPermissions,
      meeting: getMeetingPageState().meeting,
      currentMeetingPage: getMeetingPageState().pageToDisplay,
      orgUsers: getMeetingPageState().users,
      agendaData: {
        currentUserPage: getMeetingPageState().currentUserPageId,
        currentMeetingLeader:
          getMeetingPageState().currentMeetingLeader || null,
        isCurrentUserAMeetingAttendee:
          getMeetingPageState().isCurrentUserAMeetingAttendee,
        isFollowingLeader: getMeetingPageState().isFollowingLeader,
        meetingPagesFilteredByCurrentMeetingPages:
          getMeetingPageState().meetingPagesFilteredByCurrentMeetingPages,
        setIsFollowingLeader: getMeetingPageState().setIsFollowingLeader,
        meetingPageNavigationStatus:
          getMeetingPageState().getMeetingPageNavigationStatus(),
      },
      workspaceHomeId:
        getMeetingPageState().currentUser.settings.workspaceHomeId,
    }),
    {
      name: 'MeetingPageContainer.getData',
    }
  )

  const getActionHandlers = useComputed(
    () => ({
      setActiveTab: getMeetingPageState().setTab,
      handlePrevPage,
      handleNextPage,
      onSetCurrentPage,
      onUpdateCheckIn,
      onUpdateIceBreakerQuestion,
      onMeetingPaused,
      onAddAgendaSectionToMeeting,
      onCreateNotes,
      onStartMeeting,
      onUpdateMeetingPageOrder,
      onUpdateAgendaSections,
      onImportAgenda,
      onCheckIfUrlIsEmbeddable,
      onUpdateExternalLink,
      tangentClicked: onTangentClicked,
      onHandleSaveAgendaAsPdf,
      onHandlePrintAgenda,
      onUpdateUserNewFeatureViewCount,
      onConcludeMeeting,
      onUpdateMeetingLeader,
      onSetPrimaryWorkspace,
    }),
    {
      name: 'MeetingPageContainer.getActionHandlers',
    }
  )

  return (
    <props.children getData={getData} getActionHandlers={getActionHandlers} />
  )
})
