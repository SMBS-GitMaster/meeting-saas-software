import { useSubscription } from '@mm/gql'

import { useAuthenticatedBloomUserQueryDefinition } from '@mm/core-bloom'

export function useAdminMeetingsLookupSubscription() {
  return useSubscription(
    {
      user: useAuthenticatedBloomUserQueryDefinition({
        map: ({ adminPermissionsMeetingLookups }) => ({
          meetings: adminPermissionsMeetingLookups({
            map: ({ id, name, disabled, disabledText }) => ({
              id,
              name,
              disabled,
              disabledText,
            }),
          }),
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
    },
    {
      subscriptionId: 'adminMeetingsLookup',
    }
  )
}

export function useEditMeetingsLookupSubscription() {
  return useSubscription(
    {
      user: useAuthenticatedBloomUserQueryDefinition({
        map: ({ editPermissionsMeetingLookups }) => ({
          meetings: editPermissionsMeetingLookups({
            map: ({ id, name, disabled, disabledText }) => ({
              id,
              name,
              disabled,
              disabledText,
            }),
          }),
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
    },
    {
      subscriptionId: 'editMeetingsLookup',
    }
  )
}
