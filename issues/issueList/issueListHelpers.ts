import { type Id } from '@mm/gql'

import { ICompletedIssueListViewData } from './completedIssueList/completedIssueListViewTypes'
import { IIssueListViewData } from './issueListTypes'
import { ILongTermIssueListViewData } from './longTermIssueList/longTermIssueListViewTypes'

export const getIssueNumberLookupMap = <
  IssueListType extends
    | ReturnType<IIssueListViewData['getShortTermIssues']>
    | ILongTermIssueListViewData['longTermIssues']
    | ICompletedIssueListViewData['completedIssues'],
>(
  issuesToNumber: IssueListType
) => {
  const issueIdToIssueNumberMap: Record<Id, number> = [...issuesToNumber.nodes]
    .sort((a, b) => a.dateCreated - b.dateCreated)
    .reduce(
      (lookup, sortedIssue, index) => {
        lookup[sortedIssue.id] = index + 1
        return lookup
      },
      {} as Record<Id, number>
    )

  return issueIdToIssueNumberMap
}
