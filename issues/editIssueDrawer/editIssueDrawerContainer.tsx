import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useMMErrorLogger } from '@mm/core/logging'

import {
  ISSUE_PRIORITY_UNRANKED_NUMBER,
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomIssueNode,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBloomIssuesMutations } from '@mm/core-bloom/issues/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { IEditHeadlineDrawerActionHandlers } from '@mm/bloom-web/headlines/editHeadlineDrawer/editHeadlineDrawerTypes'
import { useAction, useComputed } from '@mm/bloom-web/pages/performance/mobx'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import {
  IEditIssueDrawerActions,
  IEditIssueDrawerContainerProps,
} from './editIssueDrawerTypes'
import { getEditIssueDrawerPermissions } from './editIssuesDrawerPermissions'

export const EditIssueDrawerContainer = observer(
  function EditIssueDrawerContainer(props: IEditIssueDrawerContainerProps) {
    const [issueNotesText, setIssueNotesText] = useState<Maybe<string>>(null)

    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()
    const { createNote } = useBloomNoteMutations()
    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { editIssue } = useBloomIssuesMutations()
    const drawerController = useDrawerController()
    const { getNoteById } = useBloomNoteQueries()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { logError } = useMMErrorLogger()
    const { openOverlazy, closeOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

    const sharedSubscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ settings }) => ({
            settings: settings({
              map: ({ timezone }) => ({ timezone }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        users: queryDefinition({
          def: useBloomUserNode(),
          sort: { fullName: 'asc' },
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
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        meeting: props.meetingId
          ? queryDefinition({
              def: meetingNode,
              map: ({ name, attendeesLookup, currentMeetingAttendee }) => ({
                name,
                attendees: attendeesLookup({
                  sort: { fullName: 'asc' },
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
                currentMeetingAttendee: currentMeetingAttendee({
                  map: ({ permissions }) => ({
                    permissions: permissions({
                      map: ({ view, edit, admin }) => ({ view, edit, admin }),
                    }),
                  }),
                }),
              }),
              useSubOpts: {
                doNotSuspend: true,
              },
              target: { id: props.meetingId },
            })
          : null,
      },
      { subscriptionId: `EditIssueDrawerContainer-sharedSubscription` }
    )

    const issueSubscription = useSubscription(
      {
        issue: queryDefinition({
          def: useBloomIssueNode(),
          map: ({
            title,
            addToDepartmentPlan,
            notesId,
            completed,
            dateCreated,
            priorityVoteRank,
            context,
            fromMergedIds,
            assignee,
            meeting,
          }) => ({
            title,
            addToDepartmentPlan,
            notesId,
            completed,
            dateCreated,
            priorityVoteRank,
            fromMergedIds,
            context: context({
              map: ({ fromNodeTitle, fromNodeType, notesId }) => ({
                fromNodeTitle,
                fromNodeType,
                notesId,
              }),
            }),
            assignee: assignee({
              map: ({ firstName, lastName, fullName, avatar, settings }) => ({
                firstName,
                lastName,
                fullName,
                avatar,
                settings: settings({ map: ({ timezone }) => ({ timezone }) }),
              }),
            }),
            meeting: meeting({ map: ({ name }) => ({ name }) }),
          }),
          target: { id: props.issueId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `EditIssueDrawerContainer-${props.issueId}`,
      }
    )

    const getCurrentUserPermissions = useComputed(
      () => {
        return getEditIssueDrawerPermissions(
          sharedSubscription().data.meeting?.currentMeetingAttendee
            .permissions ?? null
        )
      },
      {
        name: 'EditIssueDrawerContainer-getCurrentUserPermissions',
      }
    )

    const getComputedMeetingAttendeesAndOrgUsersLookup = useComputed(
      () => {
        const { meeting, users } = sharedSubscription().data

        return getMeetingAttendeesAndOrgUsersLookup({
          orgUsers: users || null,
          meetings: meeting ? [meeting] : null,
        })
      },
      {
        name: 'EditIssueDrawerContainer-getMeetingAttendeesAndOrgUsersLookup',
      }
    )

    const onMoveIssueToShortTerm: IEditIssueDrawerActions['onMoveIssueToShortTerm'] =
      useAction(async (issueId) => {
        try {
          await editIssue({
            id: issueId,
            addToDepartmentPlan: false,
          })
          closeOverlazy({ type: 'Drawer' })
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

    const onEditIssue: IEditIssueDrawerActions['editIssue'] = useAction(
      async (values) => {
        try {
          const issue = issueSubscription().data.issue
          if (!issue) throw Error('Issue not found')

          // https://winterinternational.atlassian.net/browse/TTD-2405
          if (
            values.completed &&
            issue.completed === false &&
            issue.priorityVoteRank !== ISSUE_PRIORITY_UNRANKED_NUMBER
          ) {
            await Promise.all([
              props.solveOrArchiveIssueClicked &&
                props.solveOrArchiveIssueClicked({
                  issueId: issue.id,
                  priorityVoteRank:
                    issue.priorityVoteRank || ISSUE_PRIORITY_UNRANKED_NUMBER,
                }),
              editIssue({
                id: issue.id,
                title: values.title,
                completed: values.completed,
                assigneeId: values.ownerId,
                meetingId: values.meetingId,
                addToDepartmentPlan: values.addToDepartmentPlan,
                context: issue.context ?? null,
              }),
            ])
          } else {
            await editIssue({
              id: issue.id,
              title: values.title,
              completed: values.completed,
              assigneeId: values.ownerId,
              meetingId: values.meetingId,
              addToDepartmentPlan: values.addToDepartmentPlan,
              context: issue.context ?? null,
            })
          }
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Failed to edit this {{issue}}', {
              issue: terms.issue.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    )

    const onArchiveIssue: IEditIssueDrawerActions['archiveIssue'] = useAction(
      async () => {
        const issue = issueSubscription().data.issue

        // https://winterinternational.atlassian.net/browse/TTD-2405
        try {
          if (!issue) throw Error('Issue not found')

          if (issue.priorityVoteRank !== ISSUE_PRIORITY_UNRANKED_NUMBER) {
            await Promise.all([
              props.solveOrArchiveIssueClicked &&
                props.solveOrArchiveIssueClicked({
                  issueId: issue.id,
                  priorityVoteRank:
                    issue.priorityVoteRank || ISSUE_PRIORITY_UNRANKED_NUMBER,
                }),
              editIssue({
                id: issue.id,
                archived: true,
                archivedTimestamp: getSecondsSinceEpochUTC(),
              }),
            ])
          } else {
            await editIssue({
              id: issue.id,
              archived: true,
              archivedTimestamp: getSecondsSinceEpochUTC(),
            })
          }
          openOverlazy('Toast', {
            type: 'success',
            text: t(`{{issue}} archived`, {
              issue: terms.issue.singular,
            }),
            undoClicked: () =>
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              ),
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Failed to archive this {{issue}}', {
              issue: terms.issue.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      }
    )

    const onCreateNotes: IEditIssueDrawerActions['createNotes'] = useAction(
      async (opts) => {
        try {
          const response = await createNote(opts)
          const issue = issueSubscription().data.issue
          if (!issue) throw Error('Issue not found')

          await editIssue({
            id: issue.id,
            notesId: response,
          })
          return response
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue creating notes for this {{issue}}`, {
              issue: terms.issue.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    )

    const onHandleChangeDrawerViewSetting: IEditHeadlineDrawerActionHandlers['onHandleChangeDrawerViewSetting'] =
      useAction(async (drawerView) => {
        await editAuthenticatedUserSettings({ drawerView })
      })

    const onHandleCloseDrawerWithUnsavedChangesProtection: IEditHeadlineDrawerActionHandlers['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useAction(({ onHandleLeaveWithoutSaving }) => {
        openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
      })

    const onGetNoteById = useAction(async () => {
      const issue = issueSubscription().data.issue
      if (
        issue?.notesId &&
        !getCurrentUserPermissions().canEditIssuesInMeeting.allowed
      ) {
        try {
          const response = await getNoteById({
            noteId: issue?.notesId,
          })
          setIssueNotesText(response.text)
        } catch (e) {
          logError(e, {
            context: `Error fetching note data for issue ${issue.id} with notesId ${issue.notesId}`,
          })
        }
      }
    })

    useEffect(() => {
      if (!issueSubscription().querying) {
        onGetNoteById()
      }
    }, [issueSubscription().querying, onGetNoteById])

    const getIssue = useComputed(
      () => {
        const issue = issueSubscription().data.issue

        return {
          id: issue?.id ?? '',
          title: issue?.title ?? '',
          ownerId: issue?.assignee.id ?? '',
          ownerFullName: issue?.assignee.fullName ?? '',
          meetingId: issue?.meeting.id ?? '',
          addToDepartmentPlan: issue?.addToDepartmentPlan ?? false,
          completed: issue?.completed ?? false,
          dateCreated: issue?.dateCreated ?? 0,
          fromMergedIssues: !!issue?.fromMergedIds,
          notesId: issue?.notesId ?? '',
          context: issue?.context ?? null,
        }
      },
      {
        name: 'EditIssueDrawerContainer-getIssue',
      }
    )

    const getData = useComputed(
      () => ({
        getCurrentUserPermissions,
        viewOnlyDrawerMode: props.viewOnlyDrawerMode,
        meetingId: props.meetingId,
        getIssue,
        currentUser: sharedSubscription().data.currentUser,
        isLoading: issueSubscription().querying,
        getMeetingAttendeesAndOrgUsersLookup:
          getComputedMeetingAttendeesAndOrgUsersLookup,
        meetingLookup: getUsersMeetingsLookup({
          meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
          includePersonalMeeting: false,
        }),
        issueNotesText,
        drawerIsRenderedInMeeting: drawerController.drawerIsRenderedInMeeting,
        drawerView: drawerController.drawerView,
        issueIdFromProps: props.issueId,
      }),
      {
        name: 'EditIssueDrawerContainer-getData',
      }
    )

    const getActions = useComputed(
      () => ({
        editIssue: onEditIssue,
        archiveIssue: onArchiveIssue,
        createNotes: onCreateNotes,
        onHandleChangeDrawerViewSetting,
        onHandleCloseDrawerWithUnsavedChangesProtection,
        onMoveIssueToShortTerm,
      }),
      {
        name: 'EditIssueDrawerContainer-getActions',
      }
    )

    const EditIssueDrawerView = props.children
    return <EditIssueDrawerView getData={getData} getActions={getActions} />
  }
)
