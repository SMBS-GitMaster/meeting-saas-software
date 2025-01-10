import { GoalStatus } from '@mm/core-bloom/goals/goalTypes'

import { ColoredSelectInputIntent } from '@mm/core-web/ui'

export const GOAL_STATUS_TO_INTENT: Record<
  GoalStatus,
  ColoredSelectInputIntent
> = {
  COMPLETED: 'success',
  OFF_TRACK: 'warning',
  ON_TRACK: 'primary',
}
