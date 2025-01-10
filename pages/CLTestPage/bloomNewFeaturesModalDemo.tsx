import { observer } from 'mobx-react'
import React from 'react'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Expandable, Text } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const BloomNewFeaturesModalDemo = observer(
  function BloomNewFeaturesModalDemo() {
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    return (
      <Expandable title='Bloom New Features Modal'>
        <br />
        <BtnText
          intent='primary'
          width='noPadding'
          ariaLabel={t('open modal')}
          onClick={() => openOverlazy('BloomNewFeaturesModal', {})}
        >
          <Text>{t('Open New Features Modal')}</Text>
        </BtnText>
        <br />
        <br />
        <BtnText
          intent='primary'
          width='noPadding'
          ariaLabel={t('open modal')}
          onClick={() =>
            openOverlazy('BloomNewFeaturesModal', { isAutoOpened: true })
          }
        >
          <Text>{t('Open New Features Modal With CheckBox')}</Text>
        </BtnText>
        <br />
        <br />
      </Expandable>
    )
  }
)
