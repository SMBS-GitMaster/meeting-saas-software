import { observer } from 'mobx-react'
import React from 'react'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Expandable, Text } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const AddExistingMetricModalDemo = observer(
  function AddExistingMetricModalDemo() {
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    return (
      <Expandable title='Add Existing Metric Modal'>
        <BtnText
          onClick={() =>
            openOverlazy('AddExistingMetricsModal', { currentMeetingId: '123' })
          }
          intent='tertiary'
          width='noPadding'
          ariaLabel={t('open modal')}
        >
          <Text>{t('Open modal')}</Text>
        </BtnText>
      </Expandable>
    )
  }
)
