import { observer } from 'mobx-react'
import React from 'react'

import { QuarterlyAlignmentPageContainer } from './quarterlyAlignmentPageContainer'
import { QuarterlyAlignmentPageView } from './quarterlyAlignmentPageView'

export const QuarterlyAlignmentPage = observer(
  function QuarterlyAlignmentPage() {
    return (
      <QuarterlyAlignmentPageContainer>
        {QuarterlyAlignmentPageView}
      </QuarterlyAlignmentPageContainer>
    )
  }
)

export default QuarterlyAlignmentPage
