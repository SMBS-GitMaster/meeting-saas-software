import { observer } from 'mobx-react'
import React from 'react'

import { CreateMeetingContainer } from './createMeetingContainer'
import { CreateMeetingView } from './createMeetingView'

export default observer(function CreateMeeting() {
  return <CreateMeetingContainer>{CreateMeetingView}</CreateMeetingContainer>
})
