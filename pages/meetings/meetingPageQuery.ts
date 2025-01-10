import { Id, queryDefinition } from '@mm/gql'

import { createDIHook } from '@mm/core/di/resolver'

import { getBloomMeetingNode } from '@mm/core-bloom/meetings/meetingNode'
import { getAuthenticatedBloomUserQueryDefinition } from '@mm/core-bloom/users/commonQueryDefinitions'
import { getBloomUserNode } from '@mm/core-bloom/users/userNode'

const DI_NAME_QUERY = 'bloom-web/pages/meetings/meetingPageQuery'

export const useMeetingPageDataQuery = createDIHook(
  DI_NAME_QUERY,
  getMeetingPageQuery
)

export function getMeetingPageQuery(diResolver: IDIResolver) {
  return (opts: { meetingId: Id }) => {
    return {
      currentUser: getAuthenticatedBloomUserQueryDefinition({
        diResolver,
        map: ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          currentOrgAvatar,
          currentOrgId,
          currentOrgName,
          isOrgAdmin,
          settings,
          numViewedNewFeatures,
        }) => ({
          id,
          firstName,
          lastName,
          fullName,
          avatar,
          userAvatarColor,
          currentOrgAvatar,
          currentOrgId,
          currentOrgName,
          isOrgAdmin,
          settings: settings({
            map: ({ timezone, drawerView, workspaceHomeId }) => ({
              timezone,
              drawerView,
              workspaceHomeId,
            }),
          }),
          numViewedNewFeatures,
        }),
      }),
      meeting: queryDefinition({
        def: getBloomMeetingNode(diResolver),
        map: ({
          name,
          meetingType,
          scheduledEndTime,
          scheduledStartTime,
          orgId,
          userOrgId,
          orgName,
          meetingPages,
          currentMeetingInstance,
          attendees,
          currentMeetingAttendee,
        }) => ({
          scheduledEndTime,
          scheduledStartTime,
          meetingType,
          orgId,
          userOrgId,
          orgName,
          meetingPages: meetingPages({
            map: ({
              pageType,
              expectedDurationS,
              pageName,
              externalPageUrl,
              timer,
              order,
              checkIn,
              noteboxPadId,
              subheading,
              dateDeleted,
            }) => ({
              pageType,
              expectedDurationS,
              pageName,
              externalPageUrl,
              timer,
              order,
              checkIn,
              noteboxPadId,
              subheading,
              dateDeleted,
            }),
            sort: {
              order: 'asc',
            },
            filter: {
              and: [
                {
                  dateDeleted: { eq: null },
                },
              ],
            },
            pagination: {
              includeTotalCount: true,
            },
          }),
          currentMeetingInstance: currentMeetingInstance({
            map: ({
              meetingStartTime,
              leaderId,
              currentPageId,
              isPaused,
              tangentAlertTimestamp,
            }) => ({
              meetingStartTime,
              leaderId,
              currentPageId,
              isPaused,
              tangentAlertTimestamp,
            }),
          }),
          name,
          meetingAttendees: attendees({
            map: ({
              id,
              firstName,
              lastName,
              fullName,
              isPresent,
              isUsingV3,
              hasSubmittedVotes,
              avatar,
              userAvatarColor,
              permissions,
            }) => ({
              id,
              firstName,
              lastName,
              fullName,
              avatar,
              isPresent,
              isUsingV3,
              hasSubmittedVotes,
              userAvatarColor,
              permissions: permissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
          }),
          currentMeetingAttendee: currentMeetingAttendee({
            map: ({ permissions }) => ({
              permissions: permissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
          }),
        }),
        target: {
          id: opts.meetingId,
        },
      }),
      users: queryDefinition({
        def: getBloomUserNode(diResolver),
        map: ({ avatar, userAvatarColor, firstName, lastName, fullName }) => ({
          avatar,
          userAvatarColor,
          firstName,
          lastName,
          fullName,
        }),
      }),
    }
  }
}
