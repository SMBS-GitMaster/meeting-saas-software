import { observer } from 'mobx-react'
import React, { useCallback, useMemo, useState } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  MetricFrequency,
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
  useBloomNoteMutations,
  useBloomUserMutations,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useBloomMetricMutations } from '@mm/core-bloom/metrics/mutations'

import { useTranslation } from '@mm/core-web/i18n'
import { useDrawerController } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAdminMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { getMetricsFormulasLookup } from '../formula/metricsFormulasLookup'
import { getCreateMetricDrawerPermissions } from './createMetricDrawerPermissions'
import {
  ICreateMetricDrawerActionHandlers,
  ICreateMetricDrawerContainerProps,
} from './createMetricDrawerTypes'

export const CreateMetricDrawerContainer = observer(
  function CreateMetricDrawerContainer(
    props: ICreateMetricDrawerContainerProps
  ) {
    const [currentlySelectedFrequency, setCurrentlySelectedFrequency] =
      useState<MetricFrequency>(props.frequency || 'WEEKLY')

    const terms = useBloomCustomTerms()
    const { createNote } = useBloomNoteMutations()
    const { createMetric } = useBloomMetricMutations()
    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { openOverlazy } = useOverlazyController()

    const meetingNode = useBloomMeetingNode()
    const { t } = useTranslation()
    const diResolver = useDIResolver()
    const { drawerView, drawerIsRenderedInMeeting } = useDrawerController()

    const meetingsLookupSubscription = useAdminMeetingsLookupSubscription()

    const subscription1 = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id, settings, orgSettings, metricFormulaLookup }) => ({
            id,
            settings: settings({
              map: ({ timezone }) => ({ timezone }),
            }),
            orgSettings: orgSettings({
              map: ({ weekStart }) => ({ weekStart }),
            }),
            metricFormulaLookup: metricFormulaLookup({
              filter: {
                and: [
                  {
                    frequency: currentlySelectedFrequency,
                  },
                ],
              },
              map: ({ title, id, assignee, frequency }) => ({
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
              }) => ({
                name,
                startOfWeekOverride,
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
      { subscriptionId: 'CreateMetricDrawer' }
    )

    const currentUserPermissions = useMemo(() => {
      return getCreateMetricDrawerPermissions({
        currentUserPermissions:
          subscription1().data.meeting?.currentMeetingAttendee.permissions ??
          null,
        isPersonalMetric: props.meetingId == null,
      })
    }, [
      props.meetingId,
      subscription1().data.meeting?.currentMeetingAttendee.permissions,
    ])

    const meeting = subscription1().data.meeting
    const currentUSer = subscription1().data.currentUser
    const weekStartAndEndNumbersForLuxon = meeting
      ? meeting.startAndEndOfWeekNumbersForLuxon({
          weekStart:
            subscription1().data.currentUser?.orgSettings.weekStart ||
            WEEK_START_DEFAULT,
        })
      : currentUSer
        ? currentUSer.orgSettings.startAndEndOfWeekNumbersForLuxon
        : START_AND_END_WEEK_NUMBERS_FOR_LUXON_DEFAULT

    const meetingAttendeesAndOrgUsersLookup = useMemo(() => {
      return getMeetingAttendeesAndOrgUsersLookup({
        orgUsers: subscription1().data?.users || null,
        meetings: meeting ? [meeting] : null,
      })
    }, [meeting, subscription1().data?.users])

    const metricsFormulasLookup = useMemo(() => {
      return getMetricsFormulasLookup(
        subscription1().data?.currentUser?.metricFormulaLookup.nodes || []
      )
    }, [subscription1().data?.currentUser?.metricFormulaLookup.nodes])

    const onHandleUpdateMetricFrequency: ICreateMetricDrawerActionHandlers['onHandleUpdateMetricFrequency'] =
      useCallback(
        (frequency) => {
          setCurrentlySelectedFrequency(frequency)
        },
        [setCurrentlySelectedFrequency]
      )

    const onCreateNotes: ICreateMetricDrawerActionHandlers['onCreateNotes'] =
      useCallback(
        async (values) => {
          return createNote(values)
        },
        [createNote]
      )

    const onCreateMetric: ICreateMetricDrawerActionHandlers['onCreateMetric'] =
      useCallback(
        async (values) => {
          try {
            const singleGoalValue =
              values.units === 'YESNO' && values.singleGoal
                ? getNumericStringValueFromTextValueForMetricYesNoUnits({
                    metricUnits: values.units,
                    value: values.singleGoal,
                    diResolver,
                  })
                : values.singleGoal && values.rule !== 'BETWEEN'
                  ? values.singleGoal
                  : undefined

            const createMetricValues = {
              title: values.title,
              assignee: values.assigneeId,
              units: values.units,
              rule: values.rule,
              frequency: values.frequency,
              notesId: values.notesId,
              meetings: values.meetingIds.includes(PERSONAL_MEETING_VALUE)
                ? []
                : values.meetingIds,
              formula: values.formula ? values.formula : undefined,
              singleGoalValue: singleGoalValue
                ? getMetricNumberWithRemovedCommas(singleGoalValue)
                : undefined,
              minGoalValue:
                values.rule === 'BETWEEN' && values.goalMin
                  ? getMetricNumberWithRemovedCommas(values.goalMin)
                  : undefined,
              maxGoalValue:
                values.rule === 'BETWEEN' && values.goalMax
                  ? getMetricNumberWithRemovedCommas(values.goalMax)
                  : undefined,
              averageData:
                values.showAverage && values.averageDate
                  ? { startDate: values.averageDate }
                  : undefined,
              cumulativeData:
                values.showCumulative && values.cumulativeDate
                  ? { startDate: values.cumulativeDate }
                  : undefined,
              progressiveData:
                values.progressiveTracking &&
                values.progressiveTrackingTargetDate
                  ? { targetDate: values.progressiveTrackingTargetDate }
                  : undefined,
              customGoals:
                values.customGoals && values.customGoals.length > 0
                  ? values.customGoals.map((customGoal) => {
                      const singleGoalValue =
                        values.units === 'YESNO' && customGoal.singleGoalValue
                          ? getNumericStringValueFromTextValueForMetricYesNoUnits(
                              {
                                metricUnits: values.units,
                                value: customGoal.singleGoalValue,
                                diResolver,
                              }
                            )
                          : customGoal.singleGoalValue
                            ? customGoal.singleGoalValue
                            : undefined

                      return {
                        startDate: customGoal.startDate,
                        endDate: customGoal.endDate,
                        rule: customGoal.rule,
                        singleGoalValue:
                          customGoal.rule !== 'BETWEEN' && singleGoalValue
                            ? getMetricNumberWithRemovedCommas(singleGoalValue)
                            : undefined,
                        minGoalValue:
                          customGoal.rule === 'BETWEEN' &&
                          customGoal.minGoalValue
                            ? getMetricNumberWithRemovedCommas(
                                customGoal.minGoalValue
                              )
                            : undefined,
                        maxGoalValue:
                          customGoal.rule === 'BETWEEN' &&
                          customGoal.maxGoalValue
                            ? getMetricNumberWithRemovedCommas(
                                customGoal.maxGoalValue
                              )
                            : undefined,
                      }
                    })
                  : undefined,
            }

            await createMetric(createMetricValues)

            if (!values.createAnotherCheckedInDrawer) {
              openOverlazy('Toast', {
                type: 'success',
                text: t(`{{metric}} successfully created`, {
                  metric: terms.metric.singular,
                }),
                undoClicked: () => {
                  console.log(
                    '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
                  )
                },
              })
            }

            if (values.createAnotherCheckedInDrawer) {
              setTimeout(() => {
                openOverlazy('CreateMetricDrawer', {
                  meetingId: props.meetingId,
                  frequency: values.frequency,
                  rule: values.rule,
                  units: values.units,
                  createAnotherCheckedInDrawer: true,
                })
              }, 500)
            }
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t(`Error creating {{metric}}`, {
                metric: terms.metric.lowercaseSingular,
              }),
              error: new UserActionError(error),
            })
            throw error
          }
        },
        [openOverlazy, props.meetingId, createMetric, t, diResolver, terms]
      )

    const onHandleChangeDrawerViewSetting: ICreateMetricDrawerActionHandlers['onHandleChangeDrawerViewSetting'] =
      useCallback(
        async (drawerView) => {
          await editAuthenticatedUserSettings({ drawerView })
        },
        [editAuthenticatedUserSettings]
      )

    const onHandleCloseDrawerWithUnsavedChangesProtection: ICreateMetricDrawerActionHandlers['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useCallback(
        ({ onHandleLeaveWithoutSaving }) => {
          openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
        },
        [openOverlazy]
      )

    const CreateMetricDrawerView = props.children
    return (
      <CreateMetricDrawerView
        data={{
          isLoading: subscription1().querying,
          currentUserPermissions,
          currentUser: subscription1().data.currentUser,
          meetingId: props.meetingId,
          initialFrequency: props.frequency || null,
          initialRule: props.rule || null,
          initialUnits: props.units || null,
          initialCreateAnotherCheckedInDrawer:
            props.createAnotherCheckedInDrawer || null,
          meetingsLookup: getUsersMeetingsLookup({
            meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
            includePersonalMeeting: true,
          }),
          meetingAttendeesAndOrgUsersLookup,
          metricsFormulasLookup,
          nodesCollectionForMetricsFormulasLookup:
            subscription1().data.currentUser?.metricFormulaLookup || null,
          weekStartAndEndNumbersForLuxon,
          drawerIsRenderedInMeeting,
          drawerView,
        }}
        actionHandlers={{
          onCreateNotes,
          onCreateMetric,
          onHandleChangeDrawerViewSetting,
          onHandleCloseDrawerWithUnsavedChangesProtection,
          onHandleUpdateMetricFrequency,
        }}
      />
    )
  }
)
