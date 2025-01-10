import { observer } from 'mobx-react'
import React from 'react'

import { useTranslation } from '@mm/core-web'

import { BloomHeader } from '@mm/bloom-web/pages/layout/header/bloomHeader'
import { MeetingWorkspaceSwitchButton } from '@mm/bloom-web/pages/layout/meetingTopNav'
import { type TMeetingTab } from '@mm/bloom-web/pages/meetings'

interface IQuarterlyAlignmentPageHeaderProps {
  activeTab: TMeetingTab
  onSetActiveTab: (tab: TMeetingTab) => void
}

export const QuarterlyAlignmentPageHeader = observer(
  function QuarterlyAlignmentPageHeader(
    props: IQuarterlyAlignmentPageHeaderProps
  ) {
    const { t } = useTranslation()

    return (
      <BloomHeader
        title={t('Quarterly alignment')}
        defaultPropsForDrawers={{ meetingId: null }}
        middleSection={
          <MeetingWorkspaceSwitchButton
            activeTab={props.activeTab}
            isOngoingMeeting={false}
            setActiveTab={props.onSetActiveTab}
          />
        }
      />
    )
  }
)
