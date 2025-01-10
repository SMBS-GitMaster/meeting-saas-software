import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { getShortDateDisplay } from '@mm/core/date'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'

import { PermissionCheckResult, useBloomCustomTerms } from '@mm/core-bloom'

import {
  GOAL_STATUS_LOOKUP,
  GOAL_STATUS_LOOKUP_RESPONSIVE_SMALL,
} from '@mm/core-bloom/goals'
import { GoalStatus } from '@mm/core-bloom/goals/goalTypes'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Badge,
  BtnIcon,
  Clickable,
  ColoredSelectInput,
  Icon,
  Menu,
  Pill,
  Text,
  Tooltip,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'
import { bloomColors } from '@mm/core-web/ui/theme/bloom/bloomVariables'

import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { IContextAwareItemFromGoalOpts } from '@mm/bloom-web/shared'
import {
  getContextAwareIssueText,
  getContextAwareTodoText,
} from '@mm/bloom-web/shared'

import { GoalsListMilestoneEntry } from './goalsListMilestoneEntry'
import { GOAL_STATUS_TO_INTENT } from './goalsListSharedConstants'
import type {
  IGoalsListGoalData,
  TGoalsListResponsiveSizes,
} from './goalsListSharedTypes'
import { MilestoneCountLabel } from './goalsMilestoneCountLabel'

interface IGoalsListGoalEntryProps {
  getData: () => {
    isLoading: boolean
    meetingId: Id
    isShowingAllMilestones: boolean
    getCurrentUserPermissions: () => {
      canEditGoalsInMeeting: PermissionCheckResult
      canCreateIssuesInMeeting: PermissionCheckResult
      canCreateTodosInMeeting: PermissionCheckResult
      canCreateGoalsInMeeting: PermissionCheckResult
    }
  }
  getResponsiveSize: () => TGoalsListResponsiveSizes
  goal: IGoalsListGoalData
  isWorkspaceView: boolean
  isPersonalWorkspaceView?: boolean
  getActionHandlers: () => {
    onEditGoalRequest: (opts: { goalId: Id; meetingId: Id }) => void
    onCreateContextAwareIssueFromGoal(opts: {
      context: IContextAwareItemFromGoalOpts
      meetingId: Id
    }): void
    onCreateContextAwareTodoFromGoal(opts: {
      context: IContextAwareItemFromGoalOpts
      meetingId: Id
    }): void
    onUpdateGoalStatus: (opts: { id: Id; status: GoalStatus }) => void
    onUpdateMilestone: (
      opts: Partial<{
        id: Id
        completed: boolean
        dueDate: number
      }>
    ) => Promise<void>
  }
}

