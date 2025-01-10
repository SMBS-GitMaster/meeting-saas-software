import { observer } from 'mobx-react'
import React from 'react'

import { useDIResolver } from '@mm/core/di/resolver'

import { MeetingTopNav } from '@mm/bloom-web/pages/layout/meetingTopNav/meetingTopNav'
import { MeetingWorkspacePage } from '@mm/bloom-web/pages/workspace/meetingWorkspacePage'
import { PersonalWorkspacePage } from '@mm/bloom-web/pages/workspace/personalWorkspacePage'

import type { IHomePageViewProps } from './homePageTypes'
import { HomePageWelcomeScreen } from './homePageWelcomeScreen'
import { HomePageWorkspaceErrorBoundary } from './homePageWorkspaceErrorBoundary'

export const HomePageView = observer(function HomePageView(
  props: IHomePageViewProps
) {
  const diResolver = useDIResolver()

  const meetingOrWorkspaceId = props.data().workspaceHomeId

  const isWorkspaceSet =
    meetingOrWorkspaceId !== null && props.data().workspaceHomeType !== null

  const isPersonalWorkspace =
    isWorkspaceSet && props.data().workspaceHomeType === 'PERSONAL'

  const isMeetingWorkspace =
    isWorkspaceSet && props.data().workspaceHomeType === 'MEETING'

  return (
    <HomePageWorkspaceErrorBoundary diResolver={diResolver}>
      {!isWorkspaceSet && <HomePageWelcomeScreen />}
      {isWorkspaceSet && isPersonalWorkspace && (
        <PersonalWorkspacePage workspaceId={meetingOrWorkspaceId} />
      )}
      {isWorkspaceSet && isMeetingWorkspace && (
        <>
          <MeetingTopNav
            meetingId={meetingOrWorkspaceId}
            activeTab={'WORKSPACE'}
            workspaceHomeId={props.data().workspaceHomeId}
            hideActiveTab={true}
            hideMeetingSpecificKebabMenuOpts={true}
            setActiveTab={() => null}
            onViewArchiveClick={() => null}
            onViewAdvancedSettingsClick={() => null}
            onEditMeetingClick={() => null}
            onSetPrimaryWorkspace={props.actions().onSetPrimaryWorkspace}
          />
          <MeetingWorkspacePage meetingId={meetingOrWorkspaceId} />
        </>
      )}
    </HomePageWorkspaceErrorBoundary>
  )
})
