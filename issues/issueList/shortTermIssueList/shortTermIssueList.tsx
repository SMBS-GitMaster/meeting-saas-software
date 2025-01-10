import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { css } from 'styled-components'

import { usePreviousValue } from '@mm/core/ui/hooks'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { FastList, toREM } from '@mm/core-web/ui'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { getNumEmptyIssueColumnCells } from '../issueHelper'
import { STAR_NUMBER } from '../issueListConstants'
import { getIssueNumberLookupMap } from '../issueListHelpers'
import { IssueListItem } from '../issueListItem'
import { IIssueListViewProps } from '../issueListTypes'
import { IssueListLayout } from '../layout/issueListLayout'
import { ShortTermIssueListHeader } from './shortTermIssueListHeader'

export const ShortTermIssueList = observer(function ShortTermIssueList(
  props: IIssueListViewProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const {
    issueListColumnSize,
    getCurrentPriorityRankedIssues,
    issueVotingHasEnded,
    sortIssuesBy,
    issueVotingType,
    hasCurrentUserVoted,
    numIssuesCurrentlyRanked,
    currentMeetingId,
  } = props.getData()
  const {
    handleAllocateStarsAction,
    handleSelectIssueToMerge,
    onEditIssueRequest,
    onMoveIssueToShortTerm,
    onCreateContextAwareTodoFromIssue,
    onAddIssueToDepartmentPlan,
    onCompleteIssue,
    onArchiveIssue,
    setStarsToAllocate,
    setRecordOfIssueIdsToStars,
    setSortIssuesBy,
    onSetIssuePriorityVotes,
  } = props.getActionHandlers()

  const previousCurrentlyRankedIssues = usePreviousValue(
    getCurrentPriorityRankedIssues()
  )
  const starVotingIsOnAnotherRound = usePreviousValue(issueVotingHasEnded)

  const getIssueNumberLookup = useComputed(
    () => {
      return getIssueNumberLookupMap(props.getData().getShortTermIssues())
    },
    {
      name: `ShortTermIssuesList.getIssueNumberLookup`,
    }
  )

  const getNumEmptyGridCellsIssues = useComputed(
    () => {
      return getNumEmptyIssueColumnCells({
        currentColumnSize: props.getData().issueListColumnSize,
        totalNumIssues: props.getData().getShortTermIssues().nodes.length,
      })
    },
    {
      name: `ShortTermIssuesList.getNumEmptyGridCellsIssues`,
    }
  )

  useEffect(
    function resetStarVotingStateWhenStarVotingIsNoLongerOver() {
      if (!issueVotingHasEnded) {
        setRecordOfIssueIdsToStars({})
        setStarsToAllocate(STAR_NUMBER)
      }
    },
    [issueVotingHasEnded, setRecordOfIssueIdsToStars, setStarsToAllocate]
  )

  useEffect(
    function sortByTotalStarVotesIfStarVotingHasEnded() {
      if (issueVotingType === 'STAR') {
        if (starVotingIsOnAnotherRound && !issueVotingHasEnded) {
          setSortIssuesBy('ASSIGNEE_ASC')
        } else if (issueVotingHasEnded) {
          setSortIssuesBy('VOTES')
        } else if (sortIssuesBy === 'PRIORITY') {
          setSortIssuesBy('VOTES')
        }
      }
    },
    [
      starVotingIsOnAnotherRound,
      hasCurrentUserVoted,
      issueVotingType,
      issueVotingHasEnded,
      sortIssuesBy,
      setSortIssuesBy,
    ]
  )

  const currentPriorityRankedIssues = getCurrentPriorityRankedIssues()
  useEffect(
    function sortByPriorityVotesIfPriorityVotingAndCurrentSortingIsStarVoting() {
      if (issueVotingType === 'PRIORITY') {
        if (sortIssuesBy === 'VOTES') {
          setSortIssuesBy('PRIORITY')
        }

        if (
          previousCurrentlyRankedIssues &&
          Object.keys(previousCurrentlyRankedIssues).length === 2 &&
          Object.keys(numIssuesCurrentlyRanked).length === 3
        ) {
          setSortIssuesBy('PRIORITY')
        }
      }
    },
    [
      currentPriorityRankedIssues,
      numIssuesCurrentlyRanked,
      previousCurrentlyRankedIssues,
      issueVotingType,
      sortIssuesBy,
      setSortIssuesBy,
    ]
  )

  useEffect(
    function sortByPriorityIfNotStarVotingAndThreeIssuesArePrioritized() {
      if (issueVotingType === 'PRIORITY' && numIssuesCurrentlyRanked === 3) {
        setSortIssuesBy('PRIORITY')
      }
    },
    [numIssuesCurrentlyRanked, issueVotingType, setSortIssuesBy]
  )

  return (
    <>
      <ShortTermIssueListHeader
        getData={props.getData}
        responsiveSize={props.responsiveSize}
        getActionHandlers={props.getActionHandlers}
      />
      <IssueListLayout
        css={css`
          .list-item-exit {
            max-height: ${toREM(64)};
            opacity: 1;
          }

          .list-item-exit-active {
            max-height: 0;
            opacity: 0;
            transition: all 700ms;
          }
        `}
        issueListColumnSize={issueListColumnSize}
        issuesToDisplay={props.getData().getShortTermIssues().nodes}
        showEmptyStateButton={true}
        emptyStateText={t('You have no short term {{issues}}.', {
          issues: terms.issue.lowercasePlural,
        })}
        renderEmptyGridCellsIssues={getNumEmptyGridCellsIssues() !== 0}
        pageType={props.getData().pageType}
      >
        <TransitionGroup component={null}>
          <FastList items={props.getData().getShortTermIssues().nodes}>
            {(issue) => (
              <CSSTransition
                key={issue.id}
                timeout={700}
                classNames='list-item'
              >
                <div
                  key={`issues_${issue.id}`}
                  css={css`
                    &:hover,
                    &:focus {
                      background-color: ${(prop) =>
                        prop.theme.colors.itemHoverBackgroundColor};
                    }
                  `}
                >
                  <IssueListItem
                    issue={issue}
                    timezone={props.getData().currentUser.settings.timezone}
                    currentMeetingId={currentMeetingId}
                    numberOfStarsLeftToAllocate={
                      props.getData().starsToAllocate
                    }
                    issueVotingType={issueVotingType || 'PRIORITY'}
                    isLongTermIssue={false}
                    canCreateIssuesInMeeting={
                      props.getData().currentUser.permissions
                        .canCreateIssuesInMeeting
                    }
                    canEditIssuesInMeeting={
                      props.getData().currentUser.permissions
                        .canEditIssuesInMeeting
                    }
                    canCreateTodosInMeeting={
                      props.getData().currentUser.permissions
                        .canCreateTodosInMeeting
                    }
                    canStarVoteForIssuesInMeeting={
                      props.getData().currentUser.permissions
                        .canStarVoteForIssuesInMeeting
                    }
                    mergeIssueMode={props.getData().mergeIssueMode}
                    issueIdsToMerge={props.getData().issueIdsToMerge}
                    isDisabledMergeIssue={
                      props.getData().issueIdsToMerge.length >= 2 &&
                      !props.getData().issueIdsToMerge.includes(issue.id)
                    }
                    showNumberedList={props.getData().showNumberedList}
                    starsSelectedForIssue={
                      props.getData().recordOfIssueIdsToStars[issue.id] || 0
                    }
                    isLoading={props.getData().isLoading}
                    issueVotingHasEnded={issueVotingHasEnded}
                    numIssuesCurrentlyRanked={numIssuesCurrentlyRanked}
                    issueListColumnSize={issueListColumnSize}
                    hasCurrentUserVoted={hasCurrentUserVoted}
                    isCompactView={props.getData().isCompactView}
                    responsiveSize={props.responsiveSize}
                    pageType={props.getData().pageType}
                    issueNumber={getIssueNumberLookup()[issue.id]}
                    handleAllocateStarsAction={handleAllocateStarsAction}
                    handleSelectIssueToMerge={handleSelectIssueToMerge}
                    onCreateContextAwareTodoFromIssue={
                      onCreateContextAwareTodoFromIssue
                    }
                    onEditIssueRequest={onEditIssueRequest}
                    onMoveIssueToShortTerm={onMoveIssueToShortTerm}
                    onAddIssueToDepartmentPlan={onAddIssueToDepartmentPlan}
                    onSetPriority={onSetIssuePriorityVotes}
                    onCompleteIssue={onCompleteIssue}
                    onArchiveIssue={onArchiveIssue}
                  />
                </div>
              </CSSTransition>
            )}
          </FastList>
        </TransitionGroup>
      </IssueListLayout>
    </>
  )
})
