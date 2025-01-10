import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { css } from 'styled-components'

import { EMeetingPageType, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Card,
  Clickable,
  FastList,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  toREM,
  useRenderListItem,
  useResizeObserver,
} from '@mm/core-web/ui/'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import { BloomPageEmptyState } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyState'
import { getEmptyStateData } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateConstants'

import { TodoListItem } from '../todoListItem'
import { PersonalTodoListSortBy } from './personalTodoListSortBy'
import {
  IPersonalTodoListViewProps,
  IUserTodosForMeeting,
} from './personalTodoListTypes'

export const PersonalTodoListView = observer(function PersonalTodoListView(
  props: IPersonalTodoListViewProps
) {
  const [todoListEl, setTodoListEl] = useState<Maybe<HTMLDivElement>>(null)

  const terms = useBloomCustomTerms()
  const { fullScreenTile, minimizeTile } =
    useWorkspaceFullScreenTileController()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const {
    width,
    ready,
    loadingUI: resizeObserverLoadingUI,
  } = useResizeObserver(todoListEl)

  const EMPTYSTATE_DATA = getEmptyStateData(terms)

  const RESPONSIVE_SIZE = useMemo(() => {
    if (!ready) return 'UNKNOWN'
    if (width <= 450) return 'SMALL'
    if (width <= 900) return 'MEDIUM'
    return 'LARGE'
  }, [width, ready])

  const showPageEmptyState = props.data().userTodosInAllMeetings().length === 0

  const renderMeetingTodoGroup = useRenderListItem<IUserTodosForMeeting>(
    (meetingWithTodos) => (
      <div
        key={meetingWithTodos.meetingId}
        css={css`
          margin-top: ${(prop) => prop.theme.sizes.spacing12};
        `}
      >
        {meetingWithTodos.meetingName === 'PERSONAL' ? (
          <TextEllipsis
            lineLimit={1}
            wordBreak={true}
            type='small'
            weight='semibold'
            css={css`
              background-color: ${meetingWithTodos.meetingColor};
              border-radius: ${toREM(4)};
              margin-bottom: ${(prop) => prop.theme.sizes.spacing4};
              margin-left: ${(prop) => prop.theme.sizes.spacing16};
              padding: ${toREM(2)} ${toREM(6)};
              width: fit-content;
            `}
          >
            {t('Personal')}
            {RESPONSIVE_SIZE !== 'SMALL' && (
              <>
                {'. '}
                <Text type='small' fontStyle='italic'>
                  {t('Your supervisor can also see this')}
                </Text>
              </>
            )}
          </TextEllipsis>
        ) : (
          <TextEllipsis
            lineLimit={1}
            wordBreak={true}
            type='small'
            weight='semibold'
            css={css`
              background-color: ${meetingWithTodos.meetingColor};
              border-radius: ${toREM(4)};
              margin-bottom: ${(prop) => prop.theme.sizes.spacing4};
              margin-left: ${(prop) => prop.theme.sizes.spacing16};
              padding: ${toREM(2)} ${toREM(6)};
              width: fit-content;
            `}
          >
            {meetingWithTodos.meetingName}
          </TextEllipsis>
        )}
        <div>
          <FastList items={meetingWithTodos.todos}>
            {(todoData) => (
              <TodoListItem
                key={todoData.id}
                currentUserPermissions={() => meetingWithTodos.permissions}
                isLoading={props.data().isLoading}
                todo={todoData}
                meetingStartTime={null}
                responsiveSize={RESPONSIVE_SIZE}
                showAssigneeAvatar={false}
                displayContextAwareButtons={false}
                onUpdateTodo={props.actions().onUpdateTodo}
                onEditTodoRequest={() => {
                  props.actions().onEditTodoRequest({
                    meetingId:
                      meetingWithTodos.meetingId === 'PERSONAL'
                        ? null
                        : meetingWithTodos.meetingId,
                    todoId: todoData.id,
                  })
                }}
                onCreateContextAwareIssueFromTodo={(todoValues) => {
                  props.actions().onCreateContextAwareIssueFromTodo({
                    meetingId: `${meetingWithTodos.meetingId}`,
                    todo: todoValues,
                  })
                }}
              />
            )}
          </FastList>
        </div>
      </div>
    )
  )

  return (
    <Card ref={setTodoListEl} className={props.className}>
      <Card.Header
        renderLeft={
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <TextEllipsis type='h3' lineLimit={1}>
              {t('My {{todos}}', { todos: terms.todo.plural })}
            </TextEllipsis>
            <BtnIcon
              intent='naked'
              size='lg'
              tag={'button'}
              iconProps={{
                iconName: 'plusIcon',
                iconSize: 'lg',
              }}
              ariaLabel={t('Create {{todo}}', {
                todo: terms.todo.lowercaseSingular,
              })}
              onClick={() =>
                openOverlazy('CreateTodoDrawer', {
                  meetingId: null,
                })
              }
              css={css`
                margin-left: ${(prop) => prop.theme.sizes.spacing8};
              `}
            />
          </div>
        }
        renderRight={
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <PersonalTodoListSortBy
              selectedGroupSort={props.data().selectedGroupSortBy}
              selectedContentSort={props.data().selectedContentSortBy}
              setGroupSortBy={props.actions().setGroupSortBy}
              setContentSortBy={props.actions().setContentSortBy}
            />
            <Menu
              maxWidth={toREM(330)}
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={(e) => {
                      openOverlazy('CreateTodoDrawer', {
                        meetingId: null,
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
                      fullScreenTile(props.data().workspaceTileId)
                    }}
                  >
                    <Text type={'body'}>{t('View in full screen')}</Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      close(e)
                      props.actions().onDeleteTile()
                    }}
                  >
                    <Text type={'body'}>{t('Delete tile')}</Text>
                  </Menu.Item>
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
      />
      <Card.Body>
        {resizeObserverLoadingUI}
        {!showPageEmptyState && RESPONSIVE_SIZE !== 'UNKNOWN' && (
          <FastList
            items={props.data().userTodosInAllMeetings()}
            memoizedRenderListItem={renderMeetingTodoGroup}
          />
        )}
        <BloomPageEmptyState
          show={showPageEmptyState}
          emptyState={EMPTYSTATE_DATA[EMeetingPageType.Todos] || undefined}
          fillParentContainer={true}
        />
      </Card.Body>
    </Card>
  )
})
