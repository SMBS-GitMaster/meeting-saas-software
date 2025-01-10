import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Loading } from '@mm/core-web/ui'

import {
  IBusinessPlanListCollection,
  IBusinessPlanTileData,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanIssuesList } from '../issues'

interface IBusinessPlanIssuesListCollectionProps {
  listCollection: IBusinessPlanListCollection
  isPdfPreview: boolean
  getIsEditingDisabled: () => boolean
  getData: () => Pick<IBusinessPlanViewData, 'pageState' | 'businessPlan'>
  getTileData: () => IBusinessPlanTileData
}

export const BusinessPlanIssuesListCollection = observer(
  (props: IBusinessPlanIssuesListCollectionProps) => {
    const {
      listCollection,
      isPdfPreview,
      getData,
      getTileData,
      getIsEditingDisabled,
    } = props

    return (
      <React.Suspense
        fallback={
          <Loading
            size='small'
            css={css`
              padding-top: ${(props) => props.theme.sizes.spacing40};
            `}
          />
        }
      >
        <BusinessPlanIssuesList
          isPdfPreview={isPdfPreview}
          getBusinessPlanData={getData}
          getTileData={getTileData}
          getIsEditingDisabled={getIsEditingDisabled}
          listCollection={listCollection}
        />
      </React.Suspense>
    )
  }
)
