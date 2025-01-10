import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { FormValuesForSubmit } from '@mm/core/forms'
import { useMMErrorLogger } from '@mm/core/logging'

import {
  PERSONAL_MEETING_VALUE,
  START_AND_END_WEEK_NUMBERS_FOR_LUXON_DEFAULT,
  WEEK_START_DEFAULT,
  getMeetingAttendeesAndOrgUsersLookup,
  getMetricNumberWithRemovedCommas,
  getNumericStringValueFromTextValueForMetricYesNoUnits,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomMeetingNode,
  useBloomMetricNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBloomMetricMutations } from '@mm/core-bloom/metrics/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { useAdminMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getMetricsFormulasLookup } from '../formula/metricsFormulasLookup'
import { getEditMetricDrawerPermissions } from './editMetricDrawerPermissions'
import {
  IEditMetricDrawerActionHandlers,
  IEditMetricDrawerContainerProps,
  IEditMetricFormValues,
} from './editMetricDrawerTypes'

export const EditMetricDrawerContainer = observer(
  function EditMetricDrawerContainer(props: IEditMetricDrawerContainerProps) {
    const componentState = useObservable<{
      metricNoteText: Maybe<string>
    }>({
      metricNoteText: null,
    })

    const setMetricNoteText = useAction((text: Maybe<string>) => {
      componentState.metricNoteText = text
    })

    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { createNote } = useBloomNoteMutations()
    const { editMetric, createCustomGoal, editCustomGoal, deleteCustomGoal } =
      useBloomMetricMutations()
    const { getNoteById } = useBloomNoteQueries()
    const { logError } = useMMErrorLogger()
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()

    const meetingNode = useBloomMeetingNode()
    const diResolver = useDIResolver()
    const drawerController = useDrawerController()

    const metricId = props.metricId
    const meetingsLookupSubscription = useAdminMeetingsLookupSubscription()

    const sharedSubscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id, settings, orgSettings }) => ({
            id,
            settings: settings({
              map: ({ timezone }) => ({ timezone }),
            }),
            orgSettings: orgSettings({
              map: ({ weekStart }) => ({ weekStart }),
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
            avatar,
            firstName,
            lastName,
            fullName,
            userAvatarColor,
          }) => ({
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
              map: ({
                name,
                startOfWeekOverride,
                attendeesLookup,
                currentMeetingAttendee,
                preventEditingUnownedMetrics,
              }) => ({
                name,
                startOfWeekOverride,
                preventEditingUnownedMetrics,
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
              target: { id: props.meetingId },
              useSubOpts: {
                doNotSuspend: true,
              },
            })
          : null,
      },
      { subscriptionId: `EditMetricDrawerContainer-sharedSubscription` }
    )

    const metricSubscription = useSubscription(
      {
        metric: queryDefinition({
          def: useBloomMetricNode(),
          map: ({
            title,
            frequency,
            units,
            rule,
            singleGoalValue,
            minGoalValue,
            maxGoalValue,
            notesId,
            formula,
            metricData,
            meetings,
            customGoals,
            assignee,
          }) => ({
            title,
            frequency,
            units,
            rule,
            singleGoalValue,
            minGoalValue,
            maxGoalValue,
            notesId,
            formula,
            metricData,
            meetings: meetings({
              map: ({ id }) => ({ id }),
            }),
            customGoals: customGoals({
              map: ({
                id,
                startDate,
                endDate,
                rule,
                singleGoalValue,
                maxGoalValue,
                minGoalValue,
                dateDeleted,
              }) => ({
                id,
                startDate,
                endDate,
                singleGoalValue,
                maxGoalValue,
                minGoalValue,
                rule,
                dateDeleted,
              }),
              sort: { startDate: 'desc' },
              filter: {
                and: [
                  {
                    dateDeleted: { eq: null },
                  },
                ],
              },
            }),
            assignee: assignee({
              map: ({ id, fullName }) => ({
                id,
                fullName,
              }),
            }),
          }),
          target: { id: metricId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `EditMetricDrawerContainer-metricSubscription-${metricId}`,
      }
    )

    const metricFormulaLookupSubsctiption = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ metricFormulaLookup }) => ({
            metricFormulaLookup: metricFormulaLookup({
              map: ({ title, id, frequency, assignee }) => ({
                title,
                id,
                frequency,
                assignee: assignee({
                  map: ({ firstName, lastName, avatar, userAvatarColor }) => ({
                    firstName,
                    lastName,
                    avatar,
                    userAvatarColor,
                  }),
                }),
              }),
              filter: {
                and: [
                  {
                    frequency:
                      metricSubscription().data.metric?.frequency ?? 'WEEKLY',
                    id: { neq: metricId },
                  },
                ],
              },
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `EditMetricDrawerContainer-metricFormulaLookupSubsctiption`,
      }
    )

    const getCurrentUserPermissions = useComputed(
      () => {
        return getEditMetricDrawerPermissions({
          currentUserPermissions:
            sharedSubscription().data.meeting?.currentMeetingAttendee
              .permissions ?? null,
          isCurrentUserOwner:
            sharedSubscription().data.currentUser?.id ===
            metricSubscription().data.metric?.assignee.id,
          preventEditingUnownedMetrics:
            sharedSubscription().data.meeting?.preventEditingUnownedMetrics ??
            false,
          terms,
          isPersonalMetric: props.meetingId === null,
        })
      },
      {
        name: `EditMetricDrawerContainer-getCurrentUserPermissions`,
      }
    )

    const getComputedMeetingAttendeesAndOrgUsersLookup = useComputed(
      () => {
        const meetings = sharedSubscription().data.meeting
        return getMeetingAttendeesAndOrgUsersLookup({
          orgUsers: sharedSubscription().data.users || null,
          meetings: meetings ? [meetings] : null,
        })
      },
      {
        name: `EditMetricDrawerContainer-getMeetingAttendeesAndOrgUsersLookup`,
      }
    )

    const getComputedMetricsFormulasLookup = useComputed(
      () => {
        return getMetricsFormulasLookup(
          metricFormulaLookupSubsctiption().data.currentUser
            ?.metricFormulaLookup.nodes || []
        )
      },
      {
        name: `EditMetricDrawerContainer-getMetricsFormulasLookup`,
      }
    )

    const getWeekStartAndEndNumbersForLuxon = useComputed(
      () => {
        const meeting = sharedSubscription().data.meeting
        const currentUser = sharedSubscription().data.currentUser

        return meeting
          ? meeting.startAndEndOfWeekNumbersForLuxon({
              weekStart:
                sharedSubscription().data.currentUser?.orgSettings.weekStart ||
                WEEK_START_DEFAULT,
            })
          : currentUser
            ? currentUser.orgSettings.startAndEndOfWeekNumbersForLuxon
            : START_AND_END_WEEK_NUMBERS_FOR_LUXON_DEFAULT
      },
      {
        name: `EditMetricDrawerContainer-getWeekStartAndEndNumbersForLuxon`,
      }
    )

    const onCreateNotes: IEditMetricDrawerActionHandlers['onCreateNotes'] =
      useAction(async (values) => {
        return createNote(values)
      })

    const onArchiveMetric: IEditMetricDrawerActionHandlers['onArchiveMetric'] =
      useAction(async () => {
        try {
          const metricId = metricSubscription().data.metric?.id
          if (!metricId) {
            throw new Error(
              `Metric id is not defined in onArchiveMetric in EditMetricDrawerContainer`
            )
          }

          await editMetric({ metricId, archived: true })
          openOverlazy('Toast', {
            type: 'success',
            text: t(`{{metric}} archived`, {
              metric: terms.metric.singular,
            }),
            undoClicked: () =>
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              ),
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error archiving {{metric}}`, {
              metric: terms.metric.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
          throw error
        }
      })

    const onHandleUpdateCustomGoals = useAction(
      async (
        customGoals: FormValuesForSubmit<
          IEditMetricFormValues,
          true,
          'customGoals'
        >['customGoals']
      ) => {
        try {
          const metricId = metricSubscription().data.metric?.id
          if (!metricId) {
            throw new Error(
              `Metric id is not defined in onHandleUpdateCustomGoals in EditMetricDrawerContainer`
            )
          }

          await Promise.all(
            customGoals.map(async (customGoal) => {
              const metricUnits = metricSubscription().data.metric?.units
              switch (customGoal.action) {
                case 'ADD': {
                  const singleGoalValue =
                    metricUnits === 'YESNO' && customGoal.item.singleGoalValue
                      ? getNumericStringValueFromTextValueForMetricYesNoUnits({
                          metricUnits,
                          value: customGoal.item.singleGoalValue,
                          diResolver,
                        })
                      : customGoal.item.singleGoalValue
                        ? customGoal.item.singleGoalValue
                        : undefined

                  const customGoalValues = {
                    metricId,
                    startDate: customGoal.item.startDate,
                    endDate: customGoal.item.endDate,
                    rule: customGoal.item.rule,
                    singleGoalValue: singleGoalValue
                      ? getMetricNumberWithRemovedCommas(singleGoalValue)
                      : undefined,
                    minGoalValue: customGoal.item.minGoalValue
                      ? getMetricNumberWithRemovedCommas(
                          customGoal.item.minGoalValue
                        )
                      : undefined,
                    maxGoalValue: customGoal.item.maxGoalValue
                      ? getMetricNumberWithRemovedCommas(
                          customGoal.item.maxGoalValue
                        )
                      : undefined,
                  }
                  return await createCustomGoal(customGoalValues)
                }
                case 'UPDATE': {
                  const singleGoalValue =
                    metricUnits === 'YESNO' && customGoal.item.singleGoalValue
                      ? getNumericStringValueFromTextValueForMetricYesNoUnits({
                          metricUnits,
                          value: customGoal.item.singleGoalValue,
                          diResolver,
                        })
                      : customGoal.item.singleGoalValue
                        ? customGoal.item.singleGoalValue
                        : undefined

                  const customGoalValues = {
                    id: customGoal.item.id,
                    startDate: customGoal.item.startDate ?? undefined,
                    endDate: customGoal.item.endDate ?? undefined,
                    rule: customGoal.item.rule ?? undefined,
                    singleGoalValue: singleGoalValue ?? undefined,
                    minGoalValue: customGoal.item.minGoalValue ?? undefined,
                    maxGoalValue: customGoal.item.maxGoalValue ?? undefined,
                  }

                  return await editCustomGoal(customGoalValues)
                }
                case 'REMOVE': {
                  const id = customGoal.item.id
                  return await deleteCustomGoal({ id })
                }
                default: {
                  throwLocallyLogInProd(
                    diResolver,
                    new UnreachableCaseError({
                      eventType: customGoal,
                      errorMessage: `The action ${customGoal} does not exist in onSubmit in EditMetricDrawerContainer`,
                    } as never)
                  )
                }
              }
            })
          )
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing custom goals`),
            error: new UserActionError(error),
          })
        }
      }
    )

    const onUpdateMetric: IEditMetricDrawerActionHandlers['onUpdateMetric'] =
      useAction(async (values) => {
        try {
          if (values.customGoals) {
            await onHandleUpdateCustomGoals(values.customGoals)
          }

          const metricId = metricSubscription().data.metric?.id
          if (!metricId) {
            throw new Error(
              `Metric id is not defined in onUpdateMetric in EditMetricDrawerContainer`
            )
          }

          const unitsToCompare =
            values.units || metricSubscription().data.metric?.units
          const ruleToCompare =
            values.rule || metricSubscription().data.metric?.rule

          const singleGoalValue =
            unitsToCompare && unitsToCompare === 'YESNO' && values.singleGoal
              ? getNumericStringValueFromTextValueForMetricYesNoUnits({
                  metricUnits: unitsToCompare,
                  value: values.singleGoal,
                  diResolver,
                })
              : values.singleGoal && ruleToCompare !== 'BETWEEN'
                ? values.singleGoal
                : undefined

          let updatedMeetings = undefined
          if (values.meetingIds) {
            updatedMeetings = values.meetingIds.includes(PERSONAL_MEETING_VALUE)
              ? []
              : values.meetingIds
          }

          const editMetricValues = {
            metricId,
            title: values.title ?? undefined,
            assignee: values.owner ?? undefined,
            units: values.units ?? undefined,
            rule: values.rule ?? undefined,
            frequency: values.frequency ?? undefined,
            notesId: values.notesId ?? undefined,
            meetings: updatedMeetings,
            formula: values.formula !== undefined ? values.formula : undefined,
            singleGoalValue: singleGoalValue
              ? getMetricNumberWithRemovedCommas(singleGoalValue)
              : undefined,
            minGoalValue:
              ruleToCompare === 'BETWEEN' && values.goalMin
                ? getMetricNumberWithRemovedCommas(values.goalMin)
                : undefined,
            maxGoalValue:
              ruleToCompare === 'BETWEEN' && values.goalMax
                ? getMetricNumberWithRemovedCommas(values.goalMax)
                : undefined,
            averageData:
              values.showAverage === false
                ? { value: null }
                : values.averageDate
                  ? { value: { startDate: values.averageDate } }
                  : undefined,
            cumulativeData:
              values.showCumulative === false
                ? { value: null }
                : values.cumulativeDate
                  ? { value: { startDate: values.cumulativeDate } }
                  : undefined,
            progressiveData: values.progressiveTrackingTargetDate
              ? {
                  value: { targetDate: values.progressiveTrackingTargetDate },
                }
              : undefined,
          }

          await editMetric(editMetricValues)
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error editing {{metric}}`, {
              metric: terms.metric.lowercaseSingular,
            }),
            error: new UserActionError(error),
          })
        }
      })

    const onHandleChangeDrawerViewSetting: IEditMetricDrawerActionHandlers['onHandleChangeDrawerViewSetting'] =
      useAction(async (drawerView) => {
        await editAuthenticatedUserSettings({ drawerView })
      })

    const onHandleCloseDrawerWithUnsavedChangesProtection: IEditMetricDrawerActionHandlers['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useAction(({ onHandleLeaveWithoutSaving }) => {
        openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
      })

    const onGetNoteById = useAction(async () => {
      const notesId = metricSubscription().data.metric?.notesId
      if (
        notesId &&
        !getCurrentUserPermissions().canEditMetricsInMeeting.allowed
      ) {
        try {
          const response = await getNoteById({
            noteId: notesId,
          })
          setMetricNoteText(response.text)
        } catch (e) {
          logError(e, {
            context: `Error fetching note data for metric ${props.metricId} with notesId ${notesId}`,
          })
        }
      }
    })

    useEffect(() => {
      if (!metricSubscription().querying) {
        onGetNoteById()
      }
    }, [metricSubscription().querying, onGetNoteById])

    const getMetric = useComputed(
      () => {
        const metric = metricSubscription().data.metric

        return {
          id: metric?.id || '',
          title: metric?.title || '',
          frequency: metric?.frequency || 'WEEKLY',
          units: metric?.units || 'NONE',
          rule: metric?.rule || 'EQUAL_TO',
          goal: metric?.goal || null,
          notesId: metric?.notesId || '',
          progressiveDate:
            metric?.metricData?.progressiveData?.targetDate ?? null,
          averageDate: metric?.metricData?.averageData?.startDate ?? null,
          cumulativeDate: metric?.metricData?.cumulativeData?.startDate ?? null,
          showAverage: !!metric?.metricData?.averageData,
          showCumulative: !!metric?.metricData?.cumulativeData,
          formula: metric?.formula || null,
          meetingIds: metric?.meetings.nodes.map((meeting) => meeting.id) || [],
          assigneeId: metric?.assignee.id || '',
          assigneeFullName: metric?.assignee.fullName || '',
          customGoals: metric?.customGoals || null,
        }
      },
      {
        name: `EditMetricDrawerContainer-getMetric`,
      }
    )

    const getMeetingsLookup = useComputed(
      () => {
        return getUsersMeetingsLookup({
          meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
          includePersonalMeeting: true,
        })
      },
      {
        name: `EditMetricDrawerContainer-getMeetingsLookup`,
      }
    )

    const getData = useComputed(
      () => ({
        getMetric: getMetric,
        getCurrentUserPermissions,
        isLoading: metricSubscription().querying,
        meetingId: props.meetingId,
        currentUser: sharedSubscription().data.currentUser,
        getMeetingsLookup: getMeetingsLookup,
        getMeetingAttendeesAndOrgUsersLookup:
          getComputedMeetingAttendeesAndOrgUsersLookup,
        getMetricsFormulasLookup: getComputedMetricsFormulasLookup,
        nodesCollectionForMetricsFormulasLookup:
          metricFormulaLookupSubsctiption().data.currentUser
            ?.metricFormulaLookup || null,
        getWeekStartAndEndNumbersForLuxon,
        metricNoteText: componentState.metricNoteText,
        drawerIsRenderedInMeeting: drawerController.drawerIsRenderedInMeeting,
        drawerView: drawerController.drawerView,
        metricIdFromProps: props.metricId,
      }),
      {
        name: `EditMetricDrawerContainer-getData`,
      }
    )

    const getActionHandlers = useComputed(
      () => ({
        onCreateNotes,
        onArchiveMetric,
        onUpdateMetric,
        onHandleChangeDrawerViewSetting,
        onHandleCloseDrawerWithUnsavedChangesProtection,
      }),
      {
        name: `EditMetricDrawerContainer-getActionHandlers`,
      }
    )

    const EditMetricDrawerView = props.children
    return (
      <EditMetricDrawerView
        getData={getData}
        getActionHandlers={getActionHandlers}
      />
    )
  }
)
