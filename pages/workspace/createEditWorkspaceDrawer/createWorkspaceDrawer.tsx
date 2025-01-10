import { observer } from 'mobx-react'
import React from 'react'

import { CreateWorkspaceDrawerContainer } from './createWorkspaceDrawerContainer'
import { CreateWorkspaceDrawerView } from './createWorkspaceDrawerView'

export const CreateWorkspaceDrawer = observer(function CreateWorkspaceDrawer() {
  return (
    <CreateWorkspaceDrawerContainer>
      {CreateWorkspaceDrawerView}
    </CreateWorkspaceDrawerContainer>
  )
})

export default CreateWorkspaceDrawer
