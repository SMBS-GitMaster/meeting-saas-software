import React, { useEffect } from 'react'

import { type Id } from '@mm/gql'

import { EMeetingPageType } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController, usePrevious } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { IMeetingPageViewData, TMeetingTab } from './meetingPageTypes'

export interface IMeetingPageEffectsOpts {
  meetingId: Id
  meetingTab: Maybe<TMeetingTab>
  showSwitchOrgSuccess: boolean
  meeting: IMeetingPageViewData['meeting']
  currentUser: { currentOrgId: Id }
  previousLeaderId: Maybe<Id>
  isCurrentUserLeader: boolean
  getCurrentMeetingIstance: () => IMeetingPageViewData['meeting']['currentMeetingInstance']
  currentMeetingLeader: Maybe<{
    id: Id
    firstName: string
    lastName: string
  }>
  getCurrentUserPageId: () => Maybe<Id>
  setIsFollowingLeader: React.Dispatch<React.SetStateAction<boolean>>
  isFollowingLeader: boolean
  setCurrentUserPageId: React.Dispatch<React.SetStateAction<Maybe<Id>>>
  onUpdateLastViewedTimestamp: () => Promise<void>
}

export function useMeetingPageEffects(opts: IMeetingPageEffectsOpts) {
  const {
    meetingId,
    meetingTab,
    showSwitchOrgSuccess,
    meeting,
    currentUser,
    previousLeaderId,
    isCurrentUserLeader,
    currentMeetingLeader,
    setIsFollowingLeader,
    isFollowingLeader,
    setCurrentUserPageId,
    getCurrentUserPageId,
    onUpdateLastViewedTimestamp,
  } = opts

  const { openOverlazy, closeOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const currentMeetingInstance = opts.getCurrentMeetingIstance()
  const previousMeetingInstance = usePrevious(currentMeetingInstance)
  const previousMeetingTab = usePrevious(opts.meetingTab)

  const { endDrawerControllerSubsciption, startDrawerControllerSubsciption } =
    useDrawerController()

  useEffect(() => {
    if (isCurrentUserLeader) {
      setIsFollowingLeader(true)
    }
  }, [isCurrentUserLeader, setIsFollowingLeader])

  useEffect(
    function openSwitchOrgSuggestionModal() {
      if (currentUser.currentOrgId !== meeting.orgId) {
        openOverlazy('SwitchOrgSuggestionModal', {
          orgId: meeting.userOrgId,
          orgName: meeting.orgName,
          meetingId: meeting.id,
        })
      }
    },
    [meeting.orgId, currentUser.currentOrgId]
  )

  useEffect(
    function showOrgChageSuccessToast() {
      if (showSwitchOrgSuccess) {
        openOverlazy('Toast', {
          type: 'success',
          text: t(`Organization change successful`),
          undoClicked: () => {
            // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
          },
        })
      }
    },
    [openOverlazy, t, showSwitchOrgSuccess]
  )

  const isOngoing = !!currentMeetingInstance
  const wasPreviouslyOngoing = !!previousMeetingInstance
  const pageIdFromMeetingIstance = currentMeetingInstance?.currentPageId
  const currentUserPageId = getCurrentUserPageId()
  useEffect(
    function displayWrapUpWhenMeetingConcludes() {
      if (isFollowingLeader) {
        if (
          meeting?.meetingPages != undefined &&
          meeting?.meetingPages.nodes.length > 0
        ) {
          if (wasPreviouslyOngoing && !isOngoing) {
            // shows wrap up page when meeting concludes
            const wrapUpPage = meeting.meetingPages.nodes.find(
              (node) => node.pageType === EMeetingPageType.WrapUp
            )?.id
            wrapUpPage && setCurrentUserPageId(wrapUpPage)
          }
        }
      }
    },
    [
      isFollowingLeader,
      setCurrentUserPageId,
      isOngoing,
      wasPreviouslyOngoing,
      meeting,
    ]
  )

  useEffect(
    function updatePageIdFromOutsideUpdate() {
      if (
        isFollowingLeader &&
        currentUserPageId !== pageIdFromMeetingIstance &&
        pageIdFromMeetingIstance
      ) {
        setCurrentUserPageId(pageIdFromMeetingIstance)
      }
    },
    [
      currentUserPageId,
      pageIdFromMeetingIstance,
      setCurrentUserPageId,
      isFollowingLeader,
    ]
  )

  const firstPageId = meeting.meetingPages.nodes.length
    ? meeting.meetingPages.nodes[0].id
    : null
  useEffect(
    function setInitialPage() {
      if (!currentUserPageId) setCurrentUserPageId(firstPageId)
    },
    [currentUserPageId, firstPageId, setCurrentUserPageId]
  )

  useEffect(() => {
    const newLeaderData = currentMeetingLeader
    const isSameLeader = previousLeaderId === currentMeetingInstance?.leaderId
    const isSameMeetingInstance =
      previousMeetingInstance != null &&
      previousMeetingInstance.id === currentMeetingInstance?.id

    if (
      newLeaderData &&
      !isSameLeader &&
      previousLeaderId != undefined &&
      isSameMeetingInstance
    ) {
      openOverlazy('Toast', {
        type: 'info',
        text: t(`{{firstName}} {{lastName}} is now the leader.`, {
          firstName: newLeaderData.firstName,
          lastName: newLeaderData.lastName,
        }),
        // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410
        undoClicked: () =>
          console.log(
            '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
          ),
      })
    }
  }, [
    currentMeetingInstance?.leaderId,
    openOverlazy,
    t,
    currentMeetingLeader,
    previousLeaderId,
    previousMeetingInstance,
    currentMeetingInstance?.id,
  ])

  useEffect(() => {
    onUpdateLastViewedTimestamp()
  }, [meetingId]) /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    startDrawerControllerSubsciption({ meetingId, meetingTab })
    return () => {
      endDrawerControllerSubsciption()
    }
  }, [
    startDrawerControllerSubsciption,
    endDrawerControllerSubsciption,
    meetingId,
    meetingTab,
  ])

  useEffect(() => {
    if (meetingTab === 'WORKSPACE' && previousMeetingTab !== 'WORKSPACE') {
      closeOverlazy({ type: 'Drawer' })
    }
  }, [meetingTab, previousMeetingTab, closeOverlazy])
}
