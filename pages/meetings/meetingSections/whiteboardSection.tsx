import { observer } from 'mobx-react'
import React from 'react'

import { IWhiteboardSectionProps } from '@mm/bloom-web/whiteboard/whiteboardSectionType'
import { WhiteboardSectionView } from '@mm/bloom-web/whiteboard/whiteboardSectionView'

export const WhiteboardSection = observer(function WhiteboardSection(
  props: IWhiteboardSectionProps
) {
  return <WhiteboardSectionView {...props} />
})
