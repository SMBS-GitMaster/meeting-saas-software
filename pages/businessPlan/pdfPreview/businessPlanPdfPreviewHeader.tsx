import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { useTimeController } from '@mm/core/date'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { TextEllipsis, toREM, useTheme } from '@mm/core-web/ui'

import { IBusinessPlanPdfPreviewViewData } from './businessPlanPdfPreviewTypes'

export const BusinessPlanPdfPreviewHeader = observer(
  (props: { getData: () => IBusinessPlanPdfPreviewViewData }) => {
    const { getData } = props

    const theme = useTheme()
    const terms = useBloomCustomTerms()
    const { getSecondsSinceEpochUTC } = useTimeController()

    return (
      <div
        css={css`
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          width: 100%;
          padding: ${theme.sizes.spacing24} ${theme.sizes.spacing24} 0
            ${theme.sizes.spacing24};
        `}
      >
        <div
          css={css`
            display: inline-flex;
            align-items: center;
            width: 100%;
          `}
        >
          {getData().currentOrgAvatar && (
            <StyledOrgAvatarPicture
              // Note - with pdf generation we have issues with caching and rendering images correctly on pdfs. This
              // applies a timestamp query param to prevent caching and crossOrigin attribute to render them correctly.
              crossOrigin='anonymous'
              src={
                `${getData().currentOrgAvatar}?_${getSecondsSinceEpochUTC()}` ||
                ''
              }
            />
          )}
          <TextEllipsis
            lineLimit={1}
            weight={'semibold'}
            type={'h1'}
            css={css`
              padding-left: ${getData().currentOrgAvatar
                ? theme.sizes.spacing8
                : 0};
            `}
          >
            {getData().currentOrgName}
          </TextEllipsis>
        </div>
        <div
          css={css`
            display: inline-flex;
            align-items: center;
            width: 100%;
          `}
        >
          <TextEllipsis
            lineLimit={1}
            weight={'semibold'}
            type={'h2'}
            css={css`
              padding-top: ${theme.sizes.spacing4};
            `}
          >
            {getData().businessPlan?.title || ''}
            {': '}
            {`${terms.futureFocus.singular} & ${terms.shortTermFocus.singular}`}
          </TextEllipsis>
        </div>
      </div>
    )
  }
)

const StyledOrgAvatarPicture = styled.img`
  vertical-align: top;
  overflow: hidden;
  border-radius: ${(props) => props.theme.sizes.br6};
  width: ${toREM(70)};
  height: ${toREM(70)};
  display: inline-flex;
  justify-content: center;
  align-items: center;
  object-fit: cover;
  object-position: top;
  image-rendering: auto;

  /* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
  -webkit-print-color-adjust: exact;
  /* stylelint-enable value-no-vendor-prefix, property-no-vendor-prefix */
`
