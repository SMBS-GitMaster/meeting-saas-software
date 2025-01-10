import { TrackedMetricColorIntention } from '@mm/core-bloom'

import { IMMTheme } from '@mm/core-web/ui/theme/mmThemeTypes'

export const getTrackedMetricColorIntentToBackgroundColorRecord = (
  theme: IMMTheme
): Record<TrackedMetricColorIntention, string> => {
  return {
    COLOR1: theme.colors.metricBadgeBackgroundColor1,
    COLOR2: theme.colors.metricBadgeBackgroundColor2,
    COLOR3: theme.colors.metricBadgeBackgroundColor3,
    COLOR4: theme.colors.metricBadgeBackgroundColor4,
    COLOR5: theme.colors.metricBadgeBackgroundColor5,
  }
}
