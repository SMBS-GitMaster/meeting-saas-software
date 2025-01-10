import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useBrowserEnvironment } from '@mm/core-web/envs'

import { BloomHeader } from '../layout/header/bloomHeader'

export default function RightPersonRightSeatPage() {
  const { v1Url } = useBrowserEnvironment()
  const terms = useBloomCustomTerms()

  return (
    <>
      <BloomHeader
        alwaysShowBoxShadow
        title={terms.rightPersonRightSeat.singular}
        defaultPropsForDrawers={{ meetingId: null }}
      />
      <iframe
        src={`${v1Url}People/PeopleAnalyzer?noheading=true`}
        title={terms.rightPersonRightSeat.singular}
        css={css`
          width: 100%;
          height: 100%;
          border: 0;
        `}
      />
    </>
  )
}
