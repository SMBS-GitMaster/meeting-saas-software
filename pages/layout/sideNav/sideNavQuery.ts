import { createDIHook } from '@mm/core/di/resolver'

import { getAuthenticatedBloomUserQueryDefinition } from '@mm/core-bloom/users/commonQueryDefinitions'

const DI_NAME = 'bloom-web/pages/layout/sideNav/query'

export const useSideNavDataQuery = createDIHook(DI_NAME, getSideNavQuery)

export const MAX_WORKSPACE_MEETINGS_ENTRIES_IN_SIDE_NAV = 4

export function getSideNavQuery(diResolver: IDIResolver) {
  return {
    user: getAuthenticatedBloomUserQueryDefinition({
      diResolver,
      map: (userData) => ({
        avatar: userData.avatar,
        userAvatarColor: userData.userAvatarColor,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        currentOrgName: userData.currentOrgName,
        currentOrgAvatar: userData.currentOrgAvatar,
        isOrgSupervisor: userData.isOrgSupervisor,
        isOrgAdmin: userData.isOrgAdmin,
        supportContactCode: userData.supportContactCode,
        coachToolsUrl: userData.coachToolsUrl,
        // notifications: userData.notifications({
        //   map: ({}) => ({}),
        //   pagination: {
        //     includeTotalCount: true,
        //   },
        // }),
        allWorkspaces: userData.workspaces({
          map: () => ({}),
          pagination: {
            includeTotalCount: true,
          },
        }),
        favoriteWorkspaces: userData.workspaces({
          map: ({
            name,
            favoriteId,
            favoritedSortingPosition,
            favoritedTimestamp,
            archived,
            workspaceParentId,
            workspaceType,
          }) => ({
            name,
            favoriteId,
            favoritedSortingPosition,
            favoritedTimestamp,
            archived,
            workspaceParentId,
            workspaceType,
          }),
          filter: {
            and: [
              {
                favoriteId: { neq: null },
                archived: false,
              },
            ],
          },
          sort: {
            favoritedSortingPosition: { direction: 'asc', priority: 1 },
            favoritedTimestamp: { direction: 'desc', priority: 2 },
          },
          pagination: {
            itemsPerPage: MAX_WORKSPACE_MEETINGS_ENTRIES_IN_SIDE_NAV,
          },
        }),
        allMeetings: userData.meetingsListLookup({
          map: () => ({}),
          pagination: {
            includeTotalCount: true,
          },
        }),
        favoriteMeetings: userData.meetingsListLookup({
          map: (meetingsData) => ({
            name: meetingsData.name,
            favoriteId: meetingsData.favoriteId,
            favoritedSortingPosition: meetingsData.favoritedSortingPosition,
            favoritedTimestamp: meetingsData.favoritedTimestamp,
            archived: meetingsData.archived,
          }),
          filter: {
            and: [
              {
                favoriteId: { neq: null },
                archived: false,
              },
            ],
          },
          sort: {
            favoritedSortingPosition: { direction: 'asc', priority: 1 },
            favoritedTimestamp: { direction: 'desc', priority: 2 },
          },
          pagination: {
            itemsPerPage: MAX_WORKSPACE_MEETINGS_ENTRIES_IN_SIDE_NAV,
          },
        }),
        orgSettings: userData.orgSettings({
          map: ({ businessPlanId, v3BusinessPlanId }) => ({
            businessPlanId,
            v3BusinessPlanId,
          }),
        }),
        orgChartId: userData.orgChartId,
      }),
      useSubOpts: {
        doNotSuspend: true,
      },
    }),
  }
}
