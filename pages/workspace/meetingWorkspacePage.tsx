import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { useMeetingIdUrlParamGuard } from '@mm/core-web/router'

import { WorkspacePageContainer } from './workspacePageContainer'
import { WorkspacePageView } from './workspacePageView'

interface IMeetingWorkspacePageProps {
  meetingId?: Id
}

export const MeetingWorkspacePage = observer(function MeetingWorkspacePage(
  props: IMeetingWorkspacePageProps
) {
  const { meetingId } = useMeetingIdUrlParamGuard({
    meetingIdViaProps: props.meetingId || null,
  })

  return (
    <WorkspacePageContainer workspaceType='MEETING' meetingId={meetingId}>
      {WorkspacePageView}
    </WorkspacePageContainer>
  )
})

export default MeetingWorkspacePage
