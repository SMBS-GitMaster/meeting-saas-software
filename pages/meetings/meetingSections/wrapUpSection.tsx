import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'

import { WrapUp } from '@mm/bloom-web/wrapUp'

interface IWrapUpSectionProps {
  meetingId: Id
  getPageToDisplayData: () => Maybe<{ pageName: string }>
  onConclude: () => void
}

export const WrapUpSection = observer(function WrapUpSection(
  props: IWrapUpSectionProps
) {
  return <WrapUp {...props} />
})
