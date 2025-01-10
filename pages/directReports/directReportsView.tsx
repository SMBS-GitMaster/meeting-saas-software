import { observer } from 'mobx-react'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { toREM } from '@mm/core-web/ui'

import { DirectReportUserTile } from '@mm/bloom-web/user'

import { DirectReportsHeader } from './directReportsHeader'
import { type IDirectReportsViewProps } from './directReportsTypes'

export const DirectReportsView = observer(function DirectReportsView(
  props: IDirectReportsViewProps
) {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('Direct reports')}</title>
      </Helmet>
      <DirectReportsHeader />
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          padding: ${toREM(12)};
          width: 100%;
        `}
      >
        {props
          .data()
          .directReportUserInfo()
          .map((userInfo) => {
            return (
              <DirectReportUserTile
                key={userInfo.directReportId}
                userId={userInfo.userId}
                positionTitles={userInfo.positionTitles}
              />
            )
          })}
      </div>
    </>
  )
})
