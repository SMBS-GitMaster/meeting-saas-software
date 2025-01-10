import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Icon, Text, toREM, useTheme } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const ApplyFormulaModal = observer(function ApplyFormulaModal() {
  const { closeOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const theme = useTheme()

  const onSubmit = async () => {
    closeOverlazy({ type: 'Modal', name: 'ApplyFormulaModal' })
  }

  return (
    <Modal
      id={'ApplyFormulaModal'}
      onHide={() =>
        closeOverlazy({
          type: 'Modal',
          name: 'ApplyFormulaModal',
        })
      }
    >
      <Modal.Header
        css={css`
          padding-bottom: 0;
        `}
      >
        <Modal.Title
          css={css`
            color: ${(props) => props.theme.colors.bodyTextDefault};
          `}
        >
          {t('Apply formula')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        css={css`
          padding-top: ${(props) => props.theme.sizes.spacing16};
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            padding-bottom: ${(props) => props.theme.sizes.spacing16};
          `}
        >
          <Icon
            iconName={'warningIcon'}
            iconSize={'lg'}
            css={css`
              margin-right: ${(props) => props.theme.sizes.spacing16};
            `}
          />
          <Text
            type={'body'}
            color={{ color: theme.colors.bodyTextDefault }}
            css={css`
              width: ${toREM(509)};
            `}
          >
            {t(
              'A formula will replace exisiting data in the sheet. To see previous data again, uncheck the formula option.'
            )}
          </Text>
        </div>
        <Text
          type={'body'}
          weight={'semibold'}
          color={{ color: theme.colors.bodyTextDefault }}
        >
          {t('Would you like to use a formula?')}
        </Text>
      </Modal.Body>
      <Modal.Footer
        css={css`
          padding-top: ${(prop) => prop.theme.sizes.spacing16} !important;
        `}
      >
        <BtnText
          intent='tertiary'
          ariaLabel={t('Cancel')}
          onClick={() =>
            closeOverlazy({
              type: 'Modal',
              name: 'ApplyFormulaModal',
            })
          }
        >
          {t('Cancel')}
        </BtnText>
        <BtnText
          intent='primary'
          ariaLabel={t('Apply formula')}
          onClick={onSubmit}
        >
          {t('Apply formula')}
        </BtnText>
      </Modal.Footer>
    </Modal>
  )
})

export default ApplyFormulaModal
