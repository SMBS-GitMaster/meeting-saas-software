import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React from 'react'

import { EBloomPostHogFeatureFlag } from '@mm/core-bloom'

import { BusinessPlanPageV1 } from '../businessPlanLegacy'
import { BusinessPlanContainer } from './businessPlanContainer'
import { BusinessPlanView } from './businessPlanView'

export * from './businessPlanTypes'
export * from './constants'

export default observer(function BusinessPlanPage() {
  const isV3BusinessPlanEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_BUSINESS_PLAN_ENABLED
  )

  if (isV3BusinessPlanEnabled) {
    return <BusinessPlanContainer>{BusinessPlanView}</BusinessPlanContainer>
  }

  return <BusinessPlanPageV1 />
})
