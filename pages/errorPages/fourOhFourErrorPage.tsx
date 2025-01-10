import React, { useCallback } from 'react'
import { css } from 'styled-components'

import { useNavigation } from '@mm/core-web/router'
import { FourOhFourError } from '@mm/core-web/ui'

import { paths } from '@mm/bloom-web/router/paths'

export default function FourOhFourPage() {
  const { navigate } = useNavigation()

  const onHandleGoBack = useCallback(() => {
    navigate(paths.home)
  }, [navigate])

  return (
    <div
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 100vh;
      `}
    >
      <FourOhFourError onHandleGoBack={onHandleGoBack} />
    </div>
  )
}
