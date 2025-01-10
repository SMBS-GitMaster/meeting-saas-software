import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { MeetingTodoList } from '@mm/bloom-web/todos'

export const TodosSection = observer(function TodosSection(props: {
  meetingId: Id
  getPageToDisplayData: () => Maybe<{ pageName: string }>
}) {
  return <MeetingTodoList {...props} workspaceTileId={null} />
})
