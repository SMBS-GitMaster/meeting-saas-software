import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { FastList } from '@mm/core-web/ui'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { getNumEmptyIssueColumnCells } from '../issueHelper'
import { IssueListLayout } from '../layout/issueListLayout'
import { CompletedIssueListItem } from './completedIssueListItem'
import { ICompletedIssueListViewProps } from './completedIssueListViewTypes'

export const CompletedIssueListView = observer(function CompletedIssueListView(
  props: ICompletedIssueListViewProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const getNumEmptyGridCellsIssues = useComputed(
    () => {
      return getNumEmptyIssueColumnCells({
        currentColumnSize: props.getData().issueListColumnSize,
        totalNumIssues: props.getData().completedIssues.nodes.length,
      })
    },
    {
      name: `CompletedIssueListView_numEmptyGridCellsIssues`,
    }
  )

  const { issueListColumnSize, pageType, isCompactView, currentUser } =
    props.getData()
  const { onEditIssueRequest, onCompleteIssue } = props.getActionHandlers()

  return (
    <IssueListLayout
      issueListColumnSize={issueListColumnSize}
      issuesToDisplay={props.getData().completedIssues.nodes}
      showEmptyStateButton={false}
      emptyStateText={t('You have no recently solved {{issues}}.', {
        issues: terms.issue.lowercasePlural,
      })}
      renderEmptyGridCellsIssues={getNumEmptyGridCellsIssues() !== 0}
      pageType={pageType}
    >
      <FastList items={props.getData().completedIssues.nodes}>
        {(issue) => (
          <div
            key={`completedIssues_${issue.id}`}
            css={css`
              &:hover,
              &:focus {
                background-color: ${(prop) =>
                  prop.theme.colors.itemHoverBackgroundColor};
              }
            `}
          >
            <CompletedIssueListItem
              issue={issue}
              isCompactView={isCompactView}
              pageType={pageType}
              responsiveSize={props.responsiveSize}
              canEditIssuesInMeeting={
                currentUser.permissions.canEditIssuesInMeeting
              }
              onEditIssueRequest={onEditIssueRequest}
              onCompleteIssue={onCompleteIssue}
            />
          </div>
        )}
      </FastList>
    </IssueListLayout>
  )
})
