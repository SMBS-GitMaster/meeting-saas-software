import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { css } from 'styled-components'

import { useObservable } from '@mm/gql'

import { useDocument } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web'

import { Text, toREM } from '@mm/core-web/ui'

import { useAction } from '../../performance/mobx'
import {
  BUSINESS_PLAN_PDF_CONTENT,
  BUSINESS_PLAN_PDF_PAGE_BREAKS_MEASUREMENT_REF_MM_ID,
} from '../constants'
import { IBusinessPlanPdfPreviewViewData } from './businessPlanPdfPreviewTypes'

export const BusinessPlanPDFPageBreaks = observer(
  (opts: {
    getData: () => Pick<IBusinessPlanPdfPreviewViewData, 'pdfPageState'>
    observableResizeState: {
      ready: boolean
      height: Maybe<number>
    }
  }) => {
    const document = useDocument()
    const { t } = useTranslation()

    const { getData, observableResizeState } = opts

    const componentState = useObservable({
      pageScrollHeight: null as Maybe<number>,
      estimatedUserDPI: 96 as number, // 96 is the most common dpi for screens.
    })

    const millimetersToPixels = useAction(
      (opts: { mm: number; dpi: number }) => {
        const { mm, dpi } = opts
        const inches = mm / 25.4 // 1 inch = 25.4 mm
        const px = inches * dpi
        return Math.round(px)
      }
    )

    // Note - the DPI is used to convert the height of an A4 page from millimeters to pixels.
    // We get the DPI by measuring the width in px of a hidden element in the DOM that is 25.4mm wide(1 inch). See useEffect below.
    // This conversion is necessary to determine how many page breaks are needed based on the user's screen resolution
    // and the scroll height of the content. This ensures that the document is paginated correctly when viewed in the PDF preview.
    const A4PageHeight =
      getData().pdfPageState.pdfPreviewPageLayout === 'LANDSCAPE'
        ? millimetersToPixels({ mm: 210, dpi: componentState.estimatedUserDPI })
        : millimetersToPixels({ mm: 297, dpi: componentState.estimatedUserDPI })

    const pageScrollHeight = componentState.pageScrollHeight || 0
    const breaksNeeded = Math.floor(pageScrollHeight / A4PageHeight)

    const pageHeight = observableResizeState.height
    useEffect(() => {
      const businessPlanScroller = document.getElementById(
        BUSINESS_PLAN_PDF_CONTENT
      )

      if (!businessPlanScroller) {
        return
      }

      return runInAction(() => {
        componentState.pageScrollHeight = businessPlanScroller.scrollHeight
      })
    }, [pageHeight, document])

    useEffect(() => {
      const measurementRefMM = document.getElementById(
        BUSINESS_PLAN_PDF_PAGE_BREAKS_MEASUREMENT_REF_MM_ID
      )

      if (!measurementRefMM) {
        return
      }

      const rect = measurementRefMM?.getBoundingClientRect()

      const widthPx = rect.width

      const dpi = widthPx

      runInAction(() => {
        componentState.estimatedUserDPI = dpi
      })
    }, [document])

    return (
      <>
        {Array.from({ length: breaksNeeded }).map((_, index) => {
          const topOffset = A4PageHeight * (index + 1)

          return (
            <div
              key={index}
              data-html2canvas-ignore
              css={css`
                position: absolute;
                top: ${toREM(topOffset)};
                padding-left: ${(props) => props.theme.sizes.spacing24};
                left: 0;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                height: ${toREM(40)};
                background-color: ${(props) =>
                  props.theme.colors.businessPlanPDFPageDividerColor};
                border-top: ${(props) => props.theme.sizes.smallDashedBorder}
                  ${(props) =>
                    props.theme.colors.businessPlanPDFPageBreakBorderColor};
                border-bottom: ${(props) => props.theme.sizes.smallDashedBorder}
                  ${(props) =>
                    props.theme.colors.businessPlanPDFPageBreakBorderColor};
                z-index: 1;
                box-shadow: ${(props) => props.theme.sizes.bs2};
                color: ${(props) =>
                  props.theme.colors.businessPlanPDFPageBreakTextColor};

                @media print {
                  display: none;
                }
              `}
            >
              <Text type={'body'} weight={'semibold'}>
                {t('Page Break')}
              </Text>
            </div>
          )
        })}
        <div
          id={BUSINESS_PLAN_PDF_PAGE_BREAKS_MEASUREMENT_REF_MM_ID}
          css={css`
            width: 25.4mm;
            height: 25.4mm;
            visibility: hidden;
            position: absolute;
          `}
        />
      </>
    )
  }
)
