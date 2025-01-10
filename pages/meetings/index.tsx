import { observer } from 'mobx-react'
import React from 'react'

import { MeetingPageContainer } from './meetingPageContainer'
import { MeetingPageView } from './meetingPageView'

export * from './meetingPageTypes'
export * from './meetingSections'

export default observer(function MeetingPage() {
  return <MeetingPageContainer>{MeetingPageView}</MeetingPageContainer>
})
