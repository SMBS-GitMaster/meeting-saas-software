import React from 'react'
import { css } from 'styled-components'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useBloomGoalNode } from '@mm/core-bloom/goals/goalNode'
import { useBloomTodoNode } from '@mm/core-bloom/todos'

import {
  Expandable,
  InfiniteErrorMessage,
  InfiniteScroller,
  Text,
  sharedScrollbarStyles,
} from '@mm/core-web/ui'

export const InfiniteScrollDemo = () => {
  const subscription = useSubscription(
    {
      todos: queryDefinition({
        def: useBloomTodoNode(),
        map: ({ title, completed }) => ({
          title,
          completed,
        }),
      }),
      goals: queryDefinition({
        def: useBloomGoalNode(),
        map: ({ title, status }) => ({
          title,
          status,
        }),
        pagination: {
          itemsPerPage: 5,
        },
      }),
    },
    {
      subscriptionId: `InfiniteScrollDemo`,
    }
  )

  const { data } = subscription()

  return (
    <Expandable title='Infinite Scroll Demo'>
      <>
        <div
          id={'IAmADemoScrollIdWithoutForms'}
          css={css`
            height: 200px;
            width: 700px;
            overflow: auto;
            background-color: lavender;

            ${sharedScrollbarStyles}
          `}
        >
          <Text
            type={'h2'}
            css={css`
              color: rebeccaPurple;
            `}
          >
            Infinite Scroll Demo without forms
          </Text>
          <div>loadingState: {data.goals.loadingState}</div>
          <div>totalPages: {data.goals.totalPages}</div>
          <div>currentPage: {data.goals.page}</div>
          <InfiniteScroller
            nodesCollection={data.goals}
            scrollParentId={'IAmADemoScrollIdWithoutForms'}
            loadingDisplay={<div>Loading...</div>}
          >
            {({ nodes, loadingError, retry }) => (
              <>
                {nodes.map((node, index) => (
                  <div
                    key={node.id}
                    css={css`
                      display: inline-flex;
                    `}
                  >
                    <Text type={'body'}>
                      {index}
                      {': '}
                    </Text>
                    <Text
                      type={'body'}
                      weight={'semibold'}
                      ellipsis={{
                        widthPercentage: 50,
                      }}
                    >
                      {node.title}
                    </Text>
                  </div>
                ))}
                {loadingError && (
                  <InfiniteErrorMessage
                    loadingError={loadingError}
                    retry={retry}
                  />
                )}
              </>
            )}
          </InfiniteScroller>
        </div>
      </>
    </Expandable>
  )
}
