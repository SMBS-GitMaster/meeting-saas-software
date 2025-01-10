import { observer } from 'mobx-react'
import React from 'react'

import {
  IBusinessPlanListCollection,
  IBusinessPlanTileData,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanGoalsListContainer } from './businessPlanGoalsListContainer'
import { BusinessPlanGoalsListView } from './businessPlanGoalsListView'

export const BusinessPlanGoalsList = observer(
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
      <BusinessPlanGoalsListContainer {...props}>
        {BusinessPlanGoalsListView}
      </BusinessPlanGoalsListContainer>
    )
  }
)