export const GoalsListGoalEntry = observer(function GoalsListGoalEntry(
  props: IGoalsListGoalEntryProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()

  const pageState = useObservable({
    showAllMilestones: props.getData().isShowingAllMilestones,
  })

  const setShowAllMilestones = useAction((showAllMilestones: boolean) => {
    pageState.showAllMilestones = showAllMilestones
  })

  const {
    canEditGoalsInMeeting,
    canCreateTodosInMeeting,
    canCreateIssuesInMeeting,
  } = props.getData().getCurrentUserPermissions()

  const isPersonalWorkspaceView = props.isPersonalWorkspaceView || false

  const isInDepartmentPlan = props.goal.departmentPlanRecords.nodes.some(
    ({ meetingId, isInDepartmentPlan }) =>
      meetingId === props.getData().meetingId && isInDepartmentPlan
  )

  const memoizedGoalStatusFormValue = useMemo(() => {
    return {
      goalStatus: props.goal.status,
    }
  }, [props.goal.status])

  const goalsListMilestoneEntryActions = useComputed(
    () => {
      return {
        onUpdateMilestone: props.getActionHandlers().onUpdateMilestone,
      }
    },
    { name: 'GoalsListGoalEntry-goalsListMilestoneEntryActions' }
  )

  const isShowingAllMilestones = props.getData().isShowingAllMilestones
  React.useEffect(() => {
    setShowAllMilestones(isShowingAllMilestones)
  }, [isShowingAllMilestones])

  return (
    <>
      <div
        onClick={() =>
          props.getActionHandlers().onEditGoalRequest({
            goalId: props.goal.id,
            meetingId: props.getData().meetingId,
          })
        }
        role='presentation'
        css={css`
          background-color: ${(prop) => prop.theme.colors.goalsListGoalEntryBg};
          margin-top: ${({ theme }) => theme.sizes.spacing4};
          padding: ${(prop) => prop.theme.sizes.spacing16};
          cursor: pointer;

          &:hover,
          &:focus {
            background-color: ${(prop) =>
              prop.theme.colors.itemHoverBackgroundColor};
          }

          &:first-of-type {
            margin-top: 0;
          }

          &:last-of-type {
            border-radius: ${(props) => props.theme.sizes.br1};
          }
        `}
      >
        {props.getResponsiveSize() === 'SMALL' && (
          <Clickable
            css={css`
              display: flex;
              flex: 1;
              justify-content: flex-start;
              margin-top: ${({ theme }) => theme.sizes.spacing4};

              ${props.getResponsiveSize() !== 'SMALL' &&
              css`
                margin-right: ${(prop) => prop.theme.sizes.spacing36};
              `}
            `}
            clicked={() =>
              props.getActionHandlers().onEditGoalRequest({
                goalId: props.goal.id,
                meetingId: props.getData().meetingId,
              })
            }
          >
            <TextEllipsis
              type='body'
              weight='semibold'
              lineLimit={2}
              wordBreak={true}
              color={{ color: theme.colors.goalsListGoalEntryTitleColor }}
              css={css`
                text-align: left;
              `}
            >
              {props.goal.title}
            </TextEllipsis>
          </Clickable>
        )}
        <div
          css={css`
            align-items: center;
            display: flex;
            justify-content: space-between;
          `}
        >
          {props.getResponsiveSize() !== 'SMALL' && (
            <div
              css={css`
                align-items: center;
                display: flex;
                flex: 1;
                flex-direction: row;
                margin: ${toREM(5)} ${({ theme }) => theme.sizes.spacing40} 0 0;
                min-height: ${({ theme }) => theme.sizes.spacing32};
              `}
            >
              <Clickable
                css={css`
                  display: flex;
                  flex: 1;
                  justify-content: flex-start;
                `}
                clicked={() =>
                  props.getActionHandlers().onEditGoalRequest({
                    goalId: props.goal.id,
                    meetingId: props.getData().meetingId,
                  })
                }
              >
                <TextEllipsis
                  type='body'
                  weight='semibold'
                  lineLimit={2}
                  wordBreak={true}
                  color={{ color: theme.colors.goalsListGoalEntryTitleColor }}
                  css={css`
                    text-align: left;
                  `}
                >
                  {props.goal.title}
                </TextEllipsis>
              </Clickable>
            </div>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            role='presentation'
            css={css`
              align-items: flex-start;
              display: flex;
              flex: ${props.getResponsiveSize() === 'SMALL' ? 1 : 0};
            `}
          >
            {/* If viewing archived */}
            {/* <BtnIcon
                iconProps={{
                  iconName: 'restoreIcon',
                  iconSize: 'lg',
                }}
                disabled={!canEditGoalsInMeeting.allowed}
                tooltip={
                  !canEditGoalsInMeeting.allowed
                    ? {
                        msg: canEditGoalsInMeeting.message,
                        position: 'top left',
                      }
                    : { msg: t('Restore') }
                }
                size='lg'
                intent='tertiaryTransparent'
                ariaLabel={t('Restore')}
                tag='button'
                onClick={() => props.onRestore(props.goal.id)}
                css={css`
                  margin-right: ${(prop) => prop.theme.sizes.spacing16};
                `}
              /> */}
            {isInDepartmentPlan && (
              <div
                css={css`
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: ${toREM(40)};
                  height: ${toREM(40)};
                  padding-right: ${(prop) => prop.theme.sizes.spacing6};
                `}
              >
                <Badge intent='secondary' text={t('BP')} textType={'small'} />
              </div>
            )}
            {props.getResponsiveSize() === 'LARGE' &&
              !isPersonalWorkspaceView && (
                <>
                  <BtnIcon
                    iconProps={{
                      iconName: 'toDoCompleteIcon',
                      iconSize: 'lg',
                    }}
                    disabled={!canCreateTodosInMeeting.allowed}
                    tooltip={
                      !canCreateTodosInMeeting.allowed
                        ? {
                            msg: canCreateTodosInMeeting.message,
                            position: 'top left',
                          }
                        : {
                            msg: getContextAwareTodoText(terms),
                            offset: `${toREM(-10)}`,
                            type: 'light',
                          }
                    }
                    size='lg'
                    intent='tertiaryTransparent'
                    ariaLabel={getContextAwareTodoText(terms)}
                    tag='button'
                    onClick={() =>
                      props
                        .getActionHandlers()
                        .onCreateContextAwareTodoFromGoal({
                          context: {
                            title: props.goal.title,
                            type: 'Goal',
                            ownerId: props.goal.assignee.id,
                            ownerFullName: props.goal.assignee.fullName,
                            notesId: props.goal.notesId,
                            status: props.goal.status,
                            dateCreated: props.goal.dateCreated,
                            dueDate: props.goal.dueDate,
                          },
                          meetingId: props.getData().meetingId,
                        })
                    }
                  />
                  <BtnIcon
                    iconProps={{
                      iconName: 'issuesIcon',
                      iconSize: 'lg',
                    }}
                    disabled={!canCreateIssuesInMeeting.allowed}
                    tooltip={
                      !canCreateIssuesInMeeting.allowed
                        ? {
                            msg: canCreateIssuesInMeeting.message,
                            position: 'top left',
                          }
                        : {
                            msg: getContextAwareIssueText(terms),
                            offset: `${toREM(-10)}`,
                            type: 'light',
                          }
                    }
                    size='lg'
                    intent='tertiaryTransparent'
                    ariaLabel={getContextAwareIssueText(terms)}
                    tag='button'
                    onClick={() =>
                      props
                        .getActionHandlers()
                        .onCreateContextAwareIssueFromGoal({
                          context: {
                            title: props.goal.title,
                            type: 'Goal',
                            ownerId: props.goal.assignee.id,
                            ownerFullName: props.goal.assignee.fullName,
                            notesId: props.goal.notesId,
                            status: props.goal.status,
                            dateCreated: props.goal.dateCreated,
                            dueDate: props.goal.dueDate,
                          },
                          meetingId: props.getData().meetingId,
                        })
                    }
                  />
                </>
              )}
            {props.getResponsiveSize() === 'SMALL' && (
              <div
                css={css`
                  display: flex;
                  flex-direction: row;
                  padding-right: ${(prop) => prop.theme.sizes.spacing16};
                  padding-top: ${(prop) => prop.theme.sizes.spacing8};
                  flex: 1;
                `}
              >
                {props.goal.milestones.nodes.length > 0 && (
                  <MilestoneCountLabel
                    quantity={props.goal.milestones.nodes.length}
                    ellipsisText={true}
                  />
                )}

                {props.goal.milestones.nodes.length > 0 && (
                  <Clickable
                    clicked={() =>
                      setShowAllMilestones(!pageState.showAllMilestones)
                    }
                  >
                    {pageState.showAllMilestones ? (
                      <Icon iconName='chevronDownIcon' iconSize='md' />
                    ) : (
                      <Icon iconName='chevronRightIcon' iconSize='md' />
                    )}
                  </Clickable>
                )}
              </div>
            )}

            <EditForm
              css={css`
                margin-left: auto;
              `}
              isLoading={props.getData().isLoading}
              values={memoizedGoalStatusFormValue}
              disabled={!canEditGoalsInMeeting.allowed}
              disabledTooltip={
                !canEditGoalsInMeeting.allowed
                  ? {
                      msg: canEditGoalsInMeeting.message,
                      type: 'light',
                      position: 'top center',
                    }
                  : undefined
              }
              validation={
                {
                  goalStatus: formValidators.string({ additionalRules: [] }),
                } satisfies GetParentFormValidation<{
                  goalStatus: GoalStatus
                }>
              }
              onSubmit={async (values) => {
                if (values.goalStatus) {
                  props.getActionHandlers().onUpdateGoalStatus({
                    id: props.goal.id,
                    status: values.goalStatus,
                  })
                }
              }}
            >
              {({ values, fieldNames }) => {
                return (
                  <>
                    {values && (
                      <ColoredSelectInput
                        id={`goalStatus-${props.goal.id}`}
                        name={fieldNames.goalStatus}
                        variant='list'
                        readonly={false}
                        unknownItemText={t('Unknown status')}
                        tooltip={
                          false
                            ? { msg: t('Restore to change status') }
                            : !canEditGoalsInMeeting.allowed
                              ? {
                                  msg: canEditGoalsInMeeting.message,
                                  type: 'light',
                                  position: 'top left',
                                }
                              : undefined
                        }
                        options={(props.getResponsiveSize() !== 'LARGE'
                          ? GOAL_STATUS_LOOKUP_RESPONSIVE_SMALL
                          : GOAL_STATUS_LOOKUP
                        ).map((item) => ({
                          ...item,
                          intent: GOAL_STATUS_TO_INTENT[item.value],
                        }))}
                        width={
                          props.getResponsiveSize() !== 'LARGE'
                            ? toREM(60)
                            : toREM(116)
                        }
                        error={undefined}
                      />
                    )}
                  </>
                )
              }}
            </EditForm>
            {props.getResponsiveSize() !== 'LARGE' &&
              !isPersonalWorkspaceView && (
                <Menu
                  position={'right center'}
                  minWidthRems={17}
                  content={(close) => (
                    <>
                      <Menu.Item
                        disabled={!canCreateIssuesInMeeting.allowed}
                        tooltip={
                          !canCreateIssuesInMeeting.allowed
                            ? {
                                msg: canCreateIssuesInMeeting.message,
                                position: 'top left',
                              }
                            : undefined
                        }
                        onClick={async (e) => {
                          props
                            .getActionHandlers()
                            .onCreateContextAwareIssueFromGoal({
                              context: {
                                title: props.goal.title,
                                type: 'Goal',
                                ownerId: props.goal.assignee.id,
                                ownerFullName: props.goal.assignee.fullName,
                                notesId: props.goal.notesId,
                                status: props.goal.status,
                                dateCreated: props.goal.dateCreated,
                                dueDate: props.goal.dueDate,
                              },
                              meetingId: props.getData().meetingId,
                            })
                          close(e)
                        }}
                      >
                        <div
                          css={css`
                            align-items: center;
                            display: flex;
                          `}
                        >
                          <Icon
                            iconName={'issuesIcon'}
                            iconSize={'lg'}
                            css={css`
                              margin-right: ${(props) =>
                                props.theme.sizes.spacing8};
                            `}
                          />
                          <Text type={'body'}>
                            {getContextAwareIssueText(terms)}
                          </Text>
                        </div>
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
                        onClick={async (e) => {
                          props
                            .getActionHandlers()
                            .onCreateContextAwareTodoFromGoal({
                              context: {
                                title: props.goal.title,
                                type: 'Goal',
                                ownerId: props.goal.assignee.id,
                                ownerFullName: props.goal.assignee.fullName,
                                notesId: props.goal.notesId,
                                status: props.goal.status,
                                dateCreated: props.goal.dateCreated,
                                dueDate: props.goal.dueDate,
                              },
                              meetingId: props.getData().meetingId,
                            })
                          close(e)
                        }}
                      >
                        <div
                          css={css`
                            align-items: center;
                            display: flex;
                          `}
                        >
                          <Icon
                            iconName={'toDoCompleteIcon'}
                            iconSize={'lg'}
                            css={css`
                              margin-right: ${(props) =>
                                props.theme.sizes.spacing8};
                            `}
                          />
                          <Text type={'body'}>
                            {getContextAwareTodoText(terms)}
                          </Text>
                        </div>
                      </Menu.Item>
                    </>
                  )}
                >
                  <span
                    css={css`
                      align-self: center;
                      margin-left: ${(props) => props.theme.sizes.spacing4};
                    `}
                  >
                    <Clickable clicked={() => null}>
                      <Icon iconName='moreVerticalIcon' iconSize='lg' />
                    </Clickable>
                  </span>
                </Menu>
              )}
          </div>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          role='presentation'
          css={css`
            align-items: center;
            display: flex;
            justify-content: space-between;
            margin-top: ${(prop) => prop.theme.sizes.spacing8};
            padding-right: ${(prop) => prop.theme.sizes.spacing12};
            width: fit-content;
          `}
        >
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            {props.getResponsiveSize() !== 'SMALL' && (
              <div
                css={css`
                  padding-right: ${(prop) => prop.theme.sizes.spacing16};
                  padding-top: ${(prop) => prop.theme.sizes.spacing8};
                  flex: 1;
                  display: flex;
                  align-items: center;
                `}
              >
                {props.goal.milestones.nodes.length > 0 &&
                  !props.isWorkspaceView && (
                    <div
                      css={css`
                        padding-right: ${(prop) => prop.theme.sizes.spacing16};
                        flex: 1;
                      `}
                    >
                      <MilestoneCountLabel
                        quantity={props.goal.milestones.nodes.length}
                        ellipsisText={true}
                      />
                    </div>
                  )}
                {props.goal.milestones.nodes.map((milestone, index) => (
                  <Tooltip
                    position='bottom left'
                    contentCss={css`
                      transform: translateX(${toREM(-10)}) !important;
                    `}
                    key={milestone.id}
                    msg={
                      <div
                        css={css`
                          align-items: center;
                        `}
                      >
                        <Text
                          type='body'
                          weight='semibold'
                          css={css`
                            margin-bottom: ${({ theme }) =>
                              theme.sizes.spacing8};
                          `}
                        >
                          {getShortDateDisplay({
                            secondsSinceEpochUTC: milestone.dueDate,
                            userTimezone: 'utc',
                          })}
                        </Text>
                        <Pill
                          css={css`
                            margin-left: ${(prop) => prop.theme.sizes.spacing8};
                          `}
                          intent={milestone.milestoneColorIntent}
                        />
                        <div
                          css={css`
                            display: flex;
                          `}
                        >
                          <Text
                            type='body'
                            wordBreak={true}
                            css={css`
                              color: ${bloomColors.neutral500};
                            `}
                          >
                            {milestone.title}
                          </Text>
                        </div>
                      </div>
                    }
                    type='gray'
                  >
                    <span>
                      <Pill
                        intent={milestone.milestoneColorIntent}
                        css={css`
                          margin-right: ${index ===
                          props.goal.milestones.nodes.length - 1
                            ? theme.sizes.spacing4
                            : theme.sizes.spacing8};
                        `}
                      />
                    </span>
                  </Tooltip>
                ))}

                {props.goal.milestones.nodes.length > 0 && (
                  <Clickable
                    clicked={() =>
                      setShowAllMilestones(!pageState.showAllMilestones)
                    }
                  >
                    {pageState.showAllMilestones ? (
                      <Icon iconName='chevronDownIcon' iconSize='md' />
                    ) : (
                      <Icon iconName='chevronRightIcon' iconSize='md' />
                    )}
                  </Clickable>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {pageState.showAllMilestones && (
        <>
          {props.goal.milestones.nodes.map((milestone) => (
            <div
              key={milestone.id}
              css={css`
                background-color: ${(prop) =>
                  prop.theme.colors.goalsListMilestoneEntryBg};
                padding: ${(prop) =>
                  `0 ${prop.theme.sizes.spacing16} 0 ${prop.theme.sizes.spacing16}`};
                padding-left: ${(prop) => prop.theme.sizes.spacing24};

                &:hover,
                &:focus {
                  background-color: ${(prop) =>
                    prop.theme.colors.itemHoverBackgroundColor};
                }
              `}
            >
              <GoalsListMilestoneEntry
                isLoading={props.getData().isLoading}
                milestone={milestone}
                getResponsiveSize={props.getResponsiveSize}
                canEditGoalsInMeeting={canEditGoalsInMeeting}
                getActionHandlers={goalsListMilestoneEntryActions}
              />
            </div>
          ))}
        </>
      )}
    </>
  )
})
