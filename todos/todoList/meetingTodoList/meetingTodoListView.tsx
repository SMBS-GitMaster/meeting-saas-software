import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { formatNumAsPercent } from '@mm/core/formatting'
import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
} from '@mm/core/forms'

import { EMeetingPageType, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Breadcrumb,
  Card,
  Clickable,
  FastList,
  Icon,
  Menu,
  QuickAddTextInput,
  SelectQuickAddUserSelection,
  Text,
  TextEllipsis,
  toREM,
  useRenderListItem,
  useResizeObserver,
} from '@mm/core-web/ui/'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'
import { useComputed } from '@mm/bloom-web/pages/performance/mobx'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import BloomPageEmptyState from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyState'
import { getEmptyStateData } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateConstants'
import { BloomPageEmptyStateTooltipProvider } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateTooltipProvider'
import { SortBy } from '@mm/bloom-web/shared/components/sortBy'

import { TodoAnimation } from '../../todoCompletedAnimation'
import { TodoListItem } from '../todoListItem'
import { ITodoListTodo } from '../todoListTypes'
import { MEETING_TODO_LIST_SORTING_OPTS } from './meetingTodoListConstants'
import { IMeetingTodoListViewProps } from './meetingTodoListTypes'

export const MeetingTodoListView = observer(function MeetingTodoListView(
  props: IMeetingTodoListViewProps
) {
  const [todoListEl, setTodoListEl] = useState<Maybe<HTMLDivElement>>(null)

  const terms = useBloomCustomTerms()
  const { fullScreenTile, minimizeTile } =
    useWorkspaceFullScreenTileController()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const todoListDimensions = useResizeObserver(todoListEl)

  const EMPTYSTATE_DATA = getEmptyStateData(terms)

  const data = props.data()
  const actions = props.actions()

  const { canCreateTodosInMeeting, canEditTodosInMeeting } = data
    .currentUser()
    .permissions()

  const isWorkSpaceView = data.pageType === 'WORKSPACE'
  const workspaceTileId = props.data().workspaceTileId

  const getResponsiveSize = useComputed(
    () => {
      const { width, ready } = todoListDimensions
      if (!ready) return 'UNKNOWN'
      if (width <= 450) return 'SMALL'
      if (width <= 900) return 'MEDIUM'
      return 'LARGE'
    },
    {
      name: 'TodoListView-getResponsiveSize',
    }
  )

  const newTodos = useComputed(
    () => {
      return data.sortBy === null
        ? data.activeTodos().filter((todo) => {
            return todo.isNew(data.meetingStartTime)
          })
        : []
    },
    {
      name: 'TodoListView-newTodos',
    }
  )

  const todosCompletedPercentage = useComputed(
    () => {
      const nonNewTodosNotImpactedBySorting = data
        .activeTodos()
        .filter((todo) => {
          return !todo.isNew(data.meetingStartTime)
        })

      const { numCompleted, total } = (
        nonNewTodosNotImpactedBySorting || []
      ).reduce(
        (acc, todo) => {
          if (todo.completed) acc.numCompleted += 1
          acc.total += 1
          return acc
        },
        { numCompleted: 0, total: 0 }
      )

      return total === 0 ? 0 : numCompleted / total
    },
    {
      name: 'TodoListView-todosCompletedPercentage',
    }
  )

  const remainingTodos = useComputed(
    () => {
      return data.sortBy === null
        ? data.activeTodos().filter((todo) => {
            return !todo.isNew(data.meetingStartTime)
          })
        : data.activeTodos()
    },
    {
      name: 'TodoListView-remainingTodos',
    }
  )

  const showPageEmptyState = useComputed(
    () =>
      remainingTodos().length +
        (data.sortBy === null ? newTodos().length : 0) ===
      0,
    {
      name: 'TodoListView-showPageEmptyState',
    }
  )

  const renderArchivedTodoListItem = useRenderListItem<ITodoListTodo>(
    (todo) => (
      <TodoListItem
        key={todo.id}
        currentUserPermissions={data.currentUser().permissions}
        isLoading={data.isLoadingArchivedTodos}
        todo={todo}
        meetingStartTime={data.meetingStartTime}
        responsiveSize={responsiveSize}
        onCreateContextAwareIssueFromTodo={
          actions.onCreateContextAwareIssueFromTodo
        }
        onUpdateTodo={actions.onUpdateTodo}
        onEditTodoRequest={actions.onEditTodoRequest}
      />
    )
  )

  const renderNewTodoListItem = useRenderListItem<ITodoListTodo>((todo) => (
    <TodoListItem
      key={todo.id}
      currentUserPermissions={data.currentUser().permissions}
      isLoading={data.isLoadingActiveTodos}
      todo={todo}
      meetingStartTime={data.meetingStartTime}
      responsiveSize={responsiveSize}
      onCreateContextAwareIssueFromTodo={
        actions.onCreateContextAwareIssueFromTodo
      }
      onUpdateTodo={actions.onUpdateTodo}
      onEditTodoRequest={actions.onEditTodoRequest}
    />
  ))

  const renderRemainingTodoListItem = useRenderListItem<ITodoListTodo>(
    (todo) => (
      <TodoListItem
        key={todo.id}
        currentUserPermissions={data.currentUser().permissions}
        isLoading={data.isLoadingActiveTodos}
        todo={todo}
        meetingStartTime={data.meetingStartTime}
        responsiveSize={responsiveSize}
        onCreateContextAwareIssueFromTodo={
          actions.onCreateContextAwareIssueFromTodo
        }
        onUpdateTodo={actions.onUpdateTodo}
        onEditTodoRequest={actions.onEditTodoRequest}
      />
    )
  )

  function renderTodoList() {
    const responsiveSize = getResponsiveSize()

    if (responsiveSize === 'UNKNOWN') return todoListDimensions.loadingUI

    if (data.isViewingArchivedTodos) {
      return (
        <FastList
          items={data.archivedTodos()}
          memoizedRenderListItem={renderArchivedTodoListItem}
        />
      )
    } else {
      return (
        <>
          {data.sortBy === null && (
            <>
              <FastList
                items={newTodos()}
                memoizedRenderListItem={renderNewTodoListItem}
              />
              <div
                css={css`
                  background-color: ${(prop) =>
                    prop.theme.colors.menuDividerColor};
                  height: ${toREM(1)};
                  width: 100%;
                `}
              />
            </>
          )}
          <FastList
            items={remainingTodos()}
            memoizedRenderListItem={renderRemainingTodoListItem}
          />
        </>
      )
    }
  }

  const todosCompletedPercentageData = useComputed(
    () => ({
      activeTodos: data.activeTodos,
      meetingStartTime: data.meetingStartTime,
      completedPercentage: todosCompletedPercentage(),
    }),
    {
      name: 'TodoListView-todosCompletedPercentageData',
    }
  )

  const responsiveSize = getResponsiveSize()

  return (
    <>
      <Card ref={setTodoListEl} className={props.className}>
        <Card.Header
          renderLeft={
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              {data.pageType === 'MEETING' ? (
                <Breadcrumb
                  fontType='h3'
                  steps={data.breadcrumbs()}
                  showInProgressIndicator={false}
                  onBack={() => actions.onViewArchivedTodos(false)}
                />
              ) : (
                <TextEllipsis type='h3' lineLimit={1}>
                  {`${t('{{todos}}:', { todos: terms.todo.plural })} ${
                    data.meetingName
                  }`}
                </TextEllipsis>
              )}
              {responsiveSize === 'LARGE' && (
                <TodosCompletedPercentage data={todosCompletedPercentageData} />
              )}
            </div>
          }
          renderRight={
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              <SortBy
                sortingOptions={MEETING_TODO_LIST_SORTING_OPTS}
                selected={data.sortBy}
                showOnlyIcon={responsiveSize !== 'LARGE'}
                onChange={actions.sort}
              />
              <Menu
                maxWidth={toREM(330)}
                content={(close) => (
                  <>
                    {data.pageType === 'MEETING' && (
                      <>
                        <Menu.Item
                          disabled={!canEditTodosInMeeting.allowed}
                          tooltip={
                            !canEditTodosInMeeting.allowed
                              ? {
                                  msg: canEditTodosInMeeting.message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            actions.print()
                          }}
                        >
                          <Text type={'body'}>{t('Print')}</Text>
                        </Menu.Item>
                        <Menu.Item
                          disabled={!canCreateTodosInMeeting.allowed}
                          tooltip={
                            !canCreateTodosInMeeting.allowed
                              ? {
                                  msg: canCreateTodosInMeeting.message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            actions.upload()
                          }}
                        >
                          <Text type={'body'}>{t('Upload')}</Text>
                        </Menu.Item>
                        {/* <Menu.Item
                          disabled={!canEditTodosInMeeting.allowed}
                          tooltip={
                            !canEditTodosInMeeting.allowed
                              ? {
                                  msg: canEditTodosInMeeting.message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            actions.export()
                          }}
                        >
                          <Text type={'body'}>{t('Export')}</Text>
                        </Menu.Item> */}
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            actions.onViewArchivedTodos(
                              !data.isViewingArchivedTodos
                            )
                          }}
                        >
                          <Text type={'body'}>
                            {data.isViewingArchivedTodos
                              ? t('View non-archived {{todos}}', {
                                  todos: terms.todo.lowercasePlural,
                                })
                              : t('View archived {{todos}}', {
                                  todos: terms.todo.lowercasePlural,
                                })}
                          </Text>
                        </Menu.Item>
                      </>
                    )}
                    {isWorkSpaceView && (
                      <>
                        <Menu.Item
                          onClick={(e) => {
                            openOverlazy('CreateTodoDrawer', {
                              meetingId: data.meetingId,
                            })
                            close(e)
                          }}
                        >
                          <Text type={'body'}>
                            {t('Create {{todo}}', {
                              todo: terms.todo.lowercaseSingular,
                            })}
                          </Text>
                        </Menu.Item>
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            if (workspaceTileId) {
                              fullScreenTile(workspaceTileId)
                            }
                          }}
                        >
                          <Text type={'body'}>{t('View in full screen')}</Text>
                        </Menu.Item>
                        {props.data().workspaceType === 'PERSONAL' && (
                          <Menu.Item
                            onClick={(e) => {
                              close(e)
                              props.actions().onDeleteTile()
                            }}
                          >
                            <Text type={'body'}>{t('Delete tile')}</Text>
                          </Menu.Item>
                        )}
                      </>
                    )}
                  </>
                )}
              >
                <span>
                  <Clickable clicked={() => null}>
                    <Icon iconName='moreVerticalIcon' iconSize='lg' />
                  </Clickable>
                </span>
              </Menu>
              {props.data().IsExpandedOnWorkspacePage && (
                <Clickable clicked={() => minimizeTile()}>
                  <Icon
                    iconName='closeIcon'
                    iconSize='lg'
                    css={css`
                      margin-left: ${(prop) => prop.theme.sizes.spacing8};
                    `}
                  />
                </Clickable>
              )}
            </div>
          }
        >
          {!data.isViewingArchivedTodos && (
            <CreateForm
              isLoading={data.isLoadingActiveTodos}
              values={
                {
                  quickAddTodoTitle: '',
                  quickAddUser: data.currentUser().id ?? '',
                } as {
                  quickAddTodoTitle: string
                  quickAddUser: Id
                }
              }
              validation={
                {
                  quickAddTodoTitle: formValidators.string({
                    additionalRules: [
                      maxLength({
                        maxLength: MEETING_TITLES_CHAR_LIMIT,
                        customErrorMsg: t(
                          `Can't exceed {{maxLength}} characters`,
                          {
                            maxLength: MEETING_TITLES_CHAR_LIMIT,
                          }
                        ),
                      }),
                    ],
                  }),
                  quickAddUser: formValidators.stringOrNumber({}),
                } satisfies GetParentFormValidation<{
                  quickAddTodoTitle: string
                  quickAddUser: Id
                }>
              }
              onSubmit={async (values) => {
                await actions.onQuickAddTodoEnter({
                  title: values.quickAddTodoTitle,
                  assigneeId: values.quickAddUser,
                })
              }}
            >
              {({ values, fieldNames, hasError, onResetForm, onSubmit }) => {
                return (
                  <Card.SubHeader>
                    <BloomPageEmptyStateTooltipProvider emptyStateId='quickCreation'>
                      {(tooltipOpts) => (
                        <QuickAddTextInput
                          id='todo-list-view-quick-add-input'
                          name={fieldNames.quickAddTodoTitle}
                          enableValidationOnFocus
                          isHover={!!values?.quickAddTodoTitle}
                          placeholder={t('Create a quick {{todo}}', {
                            todo: terms.todo.lowercaseSingular,
                          })}
                          instructions={
                            <>
                              {t('Press ')}
                              <strong>{t('enter ')}</strong>
                              {t('to add new {{todo}}', {
                                todo: terms.todo.lowercaseSingular,
                              })}
                            </>
                          }
                          disabled={!canCreateTodosInMeeting.allowed}
                          tooltip={
                            !canCreateTodosInMeeting.allowed
                              ? {
                                  msg: canCreateTodosInMeeting.message,
                                  position: 'top center',
                                }
                              : tooltipOpts
                          }
                          renderLeft={
                            <SelectQuickAddUserSelection
                              id='todo-list-view-quick-add-user-input'
                              name={fieldNames.quickAddUser}
                              width={toREM(56)}
                              disabled={!canCreateTodosInMeeting.allowed}
                              tooltip={
                                !canCreateTodosInMeeting.allowed
                                  ? {
                                      msg: canCreateTodosInMeeting.message,
                                      position: 'top center',
                                    }
                                  : undefined
                              }
                              options={data.quickAddMeetingAttendeesLookup()}
                              unknownItemText={t('Unknown owner')}
                              css={css`
                                margin-right: ${(prop) =>
                                  prop.theme.sizes.spacing12};
                                align-self: baseline;
                                justify-content: center;
                                align-items: center;
                              `}
                              sectionHeader={
                                <Text
                                  type='body'
                                  weight='semibold'
                                  css={css`
                                    line-height: ${({ theme }) =>
                                      theme.sizes.spacing20};
                                  `}
                                >
                                  {t('Assign to:')}
                                </Text>
                              }
                            />
                          }
                          onEnter={() => {
                            if (hasError) return
                            onSubmit()
                            onResetForm()
                          }}
                        />
                      )}
                    </BloomPageEmptyStateTooltipProvider>
                  </Card.SubHeader>
                )
              }}
            </CreateForm>
          )}
        </Card.Header>
        <Card.Body>
          {renderTodoList()}
          <BloomPageEmptyState
            show={showPageEmptyState()}
            emptyState={
              isWorkSpaceView
                ? EMPTYSTATE_DATA[EMeetingPageType.Todos] || undefined
                : undefined
            }
            fillParentContainer={isWorkSpaceView}
          />
        </Card.Body>
      </Card>
      {todosCompletedPercentage() >= 0.9 && (
        <TodoAnimation
          isCurrentMeetingInstance={data.isCurrentMeetingInstance}
        />
      )}
    </>
  )
})

const TodosCompletedPercentage = observer(
  function TodosCompletedPercentage(props: {
    data: () => {
      activeTodos: () => Array<any>
      meetingStartTime: number | null
      completedPercentage: number
    }
  }) {
    const { t } = useTranslation()
    const data = props.data()

    return (
      <Text
        type='small'
        weight='semibold'
        css={css`
          color: ${(prop) => prop.theme.colors.captionTextColor};
          margin-left: ${(prop) => prop.theme.sizes.spacing20};
          margin-right: ${(prop) => prop.theme.sizes.spacing12};
          white-space: nowrap;
        `}
      >
        {`${formatNumAsPercent(data.completedPercentage)} ${t('Completed')}`}
      </Text>
    )
  }
)
