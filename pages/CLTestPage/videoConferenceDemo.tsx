import React from 'react'

import { Expandable } from '@mm/core-web/ui'

import { VideoConferenceLinkButton } from '@mm/bloom-web/shared/components'

export function VideoConferenceDemo(): React.ReactElement {
  return (
    <Expandable title='Video Conference Link Button'>
      <div>
        <h5>Normal button</h5>
        <VideoConferenceLinkButton
          meetingId={'mock-meeting-id-1'}
          key='video-conference-button'
        />
      </div>
      <br />
      <div>
        <h5>Small button (variant)</h5>
        <VideoConferenceLinkButton
          meetingId={'mock-meeting-id-1'}
          key='video-conference-button-small'
          smallButton
        />
      </div>
    </Expandable>
  )
}
