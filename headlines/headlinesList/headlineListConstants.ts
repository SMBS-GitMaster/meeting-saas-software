import { ValidSortForNode } from '@mm/gql'

import { BloomHeadlineNode } from '@mm/core-bloom'

import { HeadlinesListSortingType } from './headlinesListTypes'

export const HEALDINES_LIST_SORT_BY_OPTS: Record<
  HeadlinesListSortingType,
  ValidSortForNode<BloomHeadlineNode>
> = {
  ASSIGNEE_ASC: { assignee: { fullName: 'asc' } },
  ASSIGNEE_DESC: { assignee: { fullName: 'desc' } },
  NEWEST: { dateCreated: 'desc' },
  OLDEST: { dateCreated: 'asc' },
}
