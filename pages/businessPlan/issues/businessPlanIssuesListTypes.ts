import { Id } from '@mm/gql'

import { FormValuesForSubmit } from '@mm/core/forms'

import { IMeetingAttendeesAndOrgUsersLookup } from '@mm/core-bloom'

import {
  IBusinessPlanIssueListItem,
  IBusinessPlanListCollection,
  IBusinessPlanViewData,
} from '../businessPlanTypes'

export interface IBusinessPlanIssuesListContainerProps {
  listCollection: IBusinessPlanListCollection
  getBusinessPlanData: () => Pick<
    IBusinessPlanViewData,
    'businessPlan' | 'pageState'
  >
  getIsEditingDisabled: () => boolean
  isPdfPreview: boolean
  children: (props: IBusinessPlanIssuesListViewProps) => JSX.Element
  className?: string
}

export interface IBusinessPlanIssuesListViewProps {
  isPdfPreview: boolean
  getData: () => IBusinessPlanIssuesListViewData
  getActions: () => IBusinessPlanIssuesListActionHandlers
  className?: string
}

export interface IBusinessPlanIssuesListActionHandlers {
  onCreateIssueRequest: (opts: { meetingId: Maybe<Id> }) => void
  onEditIssueRequest: (opts: { issueId: Id }) => void
  onHandleEditBusinessPlanIssues: (opts: {
    meetingId: Id
    values: Partial<
      FormValuesForSubmit<IBusinessPlanIssuesFormValues, true, 'issues'>
    >
  }) => Promise<void>
  onMoveIssueToShortTerm: (opts: { issueId: Id }) => Promise<void>
}

export interface IBusinessPlanIssuesListViewData {
  isLoading: boolean
  listCollection: IBusinessPlanListCollection
  getBusinessPlanData: () => Pick<
    IBusinessPlanViewData,
    'businessPlan' | 'pageState'
  >
  getIssueListItems: () => Array<IBusinessPlanIssueListItem>
  getIsEditingDisabled: () => boolean
  getMeetingAttendeesAndOrgUsersLookupOptions: () => Array<IMeetingAttendeesAndOrgUsersLookup>
  meetingId: Maybe<Id>
  className?: string
}

export interface IBusinessPlanIssuesFormValues {
  issues: Array<IBusinessPlanIssueListItem>
}
