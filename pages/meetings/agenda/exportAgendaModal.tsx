import React, { useState } from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Modal, Text, TextInput } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const ExportAgendaModal = () => {
  const [path, setPath] = useState('')

  const { t } = useTranslation()
  const { closeOverlazy } = useOverlazyController()

  const handleChangePath = (val: string) => {
    setPath(val)
  }

  return (
    <Modal id={'ExportAgendaModal'}>
      <Modal.Header>
        <Modal.Title>{t('Export Agenda')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          css={css`
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-evenly;
          `}
        >
          <TextInput
            id='agendaExportPathInput'
            name='agendaExportPathInput'
            value={path}
            onChange={handleChangePath}
            placeholder={t('Agenda')}
          />
          <Text
            weight='semibold'
            css={css`
              padding: ${(props) => props.theme.sizes.spacing6};
            `}
          >
            .csv
          </Text>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <BtnText
          ariaLabel={t('Cancel')}
          intent='tertiary'
          onClick={() =>
            closeOverlazy({ type: 'Modal', name: 'ExportAgendaModal' })
          }
        >
          <Text weight='semibold'>{t('Cancel')}</Text>
        </BtnText>
        <BtnText ariaLabel={t('Export agenda')} intent='primary'>
          <Text weight='semibold'>{t('Export')}</Text>
        </BtnText>
      </Modal.Footer>
    </Modal>
  )
}

export default ExportAgendaModal
