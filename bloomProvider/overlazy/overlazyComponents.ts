import { lazy } from 'react'

import { TOverlazyComponentType } from './overlazyTypes'

export const OVERLAZY_DRAWERS = {
  CreateGoalDrawer: lazy(() => import('@mm/bloom-web/goals/createGoalDrawer')),
  CreateHeadlineDrawer: lazy(
    () => import('@mm/bloom-web/headlines/createHeadlineDrawer')
  ),
  CreateIssueDrawer: lazy(
    () => import('@mm/bloom-web/issues/createIssueDrawer')
  ),
  CreateMetricDrawer: lazy(
    () => import('@mm/bloom-web/metrics/createMetricDrawer')
  ),
  CreateTodoDrawer: lazy(() => import('@mm/bloom-web/todos/createTodoDrawer')),
  CreateWorkspaceDrawer: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/workspace/createEditWorkspaceDrawer/createWorkspaceDrawer'
      )
  ),
  EditGoalDrawer: lazy(() => import('@mm/bloom-web/goals/editGoalDrawer')),
  EditHeadlineDrawer: lazy(
    () => import('@mm/bloom-web/headlines/editHeadlineDrawer')
  ),
  EditIssueDrawer: lazy(() => import('@mm/bloom-web/issues/editIssueDrawer')),
  EditMetricDrawer: lazy(
    () => import('@mm/bloom-web/metrics/editMetricDrawer')
  ),
  EditTodoDrawer: lazy(() => import('@mm/bloom-web/todos/editTodoDrawer')),
  ErrorDrawer: lazy(
    () => import('@mm/bloom-web/shared/components/errorDrawer')
  ),
  EditWorkspaceDrawer: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/workspace/createEditWorkspaceDrawer/editWorkspaceDrawer'
      )
  ),
  MergeIssuesDrawer: lazy(
    () => import('@mm/bloom-web/issues/mergeIssuesDrawer')
  ),
  EditOrgChartSeatDrawer: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/orgChart/v3OrgChart/ui/drawers/editOrgChartSeatDrawer'
      )
  ),
  CreateOrgChartSeatDrawer: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/orgChart/v3OrgChart/ui/drawers/createOrgChartSeatDrawer'
      )
  ),
}

export const OVERLAZY_STICKY_DRAWERS = {
  MeetingNotesStickyTile: lazy(
    () =>
      import(
        '@mm/bloom-web/notes/notesTile/meetingNotesTile/meetingNotesStickyTile'
      )
  ),
  MetricCellNotesStickyDrawer: lazy(
    () => import('@mm/bloom-web/metrics/cellNotes/metricCellNotesStickyDrawer')
  ),
}

