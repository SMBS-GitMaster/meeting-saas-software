import { observer } from 'mobx-react'
import React, { useCallback, useMemo, useState } from 'react'

import { chance, queryDefinition, useSubscription } from '@mm/gql'

import { UnreachableCaseError } from '@mm/gql/exceptions'

import { useDIResolver } from '@mm/core/di/resolver'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { FormValuesForSubmit } from '@mm/core/forms'

import {
  CLASSIC_CHECK_IN_TITLE,
  ICEBREAKER_QUESTIONS,
  getTipsOfTheWeek,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomLookupNodeQueryDefinition,
  useBloomMeetingNode,
  useBloomMeetingPageNode,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBloomMeetingMutations } from '@mm/core-bloom/meetings'

import { useTranslation } from '@mm/core-web/i18n'
import { useMeetingIdUrlParamGuard } from '@mm/core-web/router'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { getCheckInSectionPermissions } from './checkInSectionPermissions'
import {
  ICheckInSectionActionHandlers,
  ICheckInSectionContainerProps,
  ICheckInSectionFormValues,
} from './checkInSectionTypes'

export const CheckInSectionContainer = observer(
  function CheckInSectionContainer(props: ICheckInSectionContainerProps) {
    const { editMeetingPage, editMeetingAttendeeIsPresent } =
      useBloomMeetingMutations()
    const { openOverlazy } = useOverlazyController()
    const diResolver = useDIResolver()
    const { t } = useTranslation()
    const { meetingId } = useMeetingIdUrlParamGuard({ meetingIdViaProps: null })
    const terms = useBloomCustomTerms()
    const tipsOfTheWeek = getTipsOfTheWeek(terms)
    const [tipOfTheWeek] = useState(chance.pickone(tipsOfTheWeek))

    const subscription = useSubscription(
      {
        bloomLookup: useBloomLookupNodeQueryDefinition({
          map: ({ tipOfTheWeek, classicCheckinTitle, iceBreakers }) => ({
            tipOfTheWeek,
            classicCheckinTitle,
            iceBreakers,
          }),
        }),
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ settings }) => ({
            settings: settings({ map: ({ timezone }) => ({ timezone }) }),
          }),
        }),
        checkInPage: queryDefinition({
          def: useBloomMeetingPageNode(),
          map: ({ checkIn }) => ({ checkIn }),
          target: {
            id: props.meetingPageId,
          },
        }),
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({
            name,
            attendees,
            currentMeetingInstance,
            currentMeetingAttendee,
          }) => ({
            name,
            attendees: attendees({
              map: ({
                id,
                firstName,
                lastName,
                fullName,
                avatar,
                isPresent,
                permissions,
                userAvatarColor,
              }) => ({
                id,
                firstName,
                lastName,
                fullName,
                avatar,
                isPresent,
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
                userAvatarColor,
              }),
            }),
            currentMeetingInstance: currentMeetingInstance({
              map: ({ isPaused, leaderId }) => ({
                isPaused,
                leaderId,
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
          target: {
            id: meetingId,
          },
        }),
        users: queryDefinition({
          def: useBloomUserNode(),
          map: ({ avatar, firstName, lastName, fullName }) => ({
            avatar,
            firstName,
            lastName,
            fullName,
          }),
        }),
      },
      {
        subscriptionId: `CheckInSectionContainer-${props.meetingPageId}`,
      }
    )

    const isCurrentUserMeetingLeader =
      subscription().data.meeting?.currentMeetingInstance?.leaderId ===
      subscription().data.currentUser.id

    const currentUserPermissions = useMemo(() => {
      return getCheckInSectionPermissions({
        currentUserPermissions:
          subscription().data.meeting?.currentMeetingAttendee.permissions ??
          null,
        isCurrentUserMeetingLeader,
      })
    }, [
      subscription().data.meeting?.currentMeetingAttendee.permissions,
      isCurrentUserMeetingLeader,
    ])

    const onUpdateMeetingAttendeesIsPresent = useCallback(
      async (opts: {
        attendees: FormValuesForSubmit<
          ICheckInSectionFormValues,
          true,
          'attendees'
        >['attendees']
      }) => {
        const { attendees } = opts

        try {
          await Promise.all(
            attendees.map(async (attendee) => {
              switch (attendee.action) {
                case 'ADD': {
                  return throwLocallyLogInProd(
                    diResolver,
                    new Error(
                      `ADD actions are not implemented in onUpdateMeetingAttendeesIsPresent due to the UI not allowing it.`
                    )
                  )
                }
                case 'UPDATE': {
                  return await editMeetingAttendeeIsPresent({
                    meetingAttendee: attendee.item.id,
                    meetingId: meetingId,
                    isPresent: !!attendee.item.isPresent,
                  })
                }
                case 'REMOVE': {
                  return throwLocallyLogInProd(
                    diResolver,
                    new Error(
                      `REMOVE actions are not implemented in onUpdateMeetingAttendeesIsPresent due to the UI not allowing it.`
                    )
                  )
                }
                default: {
                  throwLocallyLogInProd(
                    diResolver,
                    new UnreachableCaseError({
                      eventType: attendee,
                      errorMessage: `The action ${attendee} does not exist in onUpdateMeetingAttendeesIsPresent`,
                    } as never)
                  )
                }
              }
            })
          )
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing attendees`),
            error: new UserActionError(error),
          })
        }
      },
      [t, diResolver, openOverlazy, editMeetingAttendeeIsPresent, meetingId]
    )

    const onUpdateCheckIn: ICheckInSectionActionHandlers['onUpdateCheckIn'] =
      useCallback(
        async ({ meetingPageId, values }) => {
          try {
            if (values.attendees) {
              await onUpdateMeetingAttendeesIsPresent({
                attendees: values.attendees,
              })
            }

            // If the user is not an admin, they can only edit the attendees above.
            // Want to return out of this to prevent errors.
            if (!currentUserPermissions.canEditCheckInInMeeting.allowed) {
              return
            }

            await editMeetingPage({
              meetingPageId: meetingPageId,
              checkIn: {
                checkInType: values.checkInType,
                isAttendanceVisible: values.isAttendanceVisible,
              },
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error editing meeting`),
              error: new UserActionError(error),
            })
          }
        },
        [
          openOverlazy,
          t,
          editMeetingPage,
          onUpdateMeetingAttendeesIsPresent,
          currentUserPermissions.canEditCheckInInMeeting.allowed,
        ]
      )

    const onUpdateIceBreakerQuestion: ICheckInSectionActionHandlers['onUpdateIceBreakerQuestion'] =
      useCallback(
        async ({ meetingPageId, iceBreakerQuestion }) => {
          try {
            await editMeetingPage({
              meetingPageId: meetingPageId,
              checkIn: {
                iceBreaker: iceBreakerQuestion,
              },
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error editing meeting`),
              error: new UserActionError(error),
            })
          }
        },
        [openOverlazy, t, editMeetingPage]
      )

    return (
      <props.children
        data={{
          meetingPageId: props.meetingPageId,
          meetingPageName: props.meetingPageName,
          isLoading: subscription().querying,
          currentUser: { permissions: currentUserPermissions },
          attendees: subscription().data.meeting.attendees.nodes,
          checkIn: {
            checkInType: subscription().data.checkInPage.checkIn.checkInType,
            currentIceBreakerQuestion:
              subscription().data.checkInPage.checkIn.iceBreaker,
            iceBreakers: ICEBREAKER_QUESTIONS,
            classicCheckinTitle: CLASSIC_CHECK_IN_TITLE,
            isAttendanceVisible:
              subscription().data.checkInPage.checkIn.isAttendanceVisible,
            tipOfTheWeek,
          },
        }}
        actionHandlers={{
          onUpdateCheckIn,
          onUpdateIceBreakerQuestion,
        }}
      />
    )
  }
)
