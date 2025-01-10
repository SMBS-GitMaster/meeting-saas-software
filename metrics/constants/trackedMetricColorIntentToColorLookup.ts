import { TrackedMetricColorIntention } from '@mm/core-bloom'

import { IMMTheme } from '@mm/core-web/ui/theme/mmThemeTypes'

export const getTrackedMetricColorIntentToColorRecord = (
  theme: IMMTheme
): Record<TrackedMetricColorIntention, string> => {
  return {
    COLOR1: theme.colors.metricChartLineColor1,
    COLOR2: theme.colors.metricChartLineColor2,
    COLOR3: theme.colors.metricChartLineColor3,
    COLOR4: theme.colors.metricChartLineColor4,
    COLOR5: theme.colors.metricChartLineColor5,
  }
}
