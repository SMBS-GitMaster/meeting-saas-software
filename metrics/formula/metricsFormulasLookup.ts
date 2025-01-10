import { type Id } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import { EFormulaBadgeType } from './formulaTypes'

export const getMetricsFormulasLookup = (
  metrics: Array<{
    title: string
    id: Id
    assignee: {
      firstName: string
      lastName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
    }
  }>
): Array<{
  type: EFormulaBadgeType.Metric
  text: string
  value: Id
  ownerMetaData: {
    firstName: string
    lastName: string
    avatar: Maybe<string>
    userAvatarColor: UserAvatarColorType
  }
}> => {
  return metrics.map((metric) => ({
    type: EFormulaBadgeType.Metric,
    text: metric.title,
    value: String(metric.id),
    ownerMetaData: metric.assignee,
  }))
}
