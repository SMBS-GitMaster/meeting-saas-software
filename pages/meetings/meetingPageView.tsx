import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useResizeDetector } from 'react-resize-detector'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { SSRSuspense } from '@mm/core/ssr'
import { usePreviousValue } from '@mm/core/ui/hooks'

import {
  EMeetingPageType,
  MEETING_PAGES_WITH_EMBEDDED_DRAWERS,
} from '@mm/core-bloom'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useTranslation } from '@mm/core-web/i18n'
import MeetingSectionsErrorBoundary from '@mm/core-web/router/customErrorBoundaries/meetingSectionsErrorBoundary'
import {
  GridContainer,
  GridItem,
  Loading,
  toREM,
  useDrawerController,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MeetingWorkspacePage } from '@mm/bloom-web/pages/workspace/meetingWorkspacePage'

import { MeetingTopNav } from '../layout/meetingTopNav'
import { useSideNavController } from '../layout/sideNav/sideNavController'
import { useAction, useComputed, useObservable } from '../performance/mobx'
import { AgendaCardView } from './agenda/agendaCardView'
import { MeetingPageEmbeddedDrawerView } from './meetingPageEmbeddedDrawersView'
import { MeetingPageTangent } from './meetingPageTangent'
import { IMeetingPageViewProps } from './meetingPageTypes'
import { MeetingSectionRenderer } from './meetingSections/meetingSectionRenderer'

