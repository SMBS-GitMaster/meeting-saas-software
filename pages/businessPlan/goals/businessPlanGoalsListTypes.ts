import { Id } from '@mm/gql'

import { FormValuesForSubmit } from '@mm/core/forms'

import { IMeetingAttendeesAndOrgUsersLookup } from '@mm/core-bloom'

import {
  IBusinessPlanGoalListItem,
  IBusinessPlanListCollection,
  IBusinessPlanTileData,
  IBusinessPlanViewData,
} from '../businessPlanTypes'

export interface IBusinessPlanGoalsListContainerProps {
  listCollection: IBusinessPlanListCollection
  isPdfPreview: boolean
  getBusinessPlanData: () => Pick<
    IBusinessPlanViewData,
    'businessPlan' | 'pageState'
  >
  getIsEditingDisabled: () => boolean
  getTileData: () => IBusinessPlanTileData
  children: (props: IBusinessPlanGoalsListViewProps) => JSX.Element
  className?: string
}

export interface IBusinessPlanGoalsListViewProps {
  isPdfPreview: boolean
  getData: () => IBusinessPlanGoalsListViewData
  getActions: () => IBusinessPlanGoalsListActionHandlers
  className?: string
}

export interface IBusinessPlanGoalsListActionHandlers {
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    goalId: Id
  }) => void
  onEditGoalRequest: (opts: { goalId: Id }) => void
  onCreateGoalRequest: (opts: { meetingId: Maybe<Id> }) => void
  onHandleEditBusinessPlanGoalsListCollection: (opts: {
    listCollectionId: Id
    meetingId: Id
    values: Partial<
      FormValuesForSubmit<IBusinessPlanGoalsFormValues, true, 'goals'>
    >
  }) => Promise<void>
}

export interface IBusinessPlanGoalsListViewData {
  isLoading: boolean
  listCollection: IBusinessPlanListCollection
  getBusinessPlanData: () => Pick<
    IBusinessPlanViewData,
    'businessPlan' | 'pageState'
  >
  getGoalListItems: () => Array<IBusinessPlanGoalListItem>
  getIsEditingDisabled: () => boolean
  getMeetingAttendeesAndOrgUsersLookupOptions: () => Array<IMeetingAttendeesAndOrgUsersLookup>
  meetingId: Maybe<Id>
  titlePlaceholder: string
  className?: string
}

export interface IBusinessPlanGoalsFormValues {
  title: string
  goals: Array<IBusinessPlanGoalListItem>
}
