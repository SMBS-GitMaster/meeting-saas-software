import React from 'react'

import { i18n } from '@mm/core/i18n'

import { generateBrowserRouter } from '@mm/core-web/router/generator'
import { IWebRouterConfig } from '@mm/core-web/router/routerTypes'

import { BloomProvider } from '@mm/bloom-web/bloomProvider'
import { SomethingWentWrongErrorPage } from '@mm/bloom-web/pages/errorPages/somethingWentWrongErrorPage'

import { paths } from './paths'

const routeConfig: IWebRouterConfig = {
  routes: [
    {
      path: '/performance/mobx',
      title: 'Mobx Performance',
      component: () => import('@mm/bloom-web/pages/performance/mobx'),
      layout: null,
    },
    {
      path: paths.home,
      title: i18n.t('Home'),
      component: () => import('@mm/bloom-web/pages/Home/homePage'),
    },
    {
      path: paths.componentLibraryDemo,
      title: i18n.t('Component library'),
      component: () => import('@mm/bloom-web/pages/CLTestPage'),
      layout: null,
    },
    {
      path: paths.meeting({ meetingId: ':meetingId' }),
      title: i18n.t('Meeting'),
      component: () => import('@mm/bloom-web/pages/meetings'),
      layout: () => import('@mm/bloom-web/pages/layout/meeting'),
    },
    {
      path: paths.workspace({ workspaceId: ':workspaceId' }),
      title: i18n.t('Workspace'),
      component: () =>
        import('@mm/bloom-web/pages/workspace/personalWorkspacePage'),
    },
    {
      path: paths.businessPlan({ businessPlanId: ':businessPlanId' }),
      title: i18n.t('Business plan'),
      component: () => import('@mm/bloom-web/pages/businessPlan'),
    },
    {
      path: paths.orgChart,
      title: i18n.t('Org chart'),
      component: () => import('@mm/bloom-web/pages/orgChart'),
    },
    {
      path: paths.v3OrgChart,
      title: i18n.t('Org chart'),
      component: () => import('@mm/bloom-web/pages/orgChart/v3OrgChart'),
    },
    {
      path: paths.orgSettings,
      title: i18n.t('Org settings'),
      component: () => import('@mm/bloom-web/pages/orgSettings'),
    },
    {
      path: paths.manageUsers,
      title: i18n.t('Manage users'),
      component: () => import('@mm/bloom-web/pages/manageUsers'),
    },
    {
      path: paths.rightPersonRightSeat,
      title: i18n.t('Right person, right seat'),
      component: () => import('@mm/bloom-web/pages/rightPersonRightSeat'),
    },
    {
      path: paths.quarterlyOneOnOne,
      title: i18n.t('Quarterly 1:1'),
      component: () => import('@mm/bloom-web/pages/quarterlyOneOnOne'),
    },
    {
      path: paths.switchOrg,
      title: i18n.t('Switch org'),
      component: () => import('@mm/bloom-web/pages/switchOrg'),
    },
    {
      path: paths.editProfile,
      title: i18n.t('Edit profile'),
      component: () => import('@mm/bloom-web/pages/editProfile'),
    },
    {
      path: paths.documents,
      title: i18n.t('Documents'),
      component: () => import('@mm/bloom-web/pages/documents'),
    },
    {
      path: paths.coachTools({ coachToolsId: ':coachToolsId' }),
      title: i18n.t('Coach tools'),
      component: () => import('@mm/bloom-web/pages/coachTools'),
    },
    {
      path: paths.bloomNewFeaturesModal,
      title: i18n.t('Bloom V3'),
      component: () => import('@mm/bloom-web/pages/bloomNewFeaturesModal'),
      layout: () => import('@mm/bloom-web/pages/layout/empty'),
    },
    {
      path: paths.bloomStarVotingModal({ meetingId: ':meetingId' }),
      title: i18n.t('Bloom V3'),
      component: () => import('@mm/bloom-web/pages/bloomStarVotingModal'),
      layout: () => import('@mm/bloom-web/pages/layout/empty'),
    },
    {
      path: paths.createMeeting,
      title: i18n.t('Create meeting'),
      component: () => import('@mm/bloom-web/pages/meetings/createMeeting'),
    },
    {
      path: paths.errors[404],
      title: i18n.t('404 - Not found'),
      layout: null,
      component: () =>
        import('@mm/bloom-web/pages/errorPages/fourOhFourErrorPage'),
    },
    {
      path: paths.directReports,
      title: i18n.t('Direct reports'),
      component: () =>
        import('@mm/bloom-web/pages/directReports/directReports'),
    },
    {
      path: paths.quarterlyAlignment({ meetingId: ':meetingId' }),
      title: i18n.t('Quarterly alignment'),
      component: () =>
        import(
          '@mm/bloom-web/pages/quarterlyAlignmentPage/quarterlyAlignmentPage'
        ),
      layout: () => import('@mm/bloom-web/pages/layout/meeting'),
    },
  ],
  defaultPath: paths.home,
  notFoundRoute: paths.errors[404],
  renderLoadingIndicator: true,
  defaultLayout: () => import('@mm/bloom-web/pages/layout/default'),
  loginPath: () => '/invalid',
  unhandledErrorComponent: (opts: { onRetry: () => void }) => (
    <SomethingWentWrongErrorPage onRetry={opts.onRetry} />
  ),
}

export function generateBloomWebRouter() {
  return generateBrowserRouter(routeConfig, BloomProvider)
}
