import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import { guessTimezone, useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useWindow } from '@mm/core/ssr'

import {
  ISSUE_PRIORITY_UNRANKED_NUMBER,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomIssuesMutations,
  useBloomMeetingMutations,
  useBloomMeetingNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'
import { useHeaderListMoreOptions } from '@mm/bloom-web/shared'

import {
  ISSUE_LIST_SORT_BY_VALUE,
  STAR_NUMBER,
  getBreadcrumbByState,
  getCustomIssueErrorMessage,
} from './issueListConstants'
import { getIssueListPermissions } from './issueListPermissions'
import {
  EIssueListColumnSize,
  IIssueListContainerProps,
  IIssueListViewActionHandlers,
  IssueBreadcrumbStateType,
  IssueListSortType,
  TIssueListTabType,
} from './issueListTypes'

export const IssueListContainer = observer(function IssueListContainer(
  props: IIssueListContainerProps
) {
  const { meetingId } = props

  const pageState = useObservable<{
    sortIssuesBy: Maybe<IssueListSortType>
    selectedIssueTab: TIssueListTabType
    showNumberedList: boolean
    mergeIssueMode: boolean
    issueIdsToMerge: Id[]
    issueListColumnSize: EIssueListColumnSize
    starsToAllocate: number
    recordOfIssueIdsToStars: Record<string, number>
  }>({
    sortIssuesBy: 'ASSIGNEE_ASC',
    selectedIssueTab: 'SHORT_TERM',
    showNumberedList: false,
    mergeIssueMode: false,
    issueIdsToMerge: [],
    issueListColumnSize: EIssueListColumnSize.One,
    starsToAllocate: STAR_NUMBER,
    recordOfIssueIdsToStars: {},
  })

  const setShowNumberedList = useAction((showNumberedList: boolean) => {
    pageState.showNumberedList = showNumberedList
  })

  const setSortIssuesBy = useAction(
    (sortIssuesBy: Maybe<IssueListSortType>) => {
      pageState.sortIssuesBy = sortIssuesBy
    }
  )

  const setIssueIdsToMerge = useAction((issueIdsToMerge: Id[]) => {
    pageState.issueIdsToMerge = issueIdsToMerge
  })

  const setSelectedIssueTab = useAction(
    (selectedIssueTab: TIssueListTabType) => {
      pageState.selectedIssueTab = selectedIssueTab
    }
  )

  const setStarsToAllocate = useAction((starsToAllocate: number) => {
    pageState.starsToAllocate = starsToAllocate
  })

  const setRecordOfIssueIdsToStars = useAction(
    (recordOfIssueIdsToStars: Record<string, number>) => {
      pageState.recordOfIssueIdsToStars = recordOfIssueIdsToStars
    }
  )

  const setMergeIssueMode = useAction((mergeIssueMode: boolean) => {
    pageState.mergeIssueMode = mergeIssueMode
  })

  const setIssueListColumnSize = useAction(
    (issueListColumnSize: EIssueListColumnSize) => {
      pageState.issueListColumnSize = issueListColumnSize
    }
  )

  const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()

  const terms = useBloomCustomTerms()
  const window = useWindow()
  const {
    editIssue,
    resetIssuePriorityVoting,
    submitIssuePriorityVotes,
    submitIssueStarVotes,
    resetIssueStarVoting,
    createIssue,
  } = useBloomIssuesMutations()
  const { checkIfEmbeddedDrawerIsAvailable } = useDrawerController()
  const { editWorkspaceTile } = useBloomWorkspaceMutations()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { editMeeting, editMeetingInstance } = useBloomMeetingMutations()
  const { openOverlazy, closeOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const { v1Url } = useBrowserEnvironment()

  const getIsCompactView = useComputed(
    () => {
      return (
        pageState.issueListColumnSize === EIssueListColumnSize.Three ||
        pageState.issueListColumnSize === EIssueListColumnSize.Four
      )
    },
    {
      name: `IssueListContainer.getIsCompactView`,
    }
  )

  const pageType = props.pageType || 'MEETING'
  const workspaceType = props.workspaceType || 'MEETING'

  const isExpandedOnWorkspacePage =
    activeFullScreenTileId !== null &&
    activeFullScreenTileId === props.workspaceTileId

  const sortIssuesParams = pageState.sortIssuesBy
    ? ISSUE_LIST_SORT_BY_VALUE[pageState.sortIssuesBy]
    : {}

  const state: IssueBreadcrumbStateType = 'DEFAULT'

  const getBreadcrumbs = useComputed(
    () => {
      const BREADCRUMB_BY_STATE = getBreadcrumbByState({
        meetingPageName: props.getPageToDisplayData()?.pageName ?? '',
      })
      return BREADCRUMB_BY_STATE[state]
    },
    {
      name: `IssueListContainer.getBreadcrumbByState`,
    }
  )

  const subscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          settings,
        }) => ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          settings: settings({ map: ({ timezone }) => ({ timezone }) }),
        }),
      }),
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({
          name,
          meetingType,
          issueVoting,
          attendees,
          currentMeetingAttendee,
          currentMeetingInstance,
          issues,
        }) => ({
          name,
          meetingType,
          issueVoting,
          currentMeetingInstance: currentMeetingInstance({
            map: ({ leaderId, issueVotingHasEnded }) => ({
              leaderId,
              issueVotingHasEnded,
            }),
          }),
          currentMeetingAttendee: currentMeetingAttendee({
            map: ({ permissions }) => ({
              permissions: permissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
          }),
          attendees: attendees({
            map: ({
              id,
              firstName,
              lastName,
              fullName,
              avatar,
              userAvatarColor,
              hasSubmittedVotes,
            }) => ({
              id,
              firstName,
              lastName,
              fullName,
              avatar,
              userAvatarColor,
              hasSubmittedVotes,
            }),
          }),
          shortTermIssues: issues({
            filter: {
              and: [
                {
                  addToDepartmentPlan: false,
                  completed: false,
                  archived: false,
                  sentToIssueMeetingName: null,
                },
              ],
            },
            sort: {
              ...sortIssuesParams,
            },
            map: ({
              title,
              completed,
              addToDepartmentPlan,
              dateCreated,
              numStarVotes,
              priorityVoteRank,
              archived,
              archivedTimestamp,
              completedTimestamp,
              notesId,
              issueNumber,
              sentFromIssueMeetingName,
              sentToIssueMeetingName,
              assignee,
            }) => ({
              title,
              addToDepartmentPlan,
              completed,
              dateCreated,
              numStarVotes,
              priorityVoteRank,
              archived,
              archivedTimestamp,
              completedTimestamp,
              notesId,
              issueNumber,
              sentFromIssueMeetingName,
              sentToIssueMeetingName,
              assignee: assignee({
                map: ({
                  firstName,
                  lastName,
                  fullName,
                  avatar,
                  userAvatarColor,
                }) => ({
                  firstName,
                  lastName,
                  fullName,
                  avatar,
                  userAvatarColor,
                }),
              }),
            }),
          }),
        }),
        target: { id: props.meetingId },
      }),
    },
    {
      subscriptionId: `IssueListContainer-${meetingId}`,
    }
  )

  const isCurrentUserMeetingLeader =
    subscription().data.meeting?.currentMeetingInstance?.leaderId ===
    subscription().data.currentUser.id

  const listHeaderMoreOptions = useHeaderListMoreOptions({
    id: meetingId,
    meetingType: subscription().data.meeting?.meetingType || '',
  })

  const getCurrentUserPermissions = useComputed(
    () => {
      return getIssueListPermissions({
        currentUserPermissions:
          subscription().data.meeting?.currentMeetingAttendee.permissions ??
          null,
        isCurrentUserMeetingLeader,
      })
    },
    {
      name: `IssueListContainer.getCurrentUserPermissions`,
    }
  )

  const getCurrentPriorityRankedIssues = useComputed(
    () => {
      const issuesToReference =
        subscription().data.meeting.shortTermIssues.nodes

      return issuesToReference.reduce(
        (rankedIssuesMap, issue) => {
          if (
            issue.priorityVoteRank !== null &&
            issue.priorityVoteRank !== ISSUE_PRIORITY_UNRANKED_NUMBER
          ) {
            rankedIssuesMap[issue.id] = issue.priorityVoteRank
          }
          return rankedIssuesMap
        },
        {} as Record<Id, number>
      )
    },
    {
      name: `IssueListContainer.currentPriorityRankedIssues`,
    }
  )

  const getAttendeesWhoHaveNotVoted = useComputed(
    () => {
      return subscription().data.meeting.attendees.nodes.filter(
        (attendee) => !attendee.hasSubmittedVotes
      )
    },
    {
      name: `IssueListContainer.getAttendeesWhoHaveNotVoted`,
    }
  )

  const getNumIssuesCurrentlyRanked = useComputed(
    () => {
      return Object.keys(getCurrentPriorityRankedIssues()).length
    },
    {
      name: `IssueListContainer.getNumIssuesCurrentlyRanked`,
    }
  )

  const getDisableClearPriorityVotesButton = useComputed(
    () => {
      return getNumIssuesCurrentlyRanked() === 0
    },
    {
      name: `IssueListContainer.getDisableClearPriorityVotesButton`,
    }
  )

  const getHasCurrentUserVoted = useComputed(
    () => {
      return subscription().data.meeting.attendees.nodes.some((attendee) => {
        return (
          attendee.id === subscription().data.currentUser.id &&
          attendee.hasSubmittedVotes
        )
      })
    },
    {
      name: `IssueListContainer.getHasCurrentUserVoted`,
    }
  )

  const onHandleNumberedList: IIssueListViewActionHandlers['onHandleNumberedList'] =
    useAction(() => {
      console.log(
        `@TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1844: onHandleNumberedList`
      )
      // use NumberIssues mutation, remove the useState and query this property from meetingNode > meetingInstance_data > showNumberedIssueList
      // @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1844
      setShowNumberedList(!pageState.showNumberedList)
    })

  const onCreateContextAwareTodoFromIssue: IIssueListViewActionHandlers['onCreateContextAwareTodoFromIssue'] =
    useAction((opts) => {
      openOverlazy('CreateTodoDrawer', {
        meetingId: props.meetingId,
        context: opts,
      })
    })

  const onQuickAddIssueEnter: IIssueListViewActionHandlers['onQuickAddIssueEnter'] =
    useAction(async ({ quickAddIssueValue, quickAddAssigneeId }) => {
      // @TODO having this here causes a new subscription to be re-established
      // which causes BE subs to randomly break
      // commenting out for now until I figure out intended behavior here https://winterinternational.slack.com/archives/C03N9UZ9YLV/p1701461693133419
      // setSortIssuesBy(null)
      try {
        await createIssue({
          title: quickAddIssueValue,
          notesId: null,
          ownerId: quickAddAssigneeId,
          recurrenceId: meetingId,
          addToDepartmentPlan: false,
          context: null,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to create {{issue}}', {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    })

  const onViewArchivedIssues: IIssueListViewActionHandlers['onViewArchivedIssues'] =
    useAction(() => {
      // setIsViewingMovedToOtherMeetingIssues(false)
      // setIsViewingArchivedIssues(isViewArchivedIssues)
      const BLOOM_V1_ARCHIVED_ISSUES_URL = `${v1Url}L10/Details/${meetingId}#/Issues`
      window.open(BLOOM_V1_ARCHIVED_ISSUES_URL, '_blank')
    })

  const onPrintIssue: IIssueListViewActionHandlers['onPrintIssue'] = useAction(
    () => {
      listHeaderMoreOptions.onPrint('issues')
    }
  )

  const onUploadIssue: IIssueListViewActionHandlers['onUploadIssue'] =
    useAction(() => {
      listHeaderMoreOptions.onUpload('issues')
    })

  const onExportIssue: IIssueListViewActionHandlers['onExportIssue'] =
    useAction(() => {
      listHeaderMoreOptions.onExport()
    })

  const onSetIssuePriorityVotes: IIssueListViewActionHandlers['onSetIssuePriorityVotes'] =
    useAction(async (opts) => {
      try {
        const response = await submitIssuePriorityVotes({
          issueId: opts.issueId,
          meetingId: meetingId,
          voteTimestamp:
            opts.currentPriorityVoteRank === ISSUE_PRIORITY_UNRANKED_NUMBER
              ? getSecondsSinceEpochUTC()
              : null,
        })

        if (Array.isArray(response) && response.length) {
          const mutationData = response[0].data.submitIssuePriorityVotes

          if (
            mutationData.errorDetails &&
            Array.isArray(mutationData.errorDetails) &&
            mutationData.errorDetails.length
          ) {
            const errorDetails = mutationData.errorDetails[0]

            const customErrorMessage = getCustomIssueErrorMessage({
              message: errorDetails.message,
              terms,
            })

            if (customErrorMessage) {
              openOverlazy('Toast', {
                type: 'error',
                text: customErrorMessage,
                error: new UserActionError(customErrorMessage),
              })
            } else {
              throw new Error(errorDetails.message)
            }
          }
        }
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Encountered problem updating {{issue}} rank`, {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
      }
    })

  const onEditIssueRequest: IIssueListViewActionHandlers['onEditIssueRequest'] =
    useAction((issueId) => {
      openOverlazy('EditIssueDrawer', {
        issueId,
        meetingId,
      })
    })

  const onMoveIssueToShortTerm: IIssueListViewActionHandlers['onMoveIssueToShortTerm'] =
    useAction(async (issueId) => {
      try {
        await editIssue({
          id: issueId,
          addToDepartmentPlan: false,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error editing {{issue}}`, {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
      }
    })

  const onAddIssueToDepartmentPlan: IIssueListViewActionHandlers['onAddIssueToDepartmentPlan'] =
    useAction(async (issueId) => {
      try {
        await editIssue({
          id: issueId,
          addToDepartmentPlan: true,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error editing {{issue}}`, {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
      }
    })

  const onRestoreIssue: IIssueListViewActionHandlers['onRestoreIssue'] =
    useAction(async (issueId) => {
      try {
        await editIssue({
          id: issueId,
          archived: false,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to restore {{issue}}', {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    })

  const onCompleteIssue: IIssueListViewActionHandlers['onCompleteIssue'] =
    useAction(async ({ issueId, value }) => {
      try {
        await editIssue({
          id: issueId,
          completed: value,
          completedTimestamp: value ? getSecondsSinceEpochUTC() : null,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error {{status}} this {{issue}}`, {
            status: value ? 'solving' : 'unsolving',
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    })

  const onMergeIssues: IIssueListViewActionHandlers['onMergeIssues'] =
    useAction((selectedIssueIds) => {
      openOverlazy('MergeIssuesDrawer', {
        issues: selectedIssueIds,
        meetingId,
      })
    })

  const onArchiveSentToIssue: IIssueListViewActionHandlers['onArchiveSentToIssue'] =
    useAction(async (issueId) => {
      try {
        await editIssue({
          id: issueId,
          archived: true,
          archivedTimestamp: getSecondsSinceEpochUTC(),
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to archive {{issue}}', {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(e),
        })
      }
    })

  const onArchiveIssue: IIssueListViewActionHandlers['onArchiveIssue'] =
    useAction(async (issueId) => {
      try {
        await editIssue({
          id: issueId,
          archived: true,
          archivedTimestamp: getSecondsSinceEpochUTC(),
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error archiving {{issue}}`, {
            issue: terms.issue.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
      }
    })

  const onSubmitStarVotes: IIssueListViewActionHandlers['onSubmitStarVotes'] =
    useAction(async () => {
      try {
        const votes = Object.entries(pageState.recordOfIssueIdsToStars).map(
          ([issueId, numberOfVotes]) => {
            return {
              issueId: Number(issueId),
              numberOfVotes,
            }
          }
        )
        await submitIssueStarVotes({ recurrenceId: meetingId, votes })
        setSortIssuesBy('VOTES')
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was a problem submitting your star votes`),
          error: new UserActionError(error),
        })
      }
    })

  const onChangeVotingType: IIssueListViewActionHandlers['onChangeVotingType'] =
    useAction(async (issueVoting) => {
      try {
        await editMeeting({
          meetingId: meetingId,
          issueVoting,
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to update voting type'),
          error: new UserActionError(e),
        })
      }
    })

  const onResetPriorityVotes: IIssueListViewActionHandlers['onResetPriorityVotes'] =
    useAction(async () => {
      try {
        await resetIssuePriorityVoting({ meetingId })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Problem encountered resetting votes`),
          error: new UserActionError(error),
        })
      }
    })

  const onRestartStarVoting: IIssueListViewActionHandlers['onRestartStarVoting'] =
    useAction(async () => {
      try {
        await resetIssueStarVoting({ meetingId })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was a problem restarting star voting.`),
          error: new UserActionError(error),
        })
      }
    })

  const onConcludeStarVoting: IIssueListViewActionHandlers['onRestartStarVoting'] =
    useAction(async () => {
      const currentMeetingInstance =
        subscription().data.meeting.currentMeetingInstance
      if (!currentMeetingInstance) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Cannot end star voting while the meeting is not ongoing.'),
          error: new Error(
            'Cannot end star voting while the meeting is not ongoing'
          ),
        })
      } else {
        try {
          await editMeetingInstance({
            meetingInstanceId: currentMeetingInstance.id,
            issueVotingHasEnded: true,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was a problem ending star voting.`),
            error: new UserActionError(error),
          })
        }
      }
    })

  const onResetUserStarVotes: IIssueListViewActionHandlers['onResetUserStarVotes'] =
    useAction(async () => {
      setStarsToAllocate(STAR_NUMBER)
      setRecordOfIssueIdsToStars({})
      await onRestartStarVoting()
      setSortIssuesBy('ASSIGNEE_ASC')
    })

  const handleSelectIssueToMerge = useAction((issueId: Id) => {
    const currentIds = pageState.issueIdsToMerge

    setIssueIdsToMerge(
      currentIds.includes(issueId)
        ? currentIds.filter((id) => id !== issueId)
        : [...currentIds, issueId]
    )
  })

  const createIssueClicked: IIssueListViewActionHandlers['createIssueClicked'] =
    useAction(() => {
      openOverlazy('CreateIssueDrawer', {
        meetingId,
      })
    })

  const handleAllocateStarsAction: IIssueListViewActionHandlers['handleAllocateStarsAction'] =
    useAction((opts) => {
      if (opts.type === 'ADD') {
        const currentStarsToAllocate = pageState.starsToAllocate

        setStarsToAllocate(
          currentStarsToAllocate === 0 ||
            currentStarsToAllocate - opts.numberToSelect < 0
            ? currentStarsToAllocate
            : currentStarsToAllocate - opts.numberToSelect
        )

        const currentRecordOfIssueIdsToStars = pageState.recordOfIssueIdsToStars
        setRecordOfIssueIdsToStars({
          ...currentRecordOfIssueIdsToStars,
          [opts.issueId]: currentRecordOfIssueIdsToStars[opts.issueId]
            ? currentRecordOfIssueIdsToStars[opts.issueId] + opts.numberToSelect
            : opts.numberToSelect,
        })
      } else {
        const currentValueMinusNumberToSelect =
          pageState.recordOfIssueIdsToStars[opts.issueId] - opts.numberToSelect

        const currentStarsToAllocate = pageState.starsToAllocate

        setStarsToAllocate(
          currentStarsToAllocate === STAR_NUMBER ||
            currentStarsToAllocate + currentValueMinusNumberToSelect >
              STAR_NUMBER
            ? currentStarsToAllocate
            : currentStarsToAllocate + currentValueMinusNumberToSelect
        )

        const getNewRecordOfIssueIdsToStars = () => {
          const currentRecordOfIssueIdsToStars =
            pageState.recordOfIssueIdsToStars
          if (
            currentRecordOfIssueIdsToStars[opts.issueId] -
              currentValueMinusNumberToSelect <=
            0
          ) {
            const { [opts.issueId]: currentValue, ...rest } =
              currentRecordOfIssueIdsToStars
            return rest
          } else {
            return {
              ...currentRecordOfIssueIdsToStars,
              [opts.issueId]:
                currentRecordOfIssueIdsToStars[opts.issueId] -
                currentValueMinusNumberToSelect,
            }
          }
        }
        setRecordOfIssueIdsToStars(getNewRecordOfIssueIdsToStars())
      }
    })

  const onDeleteTile: IIssueListViewActionHandlers['onDeleteTile'] = useAction(
    async () => {
      if (props.workspaceTileId) {
        try {
          await editWorkspaceTile({
            id: props.workspaceTileId,
            meetingId: null,
            archived: true,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue deleting the tile`),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    }
  )

  useEffect(() => {
    if (checkIfEmbeddedDrawerIsAvailable()) {
      const issueId = subscription().data.meeting?.shortTermIssues.nodes.length
        ? subscription().data.meeting?.shortTermIssues.nodes[0].id
        : null

      if (!issueId) {
        return closeOverlazy({ type: 'Drawer' })
      }

      openOverlazy('EditIssueDrawer', {
        meetingId,
        issueId,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getData = useComputed(
    () => ({
      issueIdsToMerge: pageState.issueIdsToMerge,
      mergeIssueMode: pageState.mergeIssueMode,
      showNumberedList: pageState.showNumberedList,
      issueListColumnSize: pageState.issueListColumnSize,
      isCompactView: getIsCompactView(),
      selectedIssueTab: pageState.selectedIssueTab,
      starsToAllocate: pageState.starsToAllocate,
      recordOfIssueIdsToStars: pageState.recordOfIssueIdsToStars,
      numIssuesCurrentlyRanked: getNumIssuesCurrentlyRanked(),
      hasCurrentUserVoted: getHasCurrentUserVoted(),
      disableClearPriorityVotesButton: getDisableClearPriorityVotesButton(),
      issueVotingHasEnded:
        subscription().data.meeting.currentMeetingInstance
          ?.issueVotingHasEnded ?? false,
      issueVotingType: subscription().data.meeting.issueVoting,
      currentMeetingId: meetingId,
      isMeetingOngoing:
        subscription().data.meeting.currentMeetingInstance !== null,
      getShortTermIssues: () => subscription().data.meeting.shortTermIssues,
      getCurrentPriorityRankedIssues,
      getAttendeesWhoHaveNotVoted,
      currentUser: {
        permissions: getCurrentUserPermissions(),
        ...subscription().data.currentUser,
        settings: {
          ...subscription().data.currentUser.settings,
          timezone: (subscription().data.currentUser.settings.timezone ||
            guessTimezone()) as string,
        },
      },
      meeting: subscription().data.meeting,
      meetingAttendees: subscription().data.meeting.attendees.nodes,
      sortIssuesBy: pageState.sortIssuesBy,
      breadcrumbs: getBreadcrumbs(),
      isLoading: subscription().querying,
      pageType,
      workspaceType,
      workspaceTileId: props.workspaceTileId,
      isExpandedOnWorkspacePage,
    }),
    {
      name: `IssueListContainer.getData`,
    }
  )

  const getActionHandlers = useComputed(
    () => ({
      onSortIssues: setSortIssuesBy,
      onCreateContextAwareTodoFromIssue,
      onViewArchivedIssues,
      onQuickAddIssueEnter,
      onPrintIssue,
      onUploadIssue,
      onExportIssue,
      onEditIssueRequest,
      onMoveIssueToShortTerm,
      onAddIssueToDepartmentPlan,
      onSelectIssueTab: setSelectedIssueTab,
      onRestoreIssue,
      onCompleteIssue,
      onMergeIssues,
      onArchiveSentToIssue,
      onSubmitStarVotes,
      onHandleNumberedList,
      onChangeVotingType,
      onSetIssuePriorityVotes,
      onResetPriorityVotes,
      onRestartStarVoting,
      onResetUserStarVotes,
      onConcludeStarVoting,
      onArchiveIssue,
      setShowNumberedList,
      setSelectedIssueTab,
      setMergeIssueMode,
      setIssueIdsToMerge,
      setSortIssuesBy,
      setIssueListColumnSize,
      setStarsToAllocate,
      setRecordOfIssueIdsToStars,
      handleAllocateStarsAction,
      handleSelectIssueToMerge,
      createIssueClicked,
      onDeleteTile,
    }),
    {
      name: `IssueListContainer.getActionHandlers`,
    }
  )

  const IssueListView = (
    <props.children
      className={props.className}
      getData={getData}
      getActionHandlers={getActionHandlers}
    />
  )

  if (isExpandedOnWorkspacePage) {
    return (
      <WorkspaceFullScreenTilePortal>
        {IssueListView}
      </WorkspaceFullScreenTilePortal>
    )
  } else {
    return IssueListView
  }
})
