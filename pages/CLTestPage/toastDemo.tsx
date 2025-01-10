import React from 'react'

import { Expandable, TToastType } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const ToastDemo = () => {
  const { openOverlazy } = useOverlazyController()

  function openToast(type: TToastType) {
    if (type === 'error') {
      openOverlazy('Toast', {
        type: type,
        text: `This is a ${type} toast!`,
        error: new Error('Toast error'),
        errorInfo: {
          action: 'Toast Demo Error',
        },
      })
    } else {
      openOverlazy('Toast', {
        type: type,
        text: `This is a ${type} toast!`,
        undoClicked: () => console.log(`Undo clicked on ${type} toast!`),
      })
    }
  }

  return (
    <Expandable title='Toasts'>
      <>
        <button onClick={() => openToast('info')} type='button'>
          Open Info Toast
        </button>
        <button onClick={() => openToast('warning')} type='button'>
          Open Warning Toast
        </button>
        <button onClick={() => openToast('error')} type='button'>
          Open Error Toast
        </button>
        <button onClick={() => openToast('success')} type='button'>
          Open Success Toast
        </button>
      </>
    </Expandable>
  )
}
