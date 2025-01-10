import React from 'react'

import { SentIssueListContainer } from './sentIssueListContainer'
import { SentIssueListView } from './sentIssueListView'
import { ISentIssueListContainerProps } from './types'

export const SentIssueList = (
  props: BOmit<ISentIssueListContainerProps, 'children'>
) => {
  return (
    <SentIssueListContainer {...props}>
      {SentIssueListView}
    </SentIssueListContainer>
  )
}
