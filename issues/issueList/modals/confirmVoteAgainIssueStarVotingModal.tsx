import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Text, toREM } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface IConfirmVoteAgainIssueStarVotingModalProps {
  voteAgainClicked: () => void
}

export const ConfirmVoteAgainIssueStarVotingModal = observer(
  function ConfirmVoteAgainIssueStarVotingModal(
    props: IConfirmVoteAgainIssueStarVotingModalProps
  ) {
    const { closeOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    return (
      <Modal
        id={'ConfirmVoteAgainIssueStarVotingModal'}
        onHide={() => {
          closeOverlazy({
            type: 'Modal',
            name: 'ConfirmVoteAgainIssueStarVotingModal',
          })
        }}
      >
        <Modal.Header
          css={css`
            width: ${toREM(460)};
          `}
        >
          <Modal.Title
            css={css`
              width: ${toREM(420)};
            `}
          >
            {t('Are you sure you want to vote again?')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Text>
            {t('Everyone’s vote will reset and you will lose the tally. ')}
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <BtnText
            intent='tertiary'
            ariaLabel={t('Cancel')}
            onClick={() => {
              closeOverlazy({
                type: 'Modal',
                name: 'ConfirmVoteAgainIssueStarVotingModal',
              })
            }}
          >
            {t('Cancel')}
          </BtnText>
          <BtnText
            intent='primary'
            ariaLabel={t('Yes, vote again')}
            onClick={() => {
              props.voteAgainClicked()
              closeOverlazy({
                type: 'Modal',
                name: 'ConfirmVoteAgainIssueStarVotingModal',
              })
            }}
          >
            {t('Yes, vote again')}
          </BtnText>
        </Modal.Footer>
      </Modal>
    )
  }
)

export default ConfirmVoteAgainIssueStarVotingModal
