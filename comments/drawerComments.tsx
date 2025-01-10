import React from 'react'

import DrawerCommentsContainer from './drawerCommentsContainer'
import { IDrawerCommentsContainerProps } from './drawerCommentsTypes'
import DrawerCommentsView from './drawerCommentsView'

export const DrawerComments = React.forwardRef<
  HTMLDivElement,
  Omit<IDrawerCommentsContainerProps, 'children' | 'commentsRef'>
>(function DrawerComments(props, ref) {
  return (
    <DrawerCommentsContainer {...props} commentsRef={ref}>
      {DrawerCommentsView}
    </DrawerCommentsContainer>
  )
})
