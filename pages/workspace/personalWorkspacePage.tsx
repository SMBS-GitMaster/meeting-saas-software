import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React from 'react'

import { type Id } from '@mm/gql'

import { EBloomPostHogFeatureFlag } from '@mm/core-bloom'

import { useWorkspaceIdUrlParamGuard } from '@mm/core-web/router'

import { PersonalWorkspacePageV1 } from './personalWorkspacePageV1'
import { WorkspacePageContainer } from './workspacePageContainer'
import { WorkspacePageView } from './workspacePageView'

interface IPersonalWorkspacePageProps {
  workspaceId?: Id
}

export const PersonalWorkspacePage = observer(function PersonalWorkspacePage(
  props: IPersonalWorkspacePageProps
) {
  const isV3WorkspaceEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_WORKSPACE_ENABLED
  )
  const { workspaceId } = useWorkspaceIdUrlParamGuard({
    workspaceIdViaProps: props.workspaceId || null,
  })

  if (isV3WorkspaceEnabled) {
    return (
      <WorkspacePageContainer
        workspaceType='PERSONAL'
        workspaceId={workspaceId}
      >
        {WorkspacePageView}
      </WorkspacePageContainer>
    )
  } else {
    return <PersonalWorkspacePageV1 />
  }
})

export default PersonalWorkspacePage
