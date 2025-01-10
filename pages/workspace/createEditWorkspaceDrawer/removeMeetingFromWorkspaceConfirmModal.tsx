import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Modal, Text, toREM } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface IRemoveMeetingFromWorkspaceConfirmModalProps {
  numTilesThatWillBeRemoved: number
  onDeleteClicked: () => void
}

export const RemoveMeetingFromWorkspaceConfirmModal = observer(
  function RemoveMeetingFromWorkspaceConfirmModal(
    props: IRemoveMeetingFromWorkspaceConfirmModalProps
  ) {
    const { closeOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    return (
      <Modal
        id={'RemoveMeetingFromWorkspaceConfirmModal'}
        onHide={() =>
          closeOverlazy({
            type: 'Modal',
            name: 'RemoveMeetingFromWorkspaceConfirmModal',
          })
        }
      >
        <Modal.Header
          css={css`
            padding-bottom: 0;
          `}
        >
          <Modal.Title>{t('Remove meeting and tiles')}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          css={css`
            padding-top: ${(props) => props.theme.sizes.spacing16};
            overflow-y: unset !important;
            padding-bottom: 0 !important;
          `}
        >
          <div
            css={css`
              max-width: ${toREM(432)};
              margin-bottom: ${(prop) => prop.theme.sizes.spacing32};
            `}
          >
            <Text type={'body'}>
              {t(
                `Removing this meeting will remove (${props.numTilesThatWillBeRemoved}) tiles associated from your workspace. You can add the meeting again at any time.`
              )}
            </Text>
          </div>
        </Modal.Body>
        <Modal.Footer
          css={css`
            padding-top: ${(prop) => prop.theme.sizes.spacing16} !important;
          `}
        >
          <BtnText
            intent='tertiary'
            ariaLabel={t('Cancel')}
            onClick={() => {
              closeOverlazy({
                type: 'Modal',
                name: 'RemoveMeetingFromWorkspaceConfirmModal',
              })
            }}
          >
            {t('Cancel')}
          </BtnText>
          <BtnText
            intent='primary'
            ariaLabel={t('Delete')}
            onClick={() => {
              props.onDeleteClicked()
              closeOverlazy({
                type: 'Modal',
                name: 'RemoveMeetingFromWorkspaceConfirmModal',
              })
            }}
          >
            {t('Delete')}
          </BtnText>
        </Modal.Footer>
      </Modal>
    )
  }
)

export default RemoveMeetingFromWorkspaceConfirmModal
