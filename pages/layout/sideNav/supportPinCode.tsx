import React from 'react'
import { css } from 'styled-components'

import { useWindowNavigator } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Icon, Text, Tooltip, toREM, useTheme } from '@mm/core-web/ui'

interface IPinProps {
  code: string
}

export const SupportPinCode = ({ code }: IPinProps) => {
  const { t } = useTranslation()
  const { clipboard } = useWindowNavigator()
  const [isCodeCopied, setIsCodeCopied] = React.useState(false)
  const theme = useTheme()

  const copyPinCodeHandler = () => {
    clipboard.writeText(code)
    setIsCodeCopied(true)
    const timeoutId = setTimeout(() => {
      setIsCodeCopied(false)
      clearTimeout(timeoutId)
    }, 3000)
  }

  return (
    <BtnText
      ariaLabel={t('Support pin')}
      fontWeight='normal'
      tooltip={{
        msg: <PinCodeCopiedMsg message={t('Link copied')} />,
        type: 'lighter',
        position: 'top left',
        isOpen: isCodeCopied,
        contentCss: css`
          &.tippy-box {
            box-shadow: ${theme.sizes.bs4};
          }

          .tippy-arrow {
            display: none;
          }
        `,
      }}
      tooltipWrapperCss={css`
        display: inline-block;
      `}
      css={css`
        border-color: ${({ theme }) => theme.colors.pinCodeBorderColor};
        padding: ${({ theme }) => theme.sizes.spacing4};
      `}
      onClick={copyPinCodeHandler}
    >
      <Tooltip position='top center' msg={t('Copy pin')} offset={toREM(8)}>
        <span
          css={`
            display: flex;
            align-items: center;
          `}
        >
          <Icon iconName='hyperlinkIcon' />
          <Text>{code}</Text>
        </span>
      </Tooltip>
    </BtnText>
  )
}

const PinCodeCopiedMsg = ({ message }: { message: string }) => {
  const theme = useTheme()
  return (
    <span
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <Icon
        iconName='checkCircleOnEnabled'
        iconColor={{
          color: theme.colors.pinCodeCheckIconColor,
        }}
        checkmarkColor={{
          color: theme.colors.pinCodeCheckMarkColor,
        }}
        iconSize='md'
        css={`
          line-height: 0;
        `}
      />
      <span
        css={css`
          display: inline-block;
          padding: ${({ theme }) => `0 ${theme.sizes.spacing4}`};
        `}
      >
        {message}
      </span>
    </span>
  )
}
