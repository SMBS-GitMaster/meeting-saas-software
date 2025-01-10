import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { SomethingWentWrongError } from '@mm/core-web/ui'

export const SomethingWentWrongErrorPage = observer(
  function SomethingWentWrongErrorPage(props: { onRetry: () => void }) {
    return (
      <div
        css={css`
          height: 100vh;
        `}
      >
        <SomethingWentWrongError
          addGoHomeOption
          onRetry={props.onRetry}
          addRetryDelay
        />
      </div>
    )
  }
)
