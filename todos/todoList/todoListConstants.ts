import { ValidSortForNode } from '@mm/gql'

import { BloomTodoNode } from '@mm/core-bloom/todos'

import { TTodoListSortType } from './todoListTypes'

export const TODO_LIST_SORT_BY_VALUE: Record<
  TTodoListSortType,
  ValidSortForNode<BloomTodoNode>
> = {
  ASSIGNEE_ASC: { assignee: { fullName: 'asc' } },
  ASSIGNEE_DESC: { assignee: { fullName: 'desc' } },
  MEETING_ASC: { meeting: { name: 'asc' } },
  MEETING_DESC: { meeting: { name: 'desc' } },
  OVERDUE: { dateCreated: 'asc' },
  COMPLETED: { completed: 'desc' },
  NEWEST: { dateCreated: 'desc' },
  OLDEST: { dateCreated: 'asc' },
  TITLE: { title: 'asc' },
}
