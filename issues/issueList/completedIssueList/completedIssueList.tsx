import React from 'react'

import { CompletedIssueListContainer } from './completedIssueListContainer'
import { CompletedIssueListView } from './completedIssueListView'
import { ICompletedIssueListContainerProps } from './completedIssueListViewTypes'

export const CompletedIssueList = (
  props: BOmit<ICompletedIssueListContainerProps, 'children'>
) => {
  return (
    <CompletedIssueListContainer {...props}>
      {CompletedIssueListView}
    </CompletedIssueListContainer>
  )
}
