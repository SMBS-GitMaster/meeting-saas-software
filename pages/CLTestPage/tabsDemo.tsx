import React from 'react'
import { css } from 'styled-components'

import { Expandable, Tabs } from '@mm/core-web/ui/components'

export function TabsDemo() {
  return (
    <Expandable title='Tabs'>
      <Tabs
        activeTabId={'123'}
        backgroundColor='#FAFAFA'
        tabs={new Array(100).fill(0).map((_, i) => ({
          id: `tab-${i}`,
          name: `Tab ${i}`,
        }))}
        renderTabButton={(tab) => (
          <button
            type='button'
            css={css`
              padding: 10px;
              margin: 10px;
            `}
          >
            {tab.name}
          </button>
        )}
      />
    </Expandable>
  )
}
