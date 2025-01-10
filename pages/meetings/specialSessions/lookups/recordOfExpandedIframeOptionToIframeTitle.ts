import { i18n } from '@mm/core/i18n'

import { BloomCustomTerms } from '@mm/core-bloom'

import { TSpeicalSessionsIframeExpandedOptions } from '../specialSessionsSectionTypes'

export const getRecordOfExpandedIframeOptionToIframeTitle = (opts: {
  terms: BloomCustomTerms
}): Record<TSpeicalSessionsIframeExpandedOptions, string> => {
  const { terms } = opts

  return {
    BUSINESS_PLAN: i18n.t('{{bp}}', { bp: terms.businessPlan.singular }),
    MEETING_ARCHIVE: i18n.t('Meeting Archive'),
    ORG_CHART: i18n.t('{{oc}}', { oc: terms.orgChart.singular }),
  }
}
