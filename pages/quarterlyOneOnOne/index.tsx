import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useBrowserEnvironment } from '@mm/core-web/envs'

import { BloomHeader } from '../layout/header/bloomHeader'

export default function QuarterlyOneOnOnePage() {
  const { v1Url } = useBrowserEnvironment()
  const terms = useBloomCustomTerms()

  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={null}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <iframe
        src={`${v1Url}People/QuarterlyConversation?noheading=true`}
        title={terms.quarterlyOneOnOne.singular}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
        `}
      />
    </>
  )
}
