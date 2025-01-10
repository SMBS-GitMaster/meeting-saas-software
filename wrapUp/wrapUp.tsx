import React from 'react'

import { WrapUpContainer } from './wrapUpContainer'
import { IWrapUpContainerProps } from './wrapUpTypes'
import { WrapUpView } from './wrapUpView'

export * from './wrapUpView'
export * from './wrapUpTypes'

export function WrapUp(props: Omit<IWrapUpContainerProps, 'children'>) {
  return <WrapUpContainer {...props}>{WrapUpView}</WrapUpContainer>
}
