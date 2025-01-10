import { observer } from 'mobx-react'
import React from 'react'

import { Id } from '@mm/gql'

import { type EMeetingPageType, type TMeetingType } from '@mm/core-bloom'

import { SpecialSessionsSectionView } from '../specialSessions'

interface ISpecialSessionsSectionData {
  getPageToDisplayData: () => Maybe<{
    id: Id
    pageType: EMeetingPageType
    externalPageUrl: Maybe<string>
    noteboxPadId: Maybe<Id>
    subheading: Maybe<string>
    pageName: string
  }>
  getAgendaData: () => {
    agendaIsCollapsed: boolean
  }
  meetingId: Id
  meetingType: TMeetingType
  className?: string
}

export const SpecialSessionsSection = observer(function SpecialSessionsSection(
  props: ISpecialSessionsSectionData
) {
  return (
    <SpecialSessionsSectionView
      data={{
        getPageToDisplayData: props.getPageToDisplayData,
        meetingId: props.meetingId,
        meetingType: props.meetingType,
        getAgendaData: props.getAgendaData,
      }}
      className={props.className}
    />
  )
})
