import { observer } from 'mobx-react'
import React from 'react'

import { Expandable, Text } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { AttendeeManagementModal } from '@mm/bloom-web/shared/'

type MockProps = Parameters<typeof AttendeeManagementModal>[0]

const mockProps: MockProps = {
  meetingId: '123',
}

export const AttendeeManagementModalDemo = observer(
  function AttendeeManagementModalDemo() {
    const { openOverlazy } = useOverlazyController()

    return (
      <Expandable title='Attendee Management Modal'>
        <div>
          <br />
          <button
            type='button'
            onClick={() =>
              openOverlazy('AttendeeManagementModal', { ...mockProps })
            }
          >
            <Text>With full permissions (click to open)</Text>
          </button>

          <br />
          <br />

          <button
            type='button'
            onClick={() =>
              openOverlazy('AttendeeManagementModal', {
                ...mockProps,
              })
            }
          >
            <Text>With basic permissions (click to open)</Text>
          </button>
        </div>
      </Expandable>
    )
  }
)
