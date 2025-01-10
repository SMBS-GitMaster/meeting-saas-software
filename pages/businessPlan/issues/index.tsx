import { observer } from 'mobx-react'
import React from 'react'

import {
  IBusinessPlanListCollection,
  IBusinessPlanTileData,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanIssuesListContainer } from './businessPlanIssuesListContainer'
import { BusinessPlanIssuesListView } from './businessPlanIssuesListView'

export const BusinessPlanIssuesList = observer(
  (props: {
    listCollection: IBusinessPlanListCollection
    isPdfPreview: boolean
    getIsEditingDisabled: () => boolean
    getBusinessPlanData: () => Pick<
      IBusinessPlanViewData,
      'pageState' | 'businessPlan'
    >
    getTileData: () => IBusinessPlanTileData
    className?: string
  }) => {
    return (
      <BusinessPlanIssuesListContainer {...props}>
        {BusinessPlanIssuesListView}
      </BusinessPlanIssuesListContainer>
    )
  }
)
