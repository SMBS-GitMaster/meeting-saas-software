import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { Card, Text } from '@mm/core-web/ui/components'

import { WrapUpTodoEntry } from './wrapUpTodoEntry'
import { IWrapUpActionHandlers, IWrapUpViewData } from './wrapUpTypes'

export const WrapUpTodosView = observer(function WrapUpTodosView(props: {
  getData: () => Pick<
    IWrapUpViewData,
    'getTodosData' | 'getCurrentUserPermissions'
  >
  getActions: () => Pick<
    IWrapUpActionHandlers,
    'onUpdateTodo' | 'onCreateContextAwareIssueFromTodo' | 'onTodoClicked'
  >
}) {
  const { getData, getActions } = props

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  return (
    <>
      <Card.SectionHeader>
        <Card.Title>
          {t(`{{todos}} created`, {
            todos: terms.todo.plural,
          })}
        </Card.Title>
        <Text
          type='small'
          color={{ intent: 'deemph' }}
          css={css`
            margin-top: ${(prop) => prop.theme.sizes.spacing4};
          `}
        >
          {t('Your team committed to {{count}} {{todos}} in this meeting.', {
            count: getData().getTodosData().length,
            todos:
              getData().getTodosData().length === 1
                ? terms.todo.lowercaseSingular
                : terms.todo.lowercasePlural,
          })}
        </Text>
      </Card.SectionHeader>
      <div
        css={css`
          padding: ${(props) => props.theme.sizes.spacing8} 0;
        `}
      >
        {getData()
          .getTodosData()
          .map((todo) => (
            <WrapUpTodoEntry
              key={todo.id}
              todo={todo}
              getData={getData}
              getActions={getActions}
            />
          ))}
      </div>
    </>
  )
})
