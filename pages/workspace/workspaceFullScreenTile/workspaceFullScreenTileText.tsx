import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { Card, Text } from '@mm/core-web/ui'

export const WorkspaceFullScreenTileText = observer(
  function WorkspaceFullScreenTileText() {
    const { t } = useTranslation()

    return (
      <Card
        css={css`
          height: 100%;
        `}
      >
        <div
          css={css`
            align-items: center;
            display: flex;
            height: 100%;
            justify-content: center;
            width: 100%;
          `}
        >
          <Text>{t(`You are viewing this tile in full screen.`)}</Text>
        </div>
      </Card>
    )
  }
)
