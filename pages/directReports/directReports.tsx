import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React from 'react'

import { EBloomPostHogFeatureFlag } from '@mm/core-bloom'

import { useNavigation } from '@mm/core-web/router'

import { paths } from '@mm/bloom-web/router/paths'

import { DirectReportsContainer } from './directReportsContainer'
import { DirectReportsView } from './directReportsView'

export const DirectReports = observer(function DirectReport() {
  const { navigate } = useNavigation()

  const isDirectReportsFeatureEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_QUARTERLY_ALIGNMENT_ENABLED
  )

  if (!isDirectReportsFeatureEnabled) {
    navigate(paths.errors[404])
  }

  return isDirectReportsFeatureEnabled ? (
    <DirectReportsContainer>{DirectReportsView}</DirectReportsContainer>
  ) : null
})

export default DirectReports
