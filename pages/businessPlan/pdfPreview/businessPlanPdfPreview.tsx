import { observer } from 'mobx-react'
import React from 'react'

import { BusinessPlanPdfPreviewContainer } from './businessPlanPdfPreviewContainer'
import { IBusinessPlanPdfPreviewProps } from './businessPlanPdfPreviewTypes'
import { BusinessPlanPdfPreviewView } from './businessPlanPdfPreviewView'

export const BusinessPlanPdfPreview = observer(function BusinessPlanPdfPreview(
  props: IBusinessPlanPdfPreviewProps
) {
  return (
    <BusinessPlanPdfPreviewContainer {...props}>
      {BusinessPlanPdfPreviewView}
    </BusinessPlanPdfPreviewContainer>
  )
})
