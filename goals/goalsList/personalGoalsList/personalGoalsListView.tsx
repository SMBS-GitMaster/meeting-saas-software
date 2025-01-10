import { observer } from 'mobx-react'
import React from 'react'
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
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import {
  BloomPageEmptyState,
  BloomPageEmptyStateTooltipProvider,
  getEmptyStateData,
} from '@mm/bloom-web/shared/components/bloomPageEmptyState'

import { GoalsListGoalEntry } from '../goalsListGoalEntry'
import { PersonalTodoListSortBy } from './personalGoalsListSortBy'
import type { IPersonalGoalsListViewProps } from './personalGoalsListTypes'

export const PersonalGoalsListView = observer(function PersonalGoalsListView(
  props: IPersonalGoalsListViewProps
) {
  const pageState = useObservable({
    goalsListEl: null as Maybe<HTMLDivElement>,
  })

  const setGoalsListEl = useAction((goalsListEl: Maybe<HTMLDivElement>) => {
    pageState.goalsListEl = goalsListEl
  })

  const observableResizeState = useResizeObserver(pageState.goalsListEl)
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const { fullScreenTile, minimizeTile } =
    useWorkspaceFullScreenTileController()
  const { t } = useTranslation()

  const EMPTYSTATE_DATA = getEmptyStateData(terms)

  const getResponsiveSize = useComputed(
    () => {
      if (!observableResizeState.ready) return 'UNKNOWN'
      if (observableResizeState.width < 400) return 'SMALL'
      if (observableResizeState.width < 800) return 'MEDIUM'
      return 'LARGE'
    },
    { name: 'PersonalGoalsListView-getResponsizeSize' }
  )

  return (
    <Card
      ref={setGoalsListEl}
      className={props.className}
      css={css`
        height: 100%;
      `}
    >
      <Card.Header
        renderLeft={
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            <TextEllipsis type='h3' lineLimit={1}>
              {props.data().isComponentPurposedForAnotherUser
                ? `${t('{{goals}}', { goals: terms.goal.plural })}`
                : `${t('My {{goals}}', { goals: terms.goal.plural })}`}
            </TextEllipsis>
            {getResponsiveSize() !== 'SMALL' && (
              <BloomPageEmptyStateTooltipProvider emptyStateId='pageTitlePlusIcon'>
                {(tooltipProps) => (
                  <BtnIcon
                    intent='naked'
                    size='lg'
                    iconProps={{
                      iconName: 'plusIcon',
                      iconSize: 'lg',
                      iconColor:
                        tooltipProps?.isHover || tooltipProps?.isOpen
                          ? {
                              color: theme.colors.pageEmptyStateOnHoverBtn,
                            }
                          : undefined,
                    }}
                    tooltip={tooltipProps}
                    onClick={() => props.actions().onCreateGoal()}
                    ariaLabel={t('Create {{goal}}', {
                      goal: terms.goal.lowercaseSingular,
                    })}
                    tag={'button'}
                  />
                )}
              </BloomPageEmptyStateTooltipProvider>
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
            {getResponsiveSize() === 'LARGE' && (
              <Text
                css={css`
                  margin-right: ${(prop) => prop.theme.sizes.spacing8};
                `}
                type='body'
                weight='semibold'
                color={{ color: theme.colors.meetingSectionSortByTextColor }}
              >
                {t('{{milestones}}:', {
                  milestones: terms.milestone.plural,
                })}
              </Text>
            )}
            {getResponsiveSize() === 'LARGE' && (
              <Menu
                content={(close) => (
                  <>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        props.actions().onToggleMilestones(false)
                      }}
                    >
                      <Text type={'body'}>
                        {t('Close all')}
                        {!props.data().isExpandedMilestones && (
                          <Icon
                            iconName={'checkIcon'}
                            css={css`
                              margin-left: ${(props) =>
                                props.theme.sizes.spacing8};
                              margin-top: auto;
                              margin-bottom: auto;
                            `}
                            iconSize={'md'}
                          />
                        )}
                      </Text>
                    </Menu.Item>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        props.actions().onToggleMilestones(true)
                      }}
                    >
                      <Text type={'body'}>
                        {t('Open all')}
                        {props.data().isExpandedMilestones && (
                          <Icon
                            iconName={'checkIcon'}
                            css={css`
                              margin-left: ${(props) =>
                                props.theme.sizes.spacing8};
                              margin-top: auto;
                              margin-bottom: auto;
                            `}
                            iconSize={'md'}
                          />
                        )}
                      </Text>
                    </Menu.Item>
                  </>
                )}
              >
                <span>
                  <Clickable
                    clicked={() => null}
                    css={css`
                      margin-right: ${(prop) => prop.theme.sizes.spacing8};
                    `}
                  >
                    <span
                      css={css`
                        display: flex;
                        align-items: center;
                      `}
                    >
                      <Text type='body'>
                        {!props.data().isExpandedMilestones
                          ? t('Close all')
                          : t('Open all')}
                      </Text>
                      <Icon
                        iconName={
                          props.data().isExpandedMilestones
                            ? 'chevronDownIcon'
                            : 'chevronUpIcon'
                        }
                        iconSize='lg'
                      />
                    </span>
                  </Clickable>
                </span>
              </Menu>
            )}
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
                      close(e)
                      props.actions().onCreateGoal()
                    }}
                  >
                    <Text type={'body'}>
                      {t('Create {{goal}}', {
                        goal: terms.goal.lowercaseSingular,
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
                  {getResponsiveSize() !== 'LARGE' && (
                    <>
                      <Menu.Item
                        onClick={(e) => {
                          close(e)
                          props.actions().onToggleMilestones(true)
                        }}
                      >
                        <Text type={'body'}>
                          {t('Open all {{milestones}}', {
                            milestones: terms.milestone.lowercasePlural,
                          })}
                        </Text>
                      </Menu.Item>
                      <Menu.Item
                        onClick={(e) => {
                          close(e)
                          props.actions().onToggleMilestones(false)
                        }}
                      >
                        <Text type={'body'}>
                          {t('Close all {{milestones}}', {
                            milestones: terms.milestone.lowercasePlural,
                          })}
                        </Text>
                      </Menu.Item>
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
            {props.data().isExpandedOnWorkspacePage && (
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
        {observableResizeState.loadingUI}
        {observableResizeState.ready && (
          <FastList
            waitUntil={() => !props.data().isLoading}
            items={props.data().userGoalsInAllMeetings()}
          >
            {(meetingWithGoals) => {
              return (
                <div id={`${meetingWithGoals.id}`} key={meetingWithGoals.id}>
                  {meetingWithGoals.meetingName === 'PERSONAL' ? (
                    <TextEllipsis
                      lineLimit={1}
                      wordBreak={true}
                      type='small'
                      weight='semibold'
                      css={css`
                        background-color: ${meetingWithGoals.meetingColor};
                        border-radius: ${toREM(4)};
                        margin-bottom: ${(prop) => prop.theme.sizes.spacing4};
                        margin-left: ${(prop) => prop.theme.sizes.spacing16};
                        margin-top: ${(prop) => prop.theme.sizes.spacing32};
                        padding: ${toREM(2)} ${toREM(6)};
                        width: fit-content;
                      `}
                    >
                      {t('Personal')}
                      {getResponsiveSize() !== 'SMALL' && (
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
                        background-color: ${meetingWithGoals.meetingColor};
                        border-radius: ${toREM(4)};
                        margin-bottom: ${(prop) => prop.theme.sizes.spacing4};
                        margin-left: ${(prop) => prop.theme.sizes.spacing16};
                        margin-top: ${(prop) => prop.theme.sizes.spacing32};
                        padding: ${toREM(2)} ${toREM(6)};
                        width: fit-content;
                      `}
                    >
                      {meetingWithGoals.meetingName}
                    </TextEllipsis>
                  )}
                  <FastList items={meetingWithGoals.goals}>
                    {(goal) => {
                      return (
                        <GoalsListGoalEntry
                          key={goal.id}
                          getData={() => ({
                            isLoading: props.data().isLoading,
                            meetingId: meetingWithGoals.meetingId,
                            isShowingAllMilestones:
                              props.data().isExpandedMilestones,
                            getCurrentUserPermissions: () =>
                              meetingWithGoals.permissions,
                          })}
                          isPersonalWorkspaceView={true}
                          goal={goal}
                          getResponsiveSize={getResponsiveSize}
                          isWorkspaceView={true}
                          getActionHandlers={() => ({
                            onEditGoalRequest:
                              props.actions().onEditGoalRequest,
                            onUpdateGoalStatus:
                              props.actions().onUpdateGoalStatus,
                            onUpdateMilestone:
                              props.actions().onUpdateMilestone,
                            onCreateContextAwareIssueFromGoal: function () {
                              return null
                            },
                            onCreateContextAwareTodoFromGoal: function () {
                              return null
                            },
                          })}
                        />
                      )
                    }}
                  </FastList>
                </div>
              )
            }}
          </FastList>
        )}
        <BloomPageEmptyState
          show={
            !props.data().userGoalsInAllMeetings().length &&
            !props.data().isLoading
          }
          showBtn={true}
          emptyState={EMPTYSTATE_DATA[EMeetingPageType.Goals] || undefined}
          fillParentContainer={true}
        />
      </Card.Body>
    </Card>
  )
})
