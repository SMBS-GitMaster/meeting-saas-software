import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { i18n } from '@mm/core/i18n'

import { BloomCustomTerms, TIssueEventType } from '@mm/core-bloom'

export const getEventTypeText = (opts: {
  eventType: TIssueEventType
  terms: BloomCustomTerms
}) => {
  const { eventType, terms } = opts

  switch (eventType) {
    case 'SOLVED': {
      return i18n.t(`{{issue}} solved`, {
        issue: terms.issue.lowercaseSingular,
      })
    }
    case 'MOVED': {
      return ''
    }
    case 'CREATED': {
      return i18n.t(`{{issue}} created`, {
        issue: terms.issue.lowercaseSingular,
      })
    }
    default: {
      throw new UnreachableCaseError({
        eventType: eventType,
        errorMessage: `The event type ${eventType} does not exist in timeLineStringForIssues.tsx`,
      } as never)
    }
  }
}

// This method is used to fill in empty css grid cells when viewing column sizes 2 and higher with
// empty divs so that we can render full height borders between columns in the grid using css.
// This method will return the number of empty divs needed to keep the grid filled.
// Example: if there are 4 issues and the grid is set to 3 columns, it will return 2
// so we have a full 2x3 grid (6 items total).
export const getNumEmptyIssueColumnCells = (opts: {
  currentColumnSize: number
  totalNumIssues: number
}) => {
  // Single column doesn't need to be filled.
  if (opts.currentColumnSize === 1) {
    return 0
  }

  let totalNumCells = opts.totalNumIssues

  while (totalNumCells % opts.currentColumnSize !== 0) {
    totalNumCells += 1
  }

  return totalNumCells - opts.totalNumIssues
}
