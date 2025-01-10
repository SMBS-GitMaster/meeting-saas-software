import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Text } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { IMeetingAgendaActionHandlers } from './agendaCardTypes'

interface IRemoveMeetingSectionModalProps {
  agendaSection: string
  agendaItem: {
    id: Id
  } & Record<string, any>
  onRemoveFieldArrayItem: (id: Id) => void
  onUpdateAgendaSections: IMeetingAgendaActionHandlers['onUpdateAgendaSections']
}

export function RemoveMeetingSectionModal(
  props: IRemoveMeetingSectionModalProps
) {
  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const handleRemoveMeetingSection = () => {
    props.onRemoveFieldArrayItem(props.agendaItem.id)
    props.onUpdateAgendaSections
    closeOverlazy({ type: 'Modal', name: 'RemoveMeetingSectionModal' })
  }

  return (
    <Modal id={'RemoveMeetingSectionModal'}>
      <Modal.Header>
        <Modal.Title>{t('Remove meeting section')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Text
          css={css`
            padding-bottom: ${(props) => props.theme.sizes.spacing16};
          `}
          display='block'
          type={'body'}
          weight={'normal'}
          ellipsis={{ widthPercentage: 100 }}
        >
          {t(
            'If you have content in {{section}}, it will no longer be visible in this meeting.',

            { section: props.agendaSection }
          )}
        </Text>
        <Text
          display='block'
          type={'body'}
          weight={'normal'}
          ellipsis={{ widthPercentage: 100 }}
        >
          {t(
            'Add this section back if you want to view the content during your meeting.'
          )}
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <BtnText
          intent='tertiary'
          ariaLabel={t('Cancel')}
          onClick={() =>
            closeOverlazy({ type: 'Modal', name: 'RemoveMeetingSectionModal' })
          }
        >
          {t('Cancel')}
        </BtnText>
        <BtnText
          intent='warning'
          ariaLabel={t('Remove')}
          onClick={handleRemoveMeetingSection}
        >
          {t('Remove')}
        </BtnText>
      </Modal.Footer>
    </Modal>
  )
}

export default RemoveMeetingSectionModal
