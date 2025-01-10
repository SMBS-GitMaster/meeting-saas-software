import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { guessTimezone, useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { FormValuesForSubmit } from '@mm/core/forms'
import { useMMErrorLogger } from '@mm/core/logging'
import { keys } from '@mm/core/typeHelpers'

import {
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { GOAL_STATUS_LOOKUP, GoalStatus } from '@mm/core-bloom/goals'
import { useBloomGoalNode } from '@mm/core-bloom/goals/goalNode'
import { useBloomGoalMutations } from '@mm/core-bloom/goals/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { ColoredSelectInputIntent, useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction, useComputed } from '@mm/bloom-web/pages/performance/mobx'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getEditGoalDrawerPermissions } from './editGoalDrawerPermissions'
import {
  IEditGoalDrawerActionHandlers,
  IEditGoalDrawerContainerProps,
  IEditGoalFormValues,
} from './editGoalDrawerTypes'

const goalStatusToIntent: Record<GoalStatus, ColoredSelectInputIntent> = {
  OFF_TRACK: 'warning',
  ON_TRACK: 'primary',
  COMPLETED: 'success',
}

export default observer(function EditDrawerContainer(
  props: IEditGoalDrawerContainerProps
) {
  const [goalNotesText, setGoalNotesText] = useState<Maybe<string>>(null)

  const diResolver = useDIResolver()
  const meetingNode = useBloomMeetingNode()
  const terms = useBloomCustomTerms()
  const { createNote } = useBloomNoteMutations()
  const { editAuthenticatedUserSettings } = useBloomUserMutations()
  const { editGoal, editMilestone, createMilestone, deleteMilestone } =
    useBloomGoalMutations()
  const drawerController = useDrawerController()
  const { getNoteById } = useBloomNoteQueries()
  const { logError } = useMMErrorLogger()
  const { openOverlazy } = useOverlazyController()

  const { getSecondsSinceEpochUTC } = useTimeController()
  const { t } = useTranslation()

  const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

  // the shared panel subscription is used to get the current user and the meetings
  // and ensures that as the user edits differet goals, this data is not refetched
  const sharedSubscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ avatar, firstName, lastName, fullName, settings }) => ({
          avatar,
          firstName,
          lastName,
          fullName,
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
        map: ({ avatar, firstName, lastName, fullName, userAvatarColor }) => ({
          avatar,
          firstName,
          lastName,
          fullName,
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
    { subscriptionId: `EditGoalDrawerContainer-sharedSubscription` }
  )

  const goalSubscription = useSubscription(
    {
      goal: queryDefinition({
        def: useBloomGoalNode(),
        map: ({
          title,
          dueDate,
          status,
          notesId,
          dateLastModified,
          dateCreated,
          assignee,
          milestones,
          departmentPlanRecords,
          meetings,
        }) => ({
          title,
          dueDate,
          status,
          notesId,
          dateLastModified,
          departmentPlanRecords: departmentPlanRecords({
            map: ({ meetingId, isInDepartmentPlan }) => ({
              meetingId,
              isInDepartmentPlan,
            }),
          }),
          dateCreated,
          milestones: milestones({
            filter: {
              and: [
                {
                  dateDeleted: { eq: null },
                },
              ],
            },
            sort: { dueDate: 'asc' },
            map: ({ completed, dueDate, title, dateDeleted }) => ({
              completed,
              dueDate,
              title,
              dateDeleted,
            }),
          }),
          assignee: assignee({
            map: ({ avatar, firstName, lastName, fullName }) => ({
              avatar,
              firstName,
              lastName,
              fullName,
            }),
          }),
          meetings: meetings({ map: ({ name }) => ({ name }) }),
        }),
        target: { id: props.goalId },
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
    },
    {
      subscriptionId: `EditGoalDrawerContainer-goalSubscription-${props.goalId}`,
    }
  )

  const getCurrentUserPermissions = useComputed(
    () => {
      const goal = goalSubscription().data.goal
      const isPersonalGoal = props.meetingId === null

      return getEditGoalDrawerPermissions({
        currentUserPermissions:
          sharedSubscription().data.meeting?.currentMeetingAttendee
            .permissions ?? null,
        isCurrentUserOwner:
          sharedSubscription().data.currentUser?.id === goal?.assignee.id ??
          false,
        isPersonalGoal,
      })
    },
    {
      name: `EditGoalDrawerContainer-getCurrentUserPermissions`,
    }
  )

  const getCurrentMeetingsLookup = useComputed(
    () =>
      getUsersMeetingsLookup({
        meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
        includePersonalMeeting: true,
      }),
    {
      name: `EditGoalDrawerContainer-getCurrentMeetingsLookup`,
    }
  )

  const getComputedMeetingAttendeesAndOrgUsersLookup = useComputed(
    () => {
      const meeting = sharedSubscription().data.meeting
      return getMeetingAttendeesAndOrgUsersLookup({
        orgUsers: sharedSubscription().data?.users || null,
        meetings: meeting ? [meeting] : null,
      })
    },
    {
      name: `EditGoalDrawerContainer-meetingAttendeesAndOrgUsersLookup`,
    }
  )

  const getGoalStatusLookup = useComputed(
    () => {
      return GOAL_STATUS_LOOKUP.map((status) => {
        return { ...status, intent: goalStatusToIntent[status.value] }
      })
    },
    {
      name: `EditGoalDrawerContainer-getGoalStatusLookup`,
    }
  )

  const onHandleUpdateMilestones = useAction(
    async (
      milestones: FormValuesForSubmit<
        IEditGoalFormValues,
        true,
        'editGoalMilestones'
      >['editGoalMilestones']
    ) => {
      try {
        const goal = goalSubscription().data.goal
        if (!goal) throw Error('Goal not found')

        await Promise.all(
          milestones.map(async (milestone) => {
            switch (milestone.action) {
              case 'ADD': {
                const milestoneValues = {
                  title: milestone.item.milestoneTitle,
                  dueDate: milestone.item.milestoneDueDate,
                  rockId: goal.id,
                  completed: milestone.item.milestoneCompleted,
                }
                return await createMilestone(milestoneValues)
              }
              case 'UPDATE': {
                const milestoneValues = {
                  milestoneId: milestone.item.id ?? undefined,
                  title: milestone.item.milestoneTitle ?? undefined,
                  dueDate: milestone.item.milestoneDueDate ?? undefined,
                  completed: milestone.item.milestoneCompleted ?? undefined,
                }
                return await editMilestone(milestoneValues)
              }
              case 'REMOVE': {
                const milestoneId = milestone.item.id ?? undefined
                return await deleteMilestone({ milestoneId })
              }
              default: {
                throwLocallyLogInProd(
                  diResolver,
                  new UnreachableCaseError({
                    eventType: milestone,
                    errorMessage: `The action ${milestone} does not exist in onSubmit in EditGoalDrawerContainer`,
                  } as never)
                )
              }
            }
          })
        )
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error editing {{milestones}}`, {
            milestones: terms.milestone.lowercasePlural,
          }),
          error: new UserActionError(error),
        })
      }
    }
  )

  const onSubmit: IEditGoalDrawerActionHandlers['onSubmit'] = useAction(
    async (values) => {
      if (Object.keys(values).length > 0) {
        try {
          const milestones =
            values.editGoalMilestones === undefined
              ? undefined
              : values.editGoalMilestones

          if (milestones) {
            await onHandleUpdateMilestones(milestones)
          }

          const meetingsAndPlans = values.addToDepartmentPlans
            ? (values.addToDepartmentPlans || []).map((meetingAndPlanItem) => ({
                meetingId: meetingAndPlanItem.id,
                addToDepartmentPlan: meetingAndPlanItem.addToDepartmentPlan,
              }))
            : undefined

          const goal = goalSubscription().data.goal

          const editGoalValues = {
            goalId: goal?.id,
            assignee: values.editGoalAttachToOwner ?? undefined,
            dueDate: values.editGoalDueDate ?? undefined,
            meetingsAndPlans,
            status: values.editGoalStatus ?? undefined,
            title: values.editGoalTitle ?? undefined,
          }

          if (
            keys(editGoalValues).some(
              (key) => editGoalValues[key] !== undefined && key !== 'goalId'
            )
          ) {
            await editGoal(editGoalValues)
          }
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing {{goal}}`, {
              goal: terms.goal.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    }
  )

  const onCreateNotes: IEditGoalDrawerActionHandlers['onCreateNotes'] =
    useAction(async (opts) => {
      try {
        const response = await createNote(opts)
        const goal = goalSubscription().data.goal
        await editGoal({
          goalId: goal?.id,
          notesId: response,
        })
        return response
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was an issue creating notes for this {{goal}}`, {
            goal: terms.goal.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
        throw error
      }
    })

  const onArchiveGoal: IEditGoalDrawerActionHandlers['onArchiveGoal'] =
    useAction(async () => {
      try {
        const goal = goalSubscription().data.goal
        await editGoal({
          goalId: goal?.id,
          archived: true,
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t(`{{goal}} archived`, {
            goal: terms.goal.singular,
          }),
          undoClicked: () => {
            // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410
          },
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error archiving {{goal}}`, {
            goal: terms.goal.lowercaseSingular,
          }),
          error: new UserActionError(error),
        })
        // bubble error to the drawer component so it does not close
        throw error
      }
    })

  const onHandleChangeDrawerViewSetting: IEditGoalDrawerActionHandlers['onHandleChangeDrawerViewSetting'] =
    useAction(async (drawerView) => {
      await editAuthenticatedUserSettings({ drawerView })
    })

  const onHandleCloseDrawerWithUnsavedChangesProtection: IEditGoalDrawerActionHandlers['onHandleCloseDrawerWithUnsavedChangesProtection'] =
    useAction(({ onHandleLeaveWithoutSaving }) => {
      openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
    })

  const onGetNoteById = useAction(async () => {
    const currentUserPermissions = getCurrentUserPermissions()
    const goal = goalSubscription().data.goal
    if (
      goal?.notesId &&
      !currentUserPermissions.canEditGoalsInMeeting.allowed
    ) {
      try {
        const response = await getNoteById({
          noteId: goal?.notesId,
        })
        setGoalNotesText(response.text)
      } catch (e) {
        logError(e, {
          context: `Error fetching note data for goal ${props.goalId} with notesId ${goal.notesId}`,
        })
      }
    }
  })

  useEffect(() => {
    if (!goalSubscription().querying) {
      onGetNoteById()
    }
  }, [goalSubscription().querying, onGetNoteById])

  const getGoal = useComputed(
    () => {
      const goal = goalSubscription().data.goal

      return {
        id: goal?.id || '',
        title: goal?.title || '',
        dateCreated: goal?.dateCreated || getSecondsSinceEpochUTC(),
        dueDate: goal?.dueDate || getSecondsSinceEpochUTC(),
        status: goal?.status || 'ON_TRACK',
        notesId: goal?.notesId || '',
        dateLastModified: goal?.dateLastModified || getSecondsSinceEpochUTC(),
        milestones: goal ? goal.milestones.nodes : [],
        assigneeId: goal ? goal.assignee.id : '',
        assigneeFullName: goal ? goal.assignee.fullName : '',
        meetings: goal ? goal.meetings.nodes : [],
        departmentPlanRecords: goal ? goal.departmentPlanRecords.nodes : [],
        isPersonalGoal: goal
          ? goal.isPersonalGoal({
              meetings: goal.meetings.nodes,
            })
          : false,
      }
    },
    {
      name: `EditGoalDrawerContainer-getGoal`,
    }
  )

  const getData = useComputed(
    () => ({
      meetingId: props.meetingId,
      isLoading: goalSubscription().querying,
      getCurrentUserPermissions,
      getGoal: getGoal,
      getMeetingAttendeesAndOrgUsersLookup:
        getComputedMeetingAttendeesAndOrgUsersLookup,
      getCurrentMeetingsLookup,
      getGoalStatusLookup,
      currentUserTimezone:
        sharedSubscription().data?.currentUser?.settings.timezone ??
        guessTimezone(),
      goalNotesText,
      drawerIsRenderedInMeeting: drawerController.drawerIsRenderedInMeeting,
      drawerView: drawerController.drawerView,
    }),
    {
      name: `EditGoalDrawerContainer-getData`,
    }
  )

  const getActionHandlers = useComputed(
    () => ({
      onSubmit,
      onCreateNotes,
      onArchiveGoal,
      onHandleChangeDrawerViewSetting,
      onHandleCloseDrawerWithUnsavedChangesProtection,
    }),
    {
      name: `EditGoalDrawerContainer-getActionHandlers`,
    }
  )

  const Component = props.children
  return <Component getData={getData} getActionHandlers={getActionHandlers} />
})
