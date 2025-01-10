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

export default function CoachToolsPage() {
  const { v1Url } = useBrowserEnvironment()
  const { t } = useTranslation()
  const getCurrentRoute = useCurrentRoute<
    Record<string, unknown>,
    { coachToolsId: string }
  >()

  const coachToolsId =
    Number(getCurrentRoute().urlParams.coachToolsId) ||
    getCurrentRoute().urlParams.coachToolsId

  if (!coachToolsId) {
    throw new RoutingException({
      type: RoutingExceptionType.InvalidParams,
      description: 'No coach tools id found in the url params',
    })
  }
  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={t('Coach tools')}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <iframe
        src={`${v1Url}documents/folder/${coachToolsId}?noheading=true`}
        title={t('Coach tools')}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
        `}
      />
    </>
  )
}
