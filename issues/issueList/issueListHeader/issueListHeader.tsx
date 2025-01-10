import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  Banner,
  Breadcrumb,
  Card,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  useTheme,
} from '@mm/core-web/ui'

import {
  TIssueListTabValue,
  getIssueListHeaderPortalOutId,
  issueListTabs,
} from '../issueListConstants'
import { TIssueListTabType } from '../issueListTypes'
import { IIssueListHeaderProps } from './IssueListHeaderTypes'
import { IssueListHeaderMenuOptions } from './issueListHeaderMenuOptions'

export const IssueListHeader = observer(function IssueListHeader(
  props: IIssueListHeaderProps
) {
  const { data, actionHandlers } = props

  const {
    showNumberedList,
    selectedIssueTab,
    currentUser,
    breadcrumbs,
    sortIssuesBy,
    issueVotingType,
    mergeIssueMode,
    issueIdsToMerge,
  } = data
  const {
    setSortIssuesBy,
    onMergeIssues,
    setShowNumberedList,
    onPrintIssue,
    onExportIssue,
    onViewArchivedIssues,
    onUploadIssue,
    setIssueListColumnSize,
    setMergeIssueMode,
    setIssueIdsToMerge,
    setSelectedIssueTab,
    createIssueClicked,
  } = actionHandlers

  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const isViewingMovedToOtherMeetingIssues = selectedIssueTab === 'SENT_TO'
  const isMeetingView = props.data.pageType === 'MEETING'
  const issueListHeaderPortalOutId = getIssueListHeaderPortalOutId({
    meetingId: props.data.meeting.id,
  })

  return (
    <Card.Header
      renderLeft={
        <div
          css={css`
            display: flex;
            align-items: center;
          `}
        >
          {isMeetingView ? (
            <Breadcrumb
              steps={breadcrumbs}
              showInProgressIndicator={false}
              fontType={'h3'}
            />
          ) : (
            <TextEllipsis type='h3' lineLimit={1}>
              {`${t('{{issues}}:', {
                issues: terms.issue.plural,
              })} ${props.data.meeting.name}`}
            </TextEllipsis>
          )}
        </div>
      }
      renderRight={
        <IssueListHeaderMenuOptions
          showNumberedList={showNumberedList}
          currentIssueListTab={selectedIssueTab}
          canEditIssuesInMeeting={
            currentUser.permissions.canEditIssuesInMeeting
          }
          canCreateIssuesInMeeting={
            currentUser.permissions.canCreateIssuesInMeeting
          }
          sortIssuesBy={sortIssuesBy}
          mergeIssueMode={mergeIssueMode}
          issueVotingType={issueVotingType}
          pageType={props.data.pageType}
          workspaceType={props.data.workspaceType}
          responsiveSize={props.responsiveSize}
          workspaceTileId={props.data.workspaceTileId}
          isExpandedOnWorkspacePage={props.data.isExpandedOnWorkspacePage}
          setSortIssuesBy={setSortIssuesBy}
          setMergeIssueMode={setMergeIssueMode}
          onPrintIssue={onPrintIssue}
          onExportIssue={onExportIssue}
          onUploadIssue={onUploadIssue}
          onViewArchivedIssues={onViewArchivedIssues}
          setShowNumberedList={setShowNumberedList}
          changeColumnSizeClicked={setIssueListColumnSize}
          createIssueClicked={createIssueClicked}
          onDeleteTile={props.actionHandlers.onDeleteTile}
        />
      }
    >
      <div id={issueListHeaderPortalOutId} />
      {!isViewingMovedToOtherMeetingIssues && (
        <>
          {mergeIssueMode && (
            <Card.SectionHeader
              css={css`
                padding: 0;
              `}
            >
              <Banner
                bannerText={
                  issueIdsToMerge.length === 0
                    ? t('Select two {{issues}} to merge', {
                        issues: terms.issue.lowercasePlural,
                      })
                    : issueIdsToMerge.length === 1
                      ? t('1 {{issue}} selected', {
                          issue: terms.issue.lowercaseSingular,
                        })
                      : t('{{number}} {{issues}} selected', {
                          number: issueIdsToMerge.length,
                          issues: terms.issue.lowercasePlural,
                        })
                }
                submitDisabled={
                  issueIdsToMerge.length < 2 ||
                  !currentUser.permissions.canCreateIssuesInMeeting.allowed
                }
                tooltip={
                  !currentUser.permissions.canCreateIssuesInMeeting.allowed
                    ? {
                        msg: currentUser.permissions.canCreateIssuesInMeeting
                          .message,
                        type: 'light',
                        position: 'top center',
                      }
                    : undefined
                }
                clearBtnText={t('clear selection')}
                submitBtnText={t('Merge')}
                onCancelBannerClick={() => setMergeIssueMode(false)}
                onClearBtnClick={() => setIssueIdsToMerge([])}
                onSubmitBtnClick={() => {
                  onMergeIssues(issueIdsToMerge)
                  setIssueIdsToMerge([])
                }}
              />
            </Card.SectionHeader>
          )}
        </>
      )}
      {props.responsiveSize === 'LARGE' ? (
        <Card.Tabs
          tabs={Object.values(issueListTabs)}
          active={issueListTabs[selectedIssueTab].value}
          onChange={(tab) => setSelectedIssueTab(tab as TIssueListTabType)}
        />
      ) : (
        <Menu
          position='bottom left'
          margin={`${theme.sizes.spacing4} ${theme.sizes.spacing4} ${theme.sizes.spacing4} 0px`}
          content={(close) => (
            <>
              {Object.values(issueListTabs).map((tab: TIssueListTabValue) => {
                return (
                  <Menu.Item
                    key={tab.value}
                    onClick={(e) => {
                      close(e)
                      setSelectedIssueTab(tab.value)
                    }}
                  >
                    <Text type={'body'}>{tab.text}</Text>
                  </Menu.Item>
                )
              })}
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
              padding-top: ${(props) => props.theme.sizes.spacing10};
              width: fit-content;
            `}
          >
            <TextEllipsis type='body' weight='semibold' lineLimit={1}>
              {issueListTabs[selectedIssueTab].text}
            </TextEllipsis>
            <Icon iconName='chevronDownIcon' iconSize='md2' />
          </span>
        </Menu>
      )}
    </Card.Header>
  )
})
