import { formatWithZeros } from '@mm/core/date'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { i18n } from '@mm/core/i18n'

import {
  METRICS_FREQUENCY_TO_TEXT_MAP_FOR_CONTEXT_AWARE,
  METRIC_RULE_TO_SIGN_MAP,
  getBloomCustomTerms,
  getTextValueFromNumericStringValueForMetricYesNoUnits,
  isMinMaxMetricGoal,
  isSingleValueMetricGoal,
} from '@mm/core-bloom'

import { GOAL_STATUS_LOOKUP } from '@mm/core-bloom/goals'

import { TCreateContextAwareItemOpts } from './contextAwareTypes'

export const getContextAwareNotesText = (opts: {
  context: TCreateContextAwareItemOpts
  notesText: Maybe<string>
  diResolver: IDIResolver
}) => {
  const { context, notesText, diResolver } = opts

  const terms = getBloomCustomTerms(diResolver)
  const naText = i18n.t('N/A')
  // Note: we trim since if there are no notes we have an empty string with a space inside it, which we want to treat as empty.
  // we then add a line to the naText to make sure the etherpad renders this text in frame.
  const notesTextWithNAProtection = !!notesText?.trim()
    ? notesText
    : `${naText}\n`

  switch (context.type) {
    case 'Goal': {
      const goalStatusLookupText =
        GOAL_STATUS_LOOKUP.find((value) => value.value === context.status)
          ?.text ?? naText

      const formattedDateCreated = formatWithZeros({
        secondsSinceEpochUTC: context.dateCreated,
      })

      const formattedGoalDueDate = formatWithZeros({
        secondsSinceEpochUTC: context.dueDate,
      })

      const goalNotesText = `\nFrom ${terms.goal.singular}: ${context.title}\nStatus: ${goalStatusLookupText}\n${terms.goal.singular} Created: ${formattedDateCreated}\n${terms.goal.singular} Due: ${formattedGoalDueDate}\nOwner: ${context.ownerFullName}\nDetails: ${notesTextWithNAProtection}`

      return goalNotesText
    }
    case 'Metric': {
      const ruleSign = METRIC_RULE_TO_SIGN_MAP[context.rule]
      const goalText = isSingleValueMetricGoal(context.goal)
        ? context.goal.valueFormatted
        : isMinMaxMetricGoal(context.goal)
          ? `${context.goal.minData.minFormatted} - ${context.goal.maxData.maxFormatted}`
          : naText

      const metricGoalFormattedWithRuleAndUnits = `${ruleSign} ${goalText}`

      if (context.metricScoreData) {
        const frequencyLookupText = context.metricScoreData?.metricFrequency
          ? METRICS_FREQUENCY_TO_TEXT_MAP_FOR_CONTEXT_AWARE[
              context.metricScoreData.metricFrequency
            ]
          : naText

        const dateRangeWithYearIfApplicable =
          context.metricScoreData?.metricFrequency === 'WEEKLY' ||
          context.metricScoreData?.metricFrequency === 'DAILY'
            ? `${context.metricScoreData.dateRange}, ${
                context.metricScoreData?.year || naText
              }`
            : context.metricScoreData.dateRange

        const formattedScoreValue = context.metricScoreData.formattedScoreValue
          ? getTextValueFromNumericStringValueForMetricYesNoUnits({
              diResolver,
              metricUnits: context.units,
              value: context.metricScoreData.formattedScoreValue,
            })
          : naText

        const metricNotesTextWithScoreData = `\nFrom ${
          terms.metric.singular
        }: ${
          context.title
        }\nGoal: ${metricGoalFormattedWithRuleAndUnits}\nValue Entered: ${formattedScoreValue}\nCell Notes: ${
          context.metricScoreData.cellNotes || naText
        }\n${frequencyLookupText}: ${dateRangeWithYearIfApplicable}\nOwner: ${
          context.ownerFullName
        }\nDetails: ${notesTextWithNAProtection}`

        return metricNotesTextWithScoreData
      }

      const metricNotesTextWithNoScoreData = `\nFrom ${terms.metric.singular}: ${context.title}\nGoal: ${metricGoalFormattedWithRuleAndUnits}\nOwner: ${context.ownerFullName}\nDetails: ${notesTextWithNAProtection}`
      return metricNotesTextWithNoScoreData
    }
    case 'Issue': {
      const issueNotesText = `\nResolve ${terms.issue.singular}: ${context.title}\nOwner: ${context.ownerFullName}\nDetails: ${notesTextWithNAProtection}`
      return issueNotesText
    }
    case 'To-do': {
      const todoNotesText = `\nFrom ${terms.todo.singular}: ${context.title}\nOwner: ${context.ownerFullName}\nDetails: ${notesTextWithNAProtection}`
      return todoNotesText
    }
    case 'Headline': {
      const headlineNotesText = `\n${terms.headline.singular} message: ${context.title}\nOwner: ${context.ownerFullName}\nDetails: ${notesTextWithNAProtection}`
      return headlineNotesText
    }
    case 'BusinessPlanCoreValues': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const coreValuesNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${terms.coreValues.singular}: ${context.title}`
      return coreValuesNotesText
    }
    case 'BusinessPlanCoreFocus': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const coreFocusNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${i18n.t('Tile')}: ${context.tile}\n${context.title}`
      return coreFocusNotesText
    }
    case 'BusinessPlanBhag': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const bhagNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${terms.bhag.singular}: ${context.title}`
      return bhagNotesText
    }
    case 'BusinessPlanStrategy': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const strategyNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${i18n.t('Tile')}: ${context.tile}\n${context.title}`
      return strategyNotesText
    }

    case 'BusinessPlanVisionThreeYear': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const visionNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${i18n.t('Tile')}: ${context.tile}\n${context.title}`
      return visionNotesText
    }
    case 'BusinessPlanVisionOneYear': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const visionNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${i18n.t('Tile')}: ${context.tile}\n${context.title}`
      return visionNotesText
    }
    case 'BusinessPlanQuarterlyGoalsMeasurables': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const goalsNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${i18n.t('Tile')}: ${context.tile}\n${context.title}`
      return goalsNotesText
    }
    case 'BusinessPlanQuarterlyGoals': {
      const businessPlanPageCustomTermText =
        context.businessPlanPage === 'FF'
          ? terms.futureFocus.singular
          : terms.shortTermFocus.singular

      const goalsNotesText = `\n${terms.businessPlan.singular}: ${businessPlanPageCustomTermText}\n${i18n.t('Tile')}: ${context.tile}\n${terms.quarterlyGoals.singular}: ${context.title}\n${i18n.t('Owner')}: ${context.owner}`
      return goalsNotesText
    }
    default: {
      return throwLocallyLogInProd(
        diResolver,
        new UnreachableCaseError({
          eventType: context,
          errorMessage: `The context type of ${context} does not exist for creating a context item in getContextAwareNotesText`,
        } as never)
      )
    }
  }
}
