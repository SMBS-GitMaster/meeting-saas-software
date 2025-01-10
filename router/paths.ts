import { type Id } from '@mm/gql'

import type { TMeetingTab } from '../pages/meetings'

const MEETINGS_BASE_PATH = '/meetings'

export const paths = {
  home: '/',
  componentLibraryDemo: '/cl',
  meeting: (opts: { meetingId: Id; tab?: TMeetingTab }) => {
    const searchParams = new URLSearchParams({
      tab: opts.tab || ('MEETING' as TMeetingTab),
    })

    return `${MEETINGS_BASE_PATH}/${opts.meetingId}?${searchParams.toString()}`
  },
  workspace: (opts: { workspaceId: Id; isMeetingWorkspace?: boolean }) => {
    if (opts.isMeetingWorkspace)
      return paths.meeting({ meetingId: opts.workspaceId, tab: 'WORKSPACE' })
    return `/workspace/${opts.workspaceId}`
  },
  businessPlan: (opts: { businessPlanId: Id }) => {
    return `/business-plan/${opts.businessPlanId}`
  },
  switchOrg: `/switch-org`,
  personalWorkspaceDemo: (opts: { workspaceId: Id }) => {
    return `/personal-workspace-demo/${opts.workspaceId}`
  },
  orgChart: `/org-chart`,
  v3OrgChart: `/org-chart-new`,
  orgSettings: `/org-settings`,
  manageUsers: `/manage-users`,
  editProfile: `/edit-profile`,
  rightPersonRightSeat: `/right-person-right-seat`,
  quarterlyOneOnOne: `/quarterly-one-on-one`,
  v3Banner: '/v3-banner',
  bloomNewFeaturesModal: '/new-features-modal',
  documents: '/documents',
  coachTools: (opts: { coachToolsId: string }) => {
    return `/coach-tools/${opts.coachToolsId}`
  },
  bloomStarVotingModal: (opts: { meetingId: Id }) => {
    return `/star-voting-modal/${opts.meetingId}`
  },
  createMeeting: '/create-meeting',
  errors: {
    404: '/error/404',
  },
  directReports: '/direct-reports',
  quarterlyAlignment: (opts: { meetingId: Id; tab?: TMeetingTab }) => {
    const searchParams = new URLSearchParams({
      tab: opts.tab || ('MEETING' as TMeetingTab),
    })
    return `/quarterly-alignment/${opts.meetingId}?${searchParams.toString()}`
  },
}
