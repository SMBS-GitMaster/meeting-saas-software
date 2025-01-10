import { GridStackWidget } from 'gridstack'

import { Id, NodesCollection } from '@mm/gql'

import { FormValuesForSubmit } from '@mm/core/forms'

import {
  EBusinessPlanListCollectionListType,
  IBusinessPlanGridStackWidgetOpts,
  IEditBusinessPlanTilePositionsTile,
  PermissionCheckResult,
  TBusinessPlanListItemType,
  TBusinessPlanParentPageType,
  TBusinessPlanTileType,
} from '@mm/core-bloom'

import { TCreateContextAwareBusinessPlanItemOpts } from '@mm/bloom-web/shared'

export type TBusinessPlanMode = 'EDIT' | 'PRESENTATION'

export interface IBusinessPlanContainerProps {
  children: (props: IBusinessPlanViewProps) => JSX.Element
}

export interface IBusinessPlanViewProps {
  isCreateScreen: boolean
  getData: () => IBusinessPlanViewData
  getActions: () => IBusinessPlanViewActions
}

export interface IBusinessPlanTilesGridProps {
  getData: () => IBusinessPlanViewData
  getActions: () => IBusinessPlanViewActions
  getTileToRender: (
    tile: TBusinessPlanTileProps,
    pdfPreview?: boolean
  ) => JSX.Element | null
  pdfPreview?: boolean
}

export interface IBusinessPlanViewData {
  currentOrgAvatar: Maybe<string>
  currentOrgName: string
  businessPlan: Maybe<{
    dateLastModified: number
    createdTime: string
    id: Id
    isShared: boolean
    meetingId: Maybe<Id>
    title: string
    isMainOrgBusinessPlan: (opts: { v3BusinessPlanId: Maybe<Id> }) => boolean
    hiddenTiles: NodesCollection<{
      TItemType: { isHidden: boolean; title: string; id: Id }
      TIncludeTotalCount: false
    }>
    tiles: NodesCollection<{
      TItemType: IBusinessPlanTileData
      TIncludeTotalCount: false
    }>
  }>
  getCurrentUserBusinessPlansAndSharedOrgPlans: () => {
    currentUsersBusinessPlans: Array<{
      id: Id
      title: string
      isShared: boolean
      isMainOrgBusinessPlan: (opts: { v3BusinessPlanId: Maybe<Id> }) => boolean
      currentUserPermissions: Maybe<{
        view: boolean
        edit: boolean
        admin: boolean
      }>
    }>
    sharedOrgPlans: Array<{
      id: Id
      title: string
      isShared: boolean
      isMainOrgBusinessPlan: (opts: { v3BusinessPlanId: Maybe<Id> }) => boolean
      currentUserPermissions: Maybe<{
        view: boolean
        edit: boolean
        admin: boolean
      }>
    }>
  }
  getCurrentUserPermissions: () => {
    canEditBusinessPlan: PermissionCheckResult
    isOrgAdmin: boolean
  }
  getGridstackMetadata: () => Array<IBusinessPlanTileGridstackMetadata>
  getHiddenTiles: () => Array<
    Pick<IBusinessPlanTileData, 'id' | 'title' | 'isHidden' | 'tileType'>
  >
  getMainOrgBusinessPlanCoreValuesTileData: () => Maybe<IBusinessPlanTileData>
  getBusinessPlanCoreValuesTileData: () => Maybe<IBusinessPlanTileData>
  getMeetingsLookupForCreateBusinessPlan: () => Array<{
    text: string
    value: Id
  }>
  getRecordOfTileIdToTileData: () => Record<Id, IBusinessPlanTileData>
  getTotalCountOfAllBusinessPlans: () => number
  isLoadingFirstSubscription: boolean
  isLoadingSecondSubscription: boolean
  mainOrgBusinessPlan: Maybe<{
    id: Id
    title: string
    isShared: boolean
    isMainOrgBusinessPlan: (opts: { v3BusinessPlanId: Maybe<Id> }) => boolean
    currentUserPermissions: Maybe<{
      view: boolean
      edit: boolean
      admin: boolean
    }>
    tiles: NodesCollection<{
      TItemType: IBusinessPlanTileData
      TIncludeTotalCount: false
    }>
  }>
  pageState: {
    businessPlanMode: TBusinessPlanMode
    parentPageType: TBusinessPlanParentPageType
    isLoadingGridstack: boolean
    renderPDFPreview: boolean
    renderPDFStyles: boolean
    issueListColumnSize: EBusinessPlanIssueListColumnSize
  }
  v3BusinessPlanId: Maybe<Id>
}

