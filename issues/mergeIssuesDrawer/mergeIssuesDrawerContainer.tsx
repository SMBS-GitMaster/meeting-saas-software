import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { PromiseState, useStatefulPromise } from '@mm/core/ui/hooks'

import {
  EMeetingPageType,
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomIssueNode,
  useBloomIssuesMutations,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getMergeIssueDrawerPermissions } from './mergeIssueDrawerPermissions'
import {
  IMergeIssuesDrawerActions,
  IMergeIssuesDrawerContainerProps,
} from './mergeIssuesDrawerTypes'

export const MergeIssuesDrawerContainer = observer(
  function MergeIssuesDrawerContainer(props: IMergeIssuesDrawerContainerProps) {
    const issues = props.issues
    if (issues.length !== 2) {
      throw new Error(
        `Merge Issue Drawer: only two issues can be merged at once, ${issues.length} issues were passed in.`
      )
    }

    const [recordOfNotesIdToNotesText, setRecordOfNotesIdToNotesText] =
      useState<Record<string, string>>({})
    const [newMergedIssueNoteId, setNewMergedIssueNoteId] = useState('')

    const diResolver = useDIResolver()
    const issuesMutations = useBloomIssuesMutations()
    const meetingNode = useBloomMeetingNode()
    const terms = useBloomCustomTerms()
    const { createNote } = useBloomNoteMutations()
    const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()
    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { getNoteById } = useBloomNoteQueries()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const issueOneId = issues[0]
    const issueTwoId = issues[1]
    const translatedNotesTitleText = t(`Details for {{issue}}`, {
      issue: terms.issue.lowercaseSingular,
    })

    const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

    const subscription = useSubscription(
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
        issueOne: queryDefinition({
          def: useBloomIssueNode(),
          map: ({
            id,
            title,
            addToDepartmentPlan,
            notesId,
            meeting,
            assignee,
          }) => ({
            title,
            id,
            addToDepartmentPlan,
            notesId,
            meeting: meeting({ map: ({ name, id }) => ({ name, id }) }),
            assignee: assignee({
              map: ({ fullName, id }) => ({ fullName, id }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
          target: { id: issueOneId },
        }),
        issueTwo: queryDefinition({
          def: useBloomIssueNode(),
          map: ({
            title,
            id,
            addToDepartmentPlan,
            notesId,
            meeting,
            assignee,
          }) => ({
            title,
            id,
            addToDepartmentPlan,
            notesId,
            meeting: meeting({ map: ({ name }) => ({ name }) }),
            assignee: assignee({ map: ({ fullName }) => ({ fullName }) }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
          target: { id: issueTwoId },
        }),
        meetings: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ archived, name, meetingPages }) => ({
            archived,
            name,
            meetingPages: meetingPages({
              map: ({ pageType }) => ({ pageType }),
            }),
          }),
          filter: {
            and: [
              {
                archived: false,
                _relational: {
                  meetingPages: {
                    pageType: EMeetingPageType.Issues,
                  },
                },
              },
            ],
          },
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
              map: ({ currentMeetingAttendee, name, attendees }) => ({
                currentMeetingAttendee: currentMeetingAttendee({
                  map: ({ permissions }) => ({
                    permissions: permissions({
                      map: ({ view, edit, admin }) => ({ view, edit, admin }),
                    }),
                  }),
                }),
                name,
                attendees: attendees({
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
              }),
              useSubOpts: {
                doNotSuspend: true,
              },
              target: { id: props.meetingId },
            })
          : null,
      },
      { subscriptionId: 'MergeIssuesDrawer' }
    )

    const currentUserPermissions = useMemo(() => {
      return getMergeIssueDrawerPermissions(
        subscription().data.meeting?.currentMeetingAttendee.permissions ?? null
      )
    }, [subscription().data.meeting?.currentMeetingAttendee.permissions])

    const meeting = subscription().data.meeting
    const meetingAttendeesAndOrgUsersLookup = useMemo(() => {
      return getMeetingAttendeesAndOrgUsersLookup({
        orgUsers: subscription().data?.users || null,
        meetings: meeting ? [meeting] : null,
      })
    }, [subscription().data?.users, meeting])

    const {
      call: callGetNotesText,
      pending: pendingGetNotesText,
      state: callGetNotesState,
    } = useStatefulPromise(async (notesIds: Array<Id>) => {
      try {
        await Promise.all(
          notesIds.map(async (noteId) => {
            const note = await getNoteById({ noteId })
            return setRecordOfNotesIdToNotesText((current) => {
              return { ...current, [noteId]: note.text }
            })
          })
        )
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to fetch the notes for these {{issues}}', {
            issues: terms.issue.lowercasePlural,
          }),
          error,
        })
      }
    })

    const { call: onCreateNewMergedNotes, state: onCreateNewMergedNotesState } =
      useStatefulPromise(async () => {
        const issue1 = subscription().data.issueOne
        const issue2 = subscription().data.issueTwo

        let issue1NoteText = issue1
          ? `${translatedNotesTitleText}: ${issue1?.title}`
          : ''
        let issue2NoteText = issue2
          ? `${translatedNotesTitleText}: ${issue2.title}`
          : ''

        if (issue1 && recordOfNotesIdToNotesText[issue1.notesId]) {
          issue1NoteText = `${issue1NoteText}\n${
            recordOfNotesIdToNotesText[issue1.notesId]
          }\n\n`
        }

        if (issue2 && recordOfNotesIdToNotesText[issue2.notesId]) {
          issue2NoteText = `${issue2NoteText}\n${
            recordOfNotesIdToNotesText[issue2.notesId]
          }`
        }

        const mergedNotesText = `${issue1NoteText}${issue2NoteText}`

        try {
          const mergedNoteId = await createNote({
            notes: mergedNotesText,
          })
          setNewMergedIssueNoteId(mergedNoteId)
        } catch (e) {
          throwLocallyLogInProd(
            diResolver,
            new Error(
              `Failed to create a new merged note for issues: ${
                subscription().data.issueOne?.id
              } and ${subscription().data.issueTwo?.id}`
            )
          )
        }
      })

    const onCreateIssue: IMergeIssuesDrawerActions['createIssue'] = async (
      values
    ) => {
      try {
        await issuesMutations.createIssue({
          title: values.title,
          ownerId: values.ownerId,
          recurrenceId: values.meetingId,
          addToDepartmentPlan: values.addToDepartmentPlan,
          notesId: newMergedIssueNoteId ? newMergedIssueNoteId : values.notesId,
          context: null,
          fromMergedIds: [issueOneId, issueTwoId],
        })

        const issue1 = subscription().data.issueOne
        if (issue1) {
          await issuesMutations.editIssue({
            id: issue1.id,
            archived: true,
            archivedTimestamp: getSecondsSinceEpochUTC(),
          })
        }

        const issue2 = subscription().data.issueTwo
        if (issue2) {
          await issuesMutations.editIssue({
            id: issue2.id,
            archived: true,
            archivedTimestamp: getSecondsSinceEpochUTC(),
          })
        }

        if (!values.createAnotherCheckedInDrawer) {
          openOverlazy('Toast', {
            type: 'success',
            text: t(`Merged {{issue}} created`, {
              issue: terms.issue.lowercaseSingular,
            }),
            undoClicked: () =>
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              ),
          })
        }

        if (values.createAnotherCheckedInDrawer) {
          openOverlazy('CreateIssueDrawer', {
            meetingId: props.meetingId,
          })
        }
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to merge {{issues}} or archive old {{issues}}', {
            issues: terms.issue.lowercasePlural,
          }),
          error: new UserActionError(error),
        })
      }
    }

    const onCreateNotes: IMergeIssuesDrawerActions['createNotes'] = useCallback(
      async (opts) => {
        return createNote(opts)
      },
      [createNote]
    )

    const onHandleChangeDrawerViewSetting: IMergeIssuesDrawerActions['onHandleChangeDrawerViewSetting'] =
      useCallback(
        async (drawerView) => {
          await editAuthenticatedUserSettings({ drawerView })
        },
        [editAuthenticatedUserSettings]
      )

    const onHandleCloseDrawerWithUnsavedChangesProtection: IMergeIssuesDrawerActions['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useCallback(
        ({ onHandleLeaveWithoutSaving }) => {
          openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
        },
        [openOverlazy]
      )

    const issue1 = subscription().data.issueOne
    const issue2 = subscription().data.issueTwo
    const parentIssuesData = useMemo(() => {
      return issue1 && issue2 && !pendingGetNotesText
        ? [
            {
              details: recordOfNotesIdToNotesText[issue1.notesId] || null,
              ...issue1,
            },
            {
              details: recordOfNotesIdToNotesText[issue2.notesId] || null,
              ...issue2,
            },
          ]
        : []
    }, [issue1, issue2, pendingGetNotesText, recordOfNotesIdToNotesText])

    useEffect(() => {
      if (
        issue1?.notesId &&
        issue2?.notesId &&
        callGetNotesState === PromiseState.NotCalled
      ) {
        callGetNotesText([issue1?.notesId, issue2?.notesId])
      }
    }, [issue1, issue2, callGetNotesState, callGetNotesText])

    useEffect(() => {
      if (
        callGetNotesState === PromiseState.Successful &&
        onCreateNewMergedNotesState === PromiseState.NotCalled
      ) {
        onCreateNewMergedNotes()
      }
    }, [callGetNotesState, onCreateNewMergedNotesState, onCreateNewMergedNotes])

    const MergeIssuesDrawerView = props.children
    return (
      <MergeIssuesDrawerView
        data={{
          isLoading: subscription().querying,
          meetingId: props.meetingId,
          issues: issue1 && issue2 ? [issue1, issue2] : [],
          newMergedIssueNoteId,
          parentIssuesData,
          currentUser: subscription().data.currentUser,
          currentUserPermissions,
          meetingAttendeesAndOrgUsersLookup,
          meetingLookup: getUsersMeetingsLookup({
            meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
            includePersonalMeeting: false,
          }),
          drawerIsRenderedInMeeting,
          drawerView,
        }}
        actions={{
          createIssue: onCreateIssue,
          createNotes: onCreateNotes,
          onHandleChangeDrawerViewSetting,
          onHandleCloseDrawerWithUnsavedChangesProtection,
        }}
      />
    )
  }
)
