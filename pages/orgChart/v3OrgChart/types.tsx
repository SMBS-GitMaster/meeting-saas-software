import { Id, NodesCollection } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import {
  OrgChartPermissions,
  OrgChartSeatPermissions,
} from '@mm/core-bloom/orgChart'

export type FlatOrgChartSeat = {
  id: Id
  directReports: NodesCollection<{
    TItemType: { id: Id }
    TIncludeTotalCount: false
  }>
  position: Maybe<{ title: string; roles: Array<{ id: Id; name: string }> }>
  users: NodesCollection<{
    TItemType: {
      id: Id
      firstName: string
      lastName: string
      fullName: string
      avatar: Maybe<string>
      userAvatarColor: UserAvatarColorType
    }
    TIncludeTotalCount: false
  }>
}

export type HierarchicalOrgChartSeat = Omit<
  FlatOrgChartSeat,
  'directReports'
> & {
  directReports: Maybe<Array<HierarchicalOrgChartSeat>>
  supervisor: Maybe<HierarchicalOrgChartSeat>
  permissions: OrgChartSeatPermissions
}

export type OrgChartViewProps = {
  getData: () => {
    getSeats: () => Array<HierarchicalOrgChartSeat>
    showDirectReportsForSeatsById: Record<Id, boolean>
    directReportsExpandDepth: number
    getMaxDirectReportsExpandDepth: () => number
    getSeatBeingEdited: () => Maybe<Id>
    getSeatBeingCreated: () => boolean
    getAllReportSeatIdsBySupervisorSeatId: () => Record<Id, Array<Id>>
    getCurrentUserOrgChartPermissions: () => OrgChartPermissions
  }
  getActions: () => {
    expandSeatDirectReportsById: (seatId: Id) => void
    collapseSeatDirectReportsById: (seatId: Id) => void
    onUpdateSeatSupervisor: (opts: {
      seatId: Id
      newSupervisorSeatId: Id
    }) => void
    onExpandAllDirectReports: () => void
    onCollapseAllDirectReports: () => void
    onDirectReportViewDepthChange: (depth: number) => void
    onEditSeatRequested: (opts: {
      seatId: Id
      onEditSeatDrawerClosed: () => void
    }) => void
    onDirectReportCreateRequested: (opts: { supervisorSeatId: Id }) => void
    onCreateSeatRequested: () => void
    onDeleteSeatRequested: (opts: { seatId: Id }) => void
    setHooks: (hooks: OrgChartContainerHooks) => void
  }
}

export type OrgChartContainerHooks = {
  onSeatCreated: Maybe<(opts: { newSeatId: Id }) => void>
  onSeatEdited: Maybe<(opts: { seatId: Id }) => void>
  onSeatDeleted: Maybe<
    (opts: { deletedSeatId: Id; directReportSeatIds: Maybe<Array<Id>> }) => void
  >
  onSupervisorChangeInDrawer: Maybe<
    (opts: { newSupervisorSeatId: Maybe<Id> }) => void
  >
}
