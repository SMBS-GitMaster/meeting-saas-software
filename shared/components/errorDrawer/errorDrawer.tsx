import { observer } from 'mobx-react'
import React from 'react'

import { ErrorDrawerContainer } from './errorDrawerContainer'
import { IErrorDrawerProps } from './errorDrawerTypes'
import { ErrorDrawerView } from './errorDrawerView'

export const ErrorDrawer = observer(function ErrorDrawer(
  props: IErrorDrawerProps
) {
  return (
    <ErrorDrawerContainer title={props.title} retry={props.retry}>
      {ErrorDrawerView}
    </ErrorDrawerContainer>
  )
})
