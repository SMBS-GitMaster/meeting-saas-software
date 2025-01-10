import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  MeetingIssueVoting,
  PermissionCheckResult,
  type TBloomPageType,
  type TWorkspaceType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useTheme } from '@mm/core-web/ui'
import {
  CheckBoxInput,
  Clickable,
  Icon,
  Menu,
  Text,
} from '@mm/core-web/ui/components'
import { toREM } from '@mm/core-web/ui/responsive'

import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'
import { SortBy } from '@mm/bloom-web/shared/components/sortBy'

import { ISSUE_LIST_SORTING_OPTS } from '../issueListConstants'
import {
  EIssueListColumnSize,
  IIssueListViewData,
  TIssueListResponsiveSize,
  TIssueListTabType,
} from '../issueListTypes'
import { IIssueListHeaderActionHandlers } from './IssueListHeaderTypes'

interface IIssueListHeaderMenuOptions {
  currentIssueListTab: TIssueListTabType
  sortIssuesBy: IIssueListViewData['sortIssuesBy']
  mergeIssueMode: boolean
  showNumberedList: boolean
  canEditIssuesInMeeting: PermissionCheckResult
  canCreateIssuesInMeeting: PermissionCheckResult
  issueVotingType: MeetingIssueVoting
  pageType: TBloomPageType
  workspaceType: TWorkspaceType
  responsiveSize: TIssueListResponsiveSize
  workspaceTileId: Maybe<Id>
  isExpandedOnWorkspacePage: boolean
  setSortIssuesBy: IIssueListHeaderActionHandlers['setSortIssuesBy']
  onPrintIssue: IIssueListHeaderActionHandlers['onPrintIssue']
  onUploadIssue: IIssueListHeaderActionHandlers['onUploadIssue']
  onExportIssue: IIssueListHeaderActionHandlers['onExportIssue']
  setMergeIssueMode: (value: boolean) => void
  onViewArchivedIssues: IIssueListHeaderActionHandlers['onViewArchivedIssues']
  setShowNumberedList: IIssueListHeaderActionHandlers['setShowNumberedList']
  changeColumnSizeClicked: (columnSize: EIssueListColumnSize) => void
  createIssueClicked: () => void
  onDeleteTile: IIssueListHeaderActionHandlers['onDeleteTile']
}

