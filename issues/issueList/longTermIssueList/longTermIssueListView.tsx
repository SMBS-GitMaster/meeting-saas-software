import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { FastList } from '@mm/core-web/ui'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { getNumEmptyIssueColumnCells } from '../issueHelper'
import { getIssueNumberLookupMap } from '../issueListHelpers'
import { IssueListItem } from '../issueListItem'
import { IssueListLayout } from '../layout/issueListLayout'
import { ILongTermIssueListViewProps } from './longTermIssueListViewTypes'

export const LongTermIssueListView = observer(function LongTermIssueListView(
  props: ILongTermIssueListViewProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const getIssueNumberLookup = useComputed(
    () => {
      return getIssueNumberLookupMap(props.getData().longTermIssues)
    },
    {
      name: `LongTermIssueListView.getIssueNumberLookup`,
    }
  )

  const getNumEmptyGridCellsIssues = useComputed(
    () => {
      const longTermIssues = props.getData().longTermIssues
      const issueListColumnSize = props.getData().issueListColumnSize
      return getNumEmptyIssueColumnCells({
        currentColumnSize: issueListColumnSize,
        totalNumIssues: longTermIssues.nodes.length,
      })
    },
    {
      name: `LongTermIssueListView.getNumEmptyGridCellsIssues`,
    }
  )

  const {
    currentUser,
    issueListColumnSize,
    pageType,
    currentMeetingId,
    issueVotingType,
    starsToAllocate,
    mergeIssueMode,
    issueIdsToMerge,
    showNumberedList,
    recordOfIssueIdsToStars,
    isLoading,
    issueVotingHasEnded,
    numIssuesCurrentlyRanked,
    hasCurrentUserVoted,
    isCompactView,
  } = props.getData()

  const {
    handleAllocateStarsAction,
    handleSelectIssueToMerge,
    onCreateContextAwareTodoFromIssue,
    onEditIssueRequest,
    onMoveIssueToShortTerm,
    onAddIssueToDepartmentPlan,
    onCompleteIssue,
    onArchiveIssue,
    onSetIssuePriorityVotes,
  } = props.getActionHandlers()

  return (
    <IssueListLayout
      issueListColumnSize={issueListColumnSize}
      issuesToDisplay={props.getData().longTermIssues.nodes}
      showEmptyStateButton={false}
      emptyStateText={t('You have no {{longTermIssues}}.', {
        longTermIssues: terms.longTermIssue.lowercasePlural,
      })}
      renderEmptyGridCellsIssues={getNumEmptyGridCellsIssues() !== 0}
      pageType={pageType}
    >
      <FastList items={props.getData().longTermIssues.nodes}>
        {(issue) => (
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
              timezone={currentUser.settings.timezone}
              currentMeetingId={currentMeetingId}
              numberOfStarsLeftToAllocate={starsToAllocate}
              issueVotingType={issueVotingType || 'PRIORITY'}
              isLongTermIssue={true}
              canCreateIssuesInMeeting={
                currentUser.permissions.canCreateIssuesInMeeting
              }
              canEditIssuesInMeeting={
                currentUser.permissions.canEditIssuesInMeeting
              }
              canCreateTodosInMeeting={
                currentUser.permissions.canCreateTodosInMeeting
              }
              canStarVoteForIssuesInMeeting={
                currentUser.permissions.canStarVoteForIssuesInMeeting
              }
              mergeIssueMode={mergeIssueMode}
              issueIdsToMerge={issueIdsToMerge}
              isDisabledMergeIssue={
                issueIdsToMerge.length >= 2 &&
                !issueIdsToMerge.includes(issue.id)
              }
              showNumberedList={showNumberedList}
              starsSelectedForIssue={recordOfIssueIdsToStars[issue.id] || 0}
              isLoading={isLoading}
              issueVotingHasEnded={issueVotingHasEnded}
              numIssuesCurrentlyRanked={numIssuesCurrentlyRanked}
              issueListColumnSize={issueListColumnSize}
              hasCurrentUserVoted={hasCurrentUserVoted}
              isCompactView={isCompactView}
              responsiveSize={props.responsiveSize}
              pageType={pageType}
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
        )}
      </FastList>
    </IssueListLayout>
  )
})
