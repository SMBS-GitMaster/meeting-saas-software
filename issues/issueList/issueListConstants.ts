import { ValidSortForNode } from '@mm/gql'
import { Id } from '@mm/gql'

import { i18n } from '@mm/core/i18n'

import { BloomCustomTerms } from '@mm/core-bloom'

import { BloomIssueNode } from '@mm/core-bloom/issues/issueNode'
import { BloomIssueSentToNode } from '@mm/core-bloom/issues/issueSentToNode'

import {
  IssueBreadcrumbStateType,
  IssueListSortType,
  TIssueListTabType,
} from './issueListTypes'

export const STAR_NUMBER = 5

export const ISSUE_LIST_SORTING_OPTS: Array<{
  text: string
  value: IssueListSortType
}> = [
  { text: i18n.t('Owner: A-Z'), value: 'ASSIGNEE_ASC' },
  { text: i18n.t('Owner: Z-A'), value: 'ASSIGNEE_DESC' },
  { text: i18n.t('Newest'), value: 'NEWEST' },
  { text: i18n.t('Oldest'), value: 'OLDEST' },
  { text: i18n.t('By votes'), value: 'VOTES' },
  { text: i18n.t('Priority'), value: 'PRIORITY' },
]

export const ISSUE_LIST_SORT_BY_VALUE: Record<
  IssueListSortType,
  ValidSortForNode<BloomIssueNode>
> = {
  ASSIGNEE_ASC: { assignee: { fullName: 'asc' } },
  ASSIGNEE_DESC: { assignee: { fullName: 'desc' } },
  NEWEST: { dateCreated: 'desc' },
  OLDEST: { dateCreated: 'asc' },
  VOTES: { numStarVotes: 'desc' },
  PRIORITY: { priorityVoteRank: 'asc' },
}

export const ISSUE_LIST_SORT_BY_VALUE_FOR_SENT_TO_ISSUES: Record<
  IssueListSortType,
  ValidSortForNode<BloomIssueSentToNode>
> = {
  ASSIGNEE_ASC: { assignee: { fullName: 'asc' } },
  ASSIGNEE_DESC: { assignee: { fullName: 'desc' } },
  NEWEST: { issue: { dateCreated: 'desc' } },
  OLDEST: { issue: { dateCreated: 'asc' } },
  VOTES: { issue: { numStarVotes: 'desc' } },
  PRIORITY: { issue: { priorityVoteRank: 'asc' } },
}

export type TIssueListTabValue = { text: string; value: TIssueListTabType }

export const issueListTabs: Record<TIssueListTabType, TIssueListTabValue> = {
  SHORT_TERM: {
    text: i18n.t('Short term'),
    value: 'SHORT_TERM',
  },
  LONG_TERM: {
    text: i18n.t('Long term'),
    value: 'LONG_TERM',
  },
  RECENTLY_SOLVED: {
    text: i18n.t('Recently solved'),
    value: 'RECENTLY_SOLVED',
  },
  SENT_TO: {
    text: i18n.t('Sent'),
    value: 'SENT_TO',
  },
}

export function getBreadcrumbByState(opts: {
  meetingPageName: string
}): Record<IssueBreadcrumbStateType, Array<string>> {
  const { meetingPageName } = opts
  return {
    VIEWING_ARCHIVE: [meetingPageName, i18n.t('Archived')],
    VIEWING_MOVED: [meetingPageName, i18n.t('Sent to other meetings')],
    DEFAULT: [meetingPageName],
  }
}

export const getIssueListHeaderPortalOutId = (opts: { meetingId: Id }) => {
  return `issue-list-header-portal-out_${opts.meetingId}`
}

export const getCustomIssueErrorMessage = (opts: {
  message: string
  terms: BloomCustomTerms
}) => {
  switch (opts.message) {
    case 'ISSUE_ALREADY_RANKED':
      return i18n.t('{{issue}} is already ranked', {
        issue: opts.terms.issue.singular,
      })
    case 'MAX_RANKS_EXCEEDED':
      return i18n.t('Solve {{issues}} to prioritize more', {
        issues: opts.terms.issue.lowercasePlural,
      })
    default:
      return null
  }
}
