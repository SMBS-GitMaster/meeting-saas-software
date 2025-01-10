import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Text, useTheme } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface IUnsavedChangesModalProps {
  onHandleLeaveWithoutSaving: () => void
}

export const UnsavedChangesModal = observer(function UnsavedChangesModal(
  props: IUnsavedChangesModalProps
) {
  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const theme = useTheme()

  const { onHandleLeaveWithoutSaving } = props

  const handleCloseModal = useCallback(() => {
    return closeOverlazy({ type: 'Modal', name: 'UnsavedChangesModal' })
  }, [closeOverlazy])

  const handleLeaveWithoutSavingAndCloseModal = useCallback(() => {
    handleCloseModal()
    onHandleLeaveWithoutSaving()
  }, [handleCloseModal, onHandleLeaveWithoutSaving])

  return (
    <Modal id={'UnsavedChangesModal'}>
      <Modal.Header>
        <Modal.Title>
          {t("We're having trouble saving your changes.")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        css={css`
          padding-bottom: ${theme.sizes.spacing32};
        `}
      >
        <Text type='body'>
          {t(
            'Please review all fields and make any required updates before saving.'
          )}
        </Text>
      </Modal.Body>
      <Modal.Footer
        css={css`
          padding-top: 0;
        `}
      >
        <BtnText
          intent='tertiary'
          width='medium'
          ariaLabel={t('Leave without saving ')}
          onClick={handleLeaveWithoutSavingAndCloseModal}
        >
          <Text
            weight='semibold'
            type='body'
            css={css`
              color: ${theme.colors.unsavedChangesModalLeaveButtonTextColor};
            `}
          >
            {t('Leave without saving')}
          </Text>
        </BtnText>
        <BtnText
          intent='primary'
          width='medium'
          ariaLabel={t('Go Back')}
          type='button'
          onClick={handleCloseModal}
        >
          <Text weight='semibold' type='body'>
            {t('Go Back')}
          </Text>
        </BtnText>
      </Modal.Footer>
    </Modal>
  )
})

export default UnsavedChangesModal
