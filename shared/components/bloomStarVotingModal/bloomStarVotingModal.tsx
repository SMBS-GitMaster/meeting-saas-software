import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useWindow } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web'

import { Modal, Text, toREM } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useBloomPostMessage } from '../../hooks/useBloomPostMessage'

interface IBloomStarVotingModalProps {
  isAutoOpened?: boolean
  meetingId: string | number
  onClose?: () => void
}

export const BloomStarVotingModal = observer(function BloomStarVotingModal(
  props: IBloomStarVotingModalProps
) {
  const { closeOverlazy } = useOverlazyController()

  const { sendMessage } = useBloomPostMessage()
  const window = useWindow()
  const { t } = useTranslation()

  const onCloseModal = () => {
    if (props.onClose) props.onClose()
    closeOverlazy({
      type: 'Modal',
      name: 'BloomStarVotingModal',
    })
    sendMessage({
      popup: 'starVotingModal',
      isOpen: false,
    })
  }

  const onRedirectToV3 = () => {
    const meetingUrl = window.location.origin + '/meetings/' + props.meetingId
    window.parent.location.href = meetingUrl
  }

  return (
    <Modal
      id={'BloomStarVotingModal'}
      onHide={onCloseModal}
      contentCss={css`
        border-radius: ${toREM(4)};
        padding: ${toREM(24)};
        min-width: ${toREM(480)};
        position: relative;
      `}
    >
      <Modal.CloseModal onClick={onCloseModal} />
      <Modal.Body
        css={css`
          display: flex;
          flex-direction: column;
          padding: 0;
          gap: ${toREM(32)};
        `}
      >
        <div>
          <Text type='h3' display='block'>
            {t('Use the new star voting experience!')}
          </Text>
          <Text
            type='body'
            display='block'
            css={css`
              padding-top: ${toREM(16)};
            `}
          >
            {t('This version of Bloom now only supports Priority voting.')}
          </Text>
          <Text type='body' display='block'>
            {t('Toggle over to try out new Star voting experience.')}
          </Text>
        </div>
        <button
          type='button'
          css={css`
            padding: ${toREM(10)} ${toREM(32)};
            border-radius: ${toREM(4)};
            background-color: #00ccc5;
            border: none;
            max-width: ${toREM(140)};
            margin-left: auto;
            cursor: pointer;
          `}
          onClick={onRedirectToV3}
        >
          <Text type='body' weight='semibold'>
            {t('Star voting')}
          </Text>
        </button>
      </Modal.Body>
    </Modal>
  )
})

export default BloomStarVotingModal
