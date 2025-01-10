import { Id } from '@mm/gql'

import { TSpeicalSessionsIframeExpandedOptions } from '../specialSessionsSectionTypes'

export const getRecordOfExpandedIframeOptionToIframeSrc = (opts: {
  meetingId: Id
  v1Url: string
}): Record<TSpeicalSessionsIframeExpandedOptions, string> => {
  const { meetingId, v1Url } = opts

  return {
    BUSINESS_PLAN: `${v1Url}L10/EditVto/${meetingId}?noheading=true`,
    MEETING_ARCHIVE: `${v1Url}L10/Details/${meetingId}?noheading=true#/Scorecard`,
    ORG_CHART: `${v1Url}Accountability/Chart?noheading=true`,
  }
}
