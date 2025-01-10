import { observer } from 'mobx-react'
import React from 'react'

import { Id } from '@mm/gql'

import { MetricsTable } from '@mm/bloom-web/metrics/metricsTable'

export const MetricsSection = observer(function MetricsSection(props: {
  meetingId: Id
  getPageToDisplayData: () => Maybe<{ pageName: string }>
}) {
  return <MetricsTable {...props} workspaceTileId={null} />
})
