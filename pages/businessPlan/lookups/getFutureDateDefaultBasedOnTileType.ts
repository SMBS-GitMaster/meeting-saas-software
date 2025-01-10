import {
  addOrRemoveYears,
  getEndOfQuarterSecondsSinceEpochUTCForDate,
  getSecondsSinceEpochUTCOfISOString,
  getTimeController,
} from '@mm/core/date'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'

import { TBusinessPlanTileType } from '@mm/core-bloom'

export const getFutureDateDefaultBasedOnTileType = (opts: {
  diResolver: IDIResolver
  businessPlanCreatedTimeISOString: Maybe<string>
  tileType: TBusinessPlanTileType
}) => {
  const { businessPlanCreatedTimeISOString, tileType, diResolver } = opts

  const { getSecondsSinceEpochUTC } = getTimeController(diResolver)

  if (!businessPlanCreatedTimeISOString) {
    return getSecondsSinceEpochUTC()
  }

  const dateCreatedS = getSecondsSinceEpochUTCOfISOString({
    isoString: businessPlanCreatedTimeISOString,
  })

  if (dateCreatedS) {
    if (tileType === 'VISION_ONE_YEAR') {
      return addOrRemoveYears({ secondsSinceEpochUTC: dateCreatedS, years: 1 })
    } else if (tileType === 'VISION_THREE_YEAR') {
      return addOrRemoveYears({ secondsSinceEpochUTC: dateCreatedS, years: 3 })
    } else if (tileType === 'VISION_QUARTERLY') {
      const endOfCurrentQuarter = getEndOfQuarterSecondsSinceEpochUTCForDate({
        secondsSinceEpochUTC: dateCreatedS,
      })

      return endOfCurrentQuarter
    } else {
      return getSecondsSinceEpochUTC()
    }
  } else {
    throwLocallyLogInProd(
      diResolver,
      new Error(
        'The isoString for createdTime is invalid for getFutureDateDefaultBasedOnTileType within the businessPlan, check the createdTime value for this business plan.'
      )
    )
    return getSecondsSinceEpochUTC()
  }
}
