import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { guessTimezone } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  getMeetingAttendeesAndOrgUsersLookup,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { GOAL_STATUS_LOOKUP, GoalStatus } from '@mm/core-bloom/goals'
import { useBloomGoalMutations } from '@mm/core-bloom/goals/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { ColoredSelectInputIntent, useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getCreateGoalDrawerPermissions } from './createGoalDrawerPermissions'
import {
  ICreateGoalDrawerActionHandlers,
  ICreateGoalDrawerContainerProps,
} from './createGoalDrawerTypes'

export default observer(function CreateDrawerContainer(
  props: ICreateGoalDrawerContainerProps
) {
  const { createNote } = useBloomNoteMutations()
  const { createGoal } = useBloomGoalMutations()
  const { editAuthenticatedUserSettings } = useBloomUserMutations()
  const { closeOverlazy, openOverlazy } = useOverlazyController()

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const meetingNode = useBloomMeetingNode()
  const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()

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
    { subscriptionId: 'CreateGoalDrawer' }
  )
  const currentUserPermissions = useMemo(() => {
    return getCreateGoalDrawerPermissions({
      currentUserPermissions:
        subscription().data.meeting?.currentMeetingAttendee.permissions ?? null,
      isPersonalGoal: props.meetingId === null,
      noMeetingIsSpecified: props.meetingId === undefined,
    })
  }, [subscription().data.meeting?.currentMeetingAttendee.permissions])

  const user = meetingsLookupSubscription().data.user
  const currentMeetingsLookup = getUsersMeetingsLookup({
    meetings: user ? user.meetings.nodes : [],
    includePersonalMeeting: true,
  })

  const meeting = subscription().data.meeting
  const meetingAttendeesAndOrgUsersLookup = useMemo(() => {
    return getMeetingAttendeesAndOrgUsersLookup({
      orgUsers: subscription().data?.users || null,
      meetings: meeting ? [meeting] : null,
    })
  }, [subscription().data?.users, meeting])

  const goalStatusToIntent: Record<GoalStatus, ColoredSelectInputIntent> = {
    OFF_TRACK: 'warning',
    ON_TRACK: 'primary',
    COMPLETED: 'success',
  }

  const goalStatusLookup = GOAL_STATUS_LOOKUP.map((status) => {
    return { ...status, intent: goalStatusToIntent[status.value] }
  })

  const onSubmit: ICreateGoalDrawerActionHandlers['onSubmit'] = async (
    values
  ) => {
    try {
      const milestones = values.createGoalMilestones.map((m) => ({
        title: m.milestoneTitle,
        dueDate: m.milestoneDueDate,
        completed: m.milestoneCompleted,
      }))

      const meetingsAndPlans = (values.addToDepartmentPlans || []).map(
        (meetingAndPlanItem) => ({
          meetingId: meetingAndPlanItem.id,
          addToDepartmentPlan: meetingAndPlanItem.addToDepartmentPlan,
        })
      )

      await createGoal({
        title: values.createGoalTitle,
        dueDate: values.createGoalDueDate,
        status: values.createGoalStatus,
        assignee: values.createGoalAttachToOwner,
        meetingsAndPlans,
        notesId: values.createGoalNotesId,
        milestones,
      })

      if (!values.createAnotherCheckedInDrawer) {
        openOverlazy('Toast', {
          type: 'success',
          text: t(`{{goal}} created`, {
            goal: terms.goal.singular,
          }),
          undoClicked: () => {
            console.log(
              '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
            )
          },
        })
      }

      closeOverlazy({
        type: 'Drawer',
      })

      if (values.createAnotherCheckedInDrawer) {
        setTimeout(() => {
          openOverlazy('CreateGoalDrawer', {
            meetingId: props.meetingId,
          })
        }, 0)
      }
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error creating {{goal}}`, {
          goal: terms.goal.lowercaseSingular,
        }),
        error: new UserActionError(error),
      })
      throw error
    }
  }

  const onCreateNotes: ICreateGoalDrawerActionHandlers['onCreateNotes'] =
    useCallback(
      async (opts) => {
        try {
          return createNote(opts)
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue creating notes for this {{headline}}`, {
              headline: terms.headline.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      },
      [createNote, openOverlazy, t, terms]
    )

  const onHandleChangeDrawerViewSetting: ICreateGoalDrawerActionHandlers['onHandleChangeDrawerViewSetting'] =
    useCallback(
      async (drawerView) => {
        await editAuthenticatedUserSettings({ drawerView })
      },
      [editAuthenticatedUserSettings]
    )

  const onHandleCloseDrawerWithUnsavedChangesProtection: ICreateGoalDrawerActionHandlers['onHandleCloseDrawerWithUnsavedChangesProtection'] =
    useCallback(
      ({ onHandleLeaveWithoutSaving }) => {
        openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
      },
      [openOverlazy]
    )

  const Component = props.children
  return (
    <Component
      data={{
        isLoading: subscription().querying,
        currentUserPermissions,
        currentMeetingsLookup,
        meetingAttendeesAndOrgUsersLookup,
        goalStatusLookup,
        meetingId: props.meetingId,
        currentUserId: subscription().data.currentUser?.id || null,
        currentUserTimezone:
          subscription().data.currentUser?.settings.timezone ?? guessTimezone(),
        drawerIsRenderedInMeeting,
        drawerView,
        initialItemValues: props.initialItemValues,
      }}
      actionHandlers={{
        onSubmit,
        onCreateNotes,
        onHandleChangeDrawerViewSetting,
        onHandleCloseDrawerWithUnsavedChangesProtection,
      }}
    />
  )
})
