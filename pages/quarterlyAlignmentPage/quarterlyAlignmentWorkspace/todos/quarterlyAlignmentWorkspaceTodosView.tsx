import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useAction, useComputed, useObservable } from '@mm/gql'

import { EMeetingPageType, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  BtnText,
  Card,
  FastList,
  Loading,
  TextEllipsis,
  toREM,
  useRenderListItem,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import { BloomPageEmptyState, getEmptyStateData } from '@mm/bloom-web/shared'
import { TodoListItem } from '@mm/bloom-web/todos/todoList/todoListItem'

import {
  IQuarterlyAlignmentWorkspaceTodoItem,
  IQuarterlyAlignmentWorkspaceTodosViewProps,
} from './quarterlyAlignmentWorkspaceTodosTypes'

export const QuarterlyAlignmentWorkspaceTodosView = observer(
  (props: IQuarterlyAlignmentWorkspaceTodosViewProps) => {
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { t } = useTranslation()

    const { actions, data } = props

    const EMPTYSTATE_DATA = getEmptyStateData(terms)
    const showPageEmptyState =
      (data().getUserTodosInAllMeetings() || []).length === 0 &&
      !data().isLoading

    const componentState = useObservable({
      todoListEl: null as Maybe<HTMLDivElement>,
    })

    const observableResizeState = useResizeObserver(componentState.todoListEl)

    const getResponsiveSize = useComputed(
      () => {
        if (!observableResizeState.ready) return 'UNKNOWN'
        if (observableResizeState.width < 450) return 'SMALL'
        if (observableResizeState.width < 900) return 'MEDIUM'
        return 'LARGE'
      },
      { name: 'PersonalGoalsListView-getResponsizeSize' }
    )

    const onHandleSetTodoListEl = useAction(
      (todoListEl: Maybe<HTMLDivElement>) => {
        componentState.todoListEl = todoListEl
      }
    )

    const renderTodoListItems =
      useRenderListItem<IQuarterlyAlignmentWorkspaceTodoItem>((todo) => (
        <TodoListItem
          key={todo.id}
          currentUserPermissions={() => todo.permissions}
          isLoading={data().isLoading}
          todo={todo}
          meetingStartTime={null}
          responsiveSize={getResponsiveSize()}
          onCreateContextAwareIssueFromTodo={(todoValues) => {
            actions().onHandleCreateContextAwareIssueFromTodo({
              meetingId: todo.meeting.id,
              todo: todoValues,
            })
          }}
          onUpdateTodo={actions().onHandleUpdateTodo}
          onEditTodoRequest={() => {
            actions().onHandleEditTodoRequest({
              meetingId: todo.meeting.id,
              todoId: todo.id,
            })
          }}
        />
      ))

    return (
      <Card ref={onHandleSetTodoListEl}>
        <Card.Header
          renderLeft={
            <div
              css={css`
                display: flex;
                justify-content: flex-start;
                align-items: center;
              `}
            >
              <Card.Title
                css={css`
                  padding-right: ${theme.sizes.spacing16};
                `}
              >
                {terms.todo.plural}
              </Card.Title>

              {!data().isLoading && (
                <TextEllipsis
                  lineLimit={1}
                  wordBreak={true}
                  type='small'
                  weight='semibold'
                  css={css`
                    background-color: ${theme.colors
                      .quarterlyAlignmentWorkspaceTodosCompletedPercentageColor};
                    border-radius: ${theme.sizes.br1};
                    padding: ${toREM(4)} ${theme.sizes.spacing16};
                    width: fit-content;
                    height: ${toREM(25)};
                  `}
                >
                  {t('{{percentage}}% Completion rate', {
                    percentage: data().getCompletedTodosPercentage(),
                  })}
                </TextEllipsis>
              )}
            </div>
          }
          renderRight={
            <BtnIcon
              intent='tertiaryTransparent'
              size='lg'
              iconProps={{
                iconName: data().pageState.isTileExpanded
                  ? 'chevronUpIcon'
                  : 'chevronDownIcon',
                iconSize: 'lg',
              }}
              ariaLabel={t('See all {{todos}} data', {
                todos: terms.todo.plural,
              })}
              tag={'span'}
              onClick={actions().onHandleToggleIsTileExpanded}
            />
          }
        />
        {data().pageState.isTileExpanded && (
          <>
            <Card.Body
              css={css`
                overflow-x: hidden;
                overflow-y: hidden;
              `}
            >
              <div
                css={css`
                  min-height: ${toREM(382)};
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  margin: ${theme.sizes.spacing16} ${theme.sizes.spacing24}
                    ${theme.sizes.spacing24} ${theme.sizes.spacing24};
                  border: ${theme.sizes.smallSolidBorder}
                    ${theme.colors.menuBorderColor};
                `}
              >
                {t('Stats Graph Placholder')}
              </div>
            </Card.Body>
            <Card.Header
              renderLeft={
                <>
                  {data().pageState.isTodosListExpanded ? (
                    <div
                      css={css`
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                      `}
                    >
                      <Card.Title
                        css={css`
                          padding-right: ${theme.sizes.spacing16};
                        `}
                      >
                        {t('{{todos}}: {{userName}}', {
                          todos: terms.todo.plural,
                          userName: data().currentUser?.fullName || '',
                        })}
                      </Card.Title>
                    </div>
                  ) : null}
                </>
              }
              renderRight={
                <>
                  {data().pageState.isTodosListExpanded ? (
                    <BtnIcon
                      intent='tertiaryTransparent'
                      size='lg'
                      iconProps={{
                        iconName: data().pageState.isTodosListExpanded
                          ? 'chevronUpIcon'
                          : 'chevronDownIcon',
                        iconSize: 'lg',
                      }}
                      ariaLabel={t('See all {{todos}}', {
                        todos: terms.todo.plural,
                      })}
                      tag={'span'}
                      onClick={actions().onHandleSetTodosListExpanded}
                    />
                  ) : (
                    <div
                      css={css`
                        display: flex;
                        width: 100%;
                        justify-content: flex-end;
                        align-items: center;
                        padding-bottom: ${theme.sizes.spacing24};
                      `}
                    >
                      <BtnText
                        intent='secondary'
                        ariaLabel={t('See all {{todos}}', {
                          todos: terms.todo.plural,
                        })}
                        onClick={actions().onHandleSetTodosListExpanded}
                      >
                        {t('See all {{todos}}', { todos: terms.todo.plural })}
                      </BtnText>
                    </div>
                  )}
                </>
              }
            />

            {data().pageState.isTodosListExpanded && (
              <Card.Body
                css={css`
                  overflow-x: hidden;
                  max-height: ${toREM(540)};
                `}
              >
                {observableResizeState.loadingUI || data().isLoading ? (
                  <Loading
                    size='small'
                    css={css`
                      padding: ${theme.sizes.spacing16};
                    `}
                  />
                ) : null}
                {!showPageEmptyState && getResponsiveSize() !== 'UNKNOWN' && (
                  <FastList
                    items={props.data().getUserTodosInAllMeetings() || []}
                    memoizedRenderListItem={renderTodoListItems}
                  />
                )}
                <BloomPageEmptyState
                  show={showPageEmptyState}
                  emptyState={
                    EMPTYSTATE_DATA[EMeetingPageType.Todos] || undefined
                  }
                  fillParentContainer={true}
                />
              </Card.Body>
            )}
          </>
        )}
      </Card>
    )
  }
)