export const MEETING_PAGE_BOTTOM_PORTAL_ID = 'meeting-page-bottom-portal'
export const MeetingPageView = observer(function MeetingPageView(
  props: IMeetingPageViewProps
) {
  const meetingId = props.getData().meeting.id
  const activeTab = props.getData().tab
  const setActiveTab = props.getActionHandlers().setActiveTab

  const onViewArchiveClick = React.useCallback(() => {
    setActiveTab('ARCHIVE')
  }, [setActiveTab])

  const onViewAdvancedSettingsClick = React.useCallback(() => {
    setActiveTab('ADVANCED_SETTINGS')
  }, [setActiveTab])

  const onEditMeetingClick = React.useCallback(() => {
    setActiveTab('EDIT')
  }, [setActiveTab])

  function renderActiveTab() {
    if (activeTab === 'MEETING') {
      return (
        <>
          <MeetingPageTangent
            tangentAlertTimestamp={
              props.getData().meeting.currentMeetingInstance
                ?.tangentAlertTimestamp
            }
          />
          <MeetingPage {...props} />
        </>
      )
    } else if (activeTab === 'ARCHIVE') {
      return <MeetingArchivePage meetingId={meetingId} />
    } else if (activeTab === 'ADVANCED_SETTINGS') {
      return <MeetingAdvancedSettingsPage meetingId={meetingId} />
    } else if (activeTab === 'WORKSPACE') {
      return <MeetingWorkspacePage />
    } else if (activeTab === 'EDIT') {
      return <EditMeetingPage meetingId={meetingId} />
    } else {
      throw new UnreachableCaseError(activeTab)
    }
  }

  return (
    <>
      <SSRSuspense
        fallback={
          <div
            css={css`
              height: 100vh;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Loading size='large' />
          </div>
        }
      >
        <MeetingTopNav
          meetingId={props.getData().meeting.id}
          activeTab={activeTab}
          workspaceHomeId={props.getData().workspaceHomeId}
          setActiveTab={setActiveTab}
          onViewArchiveClick={onViewArchiveClick}
          onViewAdvancedSettingsClick={onViewAdvancedSettingsClick}
          onEditMeetingClick={onEditMeetingClick}
          onSetPrimaryWorkspace={
            props.getActionHandlers().onSetPrimaryWorkspace
          }
        />
        {renderActiveTab()}
      </SSRSuspense>
    </>
  )
})

const MeetingPage = observer(function MeetingPage(
  props: IMeetingPageViewProps
) {
  const componentState = useObservable<{
    agendaIsCollapsed: boolean
  }>({
    agendaIsCollapsed: false,
  })

  const setAgendaIsCollapsed = useAction((collapsed: boolean) => {
    componentState.agendaIsCollapsed = collapsed
  })

  const meetingNotesStickToElementRef = useRef<Maybe<HTMLDivElement>>()
  const containerRef = useRef<Maybe<HTMLDivElement>>(null)
  const agendaRef = useRef<Maybe<HTMLDivElement>>(null)

  const theme = useTheme()
  const diResolver = useDIResolver()
  const sideNav = useSideNavController()
  const { openOverlazy, closeOverlazy } = useOverlazyController()

  const { activeDrawerId, drawerView, isActiveDrawerInUnsavedState } =
    useDrawerController()
  const MEETING_TASK_BAR_TOP_PADDING = 8
  const MEETING_PAGE_CONTAINER_PADDING = 24

  const { t } = useTranslation()
  const { height: agendaHeight } = useResizeDetector({
    targetRef: agendaRef,
  })
  const wasPreviouslyStopped = usePreviousValue(
    props.getData().meeting.currentMeetingInstance == null
  )

  const isMeetingOngoing =
    props.getData().meeting.currentMeetingInstance != null

  const getPageToDisplayData = useComputed(
    () =>
      props.getData().currentMeetingPage
        ? props.getData().currentMeetingPage
        : null,
    {
      name: 'MeetingPage.getPageToDisplayData',
    }
  )

  const agendaShouldBeSticky =
    containerRef.current?.scrollHeight != null &&
    agendaHeight != null &&
    containerRef.current.scrollHeight > agendaHeight

  const pageToDisplayData = getPageToDisplayData()
  const pageTypeAllowsPlaceholders =
    pageToDisplayData &&
    MEETING_PAGES_WITH_EMBEDDED_DRAWERS.includes(pageToDisplayData.pageType)
  const showEmbeddedDrawerOrPlaceholder =
    drawerView === 'EMBEDDED' &&
    !!(pageTypeAllowsPlaceholders || activeDrawerId)

  useEffect(() => {
    // if the meeting was previously stopped and is now ongoing
    // or if we mounted this view for the first time and the meeting is ongoing immediately
    // close the side nav.
    if (
      (wasPreviouslyStopped || wasPreviouslyStopped == null) &&
      isMeetingOngoing &&
      sideNav.sideNavExpanded
    ) {
      sideNav.closeSideNav()
    }
  }, [wasPreviouslyStopped, isMeetingOngoing, sideNav])

  useEffect(() => {
    openOverlazy('MeetingTaskBar', {
      meetingId: props.getData().meeting.id,
      isMeetingOngoing,
      onMetricsMeetingPage:
        pageToDisplayData?.pageType === EMeetingPageType.Metrics,
    })

    return () =>
      closeOverlazy({
        type: 'Tab',
        name: 'MeetingTaskBar',
      })
  }, [
    closeOverlazy,
    openOverlazy,
    isMeetingOngoing,
    props.getData().meeting.id,
    pageToDisplayData?.pageType,
  ])

  useEffect(() => {
    const viewCount = props.getData().currentUser.numViewedNewFeatures
    if (viewCount < 2) {
      openOverlazy('BloomNewFeaturesModal', {
        isAutoOpened: viewCount === 1,
        onClose: async () => {
          await props.getActionHandlers().onUpdateUserNewFeatureViewCount()
        },
      })
    }
  }, []) /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (
      pageToDisplayData &&
      !MEETING_PAGES_WITH_EMBEDDED_DRAWERS.includes(
        pageToDisplayData.pageType
      ) &&
      drawerView === 'EMBEDDED' &&
      !isActiveDrawerInUnsavedState
    ) {
      return closeOverlazy({ type: 'Drawer' })
    }
    // we only want this to close the overlazy when the page type changes from drawers that allow embedded to drawers that don't allow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageToDisplayData])

  const determineHeightSubtraction = componentState.agendaIsCollapsed
    ? '200px'
    : '120px'

  const expectedMeetingDurationInMinutes = useComputed(
    () => {
      return props
        .getData()
        .meeting.meetingPages.nodes.reduce((total, node) => {
          return total + node.expectedDurationS / 60
        }, 0)
    },
    { name: 'MeetingPage.expectedMeetingDurationInMinutes' }
  )

  const getAgendaData = useComputed(
    () => ({
      meetingId: props.getData().meeting.id,
      isLoading: props.getData().isLoading,
      agendaIsCollapsed: componentState.agendaIsCollapsed,
      setAgendaIsCollapsed: setAgendaIsCollapsed,
      currentUser: props.getData().currentUser,
      isCurrentUserAMeetingAttendee:
        props.getData().agendaData.isCurrentUserAMeetingAttendee,
      isFollowingLeader: props.getData().agendaData.isFollowingLeader,
      meetingPagesFilteredByCurrentMeetingPages:
        props.getData().agendaData.meetingPagesFilteredByCurrentMeetingPages,
      currentMeetingLeader: props.getData().agendaData.currentMeetingLeader,
      meetingPages: props.getData().meeting.meetingPages,
      currentMeetingInstance: props.getData().meeting.currentMeetingInstance,
      meetingAttendees: props.getData().meeting.meetingAttendees,
      activePageId: getPageToDisplayData()?.id ?? '',
      scheduledMeetingEndTime: props.getData().meeting.scheduledEndTime,
      scheduledMeetingStartTime: props.getData().meeting.scheduledStartTime,
      expectedMeetingDurationFromAgendaInMinutes:
        expectedMeetingDurationInMinutes(),
      pageToDisplay: props.getData().currentMeetingPage,
      setIsFollowingLeader: props.getData().agendaData.setIsFollowingLeader,
      meetingPageNavigationStatus:
        props.getData().agendaData.meetingPageNavigationStatus,
    }),
    {
      name: 'MeetingPage.getAgendaData',
    }
  )

  const getAgendaActionHandlers = useComputed(
    () => ({
      onStartMeeting: props.getActionHandlers().onStartMeeting,
      onMeetingPaused: props.getActionHandlers().onMeetingPaused,
      onSetCurrentUserPage: props.getActionHandlers().onSetCurrentPage,
      handleNextPage: props.getActionHandlers().handleNextPage,
      handlePrevPage: props.getActionHandlers().handlePrevPage,
      onUpdateMeetingPageOrder:
        props.getActionHandlers().onUpdateMeetingPageOrder,
      onAddAgendaSectionToMeeting:
        props.getActionHandlers().onAddAgendaSectionToMeeting,
      onUpdateAgendaSections: props.getActionHandlers().onUpdateAgendaSections,
      onImportAgenda: props.getActionHandlers().onImportAgenda,
      tangentClicked: props.getActionHandlers().tangentClicked,
      onHandleSaveAgendaAsPdf:
        props.getActionHandlers().onHandleSaveAgendaAsPdf,
      onHandlePrintAgenda: props.getActionHandlers().onHandlePrintAgenda,
      onUpdateMeetingLeader: props.getActionHandlers().onUpdateMeetingLeader,
    }),
    {
      name: 'MeetingPage.getAgendaActionHandlers',
    }
  )

  return (
    <>
      <Helmet>
        <title>{`${props.getData().meeting.name} - ${t('Run Meeting')}`}</title>
      </Helmet>
      <div
        ref={containerRef}
        css={css`
          align-items: flex-start;
          display: flex;
          padding: ${toREM(MEETING_PAGE_CONTAINER_PADDING)}
            ${toREM(MEETING_PAGE_CONTAINER_PADDING)} 0
            ${toREM(MEETING_PAGE_CONTAINER_PADDING)};
          width: 100%;
          height: 100vh;

          ${componentState.agendaIsCollapsed &&
          css`
            align-items: stretch;
            flex-direction: column;
          `};
        `}
      >
        <AgendaCardView
          ref={agendaRef}
          css={
            componentState.agendaIsCollapsed
              ? css`
                  margin-bottom: ${theme.sizes.spacing16};
                `
              : css`
                  margin-right: ${theme.sizes.spacing16};
                  width: ${toREM(216)};
                  max-height: calc(100vh - ${determineHeightSubtraction});

                  ${agendaShouldBeSticky &&
                  css`
                    position: sticky;
                  `}
                `
          }
          getData={getAgendaData}
          getActionHandlers={getAgendaActionHandlers}
          expectedMeetingDurationFromAgendaInMinutes={expectedMeetingDurationInMinutes()}
          meetingNotesStickToElementRef={meetingNotesStickToElementRef}
        />
        <GridContainer
          columns={12}
          withoutMargin={true}
          css={css`
            flex: 1;
            min-width: 0;
            flex-flow: row nowrap;
          `}
        >
          <GridItem
            m={showEmbeddedDrawerOrPlaceholder ? 9 : 12}
            withoutXPadding={true}
            css={css`
              padding: 0;
              max-height: calc(100vh - ${determineHeightSubtraction});
            `}
          >
            <MeetingSectionsErrorBoundary
              diResolver={diResolver}
              key={pageToDisplayData?.id}
            >
              <MeetingSectionRenderer
                isLoading={props.getData().isLoading}
                getAgendaData={getAgendaData}
                getPageToDisplayData={getPageToDisplayData}
                currentUser={props.getData().currentUser}
                meeting={props.getData().meeting}
                orgUsers={props.getData().orgUsers}
                checkInConstants={props.getData().checkInConstants}
                meetingAttendees={props.getData().meeting.meetingAttendees}
                actionHandlers={props.getActionHandlers()}
              />
            </MeetingSectionsErrorBoundary>
            <div
              ref={(r) => {
                meetingNotesStickToElementRef.current = r
              }}
            />
          </GridItem>

          <GridItem
            m={3}
            withoutXPadding={true}
            css={css`
              padding: 0;
              height: calc(100vh - ${determineHeightSubtraction});

              ${!showEmbeddedDrawerOrPlaceholder &&
              css`
                width: 0;
              `}
            `}
          >
            <MeetingPageEmbeddedDrawerView
              drawerView={drawerView}
              showEmbeddedDrawerOrPlaceholder={showEmbeddedDrawerOrPlaceholder}
              pageToDisplayData={pageToDisplayData}
            />
          </GridItem>
        </GridContainer>
      </div>

      <div
        id={MEETING_PAGE_BOTTOM_PORTAL_ID}
        css={css`
          position: sticky;
          bottom: 0;
          align-items: flex-end;
          align-self: flex-end;
          display: inline-flex;
          margin-top: auto;
          flex-shrink: 0;
          padding: ${toREM(MEETING_TASK_BAR_TOP_PADDING)}
            ${({ theme }) => theme.sizes.spacing32} 0;
          width: 100%;
          background: ${({ theme }) => theme.colors.bodyBackgroundColor};
          z-index: ${({ theme }) => theme.zIndices.tabs};
        `}
      />
    </>
  )
})

const MeetingArchivePage = function MeetingArchivePage(props: {
  meetingId: Id
}) {
  const { v1Url } = useBrowserEnvironment()
  const { t } = useTranslation()

  return (
    <iframe
      src={`${v1Url}L10/Details/${props.meetingId}?noheading=true#/Scorecard`}
      title={t('Archive')}
      css={css`
        width: 100%;
        height: 100%;
        border: 0;
        margin-top: -${toREM(42)};
      `}
    />
  )
}

const MeetingAdvancedSettingsPage =
  function MeetingAdvancedSettingsPage(props: { meetingId: Id }) {
    const { v1Url } = useBrowserEnvironment()
    const { t } = useTranslation()

    return (
      <iframe
        src={`${v1Url}L10/Edit/${props.meetingId}?noheading=true`}
        title={t('Advanced Settings')}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
          margin-top: -${toREM(42)};
        `}
      />
    )
  }

const EditMeetingPage = function EditMeetingPage(props: { meetingId: Id }) {
  const { v1Url } = useBrowserEnvironment()
  const { t } = useTranslation()

  return (
    <iframe
      src={`${v1Url}L10/Wizard/${props.meetingId}?noheading=true`}
      title={t('Edit meeting')}
      css={css`
        width: 100%;
        height: 100%;
        border: 0;
        margin-top: -${toREM(42)};
      `}
    />
  )
}
