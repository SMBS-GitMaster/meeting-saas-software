import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { type TMeetingType } from '@mm/core-bloom'

import { IssueList } from '@mm/bloom-web/issues'

interface IIssuesSectionProps {
  meetingId: Id
  workspaceTileId: Maybe<Id>
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  meetingType: TMeetingType
}

export const IssuesSection = observer(function IssuesSection(
  props: IIssuesSectionProps
) {
  return <IssueList {...props} />
})
