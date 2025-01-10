import { observer } from 'mobx-react'
import React, { useCallback } from 'react'

import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import {
  IErrorDrawerActionHandlers,
  IErrorDrawerContainerProps,
} from './errorDrawerTypes'

export const ErrorDrawerContainer = observer(function ErrorDrawerContainer(
  props: IErrorDrawerContainerProps
) {
  const { closeOverlazy } = useOverlazyController()

  const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()
  const onHandleGoBack: IErrorDrawerActionHandlers['onHandleGoBack'] =
    useCallback(() => {
      closeOverlazy({ type: 'Drawer' })
    }, [closeOverlazy])

  const Component = props.children
  return (
    <Component
      data={{
        title: props.title,
        retry: props.retry,
        drawerView,
        drawerIsRenderedInMeeting,
      }}
      actionHandlers={{ onHandleGoBack }}
    />
  )
})
