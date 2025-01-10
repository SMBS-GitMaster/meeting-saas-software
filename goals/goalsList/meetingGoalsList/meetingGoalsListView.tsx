import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'

import { EMeetingPageType, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Badge,
  Breadcrumb,
  BtnIcon,
  Card,
  Clickable,
  FastList,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  UserAvatar,
  toREM,
  useRenderListItem,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import {
  useAction,
  useComputed,
  useObservable,
  useObservablePreviousValue,
} from '@mm/bloom-web/pages/performance/mobx'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import {
  BloomPageEmptyState,
  BloomPageEmptyStateTooltipProvider,
  getEmptyStateData,
} from '@mm/bloom-web/shared/components/bloomPageEmptyState'
import { SortBy } from '@mm/bloom-web/shared/components/sortBy'

import { GoalsListGoalEntry } from '../goalsListGoalEntry'
import type { IGoalsListGoalData } from '../goalsListSharedTypes'
import { getMeetingGoalsListSortingOptions } from './meetingGoalsListConstants'
import type {
  IMeetingGoalsListViewProps,
  TMeetingGoalsListTab,
} from './meetingGoalsListTypes'

export const MeetingGoalsListView = observer(function MeetingGoalsListView(
  props: IMeetingGoalsListViewProps
) {
  const pageState = useObservable({
    goalsListEl: null as Maybe<HTMLDivElement>,
  })

  const setGoalsListEl = useAction((goalsListEl: Maybe<HTMLDivElement>) => {
    pageState.goalsListEl = goalsListEl
  })

  const diResolver = useDIResolver()
  const observableResizeState = useResizeObserver(pageState.goalsListEl)
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const { fullScreenTile, minimizeTile } =
    useWorkspaceFullScreenTileController()
  const { t } = useTranslation()

  const EMPTYSTATE_DATA = getEmptyStateData(terms)

  const isWorkspaceView = props.getData().pageType === 'WORKSPACE'

  const workspaceTileId = props.getData().workspaceTileId

  const previousTab = useObservablePreviousValue(
    () => props.getData().selectedTab
  )

  const getResponsiveSize = useComputed(
    () => {
      if (!observableResizeState.ready) return 'UNKNOWN'
      if (observableResizeState.width < 400) return 'SMALL'
      if (observableResizeState.width < 800) return 'MEDIUM'
      return 'LARGE'
    },
    { name: 'goalListView-getResponsizeSize' }
  )

  const getGoalsTabs = useComputed(
    () => {
      return {
        this_meeting: `${t('All {{goals}}', { goals: terms.goal.plural })} (${props
          .getData()
          .getGoalsTotalCount()})`,
        meeting_business: `${t('{{businessPlan}} {{goals}} ', {
          businessPlan: terms.businessPlan.singular,
          goals: terms.goal.plural,
        })} (${props.getData().getDepartmentPlanGoalsForTotalCount()})`,
      }
    },
    { name: 'goalsListView-getGoalsTabs' }
  )

  const GOAL_TAB_TO_ELEMENT_FOR_RESPONSIVE_TAB_MENU: Record<
    TMeetingGoalsListTab,
    () => JSX.Element
  > = {
    meeting_business: () => (
      <>
        <div
          css={css`
            display: inline-flex;
            align-items: flex-start;
            justify-content: center;
            padding: 0 ${theme.sizes.spacing6} ${toREM(2)} 0;
          `}
        >
          <Badge intent='secondary' text={t('BP')} textType={'small'} />
        </div>
        <TextEllipsis type='body' weight='bold' lineLimit={1}>
          {`${t(`{{goalTerm}}`, {
            goalTerm: terms.goal.plural,
          })} (${props.getData().getDepartmentPlanGoalsForTotalCount()})`}
        </TextEllipsis>
      </>
    ),
    this_meeting: () => (
      <>
        <TextEllipsis type='body' weight='bold' lineLimit={1}>
          {getGoalsTabs()[props.getData().selectedTab]}
        </TextEllipsis>
      </>
    ),
  }

  const { canCreateGoalsInMeeting, canEditGoalsInMeeting } = props
    .getData()
    .getCurrentUserPermissions()

  const checkIcon = (
    <Icon
      iconName={'checkIcon'}
      css={css`
        margin-left: ${(props) => props.theme.sizes.spacing8};
        margin-top: auto;
        margin-bottom: auto;
      `}
      iconSize={'md'}
    />
  )

  const getGoalsGroupedByOwner = useComputed(
    () => {
      return props
        .getData()
        .getGoals()
        .reduce((groupedGoals, goal) => {
          const groupedObjectKey = goal.assignee.id
          if (!groupedGoals.has(groupedObjectKey)) {
            groupedGoals.set(groupedObjectKey, [])
          }
          const goalsArray = groupedGoals.get(groupedObjectKey)
          if (goalsArray) {
            goalsArray.push(goal)
          }
          return groupedGoals
        }, new Map<Id, IGoalsListGoalData[]>())
    },
    { name: 'goalsListView-getGoalsGroupedByOwner' }
  )

  const getPercentOfGoalsCompleted = useComputed(
    () => {
      return Object.fromEntries(
        [...getGoalsGroupedByOwner()].map(([user, goals]) => {
          const totalGoals = goals.length
          const completeGoals = goals.filter(
            (goal) => goal.status === 'COMPLETED'
          ).length
          return [user, Math.ceil((completeGoals / totalGoals) * 100)]
        })
      )
    },
    { name: 'goalsListView-getPercentOfGoalsCompleted' }
  )

  const renderGoalListItem = useRenderListItem<IGoalsListGoalData>((goal) => {
    return (
      <GoalsListGoalEntry
        key={goal.id}
        getData={props.getData}
        getResponsiveSize={getResponsiveSize}
        goal={goal}
        isWorkspaceView={isWorkspaceView}
        getActionHandlers={props.getActionHandlers}
      />
    )
  })

  return (
    <>
      <Card ref={setGoalsListEl} className={props.className}>
        <Card.Header
          renderLeft={
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              {!isWorkspaceView ? (
                <Breadcrumb
                  fontType='h3'
                  steps={props.getData().getBreadcrumbs()}
                  showInProgressIndicator={false}
                  css={css`
                    margin-right: ${(props) => props.theme.sizes.spacing8};
                  `}
                />
              ) : (
                <TextEllipsis type='h3' lineLimit={1}>
                  {`${t('{{goals}}:', {
                    goals: terms.goal.plural,
                  })} ${props.getData().meetingName}`}
                </TextEllipsis>
              )}
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
                      onClick={() =>
                        props
                          .getActionHandlers()
                          .onCreateGoal(props.getData().meetingId)
                      }
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
                          props.getActionHandlers().onToggleMilestones(false)
                        }}
                      >
                        <Text type={'body'}>
                          {t('Close all')}
                          {!props.getData().isShowingAllMilestones
                            ? checkIcon
                            : null}
                        </Text>
                      </Menu.Item>
                      <Menu.Item
                        onClick={(e) => {
                          close(e)
                          props.getActionHandlers().onToggleMilestones(true)
                        }}
                      >
                        <Text type={'body'}>
                          {t('Open all')}
                          {props.getData().isShowingAllMilestones
                            ? checkIcon
                            : null}
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
                          {!props.getData().isShowingAllMilestones
                            ? t('Close all')
                            : t('Open all')}
                        </Text>
                        <Icon
                          iconName={
                            props.getData().isShowingAllMilestones
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
              <SortBy
                sortingOptions={getMeetingGoalsListSortingOptions(diResolver)}
                selected={props.getData().sortBy}
                showOnlyIcon={getResponsiveSize() !== 'LARGE'}
                onChange={props.getActionHandlers().onSelectGoalsSorting}
              />
              <Menu
                maxWidth={toREM(330)}
                content={(close) => (
                  <>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        props
                          .getActionHandlers()
                          .onCreateGoal(props.getData().meetingId)
                      }}
                    >
                      <Text type={'body'}>
                        {t('Create {{goal}}', {
                          goal: terms.goal.lowercaseSingular,
                        })}
                      </Text>
                    </Menu.Item>
                    {!isWorkspaceView && (
                      <>
                        <Menu.Item
                          disabled={!canEditGoalsInMeeting.allowed}
                          tooltip={
                            !canEditGoalsInMeeting.allowed
                              ? {
                                  msg: canEditGoalsInMeeting.message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            props.getActionHandlers().onPrintGoals()
                          }}
                        >
                          <Text type={'body'}>{t('Print')}</Text>
                        </Menu.Item>
                        <Menu.Item
                          disabled={!canCreateGoalsInMeeting.allowed}
                          tooltip={
                            !canCreateGoalsInMeeting.allowed
                              ? {
                                  msg: canCreateGoalsInMeeting.message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            props.getActionHandlers().onUploadGoals()
                          }}
                        >
                          <Text type={'body'}>{t('Upload')}</Text>
                        </Menu.Item>
                        {/* <Menu.Item
                          disabled={!canEditGoalsInMeeting.allowed}
                          tooltip={
                            !canEditGoalsInMeeting.allowed
                              ? {
                                  msg: canEditGoalsInMeeting.message,
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            props.getActionHandlers().onExportGoals()
                          }}
                        >
                          <Text type={'body'}>{t('Export')}</Text>
                        </Menu.Item> */}
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            props
                              .getActionHandlers()
                              .onViewArchivedGoals(props.getData().meetingId)
                          }}
                        >
                          <Text type={'body'}>
                            {t('Archived {{goals}}', {
                              goals: terms.goal.lowercasePlural,
                            })}
                          </Text>
                        </Menu.Item>
                      </>
                    )}
                    {isWorkspaceView && (
                      <>
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
                      </>
                    )}
                    {getResponsiveSize() !== 'LARGE' && (
                      <>
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            props.getActionHandlers().onToggleMilestones(true)
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
                            props.getActionHandlers().onToggleMilestones(false)
                          }}
                        >
                          <Text type={'body'}>
                            {t('Close all {{milestones}}', {
                              milestones: terms.milestone.lowercasePlural,
                            })}
                          </Text>
                        </Menu.Item>
                        {props.getData().workspaceType === 'PERSONAL' && (
                          <Menu.Item
                            onClick={(e) => {
                              close(e)
                              props.getActionHandlers().onDeleteTile()
                            }}
                          >
                            <Text type={'body'}>{t('Delete tile')}</Text>
                          </Menu.Item>
                        )}
                      </>
                    )}
                    {/* @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1837
                <Menu.Divider />
                <Menu.Item
                  tag='div'
                  contentCss={css`
                    padding: ${theme.sizes.spacing16};
                  `}
                  onClick={() => null}
                >
                  <SwitchInput
                    onChange={
                      props.actionHandlers.onCreateTodosForMilestone
                    }
                    id='goals-list-view-create-todos-for-milestone'
                    name='goals_list_view_create_todos_for_milestone'
                    value={props.data.createTodosForMilestone}
                    size='default'
                    text={t(`Create {{todos}} for {{milestones}} not completed 7 days
                      before due date.`, {todos: terms.todo.lowercasePlural, milestones: terms.milestone.lowercasePlural})}
                    css={css`
                      height: auto;
                    `}
                    switchPosition='top'
                  />
                </Menu.Item> */}
                  </>
                )}
              >
                <span>
                  <Clickable clicked={() => null}>
                    <Icon iconName='moreVerticalIcon' iconSize='lg' />
                  </Clickable>
                </span>
              </Menu>
              {props.getData().isExpandedOnWorkspacePage && (
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
          {getResponsiveSize() === 'LARGE' ? (
            <Card.Tabs
              active={props.getData().selectedTab}
              onChange={(tab) =>
                props
                  .getActionHandlers()
                  .onSelectGoalTab(tab as TMeetingGoalsListTab)
              }
              tabs={[
                {
                  text: `${t(`All {{goalTerm}}`, {
                    goalTerm: terms.goal.plural,
                  })} (${props.getData().getGoalsTotalCount()})`,
                  value: 'this_meeting',
                },
                {
                  text: `${t(`{{goalTerm}}`, {
                    goalTerm: terms.goal.plural,
                  })} (${props.getData().getDepartmentPlanGoalsForTotalCount()})`,
                  value: 'meeting_business',
                  customPrefix: () => (
                    <div
                      css={css`
                        display: inline-flex;
                        align-items: flex-start;
                        justify-content: center;
                        padding: 0 ${theme.sizes.spacing6} ${toREM(2)} 0;
                      `}
                    >
                      <Badge
                        intent={
                          props.getData().selectedTab === 'meeting_business'
                            ? 'secondary'
                            : 'inactive'
                        }
                        text={t('BP')}
                        textType={'small'}
                      />
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <Menu
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={(e) => {
                      close(e)
                      props.getActionHandlers().onSelectGoalTab('this_meeting')
                    }}
                  >
                    <Text type={'body'}>{getGoalsTabs()['this_meeting']}</Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      close(e)
                      props
                        .getActionHandlers()
                        .onSelectGoalTab('meeting_business')
                    }}
                  >
                    <Text
                      type={'body'}
                      css={css`
                        text-align: left;
                      `}
                    >
                      {getGoalsTabs()['meeting_business']}
                    </Text>
                  </Menu.Item>
                </>
              )}
            >
              <span
                css={css`
                  border-bottom: ${({ theme }) =>
                    `${theme.sizes.smallSolidBorder} ${theme.colors.cardActiveTabBorderColor}`};
                  display: flex;
                  margin-left: ${(props) => props.theme.sizes.spacing16};
                  margin-right: ${(props) => props.theme.sizes.spacing16};
                  margin-top: ${(props) => props.theme.sizes.spacing10};
                  width: fit-content;
                `}
              >
                {GOAL_TAB_TO_ELEMENT_FOR_RESPONSIVE_TAB_MENU[
                  props.getData().selectedTab
                ]()}
                <Icon iconName='chevronDownIcon' iconSize='md2' />
              </span>
            </Menu>
          )}
        </Card.Header>
        <Card.Body>
          {observableResizeState.loadingUI}
          {observableResizeState.ready && (
            <FastList
              items={Array.from(getGoalsGroupedByOwner().keys()).map(
                (ownerId) => ({
                  id: ownerId,
                })
              )}
              resetWhen={() =>
                previousTab.value !== props.getData().selectedTab
              }
              waitUntil={() => !props.getData().isLoading}
            >
              {(item) => {
                const ownerId = item.id
                const goals = getGoalsGroupedByOwner().get(ownerId)
                if (!goals) return null
                const firstGoal = goals[0]
                const percentComplete = getPercentOfGoalsCompleted()[ownerId]
                const percentCompleteIsGreaterThanZero =
                  percentComplete > 0 ? true : false

                return (
                  <div
                    key={ownerId}
                    css={css`
                      border-radius: ${({ theme }) => theme.sizes.spacing4};
                      border: ${theme.sizes.smallSolidBorder};
                      background-color: ${({ theme }) =>
                        theme.colors.cardBackgroundColor};
                      color: ${theme.colors.cardBorderColor};
                    `}
                  >
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        margin-top: ${({ theme }) => theme.sizes.spacing8};
                      `}
                    >
                      <UserAvatar
                        avatarUrl={firstGoal.assignee.avatar}
                        firstName={firstGoal.assignee.firstName}
                        lastName={firstGoal.assignee.lastName}
                        userAvatarColor={firstGoal.assignee.userAvatarColor}
                        size='m'
                        css={css`
                          flex: 0 0 ${toREM(24)};
                          margin-right: ${({ theme }) => theme.sizes.spacing16};
                          margin-left: ${({ theme }) => theme.sizes.spacing16};
                        `}
                        adornments={{ tooltip: false }}
                      />
                      <Text
                        type='h4'
                        css={css`
                          padding-right: ${theme.sizes.spacing16};
                        `}
                      >
                        {firstGoal.assignee.fullName}
                      </Text>
                      {percentCompleteIsGreaterThanZero && (
                        <div
                          css={css`
                            display: flex;
                            height: ${theme.sizes.spacing18};
                            padding: ${`${theme.sizes.spacing4} ${theme.sizes.spacing8}`};
                            justify-content: center;
                            align-items: center;
                            background-color: ${theme.colors
                              .goalsCompleteBadgeColor};
                          `}
                        >
                          {getResponsiveSize() !== 'SMALL' && (
                            <Text
                              type='small'
                              weight='bold'
                              color={{
                                color: theme.colors.textAreaTextColor,
                              }}
                            >{`${percentComplete}% ${t('completed')}`}</Text>
                          )}
                          {getResponsiveSize() === 'SMALL' && (
                            <Text
                              type='small'
                              weight='bold'
                              color={{
                                color: theme.colors.textAreaTextColor,
                              }}
                            >{`${percentComplete}%`}</Text>
                          )}
                        </div>
                      )}
                    </div>
                    <FastList
                      items={goals}
                      memoizedRenderListItem={renderGoalListItem}
                    />
                  </div>
                )
              }}
            </FastList>
          )}
          <BloomPageEmptyState
            show={
              !props.getData().getGoals().length && !props.getData().isLoading
            }
            showBtn={
              props.getData().selectedTab === 'this_meeting' && !isWorkspaceView
            }
            emptyState={
              isWorkspaceView
                ? EMPTYSTATE_DATA[EMeetingPageType.Goals] || undefined
                : props.getData().selectedTab === 'meeting_business'
                  ? EMPTYSTATE_DATA[EMeetingPageType.BP_Goals] || undefined
                  : undefined
            }
            fillParentContainer={isWorkspaceView}
          />
        </Card.Body>
      </Card>
    </>
  )
})
