import { observer } from 'mobx-react'
import React from 'react'

import { IQuarterlytAlignmentPageData } from '../quarterlyAlignmentPageTypes'
import { QuarterlyAlignmentWorkspaceContainer } from './quarterlyAlignmentWorkspaceContainer'
import { QuarterlyAlignmentWorkspaceView } from './quarterlyAlignmentWorkspaceView'

interface IQuarterlyAlignmentWorkspaceProps {
  data: () => IQuarterlytAlignmentPageData
}

export const QuarterlyAlignmentWorkspace = observer(
  function QuarterlyAlignmentWorkspace(
    props: IQuarterlyAlignmentWorkspaceProps
  ) {
    return (
      <QuarterlyAlignmentWorkspaceContainer {...props}>
        {QuarterlyAlignmentWorkspaceView}
      </QuarterlyAlignmentWorkspaceContainer>
    )
  }
)
