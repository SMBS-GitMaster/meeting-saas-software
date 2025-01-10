import debounce from 'lodash.debounce'
import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { Portal } from 'react-portal'
import { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'
import { useDocument } from '@mm/core/ssr'

import { PermissionCheckResult, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  Badge,
  BtnText,
  Card,
  Icon,
  OneLineListWithCustomOverflow,
  QuickAddTextInput,
  SelectIssueVotingInputSelection,
  Text,
  TextEllipsis,
  UserAvatar,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'
import { BloomPageEmptyStateTooltipProvider } from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateTooltipProvider'

import {
  STAR_NUMBER,
  getIssueListHeaderPortalOutId,
} from '../issueListConstants'
import {
  IIssueListViewActionHandlers,
  IIssueListViewData,
  IIssueListViewProps,
} from '../issueListTypes'

export const ShortTermIssueListHeader = observer(
  function ShortTermIssueListHeader(props: IIssueListViewProps) {
    const [quickAddIssueValue, setQuickAddIssueValue] = useState('')

    const document = useDocument()
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    const issueListHeaderPortalOutId = getIssueListHeaderPortalOutId({
      meetingId: props.getData().meeting.id,
    })

    const {
      isMeetingOngoing,
      meetingAttendees,
      currentUser,
      selectedIssueTab,
      issueVotingType,
      starsToAllocate,
      issueVotingHasEnded,
      hasCurrentUserVoted,
      disableClearPriorityVotesButton,
      pageType,
      getAttendeesWhoHaveNotVoted,
    } = props.getData()

    const {
      onChangeVotingType,
      setSortIssuesBy,
      onQuickAddIssueEnter,
      onResetUserStarVotes,
      onSubmitStarVotes,
      onRestartStarVoting,
      onResetPriorityVotes,
      onConcludeStarVoting,
    } = props.getActionHandlers()

    const isMeetingPageView = pageType === 'MEETING'

    const onQuickAddIssue = (issueTitle: string) => {
      onQuickAddIssueEnter({
        quickAddIssueValue: issueTitle,
        quickAddAssigneeId: currentUser.id,
      })
      setQuickAddIssueValue('')
    }

    return (
      <Portal
        node={
          document.getElementById(
            issueListHeaderPortalOutId
          ) as Maybe<HTMLDivElement>
        }
      >
        {isMeetingPageView && (
          <ShortTermIssueListHeaderPrioritizationOptions
            isMeetingOngoing={isMeetingOngoing}
            meetingAttendees={meetingAttendees}
            currentUser={currentUser}
            selectedIssueTab={selectedIssueTab}
            issueVotingType={issueVotingType}
            issueVotingHasEnded={issueVotingHasEnded}
            starsToAllocate={starsToAllocate}
            hasUserSubmittedVotes={hasCurrentUserVoted}
            canStarVoteForIssuesInMeeting={
              currentUser.permissions.canStarVoteForIssuesInMeeting
            }
            disableClearPriorityVotesButton={disableClearPriorityVotesButton}
            getAttendeesWhoHaveNotVoted={getAttendeesWhoHaveNotVoted}
            onChangeVotingType={onChangeVotingType}
            setSortIssuesBy={setSortIssuesBy}
            resetUserStarVotes={onResetUserStarVotes}
            submitStarVotes={onSubmitStarVotes}
            restartStarVoting={onRestartStarVoting}
            resetPriorityVotes={onResetPriorityVotes}
            concludeStarVoting={onConcludeStarVoting}
          />
        )}
        <CreateForm
          isLoading={false}
          values={{
            quickAddIssueTitle: quickAddIssueValue ?? '',
          }}
          validation={
            {
              quickAddIssueTitle: formValidators.string({
                additionalRules: [
                  maxLength({
                    maxLength: MEETING_TITLES_CHAR_LIMIT,
                    customErrorMsg: t(`Can't exceed {{maxLength}} characters`, {
                      maxLength: MEETING_TITLES_CHAR_LIMIT,
                    }),
                  }),
                ],
              }),
            } satisfies GetParentFormValidation<{
              quickAddIssueTitle: string
            }>
          }
          onSubmit={async (values) => {
            const issueTitle = (values && values['quickAddIssueTitle']) ?? ''
            onQuickAddIssue(issueTitle)
          }}
        >
          {({ fieldNames, hasError, onSubmit, onFieldChange }) => {
            return (
              <Card.SubHeader>
                <BloomPageEmptyStateTooltipProvider emptyStateId='quickCreation'>
                  {(tooltipProps) => (
                    <QuickAddTextInput
                      enableValidationOnFocus
                      disabled={
                        !currentUser.permissions.canCreateIssuesInMeeting
                          .allowed
                      }
                      tooltip={
                        !currentUser.permissions.canCreateIssuesInMeeting
                          .allowed
                          ? {
                              msg: currentUser.permissions
                                .canCreateIssuesInMeeting.message,
                              type: 'light',
                              position: 'top center',
                            }
                          : tooltipProps
                      }
                      id='Issue-list-view-quick-add-input'
                      name={fieldNames.quickAddIssueTitle}
                      placeholder={t('Create a quick {{issue}}', {
                        issue: terms.issue.lowercaseSingular,
                      })}
                      instructions={
                        <>
                          {t('Press ')}
                          <strong>{t('enter ')}</strong>
                          {t('to add new {{issue}}', {
                            issue: terms.issue.lowercaseSingular,
                          })}
                        </>
                      }
                      onChange={(title) => {
                        onFieldChange('quickAddIssueTitle', title)
                        setQuickAddIssueValue(title)
                      }}
                      onEnter={() => {
                        if (hasError) return
                        onSubmit()
                        onFieldChange('quickAddIssueTitle', '') // TODO: Remove this line when deciding which of the two states (form or view) will be used.
                      }}
                      isHover={tooltipProps?.isHover}
                    />
                  )}
                </BloomPageEmptyStateTooltipProvider>
              </Card.SubHeader>
            )
          }}
        </CreateForm>
      </Portal>
    )
  }
)

interface IIssueListViewHeaderPrioritizationOptionsProps {
  meetingAttendees: IIssueListViewData['meetingAttendees']
  currentUser: IIssueListViewData['currentUser']
  selectedIssueTab: IIssueListViewData['selectedIssueTab']
  issueVotingType: IIssueListViewData['issueVotingType']
  isMeetingOngoing: IIssueListViewData['isMeetingOngoing']
  issueVotingHasEnded: boolean
  starsToAllocate: number
  hasUserSubmittedVotes: boolean
  canStarVoteForIssuesInMeeting: PermissionCheckResult
  disableClearPriorityVotesButton: boolean
  getAttendeesWhoHaveNotVoted: () => IIssueListViewData['meetingAttendees']
  onChangeVotingType: IIssueListViewActionHandlers['onChangeVotingType']
  setSortIssuesBy: IIssueListViewActionHandlers['setSortIssuesBy']
  restartStarVoting: () => Promise<void>
  submitStarVotes: () => Promise<void>
  resetUserStarVotes: () => void
  resetPriorityVotes: () => Promise<void>
  concludeStarVoting: () => Promise<void>
}

export const ShortTermIssueListHeaderPrioritizationOptions = observer(
  function ShortTermIssueListHeaderPrioritizationOptions(
    props: IIssueListViewHeaderPrioritizationOptionsProps
  ) {
    const {
      meetingAttendees,
      currentUser,
      selectedIssueTab,
      issueVotingType,
      isMeetingOngoing,
      issueVotingHasEnded,
      starsToAllocate,
      hasUserSubmittedVotes,
      canStarVoteForIssuesInMeeting,
      getAttendeesWhoHaveNotVoted,
      onChangeVotingType,
      submitStarVotes,
      resetUserStarVotes,
      resetPriorityVotes,
    } = props

    const [submitStarVotesDisabled, setSubmitStarVotesDisabled] =
      useState(false)

    const theme = useTheme()
    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()

    const currentUserAttendee = meetingAttendees.find(
      (a) => a.id === currentUser.id
    )

    const isViewingMovedToOtherMeetingIssues = selectedIssueTab === 'SENT_TO'

    const isCurrentUserLeader =
      currentUser.permissions.currentUserIsMeetingLeader.allowed

    const isCurrentUserEditPermission =
      currentUser.permissions.canEditIssuesInMeeting.allowed

    const isStarVoting = issueVotingType === 'STAR'

    const hasCurrentUserStarVoted =
      currentUserAttendee?.hasSubmittedVotes ?? true

    const renderLeaderStarVotingSteps =
      isStarVoting && !issueVotingHasEnded && isCurrentUserLeader

    const isClearMyStarVotesButtonDisabled =
      !canStarVoteForIssuesInMeeting.allowed ||
      hasUserSubmittedVotes ||
      starsToAllocate === STAR_NUMBER

    const isClearPriorityVotesButtonDisabled =
      !currentUser.permissions.canEditIssuesInMeeting.allowed ||
      props.disableClearPriorityVotesButton

    const restartStarVotingButtonClicked = () => {
      openOverlazy('ConfirmVoteAgainIssueStarVotingModal', {
        voteAgainClicked: () => {
          props.resetUserStarVotes()
        },
      })
    }

    const submitStarVotesDebounced = debounce(async () => {
      setSubmitStarVotesDisabled(true)
      await submitStarVotes()
      setSubmitStarVotesDisabled(false)
    }, 500)

    return (
      <>
        {!isViewingMovedToOtherMeetingIssues &&
          selectedIssueTab === 'SHORT_TERM' && (
            <Card.SectionHeader
              padding='none'
              css={css`
                min-height: ${({ theme }) => theme.sizes.spacing32};
                background-color: ${({ theme }) =>
                  theme.colors.issuesPrioritizationOptionsBg};
              `}
            >
              <div
                css={css`
                  align-items: center;
                  display: flex;
                  justify-content: space-between;
                  padding-top: ${(props) => props.theme.sizes.spacing16};
                  padding-left: ${(props) => props.theme.sizes.spacing16};
                  padding-right: ${(props) => props.theme.sizes.spacing16};
                `}
              >
                <div
                  css={css`
                    align-items: center;
                    display: flex;
                  `}
                >
                  <CreateForm
                    isLoading={false}
                    disabled={
                      !currentUser.permissions.canEditIssuesInMeeting.allowed
                    }
                    disabledTooltip={
                      !currentUser.permissions.canEditIssuesInMeeting.allowed
                        ? {
                            msg: currentUser.permissions.canEditIssuesInMeeting
                              .message,
                            type: 'light',
                            position: 'top center',
                          }
                        : undefined
                    }
                    values={
                      {
                        issuesVotingType: issueVotingType,
                      } as {
                        issuesVotingType: string
                      }
                    }
                    validation={
                      {
                        issuesVotingType: formValidators.string({
                          additionalRules: [required()],
                        }),
                      } as GetParentFormValidation<{
                        issuesVotingType: string
                      }>
                    }
                    onSubmit={async () => {
                      // NO-OP
                    }}
                  >
                    {({ fieldNames }) => (
                      <>
                        <SelectIssueVotingInputSelection
                          placeholder={t('Select a voting type')}
                          id={'issuesVotingTypeId'}
                          name={fieldNames.issuesVotingType}
                          unknownItemText={t('Unknown type')}
                          disabled={
                            (isMeetingOngoing && !isCurrentUserLeader) ||
                            (!isMeetingOngoing && !isCurrentUserEditPermission)
                          }
                          tooltip={
                            isMeetingOngoing && !isCurrentUserLeader
                              ? {
                                  msg: t(
                                    'Only the leader can change voting style'
                                  ),
                                  type: 'light',
                                  position: 'top center',
                                }
                              : !isMeetingOngoing &&
                                  !isCurrentUserEditPermission
                                ? {
                                    msg: currentUser.permissions
                                      .canEditIssuesInMeeting.message,
                                    type: 'light',
                                    position: 'top center',
                                  }
                                : undefined
                          }
                          width={toREM(216)}
                          onChange={onChangeVotingType}
                          css={css`
                            margin: ${(props) => props.theme.sizes.spacing4}
                              ${(props) => props.theme.sizes.spacing16} 0 0;
                            min-width: ${toREM(259)};
                          `}
                        />
                      </>
                    )}
                  </CreateForm>
                  {isStarVoting && (
                    <>
                      {!hasCurrentUserStarVoted && !issueVotingHasEnded && (
                        <>
                          <Text type='body' weight='semibold'>
                            {t(`You have {{count}} stars left`, {
                              count: starsToAllocate,
                            })}
                          </Text>
                          {new Array(starsToAllocate)
                            .fill('')
                            .map((_, index) => (
                              <Icon
                                key={index}
                                iconName='starFullIcon'
                                iconSize={'lg'}
                                iconColor={{
                                  color: theme.colors.agendaCrown,
                                }}
                                css={css`
                                  margin-left: ${(props) =>
                                    props.theme.sizes.spacing8};
                                `}
                              />
                            ))}
                        </>
                      )}
                      {isCurrentUserLeader &&
                        hasCurrentUserStarVoted &&
                        !issueVotingHasEnded && (
                          <Text type='body' weight='semibold'>
                            {t('Vote submitted!')}
                          </Text>
                        )}
                      {!isCurrentUserLeader &&
                        hasCurrentUserStarVoted &&
                        !issueVotingHasEnded && (
                          <Text type='body' weight='semibold'>
                            {t(
                              "Votes submitted! Once everyone's finished, the leader will close voting."
                            )}
                          </Text>
                        )}
                      {!isCurrentUserLeader && issueVotingHasEnded && (
                        <Text type='body' weight='semibold'>
                          {t('Voting completed!')}
                        </Text>
                      )}
                    </>
                  )}
                </div>
                {issueVotingType === 'PRIORITY' && (
                  <BtnText
                    onClick={async () => {
                      await resetPriorityVotes()
                    }}
                    intent='tertiaryTransparent'
                    width='fitted'
                    ariaLabel={t('Clear selection')}
                    disabled={isClearPriorityVotesButtonDisabled}
                    tooltip={
                      !currentUser.permissions.canEditIssuesInMeeting.allowed
                        ? {
                            msg: currentUser.permissions.canEditIssuesInMeeting
                              .message,
                            type: 'light',
                            position: 'top left',
                          }
                        : props.disableClearPriorityVotesButton
                          ? {
                              msg: t('No priority votes to clear'),
                              type: 'light',
                              position: 'top left',
                            }
                          : undefined
                    }
                    css={css`
                      ${isClearPriorityVotesButtonDisabled &&
                      css`
                        span {
                          color: ${(props) =>
                            props.theme.colors.intentDisabledColor};
                        }
                      `}
                    `}
                  >
                    {t('Clear selection')}
                  </BtnText>
                )}
                {isStarVoting && (
                  <>
                    {isCurrentUserLeader && issueVotingHasEnded && (
                      <BtnText
                        intent='primary'
                        iconProps={{
                          iconName: 'leaderIcon',
                          iconColor: { color: theme.colors.agendaCrown },
                        }}
                        ariaLabel={t('Vote again')}
                        onClick={() => {
                          restartStarVotingButtonClicked()
                        }}
                      >
                        {t('Vote again')}
                      </BtnText>
                    )}
                    {!hasCurrentUserStarVoted && !issueVotingHasEnded && (
                      <div
                        css={css`
                          align-items: center;
                          display: flex;
                          flex-direction: row;
                        `}
                      >
                        <BtnText
                          intent='tertiaryTransparent'
                          ariaLabel={t('Clear my votes')}
                          width={'noPadding'}
                          disabled={isClearMyStarVotesButtonDisabled}
                          tooltip={
                            !canStarVoteForIssuesInMeeting.allowed
                              ? {
                                  msg: canStarVoteForIssuesInMeeting.message,
                                  position: 'top center',
                                }
                              : hasUserSubmittedVotes
                                ? {
                                    msg: t('Your votes have been submitted'),
                                    position: 'top center',
                                  }
                                : starsToAllocate === STAR_NUMBER
                                  ? {
                                      msg: t('No votes to clear'),
                                      position: 'top center',
                                    }
                                  : undefined
                          }
                          onClick={() => {
                            resetUserStarVotes()
                          }}
                          css={css`
                            margin-right: ${(prop) =>
                              prop.theme.sizes.spacing24};

                            ${isClearMyStarVotesButtonDisabled &&
                            css`
                              span {
                                color: ${(props) =>
                                  props.theme.colors.intentDisabledColor};
                              }
                            `}
                          `}
                        >
                          {t('Clear my votes')}
                        </BtnText>
                        <BtnText
                          intent='primary'
                          ariaLabel={t('Submit my votes')}
                          disabled={
                            !canStarVoteForIssuesInMeeting.allowed ||
                            hasUserSubmittedVotes ||
                            starsToAllocate > 0 ||
                            submitStarVotesDisabled
                          }
                          tooltip={
                            !canStarVoteForIssuesInMeeting.allowed
                              ? {
                                  msg: canStarVoteForIssuesInMeeting.message,
                                  position: 'top center',
                                }
                              : hasUserSubmittedVotes
                                ? {
                                    msg: t('Your votes have been submitted'),
                                    position: 'top center',
                                  }
                                : starsToAllocate > 0
                                  ? {
                                      msg: t(
                                        'Use all stars to complete the vote'
                                      ),
                                      position: 'top left',
                                    }
                                  : undefined
                          }
                          onClick={() => {
                            submitStarVotesDebounced()
                          }}
                        >
                          {t('Submit my votes')}
                        </BtnText>
                      </div>
                    )}
                    {isMeetingOngoing &&
                      isCurrentUserLeader &&
                      hasCurrentUserStarVoted &&
                      !issueVotingHasEnded && (
                        <BtnText
                          intent='primary'
                          iconProps={{
                            iconName: 'leaderIcon',
                            iconColor: { color: theme.colors.agendaCrown },
                          }}
                          ariaLabel={t('End voting and sort results')}
                          disabled={!isMeetingOngoing}
                          tooltip={
                            !isMeetingOngoing
                              ? {
                                  msg: t(
                                    'Meeting must be ongoing to end star voting'
                                  ),
                                  type: 'light',
                                  position: 'top left',
                                }
                              : undefined
                          }
                          onClick={async () => {
                            await props.concludeStarVoting()
                          }}
                        >
                          {t('End voting and sort results')}
                        </BtnText>
                      )}
                  </>
                )}
              </div>
              <div
                css={css`
                  align-items: center;
                  display: flex;
                  justify-content: flex-end;
                  padding-bottom: ${(props) => props.theme.sizes.spacing4};
                  padding-left: ${(props) => props.theme.sizes.spacing16};
                  padding-right: ${(props) => props.theme.sizes.spacing16};
                  padding-top: ${(props) => props.theme.sizes.spacing4};
                `}
              >
                {renderLeaderStarVotingSteps && (
                  <Text type='small' fontStyle='italic'>
                    {hasCurrentUserStarVoted ? t('2/2 steps') : t('1/2 steps')}
                  </Text>
                )}
                {!renderLeaderStarVotingSteps && (
                  <div
                    css={css`
                      height: ${toREM(6)};
                      width: ${toREM(6)};
                    `}
                  >
                    {''}
                  </div>
                )}
              </div>

              {isStarVoting && !issueVotingHasEnded && (
                <div
                  css={css`
                    align-items: center;
                    display: flex;
                    justify-content: space-between;
                    padding: 0 ${(prop) => prop.theme.sizes.spacing16}
                      ${(prop) => prop.theme.sizes.spacing16}
                      ${(prop) => prop.theme.sizes.spacing16};
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                      flex-flow: row nowrap;
                      height: ${toREM(48)};
                    `}
                  >
                    <OneLineListWithCustomOverflow
                      lineHeight={32}
                      renderReducedStylesBreakpoint={100}
                      css={css`
                        flex-shrink: 4;
                      `}
                      customEllipsis={(count) => (
                        <Badge
                          intent={'inactive'}
                          text={`+${count}`}
                          textType={'small'}
                          borderRadius={toREM(4)}
                          css={css`
                            min-height: ${toREM(32)};
                            min-width: ${toREM(32)};
                            display: flex;
                            justify-content: center;
                            align-items: center;
                          `}
                        />
                      )}
                    >
                      {getAttendeesWhoHaveNotVoted().map((attendee) => (
                        <UserAvatar
                          key={attendee.id}
                          id={`shortTermIssueHeaderId-${attendee.id}`}
                          avatarUrl={attendee.avatar}
                          firstName={attendee.firstName}
                          lastName={attendee.lastName}
                          userAvatarColor={attendee.userAvatarColor}
                          size='m'
                          adornments={{ tooltip: true }}
                          css={css`
                            padding-right: ${(prop) =>
                              prop.theme.sizes.spacing4};
                          `}
                        />
                      ))}
                    </OneLineListWithCustomOverflow>

                    {getAttendeesWhoHaveNotVoted().length === 0 ? (
                      <TextEllipsis
                        type='small'
                        lineLimit={1}
                        tooltipProps={{ position: 'bottom right' }}
                        css={css`
                          flex-shrink: 1;
                          width: ${toREM(250)};
                          color: ${(props) =>
                            props.theme.colors.issuesLeaderOptionsColor};
                        `}
                      >
                        {t('All attendees have cast their votes')}
                      </TextEllipsis>
                    ) : (
                      <TextEllipsis
                        lineLimit={1}
                        tooltipProps={{ position: 'bottom right' }}
                        type='small'
                        css={css`
                          flex-shrink: 1;
                          width: ${toREM(250)};
                          margin-left: ${(prop) => prop.theme.sizes.spacing16};
                          color: ${(props) =>
                            props.theme.colors.issuesLeaderOptionsColor};
                        `}
                      >
                        {t(`{{count}} {{attendee}} {{verb}} `, {
                          count: getAttendeesWhoHaveNotVoted().length,
                          attendee:
                            getAttendeesWhoHaveNotVoted().length === 1
                              ? t('attendee')
                              : t('attendees'),
                          verb:
                            getAttendeesWhoHaveNotVoted().length === 1
                              ? t('has')
                              : t('have'),
                        })}
                        <Text
                          type='small'
                          weight='semibold'
                          css={`
                            font-size: inherit;
                          `}
                        >
                          {t('not')}
                        </Text>
                        {t(' completed voting')}
                      </TextEllipsis>
                    )}
                  </div>
                </div>
              )}
            </Card.SectionHeader>
          )}
      </>
    )
  }
)
