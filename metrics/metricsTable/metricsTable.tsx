import React from 'react'

import { Id } from '@mm/gql'

import type { TBloomPageType, TWorkspaceType } from '@mm/core-bloom'

import { MetricsTableContainer } from './metricsTableContainer'
import { MetricsTableView } from './metricsTableView'

interface IMetricsTableProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  pageType?: TBloomPageType
  workspaceType?: TWorkspaceType
  className?: string
}

export const MetricsTable = (props: IMetricsTableProps) => {
  return (
    <MetricsTableContainer {...props}>{MetricsTableView}</MetricsTableContainer>
  )
}
