import { observer } from 'mobx-react'
import React from 'react'
import { Portal } from 'react-portal'
import { css } from 'styled-components'

import { useDocument } from '@mm/core/ssr'

import { EXPANDED_COMPONENT_WIDTH, ExpandedComponent } from '@mm/core-web/ui'

import { useAction } from '../../performance/mobx'
import {
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
  TBusinessPlanTileProps,
} from '../businessPlanTypes'
import { BUSINESS_PLAN_PDF_EXPANDED_PORTAL_OUT_ID } from '../constants'
import { BusinessPlanPdfPreview } from './businessPlanPdfPreview'

interface IBusinessPlanPdfFullScreenIframePortalProps {
  getData: () => IBusinessPlanViewData
  getActions: () => IBusinessPlanViewActions
  getTileToRender: (tile: TBusinessPlanTileProps) => React.JSX.Element | null
}

export const BusinessPlanPdfFullScreenIframePortal = observer(
  function BusinessPlanPdfFullScreenIframePortal(
    props: IBusinessPlanPdfFullScreenIframePortalProps
  ) {
    const document = useDocument()

    const { getData, getActions, getTileToRender } = props

    const onBackdropClicked = useAction(() => {
      getActions().onHandleExitPDFPreview()
    })

    return (
      <>
        <Portal
          node={
            document.getElementById(
              BUSINESS_PLAN_PDF_EXPANDED_PORTAL_OUT_ID
            ) as Maybe<HTMLDivElement>
          }
        >
          <ExpandedComponent
            fillHeightToScreen={true}
            backdropClicked={onBackdropClicked}
            css={css`
              border-radius: ${({ theme }) => theme.sizes.br2};
              max-width: ${EXPANDED_COMPONENT_WIDTH};
              width: unset;
            `}
          >
            <BusinessPlanPdfPreview
              getBusinessPlanData={getData}
              getBusinessPlanActions={getActions}
              getTileToRender={getTileToRender}
            />
          </ExpandedComponent>
        </Portal>
      </>
    )
  }
)
