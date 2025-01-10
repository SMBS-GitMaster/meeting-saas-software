import { ESpecialSessionMeetingType, getBloomCustomTerms } from '@mm/core-bloom'

export const getSpecialSessionsTextLookup = (
  diResolver: IDIResolver
): Record<ESpecialSessionMeetingType, string> => {
  const terms = getBloomCustomTerms(diResolver)

  return {
    [ESpecialSessionMeetingType.QuarterlyPlanning]:
      terms.quarterlyPlanning.singular,
    [ESpecialSessionMeetingType.AnnualPlanning]: terms.annualPlanning.singular,
    [ESpecialSessionMeetingType.FocusDay]: terms.launchDay.singular,
    [ESpecialSessionMeetingType.VisionBuildingOne]:
      terms.futureFocusDay.singular,
    [ESpecialSessionMeetingType.VisionBuildingTwo]:
      terms.shortTermFocusDay.singular,
  }
}