export const OVERLAZY_MODALS = {
  AddExistingMetricsModal: lazy(
    () => import('@mm/bloom-web/metrics/modals/addExistingMetricsModal')
  ),
  AdminBusinessPlanSettingsModal: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/businessPlan/modals/adminBusinessPlanSettingsModal'
      )
  ),
  ApplyFormulaModal: lazy(
    () => import('@mm/bloom-web/metrics/modals/applyFormulaModal')
  ),
  AttendeeManagementModal: lazy(
    () =>
      import(
        '@mm/bloom-web/shared/components/attendeeManagementModal/AttendeeManagementModal'
      )
  ),
  BloomNewFeaturesModal: lazy(
    () =>
      import(
        '@mm/bloom-web/shared/components/bloomNewFeaturesModal/bloomNewFeaturesModal'
      )
  ),
  BloomStarVotingModal: lazy(
    () =>
      import(
        '@mm/bloom-web/shared/components/bloomStarVotingModal/bloomStarVotingModal'
      )
  ),
  ChangeLeaderModal: lazy(
    () => import('@mm/bloom-web/pages/meetings/modals/changeLeaderModal')
  ),
  ConfirmDeleteOrgChartSeatModal: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/orgChart/v3OrgChart/ui/modals/confirmDeleteOrgChartSeatModal'
      )
  ),
  ConfirmVoteAgainIssueStarVotingModal: lazy(
    () =>
      import(
        '@mm/bloom-web/issues/issueList/modals/confirmVoteAgainIssueStarVotingModal'
      )
  ),
  CopyHeadlineToMeetingsModal: lazy(
    () => import('@mm/bloom-web/headlines/modals/copyHeadlineToMeetingsModal')
  ),
  CreateBusinessPlanModal: lazy(
    () =>
      import('@mm/bloom-web/pages/businessPlan/modals/createBusinessPlanModal')
  ),
  CreateMeetingModal: lazy(
    () => import('@mm/bloom-web/shared/components/createMeetingModal')
  ),
  ExportAgendaModal: lazy(
    () => import('@mm/bloom-web/pages/meetings/agenda/exportAgendaModal')
  ),
  ImportAgendaModal: lazy(
    () => import('@mm/bloom-web/pages/meetings/agenda/importAgendaModal')
  ),
  FeedbackModal: lazy(
    () => import('@mm/bloom-web/pages/meetings/modals/feedbackModal')
  ),
  PrintPreviewModal: lazy(
    () => import('@mm/core-web/ui/components/print/printPreview')
  ),
  MoveIssueToAnotherMeetingModal: lazy(
    () =>
      import(
        '@mm/bloom-web/issues/issueList/modals/moveIssueToAnotherMeetingModal'
      )
  ),
  RemoveMeetingSectionModal: lazy(
    () =>
      import('@mm/bloom-web/pages/meetings/agenda/removeMeetingSectionModal')
  ),
  RemoveMeetingFromWorkspaceConfirmModal: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/workspace/createEditWorkspaceDrawer/removeMeetingFromWorkspaceConfirmModal'
      )
  ),
  SaveMetricChartToWorkspaceModal: lazy(
    () => import('@mm/bloom-web/metrics/modals/saveMetricChartToWorkspaceModal')
  ),
  SetUserTimezoneModal: lazy(
    () => import('@mm/bloom-web/shared/components/setUserTimezoneModal')
  ),
  StartSpecialSessionModal: lazy(
    () =>
      import('@mm/bloom-web/pages/meetings/modals/startSpecialSessionsModal')
  ),
  SwitchOrgSuggestionModal: lazy(
    () => import('@mm/bloom-web/pages/meetings/modals/switchOrgSuggestionModal')
  ),
  UnsavedChangesModal: lazy(
    () => import('@mm/bloom-web/shared/components/unsavedChangesModal')
  ),
  UnsolveIssueModal: lazy(
    () => import('@mm/bloom-web/wrapUp/unsolveIssueModal')
  ),
  VideoConferenceModal: lazy(
    () => import('@mm/bloom-web/shared/components/videoConferenceModal')
  ),
  WarnCantDeleteSeatsWithDirectReportsModal: lazy(
    () =>
      import(
        '@mm/bloom-web/pages/orgChart/v3OrgChart/ui/modals/warnCantDeleteSeatsWithDirectReports'
      )
  ),
}

export const OVERLAZY_TABS = {
  MeetingTaskBar: lazy(
    () => import('@mm/bloom-web/pages/meetings/meetingTaskBar')
  ),
  MetricsTabPopup: lazy(
    () => import('@mm/bloom-web/metrics/metricsTabs/metricsTabPopup')
  ),
}

export const OVERLAZY_TOASTS = {
  Toast: lazy(() => import('@mm/core-web/ui/components/toast/toast')),
}

function formatComponents<TOverlaziesRecord extends Record<string, unknown>>(
  type: TOverlazyComponentType,
  record: TOverlaziesRecord
): TOverlaziesRecord {
  return Object.keys(record).reduce((acc, name: keyof TOverlaziesRecord) => {
    const value: any = record[name]
    value.type = type
    acc[name] = value
    return acc
  }, {} as TOverlaziesRecord)
}

export const OVERLAZY_COMPONENTS = {
  ...formatComponents('Drawer', OVERLAZY_DRAWERS),
  ...formatComponents('StickyDrawer', OVERLAZY_STICKY_DRAWERS),
  ...formatComponents('Modal', OVERLAZY_MODALS),
  ...formatComponents('Tab', OVERLAZY_TABS),
  ...formatComponents('Toast', OVERLAZY_TOASTS),
}
