import { Id } from '@mm/gql'

import { i18n } from '@mm/core/i18n'

import { getBloomCustomTerms } from '@mm/core-bloom'

import { TMeetingGoalsListSortingType } from './meetingGoalsListTypes'

export const getMeetingGoalListFilterByTab = (meetingId: Id) => {
  return {
    this_meeting: {},
    meeting_business: {
      _relational: {
        departmentPlanRecords: {
          isInDepartmentPlan: { eq: true, condition: 'some' },
          meetingId: { eq: meetingId, condition: 'some' },
        },
      },
    },
  }
}

export const getMeetingGoalsListSortingOptions = (
  diResolver: IDIResolver
): Array<{
  text: string
  value: TMeetingGoalsListSortingType
}> => {
  const terms = getBloomCustomTerms(diResolver)

  return [
    { text: i18n.t('Owner: A-Z'), value: 'ASSIGNEE_ASC' },
    { text: i18n.t('Owner: Z-A'), value: 'ASSIGNEE_DESC' },
    {
      text: i18n.t('{{businessPlan}}', {
        businessPlan: terms.businessPlan.singular,
      }),
      value: 'BUSINESS_PLAN',
    },
    { text: i18n.t('Newest'), value: 'NEWEST' },
    { text: i18n.t('Oldest'), value: 'OLDEST' },
    { text: i18n.t('Status'), value: 'STATUS' },
  ]
}
