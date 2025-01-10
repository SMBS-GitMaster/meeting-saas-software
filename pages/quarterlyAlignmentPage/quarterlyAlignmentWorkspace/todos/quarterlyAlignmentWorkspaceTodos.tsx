import { observer } from 'mobx-react'
import React from 'react'

import { QuarterlyAlignmentWorkspaceTodosContainer } from './quarterlyAlignmentWorkspaceTodosContainer'
import { IQuarterlyAlignmentWorkspaceTodosProps } from './quarterlyAlignmentWorkspaceTodosTypes'
import { QuarterlyAlignmentWorkspaceTodosView } from './quarterlyAlignmentWorkspaceTodosView'

export const QuarterlyAlignmentWorkspaceTodos = observer(
  function QuarterlyAlignmentWorkspaceTodos(
    props: IQuarterlyAlignmentWorkspaceTodosProps
  ) {
    return (
      <QuarterlyAlignmentWorkspaceTodosContainer {...props}>
        {QuarterlyAlignmentWorkspaceTodosView}
      </QuarterlyAlignmentWorkspaceTodosContainer>
    )
  }
)
