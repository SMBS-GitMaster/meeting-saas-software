import { observer } from 'mobx-react'
import React from 'react'
import { Helmet } from 'react-helmet-async'

import { useTranslation } from '@mm/core-web'

import { QuarterlyAlignmentMeeting } from './quarterlyAlignmentMeeting/quarterlyAlignmentMeeting'
import { QuarterlyAlignmentPageHeader } from './quarterlyAlignmentPageHeader'
import { IQuarterlyAlignmentPageViewProps } from './quarterlyAlignmentPageTypes'
import { QuarterlyAlignmentWorkspace } from './quarterlyAlignmentWorkspace/quarterlyAlignmentWorkspace'

export const QuarterlyAlignmentPageView = observer(
  function QuarterlyAlignmentPageView(props: IQuarterlyAlignmentPageViewProps) {
    const { t } = useTranslation()

    return (
      <>
        <Helmet>
          <title>{t('Quarterly alignment')}</title>
        </Helmet>
        <QuarterlyAlignmentPageHeader
          activeTab={props.data().pageState.activeTab}
          onSetActiveTab={props.actions().onSetActiveTab}
        />
        {props.data().pageState.activeTab === 'MEETING' && (
          <QuarterlyAlignmentMeeting />
        )}
        {props.data().pageState.activeTab === 'WORKSPACE' && (
          <QuarterlyAlignmentWorkspace data={props.data} />
        )}
      </>
    )
  }
)
