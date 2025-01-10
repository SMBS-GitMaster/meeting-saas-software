import { observer } from 'mobx-react'
import React from 'react'

import { Trans, useTranslation } from '@mm/core-web/i18n'
import { BtnText, Text } from '@mm/core-web/ui'
import { Modal } from '@mm/core-web/ui/components/modal/Modal'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { HierarchicalOrgChartSeat } from '../../types'

export const WarnCantDeleteSeatsWithDirectReportsModal = observer(
  function WarnCantDeleteSeatsWithDirectReportsModal(props: {
    getData: () => {
      seat: HierarchicalOrgChartSeat
    }
  }) {
    const { closeOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    return (
      <Modal
        id={'WarnCantDeleteSeatsWithDirectReportsModal'}
        onHide={() => {
          closeOverlazy({
            type: 'Modal',
            name: 'WarnCantDeleteSeatsWithDirectReportsModal',
          })
        }}
      >
        <Modal.Header>
          <Modal.Title>
            {t('You cannot delete a seat with direct reports')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Text>
            <Trans>
              {`The `}
              <Text weight='bold'>
                {props.getData().seat.position &&
                  props.getData().seat.position?.title}
              </Text>
              {` seat has direct reports and cannot be deleted. Please reassign any direct reports to a different supervisor and try again.`}
            </Trans>
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <BtnText
            intent='primary'
            ariaLabel={t('confirm')}
            onClick={() => {
              closeOverlazy({
                type: 'Modal',
                name: 'WarnCantDeleteSeatsWithDirectReportsModal',
              })
            }}
          >
            {t('Confirm')}
          </BtnText>
        </Modal.Footer>
      </Modal>
    )
  }
)

export default WarnCantDeleteSeatsWithDirectReportsModal
