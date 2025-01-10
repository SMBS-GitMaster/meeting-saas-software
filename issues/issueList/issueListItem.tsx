import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'
import { usePreviousValue } from '@mm/core/ui/hooks'

import {
  ISSUE_PRIORITY_UNRANKED_NUMBER,
  MeetingIssueVoting,
  PermissionCheckResult,
  TBloomPageType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  ActionButton,
  BtnIcon,
  CheckBoxInput,
  Clickable,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  Tooltip,
  UserAvatar,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction, useObservable } from '@mm/bloom-web/pages/performance/mobx'
import { getContextAwareTodoText } from '@mm/bloom-web/shared'

import { STAR_NUMBER } from './issueListConstants'
import {
  EIssueListColumnSize,
  IIssueListItem,
  IIssueListViewActionHandlers,
  TIssueListResponsiveSize,
} from './issueListTypes'

interface IIssueListItemProps {
  issue: IIssueListItem
  currentMeetingId: Id
  timezone: string
  mergeIssueMode: boolean
  canEditIssuesInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
  canCreateTodosInMeeting: PermissionCheckResult
  canStarVoteForIssuesInMeeting: PermissionCheckResult
  isLongTermIssue: boolean
  numberOfStarsLeftToAllocate: number
  issueVotingType: MeetingIssueVoting
  issueVotingHasEnded: boolean
  starsSelectedForIssue: number
  issueIdsToMerge: Array<Id>
  isDisabledMergeIssue: boolean
  showNumberedList: boolean
  isLoading: boolean
  numIssuesCurrentlyRanked: number
  issueListColumnSize: EIssueListColumnSize
  hasCurrentUserVoted: boolean
  isCompactView: boolean
  responsiveSize: TIssueListResponsiveSize
  pageType: TBloomPageType
  issueNumber: number
  handleAllocateStarsAction: (opts: {
    type: 'ADD' | 'SUBTRACT'
    issueId: Id
    numberToSelect: number
  }) => void
  handleSelectIssueToMerge: (issueId: Id) => void
  onCreateContextAwareTodoFromIssue: IIssueListViewActionHandlers['onCreateContextAwareTodoFromIssue']
  onEditIssueRequest: IIssueListViewActionHandlers['onEditIssueRequest']
  onMoveIssueToShortTerm: IIssueListViewActionHandlers['onMoveIssueToShortTerm']
  onAddIssueToDepartmentPlan: IIssueListViewActionHandlers['onAddIssueToDepartmentPlan']
  onCompleteIssue: IIssueListViewActionHandlers['onCompleteIssue']
  onArchiveIssue: IIssueListViewActionHandlers['onArchiveIssue']
  onSetPriority: (opts: {
    issueId: Id
    currentPriorityVoteRank: Maybe<number>
  }) => Promise<void>
}

