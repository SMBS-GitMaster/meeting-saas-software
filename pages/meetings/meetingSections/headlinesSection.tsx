import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { HeadlinesList } from '@mm/bloom-web/headlines'

interface IHeadlinesSectionProps {
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  meetingId: Id
  meetingPageName: string
  className?: string
}

export const HeadlinesSection = observer(function HeadlinesSection(
  props: IHeadlinesSectionProps
) {
  return <HeadlinesList {...props} workspaceTileId={null} />
})
