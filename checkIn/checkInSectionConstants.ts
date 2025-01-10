import { i18n } from '@mm/core/i18n'

import { BloomCustomTerms, TMeetingCheckInType } from '@mm/core-bloom'

import { TCheckInResponsiveSizes } from './checkInSectionTypes'

export function getCheckinStyleOpts(terms: BloomCustomTerms) {
  const CHECKIN_STYLES_OPTS: Array<{
    text: string
    selectedText: string
    value: TMeetingCheckInType
  }> = [
    {
      text: i18n.t('Generate an icebreaker'),
      selectedText: i18n.t('Icebreaker'),
      value: 'ICEBREAKER',
    },
    {
      text: i18n.t('Traditional {{checkInSingularTerm}}', {
        checkInSingularTerm: terms.checkIn.lowercaseSingular,
      }),
      selectedText: i18n.t('Traditional {{checkInSingularTerm}}', {
        checkInSingularTerm: terms.checkIn.lowercaseSingular,
      }),
      value: 'TRADITIONAL',
    },
  ]

  return CHECKIN_STYLES_OPTS
}

export function getCheckInTypeToTextMap(terms: BloomCustomTerms) {
  const CHECK_IN_TYPE_TO_TEXT_MAP: Record<TMeetingCheckInType, string> = {
    TRADITIONAL: terms.checkIn.singular,
    ICEBREAKER: i18n.t("This week's icebreaker question:"),
  }

  return CHECK_IN_TYPE_TO_TEXT_MAP
}

export const SHOW_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE: Record<
  TCheckInResponsiveSizes,
  number
> = {
  UNKNOWN: 0,
  LARGE: 3,
  MEDIUM: 2,
  SMALL: 1,
  XSMALL: 1,
}

export const NO_NAMES_COLUMN_COUNT_TO_RESPONSIVE_SIZE: Record<
  TCheckInResponsiveSizes,
  number
> = {
  UNKNOWN: 0,
  LARGE: 8,
  MEDIUM: 6,
  SMALL: 4,
  XSMALL: 3,
}
