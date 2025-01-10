import { observer } from 'mobx-react'
import React from 'react'

import { IExternalPageLinkViewProps } from '@mm/bloom-web/externalPage/externalPageSectionTypes'
import { ExternalPageSectionView } from '@mm/bloom-web/externalPage/externalPageSectionView'

export const ExternalPageMeetingSection = observer(
  function ExternalPageMeetingSection(props: IExternalPageLinkViewProps) {
    return <ExternalPageSectionView {...props} />
  }
)
