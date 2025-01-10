import { observer } from 'mobx-react'
import React from 'react'

import {
  queryDefinition,
  useAction,
  useComputed,
  useSubscription,
} from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  MeetingAttendeePermissions,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomMeetingMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { useNavigation } from '@mm/core-web/router'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { paths } from '@mm/bloom-web/router/paths'

import {
  ICreateMeetingActionHandlers,
  ICreateMeetingContainerProps,
} from './createMeetingTypes'

export const CreateMeetingContainer = observer(function CreateMeetingContainer(
  props: ICreateMeetingContainerProps
) {
  const { t } = useTranslation()
  const { openOverlazy } = useOverlazyController()
  const { createMeeting } = useBloomMeetingMutations()
  const { navigate } = useNavigation()

  const subscription = useSubscription(
    {
      users: queryDefinition({
        def: useBloomUserNode(),
        map: ({ avatar, userAvatarColor, firstName, lastName, fullName }) => ({
          avatar,
          userAvatarColor,
          firstName,
          lastName,
          fullName,
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          isOrgAdmin,
        }) => ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          isOrgAdmin,
        }),
      }),
    },
    { subscriptionId: `CreateMeetingContainer` }
  )

  const userOpts = useComputed(
    () => {
      return (
        (subscription().data.users &&
          subscription()
            ?.data?.users?.nodes.filter(
              (user) => user.id !== subscription()?.data?.currentUser.id
            )
            .map((user) => ({
              value: user.id,
              metadata: user,
            }))) ||
        []
      )
    },
    { name: `CreateMeetingContainer-userOpts` }
  )

  const currentUser = useComputed(
    () => {
      return {
        value: subscription()?.data?.currentUser.id,
        metadata: {
          firstName: subscription()?.data?.currentUser.firstName,
          lastName: subscription()?.data?.currentUser.lastName,
          fullName: subscription()?.data?.currentUser.fullName,
          avatar: subscription()?.data?.currentUser.avatar,
          userAvatarColor: subscription()?.data?.currentUser.userAvatarColor,
          isOrgAdmin: subscription()?.data?.currentUser.isOrgAdmin,
        },
      }
    },
    { name: `CreateMeetingContainer-currentUser` }
  )

  const onCreateMeeting: ICreateMeetingActionHandlers['onCreateMeeting'] =
    useAction(async (values) => {
      const mapPermissions = (
        permission: string
      ): MeetingAttendeePermissions => {
        switch (permission) {
          case 'ADMIN':
            return { view: true, edit: true, admin: true }
          case 'EDIT':
            return { view: true, edit: true, admin: false }
          case 'VIEW':
            return { view: true, edit: false, admin: false }
          default:
            throw new Error(`Unknown permission: ${permission}`)
        }
      }
      const memberIdByPermissionsFromMembers = values.meetingMembers.map(
        (member) => ({
          id: member.id,
          permissions: mapPermissions(member.permissions),
        })
      )
      const attendeeIdByPermissionsFromAttendees = values.meetingAttendees.map(
        (attendee) => ({
          id: attendee.id,
          permissions: mapPermissions(attendee.permissions),
        })
      )

      try {
        const meetingResult = await createMeeting({
          name: values.meetingName,
          agendaType: values.agendaType,
          meetingType: values.meetingType,
          attendeeIdByPermissions: attendeeIdByPermissionsFromAttendees,
          memberIdByPermissions: memberIdByPermissionsFromMembers,
        })
        const { id } = meetingResult[0].data.CreateMeeting
        return navigate(paths.meeting({ meetingId: id }))
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Error creating meeting'),
          error: new UserActionError(error),
        })
      }
    })

  const getActionHandlers = useComputed(
    () => ({
      onCreateMeeting,
    }),
    { name: `CreateMeetingContainer-getActionHandlers` }
  )
  const CreateMeetingView = props.children
  return (
    <CreateMeetingView
      data={{
        userOpts,
        currentUser,
      }}
      getActionHandlers={getActionHandlers}
    />
  )
})
