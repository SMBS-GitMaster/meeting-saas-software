import React from 'react'
import { css } from 'styled-components'

import {
  RoutingException,
  RoutingExceptionType,
} from '@mm/core/exceptions/routing'

import { useTranslation } from '@mm/core-web'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useCurrentRoute } from '@mm/core-web/router'

import { BloomHeader } from '../layout/header/bloomHeader'

export const PersonalWorkspacePageV1 = () => {
  const { v1Url } = useBrowserEnvironment()
  const { t } = useTranslation()
  const getCurrentRoute = useCurrentRoute<
    Record<string, never>,
    { workspaceId: string }
  >()

  const workspaceId =
    Number(getCurrentRoute().urlParams.workspaceId) ||
    getCurrentRoute().urlParams.workspaceId

  if (!workspaceId) {
    throw new RoutingException({
      type: RoutingExceptionType.InvalidParams,
      description: 'No business plan id found in the url params',
    })
  }

  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={null}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <iframe
        src={`${v1Url}Dashboard/Index/${workspaceId}?type=L10&noheading=true`}
        title={t('Workspace')}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
        `}
      />
    </>
  )
}

export default PersonalWorkspacePageV1
