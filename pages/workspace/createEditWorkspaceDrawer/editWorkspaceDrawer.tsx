import { observer } from 'mobx-react'
import React from 'react'

import type { Id } from '@mm/gql'

import { EditWorkspaceDrawerContainer } from './editWorkspaceDrawerContainer'
import { EditWorkspaceDrawerView } from './editWorkspaceDrawerView'

interface IEditWorkspaceDrawerProps {
  workspaceId: Id
}

export const EditWorkspaceDrawer = observer(function EditWorkspaceDrawer(
  props: IEditWorkspaceDrawerProps
) {
  return (
    <EditWorkspaceDrawerContainer workspaceId={props.workspaceId}>
      {EditWorkspaceDrawerView}
    </EditWorkspaceDrawerContainer>
  )
})

export default EditWorkspaceDrawer
