import React from 'react'

import { ITextInputProps, TextInput } from '@mm/core-web/ui'

type InlineTextInputProps = Omit<ITextInputProps, 'onKeyDown'> & {
  onEnter?: (
    e: React.KeyboardEvent<HTMLDivElement>,
    value: Maybe<string> | undefined
  ) => void
}
export const InlineTextInput = (props: InlineTextInputProps) => {
  const { onEnter, value, ...restProps } = props
  const handleKeyDown = React.useCallback(
    (e) => {
      const didPressEnterKey = e.key === 'Enter' || e.keyCode === 13

      if (didPressEnterKey) {
        // prevent multiline text input
        e.preventDefault()
        onEnter && onEnter(e, value)
      }
    },
    [onEnter, value]
  )
  return <TextInput value={value} onKeyDown={handleKeyDown} {...restProps} />
}
