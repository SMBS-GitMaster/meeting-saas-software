import React from 'react'
import { css } from 'styled-components'

import { Expandable, QuickAddTextInput } from '@mm/core-web/ui'

export function QuickAddTextInputDemo() {
  const [value, setValue] = React.useState('')
  return (
    <Expandable title='Quick Add Text Input'>
      <QuickAddTextInput
        css={css`
          width: 680px;
        `}
        value={value}
        onChange={setValue}
        id='quickAddTextInput'
        placeholder='Create a quick Headline'
        name='quickAddTextInput'
        onEnter={(value) => {
          alert(`Text entered: ${value}`)
          setValue('')
        }}
        instructions={
          <>
            Press <strong>enter</strong> to add new Headline
          </>
        }
      />
    </Expandable>
  )
}
