import { observer } from 'mobx-react'
import React from 'react'

import { type Id } from '@mm/gql'
import { queryDefinition, useSubscription } from '@mm/gql'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomOrgChartNode,
} from '@mm/core-bloom'

import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import type {
  IDirectReportUserInfo,
  IDirectReportsActions,
  IDirectReportsContainerProps,
  IDirectReportsData,
} from './directReportsTypes'

export const DirectReportsContainer = observer(function DirectReportsContainer(
  props: IDirectReportsContainerProps
) {
  const orgChartNode = useBloomOrgChartNode()

  const currentUserSub = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ id, orgChartId }) => ({
          id,
          orgChartId,
        }),
        useSubOpts: {
          doNotSuspend: true,
        },
      }),
    },
    {
      subscriptionId: `DirectReportsContainer-currentUserSub`,
    }
  )

  const orgChartId = currentUserSub().data.currentUser?.orgChartId
  const orgChartSub = useSubscription(
    {
      orgChart: orgChartId
        ? queryDefinition({
            def: orgChartNode,
            map: ({ seats }) => ({
              seats: seats({
                map: ({ id, position, users, directReports }) => ({
                  id,
                  position: position({ map: ({ title }) => ({ title }) }),
                  users: users({
                    map: ({ id, fullName }) => ({ id, fullName }),
                  }),
                  directReports: directReports({
                    map: ({ id, position, users }) => ({
                      id,
                      position: position({ map: ({ title }) => ({ title }) }),
                      users: users({
                        map: ({ id }) => ({ id }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
            useSubOpts: { doNotSuspend: true },
            target: { id: orgChartId },
          })
        : null,
    },
    {
      subscriptionId: `DirectReportsContainer-orgChartSub`,
    }
  )

  const directReportUserInfo = useComputed(
    () => {
      const currentUserId = currentUserSub().data.currentUser?.id
      const orgChartSeats = orgChartSub().data.orgChart?.seats.nodes

      if (!currentUserId) {
        return []
      }

      const directReportUserInfoByUserIdMap: Record<Id, IDirectReportUserInfo> =
        {}

      orgChartSeats?.forEach((seat) => {
        seat.users.nodes.forEach((user) => {
          if (user.id === currentUserId) {
            seat.directReports.nodes.forEach((directReport) => {
              directReport.users.nodes.forEach((directReportUser) => {
                if (directReportUserInfoByUserIdMap[directReportUser.id]) {
                  directReportUserInfoByUserIdMap[
                    directReportUser.id
                  ].positionTitles.push(directReport.position?.title ?? '')
                } else {
                  directReportUserInfoByUserIdMap[directReportUser.id] = {
                    userId: directReportUser.id,
                    directReportId: directReportUser.id,
                    positionTitles: [directReport.position?.title ?? ''],
                  }
                }
              })
            })
          }
        })
      })

      return Object.values(directReportUserInfoByUserIdMap)
    },
    {
      name: `DirectReportsContainer-directReportUserInfo`,
    }
  )

  const getData = useComputed(
    () => {
      const data: IDirectReportsData = {
        directReportUserInfo,
      }
      return data
    },
    {
      name: `DirectReportsContainer-getData`,
    }
  )

  const getActions = useComputed(
    () => {
      const actions: IDirectReportsActions = {}
      return actions
    },
    {
      name: `DirectReportsContainer-getActions`,
    }
  )

  return <props.children data={getData} actions={getActions} />
})
