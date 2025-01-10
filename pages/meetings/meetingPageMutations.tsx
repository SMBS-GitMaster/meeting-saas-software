import { Dispatch, SetStateAction } from 'react'

import { type Id } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { FormValuesForSubmit } from '@mm/core/forms'

import {
  PermissionCheckResult,
  useBloomMeetingMutations,
  useBloomNoteMutations,
  useBloomUserMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { ICheckInSectionFormValues } from '@mm/bloom-web/checkIn'
import { IExternalPageSectionActions } from '@mm/bloom-web/externalPage/externalPageSectionTypes'

import { useAction } from '../performance/mobx'
import { OPTIMISTIC_MEETING_INSTANCE_ID } from './meetingPageConsts'
import {
  IMeetingPageViewActionHandlers,
  IMeetingPageViewData,
} from './meetingPageTypes'

export interface IMeetingPageMutationsOpts {
  getMeetingPages: () => Array<{ id: Id }>
  currentMeetingInstanceOptimisticState: {
    get: () => IMeetingPageViewData['meeting']['currentMeetingInstance']
    set: (
      value: IMeetingPageViewData['meeting']['currentMeetingInstance']
    ) => void
  }
  optimisticPageTimeLastStarted: {
    set: (time: number | null) => void
    get: () => number | null
  }
  optimisticPageIdState: {
    set: (id: Id | null) => void
    get: () => Maybe<Id>
  }
  meetingId: Id
  currentUser: {
    id: Id
    firstName: string
    lastName: string
    fullName: string
    settings: {
      timezone: Maybe<string>
    }
    avatar: Maybe<string>
  }
  canEditCheckInInMeeting: PermissionCheckResult
  isMeetingOngoing: boolean
  isCurrentUserLeader: boolean
  isFollowingLeader: boolean
  setCurrentUserPageId: Dispatch<SetStateAction<Maybe<Id>>>
}

export function useMeetingPageMutations(
  getOpts: () => IMeetingPageMutationsOpts
) {
  const diResolver = useDIResolver()
  const { getTime } = useTimeController()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()
  const { createNote } = useBloomNoteMutations()
  const {
    editMeetingLastViewedTimestamp,
    setMeetingPage,
    startMeeting,
    iframeEmbedCheck,
    editMeetingPageOrder,
    removeMeetingPageFromMeeting,
    createMeetingPage,
    editMeetingPage,
    setTangentAlert,
    editMeetingAttendeeIsPresent,
    editMeetingLeader,
  } = useBloomMeetingMutations()
  const { incrementUserNumViewedNewFeatures, editAuthenticatedUserSettings } =
    useBloomUserMutations()

  //////////////////////// MEETING ////////////////////////

  const onUpdateLastViewedTimestamp = useAction(async () => {
    await editMeetingLastViewedTimestamp({
      meetingId: getOpts().meetingId,
      lastViewedTimestamp: getTime(),
    })
  })

  const onMeetingPaused: IMeetingPageViewActionHandlers['onMeetingPaused'] =
    useAction(() => {
      // @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1839
      console.log(
        `@TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1839 'onMeetingPaused' not implemented `
      )
    })

  const onStartMeeting = useAction(async () => {
    const seconds = getTime()
    getOpts().optimisticPageIdState.set(getOpts().getMeetingPages()[0].id)
    getOpts().optimisticPageTimeLastStarted.set(seconds)
    getOpts().currentMeetingInstanceOptimisticState.set({
      id: `${OPTIMISTIC_MEETING_INSTANCE_ID}-${getOpts().meetingId}`,
      leaderId: getOpts().currentUser.id,
      isPaused: false,
      meetingStartTime: seconds,
      currentPageId: getOpts().getMeetingPages()[0].id,
      tangentAlertTimestamp: 0,
    })

    try {
      return await startMeeting({
        meetingId: getOpts().meetingId,
        meetingStartTime: seconds,
      })
    } catch (e) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Failed to start meeting. Please reload and try again`),
        error: new UserActionError(e),
      })
    }
  })

  const onUpdateIceBreakerQuestion: IMeetingPageViewActionHandlers['onUpdateIceBreakerQuestion'] =
    useAction(async ({ meetingPageId, iceBreakerQuestion }) => {
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
    })

  const onTangentClicked: IMeetingPageViewActionHandlers['tangentClicked'] =
    useAction(async () => {
      try {
        await setTangentAlert({
          meetingId: getOpts().meetingId,
          tangentAlertTimestamp: getTime(),
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was an issue triggering the tangent`),
          error: new UserActionError(error),
        })
      }
    })

  const onUpdateMeetingAttendeesIsPresent = useAction(
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
                  meetingId: getOpts().meetingId,
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
    }
  )

  const onUpdateCheckIn: IMeetingPageViewActionHandlers['onUpdateCheckIn'] =
    useAction(
      async ({
        meetingPageId,
        values: { checkInType, isAttendanceVisible, attendees },
      }) => {
        try {
          if (attendees) {
            await onUpdateMeetingAttendeesIsPresent({ attendees })
          }

          const canEditCheckInInMeeting = getOpts().canEditCheckInInMeeting

          // If the user is not an admin, they can only edit the attendees above.
          // Want to return out of this to prevent errors.
          if (!canEditCheckInInMeeting.allowed) {
            return
          }

          await editMeetingPage({
            meetingPageId: meetingPageId,
            checkIn: {
              checkInType: checkInType,
              isAttendanceVisible: isAttendanceVisible,
            },
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing meeting`),
            error: new UserActionError(error),
          })
        }
      }
    )

  const onUpdateExternalLink: IExternalPageSectionActions['onUpdateExternalLink'] =
    useAction(async (values) => {
      try {
        await editMeetingPage({
          meetingPageId: values.id,
          externalPageUrl: values.url || '',
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Issue updating the external page'),
          error: new UserActionError(error),
        })
      }
    })

  const onSetCurrentPage: IMeetingPageViewActionHandlers['onSetCurrentPage'] =
    useAction(async ({ newPageId, currentPageId }) => {
      const {
        isMeetingOngoing,
        isCurrentUserLeader,
        isFollowingLeader,
        setCurrentUserPageId,
      } = getOpts()
      if (newPageId === currentPageId) return

      if (isMeetingOngoing && isCurrentUserLeader) {
        try {
          const seconds = getTime()
          getOpts().optimisticPageTimeLastStarted.set(seconds)
          getOpts().optimisticPageIdState.set(newPageId)
          await setMeetingPage({
            meetingId: getOpts().meetingId,
            newPageId,
            currentPageId,
            meetingPageStartTime: seconds,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Failed to update page`),
            error: new UserActionError(e),
          })
        }
      } else if (!isMeetingOngoing || !isFollowingLeader) {
        setCurrentUserPageId(newPageId)
      }
    })

  const onUpdateMeetingPageOrder: IMeetingPageViewActionHandlers['onUpdateMeetingPageOrder'] =
    useAction(async (opts) => {
      try {
        editMeetingPageOrder({
          meetingPageId: opts.meetingPageId,
          oldIndex: opts.oldIndex,
          newIndex: opts.newIndex,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Could not change the page order'),
          error: new UserActionError(error),
        })
      }
    })

  const onUpdateMeetingLeader: IMeetingPageViewActionHandlers['onUpdateMeetingLeader'] =
    useAction(
      async (opts: {
        newLeaderId: Id
        meetingInstanceId: Id
        currentPageId: Id
      }) => {
        try {
          await editMeetingLeader({
            meetingInstanceId: opts.meetingInstanceId,
            leaderId: opts.newLeaderId,
            currentPageId: opts.currentPageId,
          })
        } catch (e) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Failed to update meeting leader.'),
            error: new UserActionError(e),
          })
        }
      }
    )

  const onUpdateAgendaSections: IMeetingPageViewActionHandlers['onUpdateAgendaSections'] =
    useAction(async ({ agendaSections }) => {
      try {
        if (!agendaSections) {
          return
        }

        await Promise.all(
          agendaSections.map(async (section) => {
            switch (section.action) {
              case 'ADD': {
                return throwLocallyLogInProd(
                  diResolver,
                  new Error(
                    `ADD actions are not implemented in onUpdateAgendaSections due to the UI not allowing it.`
                  )
                )
              }
              case 'UPDATE': {
                if (!section.item.id) return
                await editMeetingPage({
                  meetingPageId: section.item.id,
                  expectedDurationS:
                    section.item.expectedDurationM != ''
                      ? Number(section.item.expectedDurationM) * 60
                      : undefined,
                  pageName: section.item.pageName,
                })
                return
              }
              case 'REMOVE': {
                await removeMeetingPageFromMeeting({
                  meetingPageId: section.item.id,
                  recurrenceId: getOpts().meetingId,
                })

                openOverlazy('Toast', {
                  type: 'success',
                  text: t('Meeting page removed successfully.'),
                  undoClicked: () =>
                    console.log(
                      '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
                    ),
                })
                return
              }
              default: {
                throwLocallyLogInProd(
                  diResolver,
                  new UnreachableCaseError({
                    eventType: section,
                    errorMessage: `The action ${section} does not exist in onSubmit in onUpdateAgendaSections`,
                  } as never)
                )
              }
            }
          })
        )
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`Error updating agenda section`),
          error: new UserActionError(error),
        })
      }
    })

  const onImportAgenda: IMeetingPageViewActionHandlers['onImportAgenda'] =
    useAction(
      // @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1875
      // - use createMeeting and pass in the name, createdTimestamp and meetingPages array
      (values) => {
        console.log(
          '@TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1875 onImportAgenda',
          values
        )
      }
    )

  const onHandlePrintAgenda: IMeetingPageViewActionHandlers['onHandlePrintAgenda'] =
    useAction(() => {
      // @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1728
      console.log(
        '@TODO_BLOOM:https://winterinternational.atlassian.net/browse/TTD-1728 onHandlePrintAgenda'
      )
    })

  const onHandleSaveAgendaAsPdf: IMeetingPageViewActionHandlers['onHandleSaveAgendaAsPdf'] =
    useAction(() => {
      // @TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1728
      console.log(
        '@TODO_BLOOM: https://winterinternational.atlassian.net/browse/TTD-1728 onHandleSaveAgendaAsPdf'
      )
    })

  const onAddAgendaSectionToMeeting: IMeetingPageViewActionHandlers['onAddAgendaSectionToMeeting'] =
    async (opts) => {
      try {
        await createMeetingPage({
          pageType: opts.pageType,
          pageName: opts.pageName,
          recurrenceId: getOpts().meetingId,
          expectedDurationS: 300, // we have no way to set expectedDurationS in the UI, default to 5 minutes so 300 seconds to match v1.
        })
      } catch (e) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to add agenda section'),
          error: new UserActionError(e),
        })
      }
    }

  const onCheckIfUrlIsEmbeddable: IExternalPageSectionActions['onCheckIfUrlIsEmbeddable'] =
    useAction(async (urlToEmbed: string) => {
      try {
        const response = await iframeEmbedCheck({
          url: `${urlToEmbed}`,
        })
        return response.iframeEmbedCheck
      } catch (e) {
        return false
      }
    })

  const onUpdateUserNewFeatureViewCount: IMeetingPageViewActionHandlers['onUpdateUserNewFeatureViewCount'] =
    useAction(async () => {
      const userId = getOpts().currentUser.id
      try {
        await incrementUserNumViewedNewFeatures({
          userId,
        })
      } catch (error) {
        throwLocallyLogInProd(
          diResolver,
          new Error(
            `Error updating the field "numViewedNewFeatures" for user ${userId}`
          )
        )
      }
    })

  const onSetPrimaryWorkspace: IMeetingPageViewActionHandlers['onSetPrimaryWorkspace'] =
    useAction(async (opts) => {
      try {
        await editAuthenticatedUserSettings({
          workspaceHomeType: opts.workspaceType,
          workspaceHomeId: opts.meetingOrWorkspaceId,
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t(`Primary workspace set`),
          undoClicked: () => null,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was an issue setting your primary workspace`),
          error: new UserActionError(error),
        })
      }
    })

  //////////////////////// NOTES ////////////////////////

  const onCreateNotes: IMeetingPageViewActionHandlers['onCreateNotes'] =
    useAction(async (opts) => {
      return createNote(opts)
    })

  const onConcludeMeeting: IMeetingPageViewActionHandlers['onConcludeMeeting'] =
    useAction(async () => {
      getOpts().currentMeetingInstanceOptimisticState.set(null)
      getOpts().optimisticPageIdState.set(null)
      getOpts().optimisticPageTimeLastStarted.set(null)
    })

  return {
    onMeetingPaused,
    onUpdateLastViewedTimestamp,
    onCreateNotes,
    onStartMeeting,
    onUpdateIceBreakerQuestion,
    onTangentClicked,
    onUpdateCheckIn,
    onUpdateExternalLink,
    onSetCurrentPage,
    onUpdateMeetingPageOrder,
    onUpdateAgendaSections,
    onImportAgenda,
    onAddAgendaSectionToMeeting,
    onHandlePrintAgenda,
    onHandleSaveAgendaAsPdf,
    onCheckIfUrlIsEmbeddable,
    onUpdateUserNewFeatureViewCount,
    onConcludeMeeting,
    onUpdateMeetingLeader,
    onSetPrimaryWorkspace,
  }
}
