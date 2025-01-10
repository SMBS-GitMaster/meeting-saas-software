import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { Text, toREM, useTheme } from '@mm/core-web/ui'

import { getMetricsTableFormattedHeaderDates } from './helpers'
import { METRIC_TABLE_ROW_HEIGHT } from './metricsTableConstants'
import { IMetricsTableViewData } from './metricsTableTypes'

export const MetricsTableScoresTableColumnHeader = observer(
  (props: {
    range: { start: number; end: number }
    metricsTableSelectedTab: IMetricsTableViewData['metricsTableSelectedTab']
  }) => {
    const theme = useTheme()

    const {
      range: { start: startDate, end: endDate },
      metricsTableSelectedTab,
    } = props

    const formattedDates = useMemo(() => {
      return getMetricsTableFormattedHeaderDates({
        frequency: metricsTableSelectedTab,
        startDate,
        endDate,
        toString: false,
      })
    }, [metricsTableSelectedTab, startDate, endDate])

    return (
      <Text
        type={'body'}
        weight={'semibold'}
        css={css`
          max-height: ${toREM(METRIC_TABLE_ROW_HEIGHT)};
          vertical-align: middle;
        `}
        color={{ color: theme.colors.bodyTextDefault }}
      >
        {formattedDates}
      </Text>
    )
  }
)
