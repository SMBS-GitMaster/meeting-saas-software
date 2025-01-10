import React from 'react'

import { OverlazyProvider } from './overlazy/overlazyProvider'

export const BloomProvider = (props: { children: JSX.Element }) => {
  return (
    <>
      {props.children}
      <OverlazyProvider />
    </>
  )
}
