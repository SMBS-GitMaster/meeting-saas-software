import { i18n } from '@mm/core/i18n'

import { TBusinessPlanTileType, getBloomCustomTerms } from '@mm/core-bloom'

export const getRecordOfBusinessPlanTileTypeToMaxItemTooltipText = (opts: {
  diResolver: IDIResolver
}): Record<TBusinessPlanTileType, string> => {
  const { diResolver } = opts

  const terms = getBloomCustomTerms(diResolver)

  return {
    BHAG: '',
    CORE_VALUES: i18n.t("You've hit the maximum limit of {{cv}}", {
      cv: terms.coreValues.plural,
    }),
    CORE_FOCUS: i18n.t("You've hit the maximum limit of {{cf}}", {
      cv: terms.focus.plural,
    }),
    STRATEGY: i18n.t("You've hit the maximum limit of {{s}}", {
      s: terms.marketingStrategy.plural,
    }),
    VISION_ONE_YEAR: i18n.t("You've hit the maximum limit of {{goals}}", {
      goals: terms.oneYearGoals.plural,
    }),
    VISION_THREE_YEAR: i18n.t(
      "You've hit the maximum limit of {{threeGoals}}",
      {
        threeGoals: terms.threeYearVision.plural,
      }
    ),
    VISION_QUARTERLY: '',
    ISSUES: '',
  }
}
