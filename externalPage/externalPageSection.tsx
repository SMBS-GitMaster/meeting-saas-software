import { observer } from 'mobx-react'
import React from 'react'

import { ExternalPageSectionContainer } from './externalPageSectionContainer'
import { IExternalPageSectionContainerProps } from './externalPageSectionTypes'
import { ExternalPageSectionView } from './externalPageSectionView'

export const ExternalPageSection = observer(function ExternalPageSection(
  props: IExternalPageSectionContainerProps
) {
  return (
    <ExternalPageSectionContainer {...props}>
      {ExternalPageSectionView}
    </ExternalPageSectionContainer>
  )
})
