import { ESpecialSessionMeetingType, getBloomCustomTerms } from '@mm/core-bloom'

export const getSpecialSessionsMenuItemsLookup = (
  diResolver: IDIResolver
): Array<{
  value: ESpecialSessionMeetingType
  text: string
}> => {
  const terms = getBloomCustomTerms(diResolver)

  return [
    {
      value: ESpecialSessionMeetingType.QuarterlyPlanning,
      text: terms.quarterlyPlanning.singular,
    },
    {
      value: ESpecialSessionMeetingType.AnnualPlanning,
      text: terms.annualPlanning.singular,
    },
    {
      value: ESpecialSessionMeetingType.FocusDay,
      text: terms.launchDay.singular,
    },
    {
      value: ESpecialSessionMeetingType.VisionBuildingOne,
      text: terms.futureFocusDay.singular,
    },
    {
      value: ESpecialSessionMeetingType.VisionBuildingTwo,
      text: terms.shortTermFocusDay.singular,
    },
  ]
}
