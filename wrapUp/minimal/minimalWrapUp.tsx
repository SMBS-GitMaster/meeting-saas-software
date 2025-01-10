import React from 'react'

import { MinimalWrapUpContainer } from './minimalWrapUpContainer'
import { IMinimalWrapUpContainerProps } from './minimalWrapUpTypes'
import { MinimalWrapUpView } from './minimalWrapUpView'

export function MinimalWrapUp(
  props: Omit<IMinimalWrapUpContainerProps, 'children'>
) {
  return (
    <MinimalWrapUpContainer {...props}>
      {MinimalWrapUpView}
    </MinimalWrapUpContainer>
  )
}
