import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Text, toREM } from '@mm/core-web/ui'

interface IProps {
  onComplete: () => void
  onCancel: () => void
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Time = styled.div`
  font-size: ${toREM(53)};
  font-family: ${(props) => props.theme.fontFamily};
  padding: ${(props) => props.theme.sizes.spacing16};
  text-align: center;
`

export const Countdown = (props: IProps) => {
  const [value, setValue] = useState(3)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { t } = useTranslation()
  const { onComplete, onCancel } = props

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setValue((prev) => prev - 1)
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (value <= 0) {
      onComplete()
      clearInterval(intervalRef.current)
    }
  }, [value, onComplete])

  return (
    <Container>
      <Time>{value}</Time>
      <BtnText
        ariaLabel={t('Cancel countdown')}
        intent='tertiary'
        onClick={onCancel}
      >
        <Text>{t('Cancel')}</Text>
      </BtnText>
    </Container>
  )
}
