import { makeAutoObservable, runInAction } from 'mobx'

import { type Id } from '@mm/gql'
import { NodesCollection, queryDefinition } from '@mm/gql'

import { createDIHook } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { i18n } from '@mm/core/i18n'
import { getMMGQLClient } from '@mm/core/mm-gql'

import {
  BloomCustomTerms,
  PermissionCheckResult,
  UserAvatarColorType,
  getBloomCustomTerms,
} from '@mm/core-bloom'

import { getBloomMeetingNode } from '@mm/core-bloom/meetings/meetingNode'
import {
  ChartableMetricUnits,
  MetricFrequency,
  TrackedMetricColorIntention,
  getBloomMetricsTabNode,
} from '@mm/core-bloom/metrics'
import { getBloomMetricTabsMutations } from '@mm/core-bloom/metrics/metricsTabs/mutations'

import { getOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import {
  getCanEditMetricTab,
  getCanPinOrUnpinMetricsTabs,
  getCanUserDeleteMetricTab,
} from './metricsTabPermissions'
import { getCanCreateMetricsTabs } from './metricsTabPermissions'
import { onMetricsTableChartButtonClick } from './onMetricsTableChartButtonClick'

export type TabData = {
  id: Id
  name: Maybe<string>
  frequency: MetricFrequency
  isSharedToMeeting: boolean
  isPinnedToTabBar: boolean
  units: ChartableMetricUnits
  creator: {
    id: Id
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
    firstName: string
    lastName: string
  }
  trackedMetrics: NodesCollection<{
    TItemType: {
      id: Id
      color: TrackedMetricColorIntention
      metric: { id: Id; title: string }
    }
    TIncludeTotalCount: true
  }>
}

// only retained for the duration of the session and not persisted
export type TabDataSessionInfo = {
  expanded: boolean
  lastDraggedTo: Maybe<{ x: number; y: number }>
  // if the user resizes their browser, or the popup container size changes for any other reason, the tab may be forcefully moved
  // however, when the screen resizes again, we want to restore the tab to its last moved position if at all possible
  lastForcefullyMovedTo: Maybe<{ x: number; y: number }>
}

export type TabNodeCollection = NodesCollection<{
  TItemType: TabData
  TIncludeTotalCount: false
}>

class MetricsTabsController {
  diResolver: IDIResolver
  unsubscribe: Maybe<() => void>
  unsubscribeActiveTab: Maybe<() => void>

  public meetingId: Maybe<Id>
  public userId: Maybe<Id>
  private activeNewOrNonSubscribedTab: Maybe<TabData | { newTab: true }>
  public activeTabSessionInfo: TabDataSessionInfo
  // each frequency has its own set of tabs
  public frequency: Maybe<MetricFrequency>
  private subscription: Maybe<
    Awaited<ReturnType<typeof this.startSubscriptions>>
  >
  private activeTabSubscription: Maybe<
    Awaited<ReturnType<typeof this.startActiveTabSubsciptions>>
  >

  constructor(diResolver: IDIResolver) {
    this.diResolver = diResolver
    this.meetingId = null
    this.userId = null
    this.activeNewOrNonSubscribedTab = null
    this.activeTabSessionInfo = {
      expanded: false,
      lastDraggedTo: null,
      lastForcefullyMovedTo: null,
    }
    this.frequency = null
    this.unsubscribe = null
    this.unsubscribeActiveTab = null
    this.subscription = null
    this.activeTabSubscription = null

    makeAutoObservable(this)
  }

  public getActiveTab = () => {
    return (
      this.activeTabSubscription?.data.tab ?? this.activeNewOrNonSubscribedTab
    )
  }

  public getCurrentUserPermissions = () => {
    return (
      this.subscription?.data.meeting.currentMeetingAttendee.permissions || null
    )
  }

  public getIsMeetingOngoing = () => {
    return !!this.subscription?.data.meeting.currentMeetingInstance
  }

  public getOwnTabs = () => {
    return this.subscription?.data.meeting.ownTabs || null
  }

  public getSharedTabs = () => {
    return this.subscription?.data.meeting.sharedTabs || null
  }

  public getActiveTabPermissions = () => {
    const activeTab = this.getActiveTab()

    if (
      this.getCurrentUserPermissions == null ||
      activeTab == null ||
      !this.isTabData(activeTab)
    ) {
      return {
        canPerformDeleteActionsForMetricTabInMeeting: {
          allowed: true,
        } as PermissionCheckResult,
        canEditMetricTabInMeeting: { allowed: true } as PermissionCheckResult,
        canPinOrUnpinMetricsTabsInMeeting: {
          allowed: true,
        } as PermissionCheckResult,
      }
    } else {
      return {
        ...getCanUserDeleteMetricTab({
          isMetricTabShared: activeTab.isSharedToMeeting,
          isOwnerOfMetricTab: this.userId === activeTab.creator.id,
          currentUserPermissions: this.getCurrentUserPermissions(),
        }),
        ...getCanEditMetricTab({
          isMetricTabShared: activeTab.isSharedToMeeting,
          isOwnerOfMetricTab: this.userId === activeTab.creator.id,
          currentUserPermissions: this.getCurrentUserPermissions(),
        }),
        ...getCanPinOrUnpinMetricsTabs(this.getCurrentUserPermissions()),
      }
    }
  }

  public getCanCreateMetricsTabsInMeeting = () => {
    if (this.getCurrentUserPermissions == null) {
      return {
        canCreateMetricsTabsInMeeting: {
          allowed: true,
        } as PermissionCheckResult,
      }
    } else {
      return getCanCreateMetricsTabs(this.getCurrentUserPermissions())
    }
  }

  public isEmptyTab = (
    tab: Maybe<{ id: Id } | { newTab: true }>
  ): tab is { newTab: true } => {
    return tab != null && 'newTab' in tab
  }

  public isTabData = <TTabData extends { id: Id }>(
    tab: Maybe<TTabData | { newTab: true }>
  ): tab is TTabData => {
    return tab != null && !this.isEmptyTab(tab)
  }

  public displayMetricsTabs = async (opts: {
    meetingId: Id
    userId: Id
    frequency: MetricFrequency
  }) => {
    this.meetingId = opts.meetingId
    this.userId = opts.userId
    this.frequency = opts.frequency

    await this.startSubscriptions()
  }

  public hideMetricsTabs = () => {
    this.dismissActiveTab()
    this.userId = null
    this.frequency = null
    this.meetingId = null

    runInAction(() => {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
        this.subscription = null
      }
      if (this.unsubscribeActiveTab) {
        this.unsubscribeActiveTab()
        this.unsubscribeActiveTab = null
        this.activeTabSubscription = null
      }
    })
  }

  public setActiveTab = async (
    opts:
      | {
          id: Id
        }
      | { newTab: true }
  ) => {
    this.activeNewOrNonSubscribedTab = null
    if (this.unsubscribeActiveTab) {
      this.unsubscribeActiveTab()
      this.unsubscribeActiveTab = null
      this.activeTabSubscription = null
    }

    if ('newTab' in opts) {
      this.activeNewOrNonSubscribedTab = { newTab: true }
    } else {
      let matchingTab = this.allTabs.find(
        (tab) => String(tab.id) === String(opts.id)
      )

      if (!matchingTab) {
        // the tab has not been received by the subscription
        // query it and then set it as the active tab
        const {
          data: { tab },
        } = await getMMGQLClient(this.diResolver).query(
          {
            tab: queryDefinition({
              def: getBloomMetricsTabNode(this.diResolver),
              map: ({
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator,
                trackedMetrics,
              }) => ({
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator: creator({
                  map: ({ avatar, userAvatarColor, firstName, lastName }) => ({
                    avatar,
                    userAvatarColor,
                    firstName,
                    lastName,
                  }),
                }),
                trackedMetrics: trackedMetrics({
                  map: ({ color, metric }) => ({
                    color,
                    metric: metric({
                      map: ({ title }) => ({
                        title,
                      }),
                    }),
                  }),
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
              target: {
                id: opts.id,
              },
            }),
          },
          { queryId: `metricsTabsController-tabData-${opts.id}` }
        )

        matchingTab = tab
      }

      runInAction(() => {
        this.activeNewOrNonSubscribedTab = matchingTab ?? null
      })
      this.startActiveTabSubsciptions()
      const { canPinOrUnpinMetricsTabsInMeeting } =
        this.getActiveTabPermissions()
      if (
        !matchingTab.isPinnedToTabBar &&
        canPinOrUnpinMetricsTabsInMeeting.allowed
      ) {
        try {
          await getBloomMetricTabsMutations(
            this.diResolver
          ).pinOrUnpinMetricTab({
            id: matchingTab.id,
            isPinnedToTabBar: true,
          })
        } catch (e) {
          getOverlazyController(this.diResolver).openOverlazy('Toast', {
            type: 'error',
            text: i18n.t(`Error attaching chart to tab bar.`),
            error: new UserActionError(e),
          })
        }
      }
    }

    // close any previously open tab
    getOverlazyController(this.diResolver).closeOverlazy({
      type: 'Tab',
      name: 'MetricsTabPopup',
    })

    getOverlazyController(this.diResolver).openOverlazy('MetricsTabPopup', {
      tab: this.getActiveTab() || { newTab: true },
    })
  }

  private getIndexOfActiveTab = () => {
    const activeTab = this.getActiveTab()

    const activeTabId = this.isTabData(activeTab) ? activeTab.id : null
    if (!activeTabId) throw Error('No active tab')
    const activeTabIndex = this.tabsToDisplay.findIndex(
      (tab) => tab.id === activeTabId
    )
    if (activeTabIndex === -1)
      throw Error('Active tab not found in tabs to display')
    return activeTabIndex
  }

  // shift+arrow right
  public goToNextTab = () => {
    const activeTabIndex = this.getIndexOfActiveTab()
    const nextTabIndex = activeTabIndex + 1
    if (nextTabIndex >= this.tabsToDisplay.length) return
    const nextTab = this.tabsToDisplay[nextTabIndex]
    this.setActiveTab({
      id: nextTab.id,
    })
  }

  // shift+arrow left
  public goToPreviousTab = () => {
    const activeTabIndex = this.getIndexOfActiveTab()
    const previousTabIndex = activeTabIndex - 1
    if (previousTabIndex < 0) return
    const previousTab = this.tabsToDisplay[previousTabIndex]
    this.setActiveTab({
      id: previousTab.id,
    })
  }

  public onChartMetricClickedFromTable = async (opts: {
    metric: {
      id: Id
      units: ChartableMetricUnits
      title: string
      frequency: MetricFrequency
    }
    userId: Id
    terms: BloomCustomTerms
  }) => {
    const terms = getBloomCustomTerms(this.diResolver)
    const result = onMetricsTableChartButtonClick({
      metricClicked: opts.metric,
      userId: opts.userId,
      activeTab: this.getActiveTab(),
    })

    if (result.addToExistingTab) {
      if ('newTab' in result.addToExistingTab) {
        const newTabId = await this.createTabForMetric({
          metric: {
            ...opts.metric,
            userId: opts.userId,
          },
          terms,
        })
        this.setActiveTab({
          id: newTabId,
        })
        return
      } else {
        const trackedMetricAlreadyExistingInTab =
          result.addToExistingTab.trackedMetrics.nodes.find((trackedMetric) => {
            return trackedMetric.metric.id === opts.metric.id
          })

        if (trackedMetricAlreadyExistingInTab) {
          try {
            await getBloomMetricTabsMutations(
              this.diResolver
            ).removeMetricFromTab({
              trackedMetricId: trackedMetricAlreadyExistingInTab.id,
            })
          } catch (e) {
            getOverlazyController(this.diResolver).openOverlazy('Toast', {
              type: 'error',
              text: i18n.t(`Error removing {{metric}} from chart.`, {
                metric: opts.terms.metric.lowercaseSingular,
              }),
              error: new UserActionError(e),
            })
          }
        } else {
          try {
            const nextColorIndex =
              result.addToExistingTab.trackedMetrics.nodes.length + 1

            const colorIntention =
              `COLOR${nextColorIndex}` as TrackedMetricColorIntention

            await getBloomMetricTabsMutations(this.diResolver).addMetricToTab({
              metricId: opts.metric.id,
              metricsTabId: result.addToExistingTab.id,
              color: colorIntention,
            })
          } catch (e) {
            getOverlazyController(this.diResolver).openOverlazy('Toast', {
              type: 'error',
              text: i18n.t(`Error adding {{metric}} to chart.`, {
                metric: opts.terms.metric.lowercaseSingular,
              }),
              error: new UserActionError(e),
            })
          }
        }
      }
    } else if (result.newTab) {
      const newTabId = await this.createTabForMetric({
        metric: {
          ...opts.metric,
          userId: opts.userId,
        },
        terms,
      })
      this.setActiveTab({
        id: newTabId,
      })
      return
    } else {
      throw new UnreachableCaseError(result as never)
    }
  }

  private createTabForMetric = async (opts: {
    metric: {
      id: Id
      title: string
      frequency: MetricFrequency
      units: ChartableMetricUnits
      userId: Id
    }
    terms: BloomCustomTerms
  }) => {
    const { metric, terms } = opts
    try {
      if (!this.meetingId) return
      const newTabId = await getBloomMetricTabsMutations(
        this.diResolver
      ).createMetricTab({
        meetingId: this.meetingId,
        name: metric.title,
        frequency: metric.frequency,
        units: metric.units,
        trackedMetrics: [
          {
            color: 'COLOR1' as TrackedMetricColorIntention,
            metricId: metric.id,
          },
        ],
        isVisibleForTeam: false,
        isPinnedToTabBar: true,
        creator: metric.userId,
      })

      return newTabId
    } catch (e) {
      getOverlazyController(this.diResolver).openOverlazy('Toast', {
        type: 'error',
        text: i18n.t(`Error creating chart for {{metric}}.`, {
          metric: terms.metric.lowercaseSingular,
        }),
        error: new UserActionError(e),
      })
    }
  }

  public toggleActiveTabExpanded = () => {
    this.activeTabSessionInfo = {
      ...this.activeTabSessionInfo,
      expanded: !this.activeTabSessionInfo?.expanded,
    }
  }

  public moveActiveTab = (coordinates: { x: number; y: number }) => {
    this.activeTabSessionInfo = {
      ...this.activeTabSessionInfo,
      lastDraggedTo: coordinates,
      lastForcefullyMovedTo: null,
    }
  }

  public setActiveTabForcedPosition = (coordinates: {
    x: number
    y: number
  }) => {
    this.activeTabSessionInfo = {
      ...this.activeTabSessionInfo,
      lastForcefullyMovedTo: coordinates,
    }
  }

  public onDraggedToPositionAvailable = () => {
    this.activeTabSessionInfo = {
      ...this.activeTabSessionInfo,
      lastForcefullyMovedTo: null,
    }
  }

  public dismissActiveTab = () => {
    const tab = this.getActiveTab()

    if (this.isTabData(tab)) {
      const { canPerformDeleteActionsForMetricTabInMeeting } =
        this.getActiveTabPermissions()

      if (
        tab.trackedMetrics.totalCount === 0 &&
        canPerformDeleteActionsForMetricTabInMeeting.allowed
      ) {
        this.deleteTabById(tab.id)
      }
    }

    this.activeNewOrNonSubscribedTab = null
    if (this.unsubscribeActiveTab) {
      this.unsubscribeActiveTab()
      this.unsubscribeActiveTab = null
      this.activeTabSubscription = null
    }

    getOverlazyController(this.diResolver).closeOverlazy({
      type: 'Tab',
      name: 'MetricsTabPopup',
    })
  }

  public deleteTabById = async (id: Id) => {
    try {
      await getBloomMetricTabsMutations(this.diResolver).deleteMetricTab({
        id,
      })
    } catch (e) {
      getOverlazyController(this.diResolver).openOverlazy('Toast', {
        type: 'error',
        text: i18n.t(`Error deleting chart.`),
        error: new UserActionError(e),
      })
    }
  }

  public unpinTabById = async (id: Id) => {
    try {
      await getBloomMetricTabsMutations(this.diResolver).pinOrUnpinMetricTab({
        id,
        isPinnedToTabBar: false,
      })
    } catch (e) {
      getOverlazyController(this.diResolver).openOverlazy('Toast', {
        type: 'error',
        text: i18n.t(`Error unpinning chart.`),
        error: new UserActionError(e),
      })
    }
  }

  public updateFrequency = (frequency: MetricFrequency) => {
    this.activeNewOrNonSubscribedTab = null
    this.frequency = frequency
    this.startSubscriptions()
  }

  get allTabs() {
    return [
      ...(this.getOwnTabs()?.nodes || []),
      ...(this.getSharedTabs()?.nodes || []),
    ]
  }

  get tabsToDisplay() {
    return this.allTabs.filter((tab) => tab.isPinnedToTabBar)
  }

  private async startActiveTabSubsciptions() {
    const activeTab = this.activeNewOrNonSubscribedTab

    if (this.unsubscribeActiveTab) {
      this.unsubscribeActiveTab()
      this.unsubscribeActiveTab = null
    }

    const mmGQLClient = getMMGQLClient(this.diResolver)
    const activeTabSubscription = await mmGQLClient.subscribe(
      {
        tab: this.isTabData(activeTab)
          ? queryDefinition({
              target: { id: activeTab.id },
              def: getBloomMetricsTabNode(this.diResolver),
              map: ({
                id,
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator,
                trackedMetrics,
              }) => ({
                id,
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator: creator({
                  map: ({
                    id,
                    avatar,
                    userAvatarColor,
                    firstName,
                    lastName,
                  }) => ({
                    id,
                    avatar,
                    userAvatarColor,
                    firstName,
                    lastName,
                  }),
                }),
                trackedMetrics: trackedMetrics({
                  map: ({ id, metric, color }) => ({
                    id,
                    color,
                    metric: metric({
                      map: ({ id, title }) => ({
                        id,
                        title,
                      }),
                    }),
                  }),
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
            })
          : null,
      },
      {
        subscriptionId: `metricsTabsController-tabData-${
          activeTab && 'id' in activeTab ? activeTab.id : 'newTab'
        }`,
      }
    )

    runInAction(() => {
      this.activeTabSubscription = activeTabSubscription
      this.unsubscribeActiveTab = activeTabSubscription.unsub
    })

    return activeTabSubscription
  }

  private async startSubscriptions() {
    const { meetingId, frequency, userId } = this
    if (!meetingId || !frequency || !userId)
      throw Error('Missing meetingId or frequency or userId')

    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }

    const mmGQLClient = getMMGQLClient(this.diResolver)
    const subscription = await mmGQLClient.subscribe(
      {
        meeting: queryDefinition({
          def: getBloomMeetingNode(this.diResolver),
          map: ({
            currentMeetingInstance,
            currentMeetingAttendee,
            metricsTabs,
          }) => ({
            currentMeetingInstance: currentMeetingInstance({
              map: ({ id }) => ({ id }),
            }),
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
            ownTabs: metricsTabs({
              map: ({
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator,
                trackedMetrics,
              }) => ({
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator: creator({
                  map: ({
                    id,
                    avatar,
                    userAvatarColor,
                    firstName,
                    lastName,
                  }) => ({
                    id,
                    avatar,
                    userAvatarColor,
                    firstName,
                    lastName,
                  }),
                }),
                trackedMetrics: trackedMetrics({
                  map: ({ color, metric }) => ({
                    color,
                    metric: metric({
                      map: ({ title, units }) => ({
                        title,
                        units,
                      }),
                    }),
                  }),
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
              filter: {
                and: [
                  {
                    frequency,
                    isSharedToMeeting: false,
                  },
                ],
              },
            }),
            sharedTabs: metricsTabs({
              map: ({
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator,
                trackedMetrics,
              }) => ({
                name,
                frequency,
                isSharedToMeeting,
                isPinnedToTabBar,
                units,
                creator: creator({
                  map: ({ avatar, userAvatarColor, firstName, lastName }) => ({
                    avatar,
                    userAvatarColor,
                    firstName,
                    lastName,
                  }),
                }),
                trackedMetrics: trackedMetrics({
                  map: ({ color, metric }) => ({
                    color,
                    metric: metric({
                      map: ({ title, units }) => ({
                        title,
                        units,
                      }),
                    }),
                  }),
                  pagination: {
                    includeTotalCount: true,
                  },
                }),
              }),
              filter: {
                and: [
                  {
                    frequency,
                    isSharedToMeeting: true,
                  },
                ],
              },
            }),
          }),
          target: { id: meetingId },
        }),
      },
      {
        subscriptionId: `metricsTabsController-tabData-${meetingId}`,
      }
    )

    runInAction(() => {
      this.subscription = subscription
      this.unsubscribe = subscription.unsub
    })

    return subscription
  }
}

export const diName = 'bloom-web/metrics/metricsTabs/metricsTabsController'

export const getMetricsTabsController = (diResolver: IDIResolver) =>
  diResolver.getOrCreate(diName, () => new MetricsTabsController(diResolver))

export const useMetricsTabsController = createDIHook(
  diName,
  getMetricsTabsController
)
