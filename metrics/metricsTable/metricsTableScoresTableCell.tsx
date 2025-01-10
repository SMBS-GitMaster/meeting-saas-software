import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { getYearFromDate } from '@mm/core/date'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
} from '@mm/core/forms'

import {
  PermissionCheckResult,
  WeekStartType,
  getMetricNumberWithRemovedCommas,
  getMetricScoreTimestamp,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnIcon, toREM, useTheme } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  getContextAwareIssueText,
  getContextAwareTodoText,
} from '@mm/bloom-web/shared'

import {
  getMetricsScoreValueFormattingValidationRule,
  getMetricsScoreValueMaxNumberValidationRule,
  getMetricsTableFormattedHeaderDates,
} from './helpers'
import { MetricsCell } from './metricsCell'
import {
  IMetricTableDataItemCustomGoalData,
  IMetricTableDataItemScoreData,
  IMetricTableScoreData,
  IMetricsTableViewActionHandlers,
} from './metricsTableTypes'

export const MetricsTableScoresTableCell = observer(
  (props: {
    metric: IMetricTableScoreData
    meetingId: Id
    index: number
    isLoading: boolean
    canEditMetricsInMeeting: PermissionCheckResult
    getCurrentUserPermissions: () => {
      canCreateTodosInMeeting: PermissionCheckResult
      canCreateIssuesInMeeting: PermissionCheckResult
    }
    rangeData: {
      start: number
      end: number
      scoreData: Maybe<IMetricTableDataItemScoreData>
      customGoalData: Maybe<IMetricTableDataItemCustomGoalData>
      highlightedWeekIsWithinRange: boolean
      formattedDates: string | JSX.Element
      cellNotesText: Maybe<string>
    }
    weekStart: WeekStartType
    //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
    overlazyScoreNodeId: Maybe<Id>
    idForRenderingHighlightedWeekInFrame?: string
    hideContextAwareCreateButtons?: boolean
    handleSetOverlazyScoreNodeId: (nodeId: Maybe<Id>) => void
    handleUpdateMetricScore: IMetricsTableViewActionHandlers['handleUpdateMetricScore']
  }) => {
    const theme = useTheme()
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()

    const {
      rangeData,
      getCurrentUserPermissions,
      canEditMetricsInMeeting,
      metric,
      index,
      isLoading,
      meetingId,
      weekStart,
      //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
      overlazyScoreNodeId,
      hideContextAwareCreateButtons = false,
      handleSetOverlazyScoreNodeId,
      handleUpdateMetricScore,
    } = props

    const { canCreateTodosInMeeting, canCreateIssuesInMeeting } =
      getCurrentUserPermissions()

    const customGoal = rangeData.customGoalData
      ? {
          goal: rangeData.customGoalData.goal(metric.units),
          metricRule: rangeData.customGoalData.rule,
        }
      : null

    const formValues = useMemo(() => {
      return isLoading
        ? null
        : {
            score: rangeData.scoreData ? rangeData.scoreData.value : '',
          }
    }, [isLoading, rangeData.scoreData?.value])

    const formValidation = useMemo(() => {
      return {
        score: formValidators.string({
          additionalRules: [
            getMetricsScoreValueFormattingValidationRule({
              units: metric.units,
            }),
            getMetricsScoreValueMaxNumberValidationRule({
              units: metric.units,
            }),
          ],
          optional: true,
        }),
      } satisfies GetParentFormValidation<{ score: string }>
    }, [
      metric,
      t,
      getMetricsScoreValueFormattingValidationRule,
      getMetricsScoreValueMaxNumberValidationRule,
    ])

    const onCreatedTodoClick = useCallback(() => {
      const formattedDates = getMetricsTableFormattedHeaderDates({
        toString: true,
        frequency: metric.frequency,
        startDate: rangeData.start,
        endDate: rangeData.end,
      })

      openOverlazy('CreateTodoDrawer', {
        context: {
          type: 'Metric',
          title: metric.title,
          ownerId: metric.ownerId,
          ownerFullName: metric.assignee.fullName,
          units: metric.units,
          rule: metric.rule,
          goal: metric.goal,
          notesId: metric.notesId,
          metricScoreData: {
            metricFrequency: metric.frequency,
            formattedScoreValue: rangeData.scoreData?.scoreValueRounded ?? null,
            cellNotes: rangeData.cellNotesText,
            dateRange: formattedDates,
            year: getYearFromDate({
              secondsSinceEpochUTC: rangeData.end,
            }),
          },
        },
        meetingId,
      })
    }, [
      openOverlazy,
      metric.title,
      meetingId,
      metric.ownerId,
      metric.frequency,
      metric.goal,
      metric.notesId,
      metric.assignee.fullName,
      metric.rule,
      metric.units,
      rangeData.cellNotesText,
      rangeData.end,
      rangeData.scoreData,
      rangeData.start,
    ])

    const onCreateIssueClick = useCallback(() => {
      const formattedDates = getMetricsTableFormattedHeaderDates({
        toString: true,
        frequency: metric.frequency,
        startDate: rangeData.start,
        endDate: rangeData.end,
      })
      openOverlazy('CreateIssueDrawer', {
        meetingId: meetingId,
        context: {
          type: 'Metric',
          title: metric.title,
          ownerId: metric.ownerId,
          ownerFullName: metric.assignee.fullName,
          units: metric.units,
          rule: metric.rule,
          goal: metric.goal,
          notesId: metric.notesId,
          metricScoreData: {
            metricFrequency: metric.frequency,
            formattedScoreValue: rangeData.scoreData?.scoreValueRounded ?? null,
            cellNotes: rangeData.cellNotesText,
            dateRange: formattedDates,
            year: getYearFromDate({
              secondsSinceEpochUTC: rangeData.end,
            }),
          },
        },
        initialItemValues: {
          title: metric.title,
        },
      })
    }, [
      openOverlazy,
      metric.title,
      meetingId,
      metric.ownerId,
      metric.frequency,
      metric.goal,
      metric.notesId,
      metric.assignee.fullName,
      metric.rule,
      metric.units,
      rangeData.cellNotesText,
      rangeData.end,
      rangeData.scoreData,
      rangeData.start,
    ])

    const onSubmit = useCallback(
      async (values: { score: string }) => {
        const value = values.score
          ? getMetricNumberWithRemovedCommas(values.score)
          : null
        const timestamp = getMetricScoreTimestamp({
          frequency: metric.frequency,
          dateRangeStartDate: rangeData.start,
          weekStart,
        })
        const metricId = metric.id
        const scoreId = rangeData.scoreData ? rangeData.scoreData.id : undefined

        // Note: we allow negative numbers and decimals, but if the BE mutation just sends - || . || -. without a number attached(like -1), the BE mutation will error out.
        if (value === '-' || value === '-.' || value === '.') {
          return
        }

        handleUpdateMetricScore({
          value,
          timestamp,
          metricId,
          scoreId,
          metricUnits: metric.units,
        })
      },
      [
        rangeData,
        handleUpdateMetricScore,
        metric.id,
        metric.frequency,
        weekStart,
        metric.units,
      ]
    )

    return (
      <div
        css={css`
          display: inline-flex;
          width: 100%;
          height: 100%;
          justify-content: ${rangeData.highlightedWeekIsWithinRange
            ? 'space-between'
            : 'center'};
          align-items: center;
        `}
      >
        <EditForm
          isLoading={props.isLoading}
          disabled={!canEditMetricsInMeeting.allowed}
          disabledTooltip={
            !canEditMetricsInMeeting.allowed
              ? {
                  msg: canEditMetricsInMeeting.message,
                  position: 'top center',
                }
              : undefined
          }
          sendDiffs={false}
          values={formValues as { score: string }}
          validation={formValidation}
          onSubmit={async (values) => {
            if (values.score != null) {
              onSubmit(values as { score: string })
            }
          }}
        >
          {({ fieldNames }) => {
            return (
              <>
                <MetricsCell
                  name={fieldNames.score}
                  id={`score_${metric.id}_${index}`}
                  metricTitle={metric.title}
                  scoreNodeId={
                    rangeData.scoreData ? rangeData.scoreData.id : null
                  }
                  dateRange={rangeData.formattedDates}
                  notesText={rangeData.cellNotesText}
                  goal={metric.goal}
                  metricRule={metric.rule}
                  customGoal={customGoal}
                  hasNote={!!rangeData.cellNotesText}
                  hasFormula={!!metric.formula}
                  hasProgressiveTracking={!!metric.progressiveData}
                  metricUnit={metric.units}
                  //@BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-1389
                  overlazyScoreNodeId={overlazyScoreNodeId}
                  handleSetOverlazyScoreNodeId={handleSetOverlazyScoreNodeId}
                />
              </>
            )
          }}
        </EditForm>
        {rangeData.highlightedWeekIsWithinRange &&
          !hideContextAwareCreateButtons && (
            <div
              css={css`
                background-color: ${theme.colors
                  .metricsTableScoreCurrentDateRangeBackgroundColor};
                height: 100%;
                width: ${toREM(80)};
                margin-left: ${theme.sizes.spacing8};
                display: inline-flex;
                align-items: center;
                justify-content: center;
              `}
            >
              <BtnIcon
                intent='naked'
                size='lg'
                iconProps={{
                  iconName: 'issuesIcon',
                  iconSize: 'lg',
                }}
                onClick={onCreateIssueClick}
                ariaLabel={getContextAwareIssueText(terms)}
                tag={'span'}
                disabled={!canCreateIssuesInMeeting.allowed}
                tooltip={
                  !canCreateIssuesInMeeting.allowed
                    ? {
                        msg: canCreateIssuesInMeeting.message,
                        position: 'bottom center',
                      }
                    : {
                        type: 'light',
                        msg: getContextAwareIssueText(terms),
                        position: 'bottom center',
                      }
                }
                css={css`
                  padding-right: ${theme.sizes.spacing16};
                `}
              />
              <BtnIcon
                intent='naked'
                size='lg'
                iconProps={{
                  iconName: 'toDoCompleteIcon',
                  iconSize: 'lg',
                }}
                disabled={!canCreateTodosInMeeting.allowed}
                tooltip={
                  !canCreateTodosInMeeting.allowed
                    ? {
                        msg: canCreateTodosInMeeting.message,
                        position: 'bottom center',
                      }
                    : {
                        type: 'light',
                        msg: getContextAwareTodoText(terms),
                        position: 'bottom center',
                      }
                }
                onClick={onCreatedTodoClick}
                ariaLabel={getContextAwareTodoText(terms)}
                tag={'span'}
              />
            </div>
          )}
      </div>
    )
  }
)
