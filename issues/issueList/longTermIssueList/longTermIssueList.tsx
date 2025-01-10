import { observer } from 'mobx-react'
import React from 'react'

import { LongTermIssueListContainer } from './longTermIssueListContainer'
import { LongTermIssueListView } from './longTermIssueListView'
import { ILongTermIssueListContainerProps } from './longTermIssueListViewTypes'

export const LongTermIssueList = observer(
  (props: BOmit<ILongTermIssueListContainerProps, 'children'>) => {
    return (
      <LongTermIssueListContainer {...props}>
        {LongTermIssueListView}
      </LongTermIssueListContainer>
    )
  }
)
