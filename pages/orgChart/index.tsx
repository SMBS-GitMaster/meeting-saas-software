import posthog from 'posthog-js'
import React from 'react'
import { css } from 'styled-components'

import { EBloomPostHogFeatureFlag, useBloomCustomTerms } from '@mm/core-bloom'

import { useBrowserEnvironment } from '@mm/core-web/envs'

import { BloomHeader } from '../layout/header/bloomHeader'
import V3OrgChart from './v3OrgChart'

export default function OrgChartPage() {
  const isV3OrgChartEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_ORG_CHART_ENABLED
  )

  if (isV3OrgChartEnabled) {
    return <V3OrgChart />
  } else {
    return <V1OrgChartPage />
  }
}

const V1OrgChartPage = function V1OrgChartPage() {
  const { v1Url } = useBrowserEnvironment()
  const terms = useBloomCustomTerms()

  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={terms.orgChart.singular}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <iframe
        src={`${v1Url}Accountability/Chart?noheading=true`}
        title={terms.orgChart.singular}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
        `}
      />
    </>
  )
}
