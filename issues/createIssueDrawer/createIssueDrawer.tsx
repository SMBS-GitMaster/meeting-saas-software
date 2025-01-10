import { observer } from 'mobx-react'
import React from 'react'

import { CreateIssueDrawerContainer } from './createIssueDrawerContainer'
import { ICreateIssueDrawerProps } from './createIssueDrawerTypes'
import { CreateIssueDrawerView } from './createIssueDrawerView'

export const CreateIssueDrawer = observer(function CreateIssueDrawer(
  props: ICreateIssueDrawerProps
) {
  return (
    <CreateIssueDrawerContainer
      meetingId={props.meetingId}
      context={props.context}
      isUniversalAdd={props.isUniversalAdd}
      initialItemValues={props.initialItemValues}
    >
      {CreateIssueDrawerView}
    </CreateIssueDrawerContainer>
  )
})
