import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { Card, Text } from '@mm/core-web/ui/components'

import { WrapUpIssueEntry } from './wrapUpIssueEntry'
import { IWrapUpActionHandlers, IWrapUpViewData } from './wrapUpTypes'

export const WrapUpIssuesView = observer(function WrapUpIssuesView(props: {
  getData: () => Pick<
    IWrapUpViewData,
    'getIssuesData' | 'getCurrentUserPermissions'
  >
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onCreateContextAwareTodoFromIssue' | 'onUpdateIssue'
  >
}) {
  const { getData, getActions } = props

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  return (
    <>
      <Card.SectionHeader>
        <Card.Title>
          {t('{{issues}} solved', {
            issues: terms.issue.plural,
          })}
        </Card.Title>
        <Text
          type='small'
          color={{ intent: 'deemph' }}
          css={css`
            margin-top: ${(prop) => prop.theme.sizes.spacing4};
          `}
        >
          {t('You and your teammates solved {{count}} {{issues}} today!', {
            count: getData().getIssuesData().length,
            issues:
              getData().getIssuesData().length === 1
                ? terms.issue.lowercaseSingular
                : terms.issue.lowercasePlural,
          })}
        </Text>
      </Card.SectionHeader>
      <div
        css={css`
          padding: ${(props) => props.theme.sizes.spacing8};
        `}
      >
        {getData()
          .getIssuesData()
          .map((issue) => (
            <WrapUpIssueEntry
              key={issue.id}
              issue={issue}
              getData={getData}
              getActions={getActions}
            />
          ))}
      </div>
    </>
  )
})