export const IssueListItem = observer(function IssueListItem(
  props: IIssueListItemProps
) {
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const { openOverlazy } = useOverlazyController()

  const componentState = useObservable<{
    // 2 different states to allow us to show different messages
    isBeingPrioritized: boolean
    isBeingDeprioritized: boolean
    disablePrioritizationButtonTimeout: Maybe<NodeJS.Timeout>
  }>({
    // is true immediately after the user clicks to prioritize the issue, turns back to false once the issue receives a priority via subscription message
    isBeingPrioritized: false,
    isBeingDeprioritized: false,
    disablePrioritizationButtonTimeout: null,
  })

  const setIsBeingPrioritized = useAction((isBeingPrioritized: boolean) => {
    componentState.disablePrioritizationButtonTimeout &&
      clearTimeout(componentState.disablePrioritizationButtonTimeout)
    componentState.disablePrioritizationButtonTimeout = null

    componentState.isBeingPrioritized = isBeingPrioritized

    if (isBeingPrioritized) {
      beingDisablePrioritizationButtonTimeout()
    }
  })

  const setIsBeingDeprioritized = useAction((isBeingDeprioritized: boolean) => {
    componentState.disablePrioritizationButtonTimeout &&
      clearTimeout(componentState.disablePrioritizationButtonTimeout)
    componentState.disablePrioritizationButtonTimeout = null

    componentState.isBeingDeprioritized = isBeingDeprioritized

    if (isBeingDeprioritized) {
      beingDisablePrioritizationButtonTimeout()
    }
  })

  // in case we never receive a message about the issue being updated
  const beingDisablePrioritizationButtonTimeout = useAction(() => {
    componentState.disablePrioritizationButtonTimeout = setTimeout(() => {
      runInAction(() => {
        componentState.isBeingPrioritized = false
        componentState.isBeingDeprioritized = false
      })
    }, 2000)
  })

  const hasRank =
    props.issue.priorityVoteRank != null &&
    props.issue.priorityVoteRank !== ISSUE_PRIORITY_UNRANKED_NUMBER
  const previouslyHadRank = usePreviousValue(hasRank)

  useEffect(() => {
    if (hasRank && !previouslyHadRank) {
      setIsBeingPrioritized(false)
    } else if (!hasRank && previouslyHadRank) {
      setIsBeingDeprioritized(false)
    }
  }, [
    hasRank,
    previouslyHadRank,
    setIsBeingPrioritized,
    setIsBeingDeprioritized,
  ])

  const isMeetingPageView = props.pageType === 'MEETING'

  const isStarVotingView =
    props.issueVotingType === 'STAR' &&
    !props.isLongTermIssue &&
    isMeetingPageView

  const shouldShowTotalStarVotes =
    isStarVotingView && (props.hasCurrentUserVoted || props.issueVotingHasEnded)

  const shouldShowStarVotingButtons =
    isStarVotingView && !shouldShowTotalStarVotes

  const memoizedCompletedFormValues = useMemo(() => {
    return {
      completed: props.issue.completed,
    } as { completed: boolean }
  }, [props.issue.completed])

  function renderPriorityButton() {
    let innerContent = null

    if (
      componentState.isBeingPrioritized ||
      componentState.isBeingDeprioritized
    ) {
      innerContent = (
        <Text
          type={'badge'}
          css={css`
            align-items: center;
            background-color: ${(prop) =>
              prop.theme.colors.issueNumberBackgroundColor};
            border-radius: ${(prop) => prop.theme.sizes.br50};
            color: ${(prop) => prop.theme.colors.issueNumberColor};
            display: inline-flex;
            height: ${toREM(19)};
            justify-content: center;
            line-height: normal;
            width: ${toREM(19)};
          `}
        >
          -
        </Text>
      )
    } else if (
      props.issue.priorityVoteRank !== ISSUE_PRIORITY_UNRANKED_NUMBER
    ) {
      innerContent = (
        <Text
          type={'badge'}
          css={css`
            align-items: center;
            background-color: ${(prop) =>
              prop.theme.colors.issueNumberBackgroundColor};
            border-radius: ${(prop) => prop.theme.sizes.br50};
            color: ${(prop) => prop.theme.colors.issueNumberColor};
            display: inline-flex;
            height: ${toREM(19)};
            justify-content: center;
            line-height: normal;
            width: ${toREM(19)};
          `}
        >
          {props.issue.priorityVoteRank}
        </Text>
      )
    } else {
      innerContent = <Icon iconName='issueCircleIcon' iconSize='lg' />
    }

    return (
      <Clickable
        disabled={
          !props.canEditIssuesInMeeting.allowed ||
          (props.numIssuesCurrentlyRanked === 3 &&
            props.issue.priorityVoteRank === ISSUE_PRIORITY_UNRANKED_NUMBER) ||
          componentState.isBeingPrioritized ||
          componentState.isBeingDeprioritized
        }
        tooltip={
          !props.canEditIssuesInMeeting.allowed
            ? {
                msg: props.canEditIssuesInMeeting.message,
                type: 'light',
                position: 'top right',
              }
            : props.numIssuesCurrentlyRanked === 3 &&
                props.issue.priorityVoteRank === ISSUE_PRIORITY_UNRANKED_NUMBER
              ? {
                  msg: t('Solve {{issues}} to prioritize more', {
                    issues: terms.issue.lowercasePlural,
                  }),
                  type: 'light',
                  position: 'top right',
                }
              : componentState.isBeingPrioritized
                ? {
                    msg: t('{{issue}} is being prioritized', {
                      issue: terms.issue.singular,
                    }),
                    type: 'light',
                    position: 'top right',
                  }
                : componentState.isBeingDeprioritized
                  ? {
                      msg: t('{{issue}} is being deprioritized', {
                        issue: terms.issue.singular,
                      }),
                      type: 'light',
                      position: 'top right',
                    }
                  : undefined
        }
        clicked={async () => {
          if (props.issue.priorityVoteRank === ISSUE_PRIORITY_UNRANKED_NUMBER) {
            setIsBeingPrioritized(true)
          } else {
            setIsBeingDeprioritized(true)
          }
          await props.onSetPriority({
            issueId: props.issue.id,
            currentPriorityVoteRank: props.issue.priorityVoteRank,
          })
        }}
        css={css`
          ${props.isCompactView
            ? css`
                margin-right: ${(prop) => prop.theme.sizes.spacing8};
              `
            : css`
                margin-right: ${(prop) => prop.theme.sizes.spacing16};
              `}
        `}
      >
        {innerContent}
      </Clickable>
    )
  }

  return (
    <div
      css={css`
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        height: 100%;
        justify-content: space-between;
        min-height: ${toREM(64)};

        ${shouldShowStarVotingButtons
          ? css`
              align-items: flex-start;
              padding-bottom: ${(prop) => prop.theme.sizes.spacing8};
              padding-top: ${(prop) => prop.theme.sizes.spacing8};
            `
          : css`
              align-items: center;
            `}

        ${props.isCompactView
          ? css`
              padding-left: ${(prop) => prop.theme.sizes.spacing12};
              padding-right: ${(prop) => prop.theme.sizes.spacing4};
            `
          : css`
              padding-left: ${(prop) => prop.theme.sizes.spacing16};
              padding-right: ${(prop) => prop.theme.sizes.spacing16};
            `}
      `}
    >
      <div
        css={css`
          align-items: flex-start;
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          width: 100%;
        `}
      >
        <div
          css={css`
            align-items: center;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
          `}
        >
          {props.showNumberedList && (
            <Text
              type={'body'}
              css={css`
                min-width: ${({ theme }) => theme.sizes.spacing20};
                text-align: right;

                ${props.isCompactView
                  ? css`
                      margin-right: ${({ theme }) => theme.sizes.spacing4};
                    `
                  : css`
                      margin-right: ${({ theme }) => theme.sizes.spacing8};
                    `}
              `}
            >
              {props.issueNumber}.
            </Text>
          )}
          {props.mergeIssueMode && (
            <CheckBoxInput
              id={`issueListItemMergeCheckbox_${props.issue.id}`}
              name='issueListItemMergeCheckbox'
              iconSize={'lg'}
              value={!!props.issueIdsToMerge.includes(props.issue.id)}
              tooltip={
                props.isDisabledMergeIssue
                  ? {
                      msg: t('You can only merge two {{issues}} at once', {
                        issues: terms.issue.lowercasePlural,
                      }),
                      type: 'light',
                    }
                  : !props.canEditIssuesInMeeting.allowed
                    ? {
                        msg: props.canEditIssuesInMeeting.message,
                        type: 'light',
                        position: 'top right',
                      }
                    : undefined
              }
              disabled={
                props.isDisabledMergeIssue ||
                !props.canEditIssuesInMeeting.allowed
              }
              onChange={() => props.handleSelectIssueToMerge(props.issue.id)}
              css={css`
                ${props.isCompactView
                  ? css`
                      margin-right: ${(props) => props.theme.sizes.spacing8};
                    `
                  : css`
                      margin-right: ${(props) => props.theme.sizes.spacing16};
                    `}
              `}
            />
          )}
          {shouldShowTotalStarVotes && (
            <div
              css={css`
                align-items: center;
                display: flex;
              `}
            >
              <Icon
                iconName={
                  props.issue.numStarVotes === 0
                    ? 'starEmptyIcon'
                    : 'starFullIcon'
                }
                iconSize={'lg'}
                iconColor={
                  props.issue.numStarVotes === 0
                    ? { color: theme.colors.intentDisabledColor }
                    : { color: theme.colors.agendaCrown }
                }
              />
              <Text
                type={'body'}
                weight={'semibold'}
                css={css`
                  ${props.isCompactView
                    ? css`
                        margin-right: ${(props) => props.theme.sizes.spacing8};
                      `
                    : css`
                        margin-right: ${(props) => props.theme.sizes.spacing16};
                      `}
                `}
              >
                {props.issue.numStarVotes}
              </Text>
            </div>
          )}
          {props.issueVotingType === 'PRIORITY' &&
            !props.isLongTermIssue &&
            isMeetingPageView &&
            renderPriorityButton()}
          <UserAvatar
            avatarUrl={props.issue.assignee.avatar}
            firstName={props.issue.assignee.firstName}
            lastName={props.issue.assignee.lastName}
            userAvatarColor={props.issue.assignee.userAvatarColor}
            size='s'
            adornments={{ tooltip: true }}
            css={css`
              flex: 0 0 ${(prop) => prop.theme.sizes.spacing24};
              ${props.isCompactView
                ? css`
                    margin-right: ${(prop) => prop.theme.sizes.spacing8};
                  `
                : css`
                    margin-right: ${(prop) => prop.theme.sizes.spacing16};
                  `}
            `}
          />
          <Clickable
            css={css`
              align-self: center;
              flex: 1;

              ${props.isCompactView
                ? css`
                    margin-right: ${toREM(3)};
                  `
                : css`
                    margin-right: ${(prop) => prop.theme.sizes.spacing20};
                  `}
            `}
            clicked={() => props.onEditIssueRequest(props.issue.id)}
          >
            <span
              css={css`
                display: flex;
                flex-direction: row;
                text-align: left;
              `}
            >
              <TextEllipsis
                type='body'
                lineLimit={2}
                wordBreak={true}
                css={css`
                  text-align: left;
                `}
              >
                {props.issue.title}
              </TextEllipsis>
            </span>
          </Clickable>
        </div>
        {shouldShowStarVotingButtons && (
          <div
            css={css`
              display: inline-flex;
              margin-top: ${(prop) => prop.theme.sizes.spacing4};
            `}
          >
            {new Array(STAR_NUMBER).fill('').map((_, index) => {
              const isStarSelected = index < props.starsSelectedForIssue
              const indexOfStarsToDisable = props.starsSelectedForIssue
                ? props.numberOfStarsLeftToAllocate +
                  props.starsSelectedForIssue -
                  1
                : props.numberOfStarsLeftToAllocate - 1

              return (
                <Clickable
                  key={`${index}_starVotingInIssues`}
                  disabled={!props.canStarVoteForIssuesInMeeting.allowed}
                  tooltip={
                    !props.canStarVoteForIssuesInMeeting.allowed
                      ? {
                          msg: props.canStarVoteForIssuesInMeeting.message,
                          type: 'light',
                          position: 'top left',
                        }
                      : undefined
                  }
                  clicked={() => {
                    if (index > indexOfStarsToDisable) {
                      return
                    } else if (isStarSelected) {
                      props.handleAllocateStarsAction({
                        type: 'SUBTRACT',
                        issueId: props.issue.id,
                        numberToSelect: index,
                      })
                    } else {
                      props.handleAllocateStarsAction({
                        type: 'ADD',
                        issueId: props.issue.id,
                        numberToSelect: index + 1 - props.starsSelectedForIssue,
                      })
                    }
                  }}
                  css={css`
                    width: ${(props) => props.theme.sizes.spacing24};
                  `}
                >
                  <Icon
                    key={index}
                    iconName={
                      index > indexOfStarsToDisable || !isStarSelected
                        ? 'starEmptyIcon'
                        : 'starFullIcon'
                    }
                    iconSize={'lg'}
                    iconColor={
                      index > indexOfStarsToDisable
                        ? { color: theme.colors.intentDisabledColor }
                        : isStarSelected
                          ? { color: theme.colors.agendaCrown }
                          : undefined
                    }
                  />
                </Clickable>
              )
            })}
          </div>
        )}
      </div>
      <div
        css={css`
          align-items: center;
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
        `}
      >
        {props.issue.sentFromIssueMeetingName && (
          <Tooltip
            position='top center'
            msg={props.issue.sentFromIssueMeetingName}
          >
            <Text
              type='badge'
              weight='bold'
              css={css`
                background-color: ${(prop) =>
                  prop.theme.colors.issueListColumnBorderColor};
                padding: ${toREM(2)} ${toREM(4)};

                ${props.responsiveSize !== 'LARGE' || props.isCompactView
                  ? css`
                      margin-right: ${toREM(4)};
                    `
                  : css`
                      margin-right: ${toREM(52)};
                    `}
              `}
            >
              From
            </Text>
          </Tooltip>
        )}
        {!props.isCompactView && (
          <>
            {props.isLongTermIssue && props.responsiveSize === 'LARGE' && (
              <>
                {props.responsiveSize === 'LARGE' && (
                  <BtnIcon
                    iconProps={{
                      iconName: 'forwardIcon',
                    }}
                    size='lg'
                    intent='naked'
                    ariaLabel={t('Move {{longTermIssue}} to short term', {
                      longTermIssue: terms.longTermIssue.lowercaseSingular,
                    })}
                    tag='button'
                    disabled={!props.canEditIssuesInMeeting.allowed}
                    tooltip={
                      !props.canEditIssuesInMeeting.allowed
                        ? {
                            msg: props.canEditIssuesInMeeting.message,
                            type: 'light',
                            position: 'top center',
                          }
                        : {
                            msg: t(`Move to short term to solve`),
                            type: 'light',
                            position: 'top center',
                          }
                    }
                    css={css`
                      margin-right: ${(props) => props.theme.sizes.spacing12};
                    `}
                    onClick={async () => {
                      await props.onMoveIssueToShortTerm(props.issue.id)
                    }}
                  />
                )}
              </>
            )}
            {props.responsiveSize === 'LARGE' ? (
              <>
                {!props.isLongTermIssue && (
                  <Menu
                    position={'right center'}
                    content={(close) => (
                      <>
                        {!props.isLongTermIssue && (
                          <>
                            <Menu.Item
                              disabled={!props.canEditIssuesInMeeting.allowed}
                              tooltip={
                                !props.canEditIssuesInMeeting.allowed
                                  ? {
                                      msg: props.canEditIssuesInMeeting.message,
                                      type: 'light',
                                      position: 'top center',
                                    }
                                  : undefined
                              }
                              onClick={(e) => {
                                close(e)
                                props.onAddIssueToDepartmentPlan(props.issue.id)
                              }}
                            >
                              <div
                                css={css`
                                  align-items: center;
                                  display: flex;
                                `}
                              >
                                <Icon
                                  iconName={'VTOIcon'}
                                  iconSize={'lg'}
                                  css={css`
                                    margin-right: ${(props) =>
                                      props.theme.sizes.spacing8};
                                  `}
                                />
                                <Text type={'body'}>
                                  {t('Move to long term')}
                                </Text>
                              </div>
                            </Menu.Item>
                            <Menu.Item
                              disabled={!props.canEditIssuesInMeeting.allowed}
                              tooltip={
                                !props.canEditIssuesInMeeting.allowed
                                  ? {
                                      msg: props.canEditIssuesInMeeting.message,
                                      type: 'light',
                                      position: 'top center',
                                    }
                                  : undefined
                              }
                              onClick={(e) => {
                                close(e)
                                openOverlazy('MoveIssueToAnotherMeetingModal', {
                                  issueId: props.issue.id,
                                  currentMeetingId: props.currentMeetingId,
                                })
                              }}
                            >
                              <div
                                css={css`
                                  display: flex;
                                  align-items: center;
                                `}
                              >
                                <Icon
                                  iconName={'meetingIconSolid'}
                                  iconSize={'lg'}
                                  css={css`
                                    margin-right: ${(props) =>
                                      props.theme.sizes.spacing8};
                                  `}
                                />
                                <Text type={'body'}>
                                  {t('Move to another meeting')}
                                </Text>
                              </div>
                            </Menu.Item>
                          </>
                        )}
                      </>
                    )}
                  >
                    <BtnIcon
                      iconProps={{
                        iconName: 'forwardIcon',
                      }}
                      size='lg'
                      intent='naked'
                      ariaLabel={t('Open move {{issue}} menu', {
                        issue: terms.issue.lowercaseSingular,
                      })}
                      tag='button'
                      onClick={() => null}
                    />
                  </Menu>
                )}
                <BtnIcon
                  iconProps={{
                    iconName: 'toDoCompleteIcon',
                  }}
                  disabled={!props.canCreateTodosInMeeting.allowed}
                  tooltip={
                    !props.canCreateTodosInMeeting.allowed
                      ? {
                          msg: props.canCreateTodosInMeeting.message,
                          position: 'top center',
                        }
                      : {
                          msg: getContextAwareTodoText(terms),
                          position: 'top left',
                          contentCss: css`
                            transform: translateX(${toREM(13)});
                          `,
                        }
                  }
                  size='lg'
                  intent='naked'
                  ariaLabel={getContextAwareTodoText(terms)}
                  tag='button'
                  css={css`
                    margin-left: ${props.isLongTermIssue
                      ? 0
                      : (props) => props.theme.sizes.spacing12};
                    margin-right: ${(props) => props.theme.sizes.spacing16};
                  `}
                  onClick={() =>
                    props.onCreateContextAwareTodoFromIssue({
                      ownerFullName: props.issue.assignee.fullName,
                      ownerId: props.issue.assignee.id,
                      notesId: props.issue.notesId,
                      title: props.issue.title,
                      type: 'Issue',
                    })
                  }
                />

                {props.isLongTermIssue && (
                  <BtnIcon
                    iconProps={{
                      iconName: 'archiveIcon',
                    }}
                    size='lg'
                    intent='naked'
                    ariaLabel={t('Archive {{longTermIssue}}', {
                      longTermIssue: terms.longTermIssue.lowercaseSingular,
                    })}
                    tag='button'
                    disabled={!props.canEditIssuesInMeeting.allowed}
                    tooltip={
                      !props.canEditIssuesInMeeting.allowed
                        ? {
                            msg: props.canEditIssuesInMeeting.message,
                            type: 'light',
                            position: 'top center',
                          }
                        : {
                            msg: t(`Archive`),
                            type: 'light',
                            position: 'top center',
                          }
                    }
                    onClick={async () => {
                      await props.onArchiveIssue(props.issue.id)
                    }}
                    css={css`
                      margin-right: ${(props) => props.theme.sizes.spacing12};
                    `}
                  />
                )}
              </>
            ) : (
              <>
                <Menu
                  position={'right center'}
                  minWidthRems={17}
                  content={(close) => (
                    <>
                      {props.isLongTermIssue && (
                        <>
                          <Menu.Item
                            disabled={!props.canEditIssuesInMeeting.allowed}
                            tooltip={
                              !props.canEditIssuesInMeeting.allowed
                                ? {
                                    msg: props.canEditIssuesInMeeting.message,
                                    type: 'light',
                                    position: 'top center',
                                  }
                                : undefined
                            }
                            onClick={async (e) => {
                              close(e)
                              await props.onMoveIssueToShortTerm(props.issue.id)
                            }}
                          >
                            <div
                              css={css`
                                display: flex;
                                align-items: center;
                              `}
                            >
                              <Icon
                                iconName={'forwardIcon'}
                                iconSize={'lg'}
                                css={css`
                                  margin-right: ${(props) =>
                                    props.theme.sizes.spacing8};
                                `}
                              />
                              <Text
                                type={'body'}
                                css={css`
                                  text-align: left;
                                `}
                              >
                                {t('Move to short term to solve')}
                              </Text>
                            </div>
                          </Menu.Item>
                        </>
                      )}
                      {!props.isLongTermIssue && (
                        <Menu.Item
                          disabled={!props.canEditIssuesInMeeting.allowed}
                          tooltip={
                            !props.canEditIssuesInMeeting.allowed
                              ? {
                                  msg: props.canEditIssuesInMeeting.message,
                                  type: 'light',
                                  position: 'top center',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            props.onAddIssueToDepartmentPlan(props.issue.id)
                          }}
                        >
                          <div
                            css={css`
                              align-items: center;
                              display: flex;
                            `}
                          >
                            <Icon
                              iconName={'VTOIcon'}
                              iconSize={'lg'}
                              css={css`
                                margin-right: ${(props) =>
                                  props.theme.sizes.spacing8};
                              `}
                            />
                            <Text type={'body'}>{t('Move to long term')}</Text>
                          </div>
                        </Menu.Item>
                      )}
                      <Menu.Item
                        disabled={!props.canEditIssuesInMeeting.allowed}
                        tooltip={
                          !props.canEditIssuesInMeeting.allowed
                            ? {
                                msg: props.canEditIssuesInMeeting.message,
                                type: 'light',
                                position: 'top center',
                              }
                            : undefined
                        }
                        onClick={(e) => {
                          close(e)
                          props.onCreateContextAwareTodoFromIssue({
                            ownerFullName: props.issue.assignee.fullName,
                            ownerId: props.issue.assignee.id,
                            notesId: props.issue.notesId,
                            title: props.issue.title,
                            type: 'Issue',
                          })
                        }}
                      >
                        <div
                          css={css`
                            display: flex;
                            align-items: center;
                            text-align: left;
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
                      {!props.isLongTermIssue && (
                        <Menu.Item
                          disabled={!props.canEditIssuesInMeeting.allowed}
                          tooltip={
                            !props.canEditIssuesInMeeting.allowed
                              ? {
                                  msg: props.canEditIssuesInMeeting.message,
                                  type: 'light',
                                  position: 'top center',
                                }
                              : undefined
                          }
                          onClick={(e) => {
                            close(e)
                            openOverlazy('MoveIssueToAnotherMeetingModal', {
                              issueId: props.issue.id,
                              currentMeetingId: props.currentMeetingId,
                            })
                          }}
                        >
                          <div
                            css={css`
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Icon
                              iconName={'meetingIconSolid'}
                              iconSize={'lg'}
                              css={css`
                                margin-right: ${(props) =>
                                  props.theme.sizes.spacing8};
                              `}
                            />
                            <Text type={'body'}>
                              {t('Move to another meeting')}
                            </Text>
                          </div>
                        </Menu.Item>
                      )}
                      {props.isLongTermIssue && (
                        <Menu.Item
                          disabled={!props.canEditIssuesInMeeting.allowed}
                          tooltip={
                            !props.canEditIssuesInMeeting.allowed
                              ? {
                                  msg: props.canEditIssuesInMeeting.message,
                                  type: 'light',
                                  position: 'top center',
                                }
                              : {
                                  msg: t(`Archive`),
                                  type: 'light',
                                  position: 'top center',
                                }
                          }
                          onClick={async (e) => {
                            close(e)
                            await props.onArchiveIssue(props.issue.id)
                          }}
                        >
                          <div
                            css={css`
                              display: flex;
                              align-items: center;
                            `}
                          >
                            <Icon
                              iconName={'archiveIcon'}
                              iconSize={'lg'}
                              css={css`
                                margin-right: ${(props) =>
                                  props.theme.sizes.spacing8};
                              `}
                            />
                            <Text type={'body'}>{t('Archive')}</Text>
                          </div>
                        </Menu.Item>
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
              </>
            )}
          </>
        )}
        {!props.isLongTermIssue && props.pageType === 'MEETING' && (
          <EditForm
            sendDiffs={false}
            isLoading={props.isLoading}
            disabled={!props.canEditIssuesInMeeting.allowed}
            disabledTooltip={
              !props.canEditIssuesInMeeting.allowed
                ? {
                    msg: props.canEditIssuesInMeeting.message,
                    type: 'light',
                    position: 'top left',
                  }
                : undefined
            }
            values={memoizedCompletedFormValues}
            validation={
              {
                completed: formValidators.boolean({
                  additionalRules: [required()],
                }),
              } satisfies GetParentFormValidation<{ completed: boolean }>
            }
            onSubmit={async (value) => {
              if (value.completed != null) {
                await props.onCompleteIssue({
                  issueId: props.issue.id,
                  value: value.completed,
                })
              }
            }}
          >
            {({ fieldNames }) => {
              return (
                <ActionButton
                  id='completed'
                  name={fieldNames.completed}
                  type='TOGGLE'
                  hideTextAdornments={props.isCompactView}
                  text={props.isCompactView ? t('S') : t('Solved')}
                />
              )
            }}
          </EditForm>
        )}
        {props.isCompactView && (
          <Menu
            maxWidth={toREM(330)}
            content={(close) => (
              <>
                {props.isLongTermIssue && (
                  <>
                    <Menu.Item
                      disabled={!props.canEditIssuesInMeeting.allowed}
                      tooltip={
                        !props.canEditIssuesInMeeting.allowed
                          ? {
                              msg: props.canEditIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                      onClick={async (e) => {
                        close(e)
                        await props.onMoveIssueToShortTerm(props.issue.id)
                      }}
                    >
                      <div
                        css={css`
                          align-items: center;
                          display: flex;
                        `}
                      >
                        <Icon
                          iconName='forwardIcon'
                          iconSize='lg'
                          css={css`
                            margin-right: ${(props) =>
                              props.theme.sizes.spacing8};
                          `}
                        />
                        <Text type={'body'}>
                          {t('Move to short term to solve')}
                        </Text>
                      </div>
                    </Menu.Item>
                  </>
                )}
                <Menu.Item
                  disabled={!props.canEditIssuesInMeeting.allowed}
                  tooltip={
                    !props.canEditIssuesInMeeting.allowed
                      ? {
                          msg: props.canEditIssuesInMeeting.message,
                          type: 'light',
                          position: 'top center',
                        }
                      : undefined
                  }
                  onClick={(e) => {
                    close(e)
                    props.onCreateContextAwareTodoFromIssue({
                      ownerFullName: props.issue.assignee.fullName,
                      ownerId: props.issue.assignee.id,
                      notesId: props.issue.notesId,
                      title: props.issue.title,
                      type: 'Issue',
                    })
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
                        margin-right: ${(props) => props.theme.sizes.spacing8};
                      `}
                    />
                    <Text type={'body'}>{getContextAwareTodoText(terms)}</Text>
                  </div>
                </Menu.Item>
                {props.isLongTermIssue && (
                  <Menu.Item
                    disabled={!props.canEditIssuesInMeeting.allowed}
                    tooltip={
                      !props.canEditIssuesInMeeting.allowed
                        ? {
                            msg: props.canEditIssuesInMeeting.message,
                            type: 'light',
                            position: 'top center',
                          }
                        : undefined
                    }
                    onClick={async (e) => {
                      close(e)
                      await props.onArchiveIssue(props.issue.id)
                    }}
                  >
                    <div
                      css={css`
                        align-items: center;
                        display: flex;
                      `}
                    >
                      <Icon
                        iconName='archiveIcon'
                        iconSize='lg'
                        css={css`
                          margin-right: ${(props) =>
                            props.theme.sizes.spacing8};
                        `}
                      />
                      <Text type={'body'}>{t('Archive')}</Text>
                    </div>
                  </Menu.Item>
                )}
                {!props.isLongTermIssue && (
                  <>
                    <Menu.Item
                      disabled={!props.canEditIssuesInMeeting.allowed}
                      tooltip={
                        !props.canEditIssuesInMeeting.allowed
                          ? {
                              msg: props.canEditIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                      onClick={async (e) => {
                        close(e)
                        await props.onAddIssueToDepartmentPlan(props.issue.id)
                      }}
                    >
                      <div
                        css={css`
                          align-items: center;
                          display: flex;
                        `}
                      >
                        <Icon
                          iconName={'VTOIcon'}
                          iconSize={'lg'}
                          css={css`
                            margin-right: ${(props) =>
                              props.theme.sizes.spacing8};
                          `}
                        />
                        <Text type={'body'}>{t('Move to long term')}</Text>
                      </div>
                    </Menu.Item>
                    <Menu.Item
                      disabled={!props.canEditIssuesInMeeting.allowed}
                      tooltip={
                        !props.canEditIssuesInMeeting.allowed
                          ? {
                              msg: props.canEditIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        close(e)
                        openOverlazy('MoveIssueToAnotherMeetingModal', {
                          issueId: props.issue.id,
                          currentMeetingId: props.currentMeetingId,
                        })
                      }}
                    >
                      <div
                        css={css`
                          display: flex;
                          align-items: center;
                        `}
                      >
                        <Icon
                          iconName={'meetingIconSolid'}
                          iconSize={'lg'}
                          css={css`
                            margin-right: ${(props) =>
                              props.theme.sizes.spacing8};
                          `}
                        />
                        <Text type={'body'}>
                          {t('Move to another meeting')}
                        </Text>
                      </div>
                    </Menu.Item>
                  </>
                )}
              </>
            )}
          >
            <span
              css={css`
                cursor: pointer;
                margin-left: ${(prop) => prop.theme.sizes.spacing4};
              `}
            >
              <Icon iconName='moreVerticalIcon' iconSize='lg' />
            </span>
          </Menu>
        )}
      </div>
    </div>
  )
})
