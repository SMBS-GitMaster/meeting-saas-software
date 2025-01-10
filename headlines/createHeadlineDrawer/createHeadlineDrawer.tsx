import { observer } from 'mobx-react'
import React from 'react'

import CreateHeadlineDrawerContainer from './createHeadlineDrawerContainer'
import { ICreateHeadlineDrawerProps } from './createHeadlineDrawerTypes'
import CreateHeadlineDrawerView from './createHeadlineDrawerView'

export const CreateHeadlineDrawer = observer(function CreateHeadlineDrawer(
  props: ICreateHeadlineDrawerProps
) {
  return (
    <CreateHeadlineDrawerContainer {...props}>
      {CreateHeadlineDrawerView}
    </CreateHeadlineDrawerContainer>
  )
})
