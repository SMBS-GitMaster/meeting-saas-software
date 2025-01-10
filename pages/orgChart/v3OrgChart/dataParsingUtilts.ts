import { computed } from 'mobx'

import { Id } from '@mm/gql'

import { getOrgChartSeatPermissions } from '@mm/core-bloom'

import { FlatOrgChartSeat, HierarchicalOrgChartSeat } from './types'

export function getSeatsById(opts: {
  seatData: Array<FlatOrgChartSeat>
  currentUser: {
    id: Id
    isOrgAdmin: boolean
  }
}): Record<Id, HierarchicalOrgChartSeat> {
  const supervisorBySeatId = {} as Record<Id, FlatOrgChartSeat>
  const seatIdsByUserId = {} as Record<Id, Array<Id>>

  const seatsById = opts.seatData.reduce(
    (acc, seat) => {
      if (seat.directReports) {
        seat.directReports.nodes.forEach((dr) => {
          supervisorBySeatId[dr.id] = seat
        })
      }

      seat.users.nodes.forEach((user) => {
        seatIdsByUserId[user.id] = seatIdsByUserId[user.id] || []
        seatIdsByUserId[user.id].push(seat.id)
      })

      const computedPermissions = computed(() => {
        const allSeatsThatReportToCurrentUser =
          seatIdsByUserId[opts.currentUser.id]?.flatMap(
            (seatId) => getAllReportSeatIdsBySupervisorSeatId(acc)[seatId]
          ) || []

        return getOrgChartSeatPermissions({
          seat,
          currentUser: {
            id: opts.currentUser.id,
            isDirectOrIndirectSupervisorOfSeat:
              allSeatsThatReportToCurrentUser.includes(seat.id),
            isOrgAdmin: opts.currentUser.isOrgAdmin,
          },
        })
      })

      const computedDirectReports = computed(() => {
        return seat.directReports?.nodes
          .map((dr) => acc[dr.id])
          .filter((dr) => dr != null)
      })

      const proxyTrap: ProxyHandler<FlatOrgChartSeat> = {
        get(target, prop) {
          if (prop === 'directReports') {
            return computedDirectReports.get()
          } else if (prop === 'supervisor') {
            const supervisor = supervisorBySeatId[target.id]
            if (supervisor) {
              return acc[supervisor.id]
            } else {
              return null
            }
          } else if (prop === 'permissions') {
            return computedPermissions.get()
          } else {
            return target[prop as keyof FlatOrgChartSeat]
          }
        },
      }

      acc[seat.id] = new Proxy(
        seat,
        proxyTrap
      ) as unknown as HierarchicalOrgChartSeat

      return acc
    },
    {} as Record<Id, HierarchicalOrgChartSeat>
  )

  return seatsById
}

export function buildHierarchy(
  seatsById: Record<Id, HierarchicalOrgChartSeat>
): Array<HierarchicalOrgChartSeat> {
  const seatsWithManagers = Object.values(seatsById)
    .filter((seat) => seat.directReports)
    .flatMap((seat) => seat.directReports?.map((dr) => dr.id) || [])

  const rootNodes = Object.values(seatsById).filter(
    (seat) => !seatsWithManagers.includes(seat.id)
  )

  return rootNodes.map(
    (node) => seatsById[node.id]
  ) as Array<HierarchicalOrgChartSeat>
}

export function getSeatIdsInFirstNLevels(
  data: Array<HierarchicalOrgChartSeat>,
  levels: number
) {
  if (levels < 1) return []
  const ids = data.map((node) => node.id)

  if (levels === 1) return ids

  data.forEach((node) => {
    if (node.directReports) {
      ids.push(...getSeatIdsInFirstNLevels(node.directReports, levels - 1))
    }
  })
  return ids
}

type DirectReport = {
  id: Id
  directReports: Maybe<Array<DirectReport>>
}

// Returns a record of all reports (direct or non direct) to any give seat id
export function getAllReportSeatIdsBySupervisorSeatId(
  data: Record<Id, HierarchicalOrgChartSeat>
): Record<Id, Array<Id>> {
  const allReportsBySupervisorSeatId = {} as Record<Id, Array<Id>>

  function traverseReports(seat: {
    id: Id
    directReports: Maybe<Array<DirectReport>>
  }) {
    allReportsBySupervisorSeatId[seat.id] =
      allReportsBySupervisorSeatId[seat.id] || []

    if (seat.directReports) {
      allReportsBySupervisorSeatId[seat.id].push(
        ...seat.directReports.map((dr) => dr.id)
      )

      seat.directReports.forEach((dr) => {
        traverseReports({
          id: seat.id,
          directReports: dr.directReports,
        })
      })
    }
  }

  Object.values(data).forEach(traverseReports)

  return allReportsBySupervisorSeatId
}

export function getHierarchyMaxDepth(
  data: Array<HierarchicalOrgChartSeat>,
  currentDepth = 1
): number {
  return data.reduce((maxDepth, node) => {
    if (node.directReports && node.directReports.length) {
      const depth = getHierarchyMaxDepth(node.directReports, currentDepth + 1)
      if (depth > maxDepth) return depth
    }
    return maxDepth
  }, currentDepth)
}

export function canEditAnyFieldInOrgChartSeatDrawer(
  seat: HierarchicalOrgChartSeat
) {
  return (
    seat.permissions.canEditPositionTitle.allowed ||
    seat.permissions.canEditRoles.allowed ||
    seat.permissions.canEditUsers.allowed ||
    seat.permissions.canEditSupervisor.allowed
  )
}
