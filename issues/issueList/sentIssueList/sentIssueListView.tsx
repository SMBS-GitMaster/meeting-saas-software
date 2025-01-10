import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { FastList } from '@mm/core-web/ui'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { getNumEmptyIssueColumnCells } from '../issueHelper'
import { IssueListLayout } from '../layout/issueListLayout'
import { SentToOtherMeetingIssueListItem } from './sentToOtherMeetingIssueListItem'
import { ISentIssueListViewProps } from './types'

export const SentIssueListView = observer(function SentIssueListView(
  props: ISentIssueListViewProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const getNumEmptyGridCellsIssues = useComputed(
    () => {
      const { issueListColumnSize, issuesSentToOtherMeetings } = props.getData()
      return getNumEmptyIssueColumnCells({
        currentColumnSize: issueListColumnSize,
        totalNumIssues: issuesSentToOtherMeetings.nodes.length,
      })
    },
    {
      name: `SentIssueListView.getNumEmptyGridCellsIssues`,
    }
  )

  const {
    issuesSentToOtherMeetings,
    issueListColumnSize,
    pageType,
    currentUser,
  } = props.getData()

  const { onEditIssueRequest, onArchiveSentToIssue } = props.getActionHandlers()

  return (
    <IssueListLayout
      issueListColumnSize={issueListColumnSize}
      issuesToDisplay={issuesSentToOtherMeetings.nodes}
      showEmptyStateButton={false}
      emptyStateText={t('You have no {{issues}} sent to other meetings.', {
        issues: terms.issue.lowercasePlural,
      })}
      renderEmptyGridCellsIssues={getNumEmptyGridCellsIssues() !== 0}
      pageType={pageType}
    >
      <FastList items={issuesSentToOtherMeetings.nodes}>
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
            <SentToOtherMeetingIssueListItem
              issue={issue}
              canEditIssuesInMeeting={
                currentUser.permissions.canEditIssuesInMeeting
              }
              responsiveSize={props.responsiveSize}
              onEditIssueRequest={onEditIssueRequest}
              onArchiveSentToIssue={onArchiveSentToIssue}
            />
          </div>
        )}
      </FastList>
    </IssueListLayout>
  )
})
