import { observer } from 'mobx-react'
import React, { useRef } from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Expandable, Text } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

export const MetricCellNotesDemo = observer(function MetricCellNotesDemo() {
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const stickToElementRef = useRef<Maybe<HTMLDivElement>>()

  return (
    <Expandable title='Metric Cell Notes Demo'>
      <div
        css={css`
          width: 100%;
          display: flex;
          justify-content: center;
        `}
      >
        <div
          ref={(r) => {
            stickToElementRef.current = r
          }}
        >
          <Text type={'body'}>{t('Stick to me')}</Text>
        </div>
      </div>
      <br />
      <BtnText
        ariaLabel=''
        onClick={() =>
          openOverlazy('MetricCellNotesStickyDrawer', {
            isLoading: false,
            disabled: false,
            title: t('Did we have fun this week?'),
            hasMetScore: false,
            scoreNodeId: '123',
            dateRange: t('August 15 - 20'),
            score: t('no'),
            notes: t(
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Id sagittis, justo risus laoreet elementum nisl pharetra, sed era dulce nulla.'
            ),
            stickToElementRef,
          })
        }
        intent='tertiary'
      >
        {t('Open Metric Cell Notes')}
      </BtnText>
      <BtnText
        ariaLabel=''
        onClick={() =>
          openOverlazy('MetricCellNotesStickyDrawer', {
            isLoading: false,
            disabled: false,
            title: t('Did we have fun this week?'),
            hasMetScore: true,
            scoreNodeId: '123',
            initialEditMode: true,
            dateRange: t('August 15 - 20'),
            score: t('yes'),
            notes: '',
            stickToElementRef,
          })
        }
        intent='tertiary'
      >
        {t('Open Metric Cell Notes - initally focused')}
      </BtnText>
    </Expandable>
  )
})
