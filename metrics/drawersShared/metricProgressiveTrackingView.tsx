import React, { useCallback } from 'react'

import {
  getEndOfMonthSecondsSinceEpochUTC,
  getEndOfQuarterSecondsSinceEpochUTC,
  getStartOfDayForEndOfWeekSecondsSinceEpochUTC,
} from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'

import {
  MetricFrequency,
  getMetricsDaysLookup,
  getMetricsEndDateMonthsLookup,
  getMetricsEndDateQuartersLookup,
  getMetricsWeeksLookup,
} from '@mm/core-bloom/metrics'

import { useTranslation } from '@mm/core-web/i18n'
import { SelectInputSingleSelection } from '@mm/core-web/ui'

interface IMetricProgressiveTrackingViewProps {
  frequency: MetricFrequency
  weekStartAndEndNumbersForLuxon: {
    weekdayStartNumber: number
    weekdayEndNumber: number
  }
}

export const MetricProgressiveTrackingView: React.FC<
  IMetricProgressiveTrackingViewProps
> = ({ frequency, weekStartAndEndNumbersForLuxon }) => {
  const diResolver = useDIResolver()
  const { t } = useTranslation()

  const determineInputByFrequency = useCallback(() => {
    switch (frequency) {
      case 'DAILY': {
        const daysLookup = getMetricsDaysLookup(diResolver)

        return (
          <SelectInputSingleSelection
            id={'progressiveTrackingTargetDate'}
            name={'progressiveTrackingTargetDate'}
            options={daysLookup}
            placeholder={t('Choose a target completion day')}
            unknownItemText={t('Unknown day')}
            formControl={{
              label: t('Target completion day'),
            }}
            width={'100%'}
          />
        )
      }
      case 'WEEKLY': {
        const weeksLookup = getMetricsWeeksLookup({
          weekStartAndEndNumbersForLuxon,
          diResolver,
        })
        return (
          <SelectInputSingleSelection
            id={'progressiveTrackingTargetDate'}
            name={'progressiveTrackingTargetDate'}
            options={weeksLookup}
            placeholder={t('Choose a target completion week')}
            unknownItemText={t('Unknown week')}
            formControl={{
              label: t('Target completion week'),
            }}
            scrollToItemOnOpen={{
              itemValue:
                getStartOfDayForEndOfWeekSecondsSinceEpochUTC(diResolver),
            }}
            width={'100%'}
          />
        )
      }
      case 'MONTHLY': {
        const monthsLookup = getMetricsEndDateMonthsLookup(diResolver)
        return (
          <SelectInputSingleSelection
            id={'progressiveTrackingTargetDate'}
            name={'progressiveTrackingTargetDate'}
            options={monthsLookup}
            placeholder={t('Choose a target completion month')}
            unknownItemText={t('Unknown month')}
            formControl={{
              label: t('Target completion month'),
            }}
            scrollToItemOnOpen={{
              itemValue: getEndOfMonthSecondsSinceEpochUTC(diResolver),
            }}
            width={'100%'}
          />
        )
      }
      case 'QUARTERLY': {
        const quartersLookup = getMetricsEndDateQuartersLookup()
        return (
          <SelectInputSingleSelection
            id={'progressiveTrackingTargetDate'}
            name={'progressiveTrackingTargetDate'}
            options={quartersLookup}
            placeholder={t('Choose a target completion quarter')}
            unknownItemText={t('Unknown quarter')}
            formControl={{
              label: t('Target completion quarter'),
            }}
            scrollToItemOnOpen={{
              itemValue: getEndOfQuarterSecondsSinceEpochUTC(),
            }}
            width={'100%'}
          />
        )
      }
      default: {
        throw new UnreachableCaseError(frequency as never)
      }
    }
  }, [frequency, t, weekStartAndEndNumbersForLuxon, diResolver])

  return <>{determineInputByFrequency()}</>
}