export interface IBusinessPlanViewActions {
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    context: TCreateContextAwareBusinessPlanItemOpts
    meetingId: Maybe<Id>
  }) => void
  onHandleDuplicateTile: (tileId: Id) => Promise<void>
  onHandleEditBusinessPlanGoalOptionsMenuItems: (opts: {
    listCollectionId: Id
    values: { showOwner?: boolean; showNumberedList?: boolean }
  }) => Promise<void>
  onHandleEditNumberedOrBulletedListCollection: (opts: {
    listCollectionId: Id
    tileId: Id
    values: Partial<
      FormValuesForSubmit<
        {
          title: string
          listItems: Array<IBusinessPlanGenericListItem>
        },
        true,
        'listItems'
      >
    >
    onListItemCreated: (opts: { itemId: Id; temporaryId: Id }) => void
  }) => Promise<void>
  onHandleEditTitledListCollection: (opts: {
    listCollectionId: Id
    tileId: Id
    values: Partial<
      FormValuesForSubmit<
        { title: string; listItems: Array<IBusinessPlanTitledListItem> },
        true,
        'listItems'
      >
    >
    onListItemCreated: (opts: { itemId: Id; temporaryId: Id }) => void
  }) => Promise<void>
  onHandleEditTextListCollection: (opts: {
    listCollectionId: Id
    tileId: Id
    values: Partial<
      FormValuesForSubmit<IBusinessPlanTextListCollection, true, 'listItems'>
    >
    onListItemCreated: (opts: { itemId: Id; temporaryId: Id }) => void
  }) => Promise<void>
  onHandleEditBusinessPlanTilePositions: (opts: {
    updatedTiles: Array<IEditBusinessPlanTilePositionsTile>
  }) => Promise<void>
  onHandleEditBusinessPlanTileText: (opts: {
    tileId: Id
    text: string
  }) => Promise<void>
  onHandleCreateBusinessPlanForMeeting: (opts: {
    meetingId: Id
  }) => Promise<void>
  onHandleHideTile: (opts: {
    tileId: Id
    tileType: TBusinessPlanTileType
  }) => Promise<void>
  onHandleMoveTileToOtherPage: (opts: {
    tileId: Id
    newParentPageType: TBusinessPlanParentPageType
    isCoreValuesTile: boolean
  }) => Promise<void>
  onHandleNavigateToBusinessPlan: (opts: { businessPlanId: Id }) => void
  onHandleEnterPDFPreview: () => void
  onHandleExitPDFPreview: () => void
  onHandleRenderPDFStyles: (showStyles: boolean) => void
  onHandleRenameTile: (opts: { tileId: Id; title: string }) => Promise<void>
  onHandleRestoreHiddenTile: (opts: { tileId: Id }) => Promise<void>
  onHandleSaveBusinessPlanTitle: (opts: {
    title: string
    businessPlanId: Id
  }) => Promise<void>
  onHandleSetBusinessPlanMode: (businessPlanMode: TBusinessPlanMode) => void
  onHandleSetCurrentParentPage: (
    parentPageType: TBusinessPlanParentPageType
  ) => void
  onHandleSetSearchTermForSharedAndUnsharedPlans: (searchTerm: string) => void
  onHandleShareBusinessPlan: (opts: {
    isShared: boolean
    businessPlanId: Id
  }) => Promise<void>
  onHandleSortAndReorderBusinessPlanListItems: (opts: {
    listItemId: Id
    listCollectionId: Id
    tileId: Id
    sortOrder: number
  }) => Promise<void>
  onHandleUpdateIssueListColumnSize: (
    issueListColumnSize: EBusinessPlanIssueListColumnSize
  ) => void
}

export interface IBusinessPlanGetListCollectionToRenderOpts {
  isPdfPreview: boolean
  listCollection: IBusinessPlanListCollection
  textListCollectionCountForStrategyTile?: number
  getIsEditingDisabled: () => boolean
  getTileData: () => IBusinessPlanTileData
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    textTitle?: string
  }) => void
}

export enum EBusinessPlanIssueListColumnSize {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
}

export type TBusinessPlanTileProps = {
  id: Id
  tileType: TBusinessPlanTileType
  gridStackWidgetOpts?: GridStackWidget
}

export interface IBusinessPlanGenericListItem {
  text: string
  id: Id
  sortOrder: number
  listItemType: TBusinessPlanListItemType
}

export interface IBusinessPlanTitledListItem {
  textTitle: string
  text: string
  id: Id
  sortOrder: number
  date: Maybe<number>
  listItemType: TBusinessPlanListItemType
}

export interface IBusinessPlanGoalListItem {
  id: Id
  ownerId: Id
  title: string
}

export interface IBusinessPlanIssueListItem {
  id: Id
  ownerId: Id
  title: string
}

export interface IBusinessPlanTextListCollection {
  title: string
  listItems: Array<IBusinessPlanGenericListItem>
}

export interface IBusinessPlanListCollection {
  id: Id
  title: Maybe<string>
  listType: EBusinessPlanListCollectionListType
  showOwner: boolean
  isNumberedList: boolean
  listItems: NodesCollection<{
    TItemType: {
      id: Id
      textTitle: Maybe<string>
      text: Maybe<string>
      sortOrder: number
      listItemType: TBusinessPlanListItemType
      date: Maybe<number>
    }
    TIncludeTotalCount: false
  }>
}

export interface IBusinessPlanTileData {
  title: Maybe<string>
  id: Id
  text: Maybe<string>
  parentPageType: TBusinessPlanParentPageType
  tileType: TBusinessPlanTileType
  isHidden: boolean
  gridStackWidgetPortraitPrintingOpts: IBusinessPlanGridStackWidgetOpts
  gridStackWidgetLandscapePrintingOpts: IBusinessPlanGridStackWidgetOpts
  gridStackWidgetOpts: IBusinessPlanGridStackWidgetOpts
  listCollections: NodesCollection<{
    TItemType: IBusinessPlanListCollection
    TIncludeTotalCount: false
  }>
}

export interface IBusinessPlanTileGridstackMetadata {
  gridStackWidgetOpts: IBusinessPlanGridStackWidgetOpts
  id: Id
  tileType: TBusinessPlanTileType
  disabled?: boolean
}
