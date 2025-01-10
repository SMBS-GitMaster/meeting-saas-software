import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type Id, chance, useSubscription } from '@mm/gql'

import {
  getMeetingPageTypesFilteredByCurrentMeetingPagesLookup,
  getTipsOfTheWeek,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { UNLIMITED_ADD_PAGE_TYPES } from '@mm/core-bloom/meetings/constants'

import { useNavigation } from '@mm/core-web/router'
import { useCurrentRoute } from '@mm/core-web/router/hooks/useCurrentRoute'
import { useDrawerController, usePrevious } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { paths } from '@mm/bloom-web/router/paths'

import {
  useAction,
  useComputed,
  useObservable,
  useOptimisticState,
} from '../performance/mobx'
import { OPTIMISTIC_MEETING_INSTANCE_ID } from './meetingPageConsts'
import { getMeetingPagePermissions } from './meetingPagePermissions'
import { useMeetingPageDataQuery } from './meetingPageQuery'
import { IMeetingPageViewData, type TMeetingTab } from './meetingPageTypes'

export function useMeetingPageStates() {
  const { t } = useTranslation()
  const getRoute = useCurrentRoute<
    { tab: 'MEETING' | 'WORKSPACE' },
    { meetingId: string }
  >()

  const { navigate } = useNavigation()
  const overlazy = useOverlazyController()

  const meetingId = Number(getRoute().urlParams.meetingId)

  const pageState = useObservable<{
    isFollowingLeader: boolean
    currentUserPageId: Maybe<Id>
    tab: TMeetingTab
  }>({
    isFollowingLeader: true,
    currentUserPageId: null,
    tab: getRoute().queryParams.tab || 'MEETING',
  })

  const setTab = useAction((newTab: TMeetingTab) => {
    const meetingId = Number(getRoute().urlParams.meetingId)
    pageState.tab = newTab

    navigate(paths.meeting({ meetingId, tab: newTab }))
  })

  // ensures that this page state stays in sync with the URL
  const tab = getRoute().queryParams.tab
  useEffect(() => {
    if (tab && tab !== pageState.tab) {
      setTab(tab)
    }
  }, [tab, setTab])

  const setCurrentUserPageId = useAction((pageId) => {
    pageState.currentUserPageId = pageId
  })

  const setIsFollowingLeader = useAction((isFollowing) => {
    pageState.isFollowingLeader = isFollowing
  })

  const terms = useBloomCustomTerms()
  const tipsOfTheWeek = getTipsOfTheWeek(terms)
  const [tipOfTheWeek] = useState(chance.pickone(tipsOfTheWeek))
  const { handleSetDrawerViewOutsideOfDrawerSubscriptionInMeetingsOnly } =
    useDrawerController()

  const subscription = useSubscription(
    useMeetingPageDataQuery()({
      meetingId,
    }),
    {
      subscriptionId: `useMeetingPageStates-query2-${meetingId}`,
    }
  )

  const notifyErrorOnOptimisticStateRollback = useAction(
    (error: any) => {
      overlazy.openOverlazy('Toast', {
        type: 'error',
        text: t(
          'Something went wrong. Please reload before continuing to run your meeting'
        ),
        error,
      })
    },
    {
      debounceOpts: {
        timeout: 5000,
        leading: true,
        trailing: false,
      },
    }
  )

  const getPersistedCurrentMeetingInstance = useComputed(
    () => subscription().data.meeting?.currentMeetingInstance,
    {
      name: `useMeetingPageStates-getPersistedCurrentMeetingInstance`,
    }
  )

  const currentMeetingInstanceOptimisticState = useOptimisticState<
    IMeetingPageViewData['meeting']['currentMeetingInstance']
  >({
    getPersistedValue: getPersistedCurrentMeetingInstance,
    stateName: `useMeetingPageStates-currentMeetingInstanceOptimisticState`,
    rollbackPreventionTimeoutOverrideMS: 10000,
    rollbackCondition: ({ persistedValue, optimisticValue }) => {
      // it's only a rollback if we went from a running meeting (non-null) to non running meeting (null)
      return Boolean(persistedValue) !== Boolean(optimisticValue)
    },
    onRollback: () => {
      notifyErrorOnOptimisticStateRollback(
        new Error('Meeting instance optimistic state rollback')
      )
    },
    acceptPersistedImmediatelyCondition: ({
      previouslyPersistedValue,
      newPersistedValue,
    }) => {
      // if we went from a running meeting to non running meeting, we should accept the persisted value immediately
      return Boolean(previouslyPersistedValue) !== Boolean(newPersistedValue)
    },
  })

  const getCurrentUserIsLeader = useComputed(
    () => {
      return (
        currentMeetingInstanceOptimisticState.get()?.leaderId ===
        subscription().data.currentUser.id
      )
    },
    {
      name: `useMeetingPageStates-getCurrentUserIsLeader`,
    }
  )
  const previousLeaderId = usePrevious(
    currentMeetingInstanceOptimisticState.get()?.leaderId
  )

  const { currentUser } = subscription().data
  const currentUserIsLeader = getCurrentUserIsLeader()
  const currentUserWithMemoizedPermissions = useMemo(
    () => ({
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      fullName: currentUser.fullName,
      avatar: currentUser.avatar,
      userAvatarColor: currentUser.userAvatarColor,
      settings: currentUser.settings,
      numViewedNewFeatures: currentUser.numViewedNewFeatures,
      currentOrgName: currentUser.currentOrgName,
      currentOrgId: currentUser.currentOrgId,
      currentOrgAvatar: currentUser.currentOrgAvatar,
      isOrgAdmin: currentUser.isOrgAdmin,
      /** @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-489 */
      permissions: getMeetingPagePermissions({
        currentUserPermissions:
          subscription().data.meeting?.currentMeetingAttendee.permissions ??
          null,
        currentUserIsMeetingAdmin:
          subscription().data.meeting?.currentMeetingAttendee.permissions.admin,
        currentUserIsLeader,
      }),
    }),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [
      currentUser,
      currentUserIsLeader,
      // see https://winterinternational.atlassian.net/browse/TTD-2241 for a reason why "permissions" is split here
      subscription().data.meeting?.currentMeetingAttendee.permissions.view,
      subscription().data.meeting?.currentMeetingAttendee.permissions.edit,
      subscription().data.meeting?.currentMeetingAttendee.permissions.admin,
    ]
  )

  const getIsMeetingOngoing = useComputed(
    () => {
      return currentMeetingInstanceOptimisticState.get() !== null
    },
    {
      name: `useMeetingPageStates-getIsMeetingOngoing`,
    }
  )

  const getCurrentMeetingLeader = useComputed(
    () =>
      //since we are allowing meeting members to be meeting leaders, we need to check all users to find the leader since members are not meeting attendees
      subscription().data.users?.nodes.find(
        (item) =>
          item.id === currentMeetingInstanceOptimisticState.get()?.leaderId
      ),
    {
      name: `useMeetingPageStates-getCurrentMeetingLeader`,
    }
  )

  const getIsCurrentUserLeader = useComputed(
    () =>
      currentMeetingInstanceOptimisticState.get()?.leaderId ===
      subscription().data.currentUser.id,
    {
      name: `useMeetingPageStates-getIsCurrentUserLeader`,
    }
  )

  const getMeetingPages = useComputed(
    () => subscription().data.meeting?.meetingPages.nodes || [],
    {
      name: `useMeetingPageStates-getMeetingPages`,
    }
  )

  const getOngoingMeetingCurrentPageId = useComputed(
    () =>
      getIsMeetingOngoing()
        ? currentMeetingInstanceOptimisticState.get()?.currentPageId ?? null
        : null,
    {
      name: `useMeetingPageStates-getOngoingMeetingCurrentPageId`,
    }
  )

  const optimisticPageIdState = useOptimisticState({
    getPersistedValue: getOngoingMeetingCurrentPageId,
    stateName: `useMeetingPageStates.optimisticPageIdState`,
    rollbackPreventionTimeoutOverrideMS: 10000,
    rollbackCondition: ({ persistedValue, optimisticValue }) => {
      // casting to string since it seems currently some BE messages are sending id as a string
      return String(persistedValue) !== String(optimisticValue)
    },
    onRollback: () => {
      notifyErrorOnOptimisticStateRollback(
        new Error('Meeting page optimistic state rollback')
      )
    },
  })

  const getPageToDisplayId = useComputed(
    () => {
      const isMeetingOngoing = getIsMeetingOngoing()
      const optimisticPageId = optimisticPageIdState.get()

      return isMeetingOngoing && pageState.isFollowingLeader && optimisticPageId
        ? optimisticPageId
        : pageState.currentUserPageId
    },
    {
      name: `useMeetingPageStates-getPageToDisplayId`,
    }
  )

  const getPageToDisplayIndex = useComputed(
    () => {
      return subscription().data.meeting?.meetingPages.nodes.findIndex(
        (page) => {
          return `${page.id}` === `${getPageToDisplayId()}`
        }
      )
    },
    {
      name: `useMeetingPageStates-getPageToDisplayIndex`,
    }
  )

  const getPageToDisplay = useComputed(
    () => {
      const page =
        getPageToDisplayIndex() != null &&
        subscription().data.meeting?.meetingPages.nodes[getPageToDisplayIndex()]
          ? subscription().data.meeting.meetingPages.nodes[
              getPageToDisplayIndex()
            ]
          : subscription().data.meeting.meetingPages.nodes[0]

      // Note - with speical sessions we run into the intermittent bug where the query library returns an empty array
      // for meetingPages.nodes when the agenda is swapped on conclude meeting. This is a temporary fix to handle this case.
      if (!page) {
        return null
      }

      return {
        ...page,
        timer: {
          ...page.timer,
          timeLastStarted:
            optimisticPageTimeLastStarted.get() || page.timer.timeLastStarted,
        },
      }
    },
    {
      name: `useMeetingPageStates-getPageToDisplay`,
    }
  )

  const getPageToDisplayPersisted = useComputed(
    () => {
      return subscription().data.meeting?.meetingPages.nodes.find(
        (page) => `${page.id}` === `${getPageToDisplayId()}`
      )
    },
    {
      name: `useMeetingPageStates-getPersistedPageToDisplay`,
    }
  )

  const getPersistedTimeLastStarted = useComputed(
    () => {
      return getPageToDisplayPersisted()?.timer.timeLastStarted || null
    },
    {
      name: `useMeetingPageStates-getPersistedTimeLastStarted`,
    }
  )

  const optimisticPageTimeLastStarted = useOptimisticState({
    getPersistedValue: getPersistedTimeLastStarted,
    stateName: `useMeetingPageStates-optimisticPageTimeLastStarted`,
    rollbackPreventionTimeoutOverrideMS: 10000,
    rollbackCondition: ({ persistedValue, optimisticValue }) => {
      return persistedValue !== optimisticValue
    },
    onRollback: () => {
      notifyErrorOnOptimisticStateRollback(
        new Error('Meeting page time last started optimistic state rollback')
      )
    },
  })

  const getIsCurrentUserAMeetingAttendee = useComputed(
    () => {
      return (subscription().data.meeting?.meetingAttendees.nodes || []).some(
        (attendee) => {
          return attendee.id === subscription().data.currentUser.id
        }
      )
    },
    {
      name: `useMeetingPageStates-isCurrentUserAMeetingAttendee`,
    }
  )

  const getMeetingPagesFilteredByCurrentMeetingPages = useComputed(
    () => {
      return getMeetingPageTypesFilteredByCurrentMeetingPagesLookup({
        currentMeetingPages:
          subscription().data.meeting?.meetingPages.nodes || [],
        unlimitedPages: UNLIMITED_ADD_PAGE_TYPES,
        terms,
      })
    },
    {
      name: `useMeetingPageStates-meetingPagesFilteredByCurrentMeetingPages`,
    }
  )

  const getMeeting = useComputed(
    () => ({
      ...subscription().data.meeting,
      currentMeetingInstance: currentMeetingInstanceOptimisticState.get(),
    }),
    {
      name: `useMeetingPageStates-getMeeting`,
    }
  )

  const getMeetingPageNavigationStatus = useComputed<
    { disabled: false; message: null } | { disabled: true; message: string }
  >(
    () => {
      if (!getIsMeetingOngoing())
        return {
          disabled: false,
          message: null,
        }

      if (!getIsCurrentUserLeader() && pageState.isFollowingLeader) {
        return {
          disabled: true,
          message: t('Unfollow leader to view other sections'),
        }
      }

      const instanceId = getMeeting().currentMeetingInstance?.id
      if (
        // disable meeting page navigation until the start meeting mutation has succeeded
        // and we have a valid meeting instance id
        typeof instanceId === 'string' &&
        instanceId.startsWith(OPTIMISTIC_MEETING_INSTANCE_ID)
      )
        return {
          disabled: true,
          message: t(
            'Please wait a moment for the meeting to start for all attendees before navigating to a different section'
          ),
        }

      return {
        disabled: false,
        message: null,
      }
    },
    {
      name: `useMeetingPageStates-getMeetingNavigationIsDisabled`,
    }
  )

  // note - we call this here to prevent a bug with slow connections rendering the drawer with the default view, then 'jumping' to the correct view.
  useEffect(() => {
    handleSetDrawerViewOutsideOfDrawerSubscriptionInMeetingsOnly(
      currentUser.settings.drawerView
    )
    // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2916
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId])

  const getMeetingPageState = useComputed(
    () => ({
      getMeetingPages,
      currentMeetingInstanceOptimisticState,
      meeting: getMeeting(),
      currentUser: subscription().data.currentUser,
      users: subscription().data.users,
      optimisticPageIdState,
      optimisticPageTimeLastStarted,
      currentMeetingLeader: getCurrentMeetingLeader(),
      currentUserPageId: pageState.currentUserPageId,
      currentUserWithMemoizedPermissions,
      isCurrentUserAMeetingAttendee: getIsCurrentUserAMeetingAttendee(),
      isCurrentUserLeader: getIsCurrentUserLeader(),
      isFollowingLeader: pageState.isFollowingLeader,
      isMeetingOngoing: getIsMeetingOngoing(),
      meetingPagesFilteredByCurrentMeetingPages:
        getMeetingPagesFilteredByCurrentMeetingPages(),
      pageToDisplay: getPageToDisplay(),
      pageToDisplayIndex: getPageToDisplayIndex(),
      previousLeaderId,
      querying: subscription().querying,
      getCurrentUserPageId: () => pageState.currentUserPageId,
      setCurrentUserPageId,
      setIsFollowingLeader,
      tipOfTheWeek,
      tab: pageState.tab,
      setTab,
      getMeetingPageNavigationStatus,
    }),
    {
      name: `useMeetingPageStates-getMeetingPageState`,
    }
  )

  return getMeetingPageState
}
