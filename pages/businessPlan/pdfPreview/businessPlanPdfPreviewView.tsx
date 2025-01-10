import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import {
  EXPANDED_COMPONENT_MAX_HEIGHT,
  Loading,
  useResizeObserver,
} from '@mm/core-web/ui'

import { useAction, useObservable } from '../../performance/mobx'
import { BusinessPlanTilesGrid } from '../businessPlanTilesGrid'
import { BUSINESS_PLAN_PDF_CONTENT } from '../constants'
import { BusinessPlanPdfOptions } from './businessPlanPdfOptions'
import { BusinessPlanPDFPageBreaks } from './businessPlanPdfPageBreaks'
import { BusinessPlanPdfPreviewHeader } from './businessPlanPdfPreviewHeader'
import { IBusinessPlanPdfPreviewViewProps } from './businessPlanPdfPreviewTypes'
import {
  A4LandscapePrintPreviewStyles,
  A4PortraitPrintPreviewStyles,
} from './businessPlanPdfStyles'

export const BusinessPlanPdfPreviewView = observer(
  function BusinessPlanPdfPreviewView(props: IBusinessPlanPdfPreviewViewProps) {
    const { getData, getActions } = props

    const pageState = useObservable({
      businessPlanGridEl: null as Maybe<HTMLDivElement>,
    })

    const observableResizeState = useResizeObserver(
      pageState.businessPlanGridEl
    )

    const setBusinessPlanObservableGridEl = useAction(
      (businessPlanGridEl: Maybe<HTMLDivElement>) => {
        pageState.businessPlanGridEl = businessPlanGridEl
      }
    )

    return (
      <div
        css={css`
          display: flex;
          justify-content: center;
          width: 100%;
          height: ${EXPANDED_COMPONENT_MAX_HEIGHT};
        `}
      >
        <div
          id={BUSINESS_PLAN_PDF_CONTENT}
          css={css`
            width: 100%;
            height: 100%;
            overflow-y: auto;

            ${getData().pdfPageState.pdfPreviewPageLayout === 'PORTRAIT'
              ? css`
                  ${A4PortraitPrintPreviewStyles}
                `
              : css`
                  ${A4LandscapePrintPreviewStyles}
                `}
          `}
        >
          {getData().isLoadingSecondSubscription ||
          getData().pageState.isLoadingGridstack ? (
            <Loading
              css={css`
                height: 100vh;
              `}
            />
          ) : (
            <div
              ref={setBusinessPlanObservableGridEl}
              css={css`
                position: relative;
                background-color: ${(props) =>
                  props.theme.colors.cardBackgroundColor} !important;

                /* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
                -webkit-print-color-adjust: exact;
                /* stylelint-enable value-no-vendor-prefix, property-no-vendor-prefix */
              `}
            >
              <BusinessPlanPdfPreviewHeader getData={getData} />
              <BusinessPlanTilesGrid
                key={`${getData().businessPlan?.id}_pdf_preview`}
                pdfPreview={true}
                getData={getData}
                getActions={getActions}
                getTileToRender={getData().getTileToRender}
              />
              <BusinessPlanPDFPageBreaks
                getData={getData}
                observableResizeState={observableResizeState}
              />
            </div>
          )}
        </div>
        <BusinessPlanPdfOptions getData={getData} getActions={getActions} />
      </div>
    )
  }
)