export const IssueListHeaderMenuOptions = observer(
  function IssueListHeaderMenuOptions(props: IIssueListHeaderMenuOptions) {
    const {
      currentIssueListTab,
      sortIssuesBy,
      mergeIssueMode,
      canEditIssuesInMeeting,
      canCreateIssuesInMeeting,
      showNumberedList,
      setSortIssuesBy,
      setMergeIssueMode,
      onPrintIssue,
      // onExportIssue,
      onUploadIssue,
      onViewArchivedIssues,
      setShowNumberedList,
    } = props

    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { fullScreenTile, minimizeTile } =
      useWorkspaceFullScreenTileController()
    const { t } = useTranslation()

    const renderNumberedListToggle =
      currentIssueListTab === 'SHORT_TERM' ||
      currentIssueListTab === 'LONG_TERM'

    const isViewingMovedToOtherMeetingIssues = currentIssueListTab === 'SENT_TO'

    const isMeetingView = props.pageType === 'MEETING'

    return (
      <>
        <div
          css={css`
            display: flex;
            align-items: center;
          `}
        >
          {isMeetingView && renderNumberedListToggle && (
            <CheckBoxInput
              id='showNumberedIssueListId'
              name='showNumberedIssueList'
              inputType='toggle'
              text={
                <Text
                  weight='semibold'
                  type='body'
                  color={{ color: theme.colors.meetingSectionSortByTextColor }}
                >
                  {t('Numbered List')}
                </Text>
              }
              tooltip={
                !canEditIssuesInMeeting.allowed
                  ? {
                      msg: canEditIssuesInMeeting.message,
                      type: 'light',
                      position: 'top center',
                    }
                  : undefined
              }
              disabled={!canEditIssuesInMeeting.allowed}
              value={showNumberedList}
              onChange={setShowNumberedList}
              css={css`
                display: flex;
                align-items: center;
                gap: ${(prop) => prop.theme.sizes.spacing6};
                margin-right: ${toREM(19)};
                height: ${toREM(14)};
              `}
            />
          )}
          {props.responsiveSize === 'LARGE' && (
            <Menu
              maxWidth={toREM(330)}
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={(e) => {
                      props.changeColumnSizeClicked(EIssueListColumnSize.One)
                      close(e)
                    }}
                  >
                    <Text type={'body'}>{t('One column')}</Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      props.changeColumnSizeClicked(EIssueListColumnSize.Two)
                      close(e)
                    }}
                  >
                    <Text type={'body'}>{t('Two columns')}</Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      props.changeColumnSizeClicked(EIssueListColumnSize.Three)
                      close(e)
                    }}
                  >
                    <Text type={'body'}>{t('Three columns')}</Text>
                  </Menu.Item>
                  <Menu.Item
                    onClick={(e) => {
                      props.changeColumnSizeClicked(EIssueListColumnSize.Four)
                      close(e)
                    }}
                  >
                    <Text type={'body'}>{t('Four columns')}</Text>
                  </Menu.Item>
                </>
              )}
            >
              <div
                css={css`
                  align-items: center;
                  display: flex;
                  cursor: pointer;
                  margin-right: ${theme.sizes.spacing16};
                `}
              >
                <Icon iconName='columnIcon' iconSize='md2' />
                <Text
                  type='body'
                  weight='semibold'
                  css={css`
                    margin-left: ${theme.sizes.spacing8};
                  `}
                >
                  {t('Columns')}
                </Text>
                <Icon iconName='chevronDownIcon' iconSize='lg' />
              </div>
            </Menu>
          )}
          <SortBy
            sortingOptions={ISSUE_LIST_SORTING_OPTS}
            selected={sortIssuesBy}
            showOnlyIcon={props.responsiveSize !== 'LARGE'}
            onChange={setSortIssuesBy}
            labelCss={css`
              margin-right: ${theme.sizes.spacing4};
              color: ${theme.colors.issuesSortByColor};
            `}
            selectedCss={css`
              margin: 0;
              padding-right: ${theme.sizes.spacing16};
            `}
            hideItem={(opts) => {
              if (isViewingMovedToOtherMeetingIssues) {
                if (opts.value === 'VOTES' || opts.value === 'PRIORITY') {
                  return true
                }
              }

              if (
                props.issueVotingType === 'STAR' &&
                opts.value === 'PRIORITY'
              ) {
                return true
              }

              if (
                props.issueVotingType === 'PRIORITY' &&
                opts.value === 'VOTES'
              ) {
                return true
              }

              return false
            }}
          />
          <Menu
            maxWidth={toREM(330)}
            content={(close) => (
              <>
                {isMeetingView && (
                  <>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        setMergeIssueMode(!mergeIssueMode)
                      }}
                      disabled={
                        isViewingMovedToOtherMeetingIssues ||
                        !canEditIssuesInMeeting.allowed
                      }
                      tooltip={
                        !canEditIssuesInMeeting.allowed
                          ? {
                              msg: canEditIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                    >
                      <Text type={'body'}>
                        {t('Merge {{issues}}', {
                          issues: terms.issue.lowercasePlural,
                        })}
                      </Text>
                    </Menu.Item>
                    <Menu.Item
                      disabled={!canEditIssuesInMeeting.allowed}
                      tooltip={
                        !canEditIssuesInMeeting.allowed
                          ? {
                              msg: canEditIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        close(e)
                        onPrintIssue()
                      }}
                    >
                      <Text type={'body'}>{t('Print')}</Text>
                    </Menu.Item>
                    <Menu.Item
                      disabled={!canCreateIssuesInMeeting.allowed}
                      tooltip={
                        !canCreateIssuesInMeeting.allowed
                          ? {
                              msg: canCreateIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        close(e)
                        onUploadIssue()
                      }}
                    >
                      <Text type={'body'}>{t('Upload')}</Text>
                    </Menu.Item>
                    {/* <Menu.Item
                      disabled={!canEditIssuesInMeeting.allowed}
                      tooltip={
                        !canEditIssuesInMeeting.allowed
                          ? {
                              msg: canEditIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        close(e)
                        onExportIssue()
                      }}
                      css={css`
                        border-bottom: ${(props) =>
                          `${props.theme.sizes.smallSolidBorder} ${props.theme.colors.dividerStrokeDefault}`};
                      `}
                    >
                      <Text type={'body'}>{t('Export')}</Text>
                    </Menu.Item> */}
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        onViewArchivedIssues()
                      }}
                    >
                      <Text type={'body'}>
                        {t('View archived {{issues}}', {
                          issues: terms.issue.lowercasePlural,
                        })}
                      </Text>
                    </Menu.Item>
                  </>
                )}
                {!isMeetingView && (
                  <>
                    <Menu.Item
                      disabled={!canCreateIssuesInMeeting.allowed}
                      tooltip={
                        !canCreateIssuesInMeeting.allowed
                          ? {
                              msg: canCreateIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        close(e)
                        props.createIssueClicked()
                      }}
                    >
                      <Text type={'body'}>
                        {t('Create {{issue}}', {
                          issue: terms.issue.lowercaseSingular,
                        })}
                      </Text>
                    </Menu.Item>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        if (props.workspaceTileId) {
                          fullScreenTile(props.workspaceTileId)
                        }
                      }}
                    >
                      <Text type={'body'}>{t('View in full screen')}</Text>
                    </Menu.Item>
                    {props.workspaceType === 'PERSONAL' && (
                      <Menu.Item
                        onClick={(e) => {
                          close(e)
                          props.onDeleteTile()
                        }}
                      >
                        <Text type={'body'}>{t('Delete tile')}</Text>
                      </Menu.Item>
                    )}
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
          {props.isExpandedOnWorkspacePage && (
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
      </>
    )
  }
)
