import { observer } from 'mobx-react'
import React from 'react'

import { EditIssueDrawerContainer } from './editIssueDrawerContainer'
import { IEditIssueDrawerProps } from './editIssueDrawerTypes'
import { EditIssueDrawerView } from './editIssueDrawerView'

export const EditIssueDrawer = observer(function EditIssueDrawer(
  props: IEditIssueDrawerProps
) {
  return (
    <EditIssueDrawerContainer
      issueId={props.issueId}
      meetingId={props.meetingId}
      viewOnlyDrawerMode={props.viewOnlyDrawerMode}
    >
      {EditIssueDrawerView}
    </EditIssueDrawerContainer>
  )
})

export default EditIssueDrawer
