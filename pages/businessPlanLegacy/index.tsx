import React from 'react'
import { css } from 'styled-components'

import {
  RoutingException,
  RoutingExceptionType,
} from '@mm/core/exceptions/routing'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useCurrentRoute } from '@mm/core-web/router'

import { BloomHeader } from '../layout/header/bloomHeader'

export const BusinessPlanPageV1 = () => {
  const { v1Url } = useBrowserEnvironment()
  const terms = useBloomCustomTerms()
  const getCurrentRoute = useCurrentRoute<
    Record<string, unknown>,
    { businessPlanId: string }
  >()

  const businessPlanId =
    Number(getCurrentRoute().urlParams.businessPlanId) ||
    getCurrentRoute().urlParams.businessPlanId

  if (!businessPlanId) {
    throw new RoutingException({
      type: RoutingExceptionType.InvalidParams,
      description: 'No business plan id found in the url params',
    })
  }
  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={terms.businessPlan.singular}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <iframe
        src={`${v1Url}L10/EditVto/${businessPlanId}?noheading=true`}
        title={terms.businessPlan.singular}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
        `}
      />
    </>
  )
}
