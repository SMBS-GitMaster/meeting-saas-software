import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { FormValuesForSubmit } from '@mm/core/forms'

import {
  getOrgChartPermissions,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomOrgChartNode,
  useBloomUserNode,
} from '@mm/core-bloom'

import { useOrgChartMutations } from '@mm/core-bloom/orgChart/mutations'

import { useTranslation } from '@mm/core-web'

import { UserOptionMetadata } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useAction, useComputed, useObservable } from '../../performance/mobx'
import {
  buildHierarchy,
  getAllReportSeatIdsBySupervisorSeatId,
  getHierarchyMaxDepth,
  getSeatIdsInFirstNLevels,
  getSeatsById,
} from './dataParsingUtilts'
import { OrgChartContainerHooks, OrgChartViewProps } from './types'
import {
  ICreateOrgChartSeatDrawerActions,
  ICreateOrgChartSeatDrawerProps,
} from './ui/drawers/createOrgChartSeatDrawer'
import {
  IEditOrgChartSeatDrawerActions,
  IEditOrgChartSeatDrawerProps,
  IEditOrgChartSeatValues,
} from './ui/drawers/editOrgChartSeatDrawer'
import { SupervisorInputMetadata } from './ui/drawers/selectSupervisorInput'

const DEFAULT_DIRECT_REPORT_VIEW_DEPTH = 3

export const OrgChartContainer = observer(function OrgChartContainer(props: {
  children: (props: OrgChartViewProps) => JSX.Element
}) {
  const { t } = useTranslation()
  const overlazyController = useOverlazyController()
  const orgChartMutations = useOrgChartMutations()

  const subscription1 = useSubscription(
    {
      users: queryDefinition({
        def: useBloomUserNode(),
        map: ({ avatar, firstName, lastName, fullName, userAvatarColor }) => ({
          avatar,
          firstName,
          lastName,
          fullName,
          userAvatarColor,
        }),
      }),
      user: useAuthenticatedBloomUserQueryDefinition({
        map: ({ isOrgAdmin, orgChartId }) => ({
          isOrgAdmin,
          orgChartId,
        }),
      }),
    },
    {
      subscriptionId: 'OrgChartContainer-subscription1',
    }
  )

  const subscription2 = useSubscription(
    {
      orgChart: queryDefinition({
        def: useBloomOrgChartNode(),
        target: {
          id: subscription1().data.user.orgChartId,
        },
        map: ({ seats }) => ({
          seats: seats({
            map: ({ id, position, users, directReports }) => ({
              id,
              position: position({
                map: ({ title, roles }) => ({
                  title,
                  roles: roles({
                    map: ({ id, name }) => ({ id, name }),
                  }),
                }),
              }),
              users: users({
                map: ({
                  id,
                  fullName,
                  avatar,
                  firstName,
                  lastName,
                  userAvatarColor,
                }) => ({
                  id,
                  fullName,
                  avatar,
                  firstName,
                  lastName,
                  userAvatarColor,
                }),
              }),
              directReports: directReports({
                map: ({ id }) => ({ id }),
              }),
            }),
          }),
        }),
      }),
    },
    {
      subscriptionId: 'OrgChartContainer-subscription2',
    }
  )

  const getHierarchicalSeatsById = useComputed(
    () => {
      return getSeatsById({
        seatData: subscription2().data.orgChart.seats.nodes,
        currentUser: subscription1().data.user,
      })
    },
    {
      name: 'OrgChart-seatsById',
    }
  )

  const getHierarchicalData = useComputed(
    () => {
      return buildHierarchy(getHierarchicalSeatsById())
    },
    {
      name: 'OrgChart-getHierarchicalData',
    }
  )

  const getMaxDirectReportsExpandDepth = useComputed(
    () => getHierarchyMaxDepth(getHierarchicalData()),
    {
      name: 'OrgChart-getMaxDirectReportsExpandDepth',
    }
  )

  const getComputedAllReportSeatIdsBySupervisorSeatId = useComputed(
    () => getAllReportSeatIdsBySupervisorSeatId(getHierarchicalSeatsById()),
    {
      name: 'OrgChart-allReportSeatIdsBySupervisorSeatId',
    }
  )

  const getCurrentUserOrgChartPermissions = useComputed(
    () => {
      return getOrgChartPermissions({
        currentUser: subscription1().data.user,
      })
    },
    {
      name: 'OrgChart-getUserOrgChartPermissions',
    }
  )

  const containerState = useObservable({
    onEditSeatDrawerClosed: null as Maybe<() => void>,
    editSeatInfo: null as Maybe<{
      seatId: Id
    }>,
    createSeatInfo: null as Maybe<{
      initiallyChosenSupervisorSeatId: Maybe<Id>
    }>,
    confirmSeatDeleteInfo: null as Maybe<{
      seatId: Id
      initialSupervisorSeatIdSuggestion: Maybe<Id>
    }>,
    directReportsExpandDepth: DEFAULT_DIRECT_REPORT_VIEW_DEPTH,
    showDirectReportsForSeatsById: getSeatIdsInFirstNLevels(
      getHierarchicalData(),
      DEFAULT_DIRECT_REPORT_VIEW_DEPTH - 1
    ).reduce(
      (acc, seatId) => {
        acc[seatId] = true
        return acc
      },
      {} as Record<Id, boolean>
    ),
    hooks: null as Maybe<OrgChartContainerHooks>,
  })

  const currentDepth = containerState.directReportsExpandDepth
  const maxDepth = getMaxDirectReportsExpandDepth()
  useEffect(
    action(function resetMaxDepth() {
      if (currentDepth > maxDepth) {
        containerState.directReportsExpandDepth = maxDepth
      }
    }),
    [currentDepth, maxDepth]
  )

  const expandSeatDirectReportsById = useAction((seatId: Id) => {
    containerState.showDirectReportsForSeatsById[seatId] = true
  })
  const collapseSeatDirectReportsById = useAction((seatId: Id) => {
    containerState.showDirectReportsForSeatsById[seatId] = false
  })

  const onUpdateSeatSupervisor = useAction(
    async (opts: { seatId: Id; newSupervisorSeatId: Id }) => {
      if (opts.seatId === opts.newSupervisorSeatId) return

      try {
        await orgChartMutations.editOrgChartSeat({
          seatId: opts.seatId,
          supervisorId: opts.newSupervisorSeatId,
        })
      } catch (e) {
        overlazyController.openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to update supervisor'),
          error: new UserActionError(e),
        })
        throw e
      }
    }
  )

  const onDirectReportViewDepthChange = useAction((viewDepth: number) => {
    containerState.directReportsExpandDepth = viewDepth
    containerState.showDirectReportsForSeatsById = getSeatIdsInFirstNLevels(
      getHierarchicalData(),
      viewDepth - 1
    ).reduce(
      (acc, seatId) => {
        acc[seatId] = true
        return acc
      },
      {} as Record<Id, boolean>
    )
  })

  const onCollapseAllDirectReports = useAction(() => {
    containerState.directReportsExpandDepth = 1
    containerState.showDirectReportsForSeatsById = getSeatIdsInFirstNLevels(
      getHierarchicalData(),
      0
    ).reduce(
      (acc, seatId) => {
        acc[seatId] = true
        return acc
      },
      {} as Record<Id, boolean>
    )
  })

  const onExpandAllDirectReports = useAction(() => {
    containerState.directReportsExpandDepth = getMaxDirectReportsExpandDepth()
    containerState.showDirectReportsForSeatsById = getSeatIdsInFirstNLevels(
      getHierarchicalData(),
      getMaxDirectReportsExpandDepth() - 1
    ).reduce(
      (acc, seatId) => {
        acc[seatId] = true
        return acc
      },
      {} as Record<Id, boolean>
    )
  })

  const handleRolesUpdate = useAction(
    async (opts: {
      seatId: Id
      actions: FormValuesForSubmit<
        IEditOrgChartSeatValues,
        true,
        'roles'
      >['roles']
      onListItemCreated: (opts: { itemId: Id; temporaryId: Id }) => void
    }) => {
      const { seatId, actions } = opts

      const promises = actions.map(async (roleRelatedAction) => {
        if (roleRelatedAction.action === 'ADD') {
          const response = await orgChartMutations.createOrgChartPositionRole({
            seatId,
            name: roleRelatedAction.item.name,
          })

          opts.onListItemCreated({
            itemId: response.id,
            temporaryId: roleRelatedAction.item.id,
          })
        } else if (roleRelatedAction.action === 'REMOVE') {
          return orgChartMutations.deleteOrgChartPositionRole({
            roleId: roleRelatedAction.item.id,
          })
        } else if (roleRelatedAction.action === 'UPDATE') {
          return orgChartMutations.editOrgChartPositionRole({
            roleId: roleRelatedAction.item.id,
            name: roleRelatedAction.item.name!,
          })
        } else {
          throw new UnreachableCaseError(roleRelatedAction as never)
        }
      })

      await Promise.allSettled(promises)
    }
  )

  const onEditSeat: IEditOrgChartSeatDrawerActions['onEditSeat'] = useAction(
    async ({ values, onListItemCreated }) => {
      const seatId = containerState.editSeatInfo?.seatId
      if (!seatId) throw Error('No seat being edited')

      const { positionTitle, userIds, supervisorId, roles } = values

      const promises: Array<Promise<void>> = []
      if (roles) {
        promises.push(
          handleRolesUpdate({ seatId, actions: roles, onListItemCreated })
        )
      }

      if (
        [positionTitle, userIds, supervisorId].some(
          (value) => value !== undefined
        )
      ) {
        promises.push(
          orgChartMutations.editOrgChartSeat({
            seatId,
            positionTitle,
            userIds,
            supervisorId,
          })
        )
      }

      try {
        await Promise.all(promises)
      } catch (e) {
        overlazyController.openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to update seat'),
          error: new UserActionError(e),
        })
        throw e
      }

      containerState.hooks?.onSeatEdited?.({
        seatId,
      })
    }
  )

  const onEditSeatDrawerClosed = useAction(() => {
    containerState.editSeatInfo = null
    if (containerState.onEditSeatDrawerClosed) {
      containerState.onEditSeatDrawerClosed()
      containerState.onEditSeatDrawerClosed = null
    }
  })

  const getUserOptions = useComputed(
    (): Array<{ value: Id; metadata: UserOptionMetadata }> => {
      return subscription1().data.users.nodes.map((user) => ({
        value: user.id,
        metadata: user,
      }))
    },
    {
      name: 'OrgChart-getUserOptions',
    }
  )

  const getSupervisorOptions = useComputed(
    () => {
      const seatBeingEdited = containerState.editSeatInfo?.seatId
      const seatBeingDeleted = containerState.confirmSeatDeleteInfo?.seatId

      function getSeatOptions() {
        const seatToExcludeReportsOf = seatBeingEdited || seatBeingDeleted
        if (seatToExcludeReportsOf) {
          const allSeatsUnderThisSeat =
            getComputedAllReportSeatIdsBySupervisorSeatId()[
              seatToExcludeReportsOf
            ]
          return Object.values(getHierarchicalSeatsById()).filter(
            (seat) =>
              seat.id !== seatToExcludeReportsOf &&
              seat.id !== seatBeingEdited &&
              !allSeatsUnderThisSeat?.includes(seat.id)
          )
        } else {
          return Object.values(getHierarchicalSeatsById())
        }
      }

      return getSeatOptions().map((seat) => {
        const firstUserInSeat = seat.users.nodes[0] ?? null

        return {
          value: seat.id,
          metadata: {
            firstUserInSeat,
            positionTitle: seat.position?.title,
            numberOfAdditionalUsersInSeat:
              seat.users.nodes.length > 1 ? seat.users.nodes.length - 1 : 0,
          } as SupervisorInputMetadata,
        }
      })
    },
    {
      name: 'OrgChart-getSupervisorOptions',
    }
  )

  const onHandleCloseDrawerWithUnsavedChangesProtection = useAction(
    ({ onHandleLeaveWithoutSaving }) => {
      overlazyController.openOverlazy('UnsavedChangesModal', {
        onHandleLeaveWithoutSaving,
      })
    }
  )

  const getCreateSeatDrawerData: ICreateOrgChartSeatDrawerProps['getData'] =
    useComputed(
      () => {
        return {
          getUserOptions,
          getSupervisorOptions,
          getInitialSupervisorSeatId: () =>
            containerState.createSeatInfo?.initiallyChosenSupervisorSeatId ??
            null,
        }
      },
      {
        name: 'OrgChart-getCreateSeatDrawerData',
      }
    )

  const getCreateSeatDrawerActions: ICreateOrgChartSeatDrawerProps['getActions'] =
    useComputed(
      () => {
        return {
          onCreateSeat,
          onHandleCloseDrawerWithUnsavedChangesProtection,
          onCreateSeatDrawerClosed: action(() => {
            containerState.createSeatInfo = null
          }),
          onSupervisorChange: action((newSupervisorSeatId: Maybe<Id>) => {
            containerState.hooks?.onSupervisorChangeInDrawer?.({
              newSupervisorSeatId,
            })
          }),
        }
      },
      {
        name: 'OrgChart-getCreateSeatDrawerActions',
      }
    )

  const getEditDrawerData: IEditOrgChartSeatDrawerProps['getData'] =
    useComputed(
      () => {
        const seatId = containerState.editSeatInfo?.seatId
        if (!seatId) throw Error('No seat being edited')

        const seat = getHierarchicalSeatsById()[seatId]
        if (!seat) throw Error('Seat not found')

        return {
          seat,
          getUserOptions,
          getSupervisorOptions,
        }
      },
      {
        name: 'OrgChart-getEditDrawerData',
      }
    )

  const getEditDrawerActions: IEditOrgChartSeatDrawerProps['getActions'] =
    useComputed(
      () => {
        return {
          onEditSeat,
          onEditSeatDrawerClosed,
          onHandleCloseDrawerWithUnsavedChangesProtection,
          onSupervisorChange: action((newSupervisorSeatId: Maybe<Id>) => {
            containerState.hooks?.onSupervisorChangeInDrawer?.({
              newSupervisorSeatId,
            })
          }),
        }
      },
      {
        name: 'OrgChart-getEditDrawerActions',
      }
    )

  const getData = useComputed(
    () => {
      return {
        getSeats: getHierarchicalData,
        directReportsExpandDepth: containerState.directReportsExpandDepth,
        showDirectReportsForSeatsById:
          containerState.showDirectReportsForSeatsById,
        getMaxDirectReportsExpandDepth,
        getSeatBeingEdited: () => containerState.editSeatInfo?.seatId ?? null,
        getSeatBeingCreated: () => containerState.createSeatInfo != null,
        getAllReportSeatIdsBySupervisorSeatId:
          getComputedAllReportSeatIdsBySupervisorSeatId,
        getCurrentUserOrgChartPermissions,
      }
    },
    {
      name: 'OrgChart-getData',
    }
  )

  const onEditSeatRequested = useAction(
    (opts: { seatId: Id; onEditSeatDrawerClosed: () => void }) => {
      containerState.editSeatInfo = {
        seatId: opts.seatId,
      }
      containerState.onEditSeatDrawerClosed = opts.onEditSeatDrawerClosed
      overlazyController.openOverlazy('EditOrgChartSeatDrawer', {
        getData: getEditDrawerData,
        getActions: getEditDrawerActions,
      })
    }
  )

  const onDirectReportCreateRequested = useAction(
    (opts: { supervisorSeatId: Id }) => {
      containerState.hooks?.onSupervisorChangeInDrawer?.({
        newSupervisorSeatId: opts.supervisorSeatId,
      })
      containerState.createSeatInfo = {
        initiallyChosenSupervisorSeatId: opts.supervisorSeatId,
      }
      overlazyController.openOverlazy('CreateOrgChartSeatDrawer', {
        getData: getCreateSeatDrawerData,
        getActions: getCreateSeatDrawerActions,
      })
    }
  )

  const onCreateSeatRequested = useAction(() => {
    containerState.createSeatInfo = {
      initiallyChosenSupervisorSeatId: null,
    }
    overlazyController.openOverlazy('CreateOrgChartSeatDrawer', {
      getData: getCreateSeatDrawerData,
      getActions: getCreateSeatDrawerActions,
    })
  })

  const onCreateSeat: ICreateOrgChartSeatDrawerActions['onCreateSeat'] =
    useAction(async ({ values }) => {
      try {
        await orgChartMutations.createOrgChartSeat({
          positionTitle: values.positionTitle,
          roles: values.roles
            .map((role) => role.name)
            .filter((role) => role !== ''),
          userIds: values.userIds,
          supervisorId: values.supervisorSeatId,
        })

        if (values.createAnotherCheckedInDrawer) {
          setTimeout(onCreateSeatRequested)
        }
      } catch (e) {
        overlazyController.openOverlazy('Toast', {
          type: 'error',
          text: t('Failed to create seat'),
          error: new UserActionError(e),
        })
      }

      // @TODO bring back animation?
      // Need seat id in mutation, and a way to handle the delay between the mutation and the new seat appearing via subscription
      // containerState.hooks?.onSeatCreated?.({
      //   newSeatId: newSeat.id,
      // })
    })

  const getConfirmDeleteOrgChartSeatModalData = useComputed(
    () => {
      const confirmSeatDeleteInfo = containerState.confirmSeatDeleteInfo
      if (!confirmSeatDeleteInfo) throw Error('No seat to delete')

      return {
        seat: getHierarchicalSeatsById()[confirmSeatDeleteInfo.seatId],
        getSupervisorOptions,
        initialSupervisorSeatIdSuggestion:
          confirmSeatDeleteInfo.initialSupervisorSeatIdSuggestion,
      }
    },
    {
      name: 'OrgChart-getConfirmDeleteOrgChartSeatModalData',
    }
  )

  const onDeleteSeat = useAction(async () => {
    const seatIdBeingDeleted = containerState.confirmSeatDeleteInfo?.seatId

    try {
      if (!seatIdBeingDeleted) throw Error('No seat to delete')

      await orgChartMutations.deleteOrgChartSeat({
        seatId: seatIdBeingDeleted,
      })
    } catch (e) {
      overlazyController.openOverlazy('Toast', {
        type: 'error',
        text: t('Failed to delete seat'),
        error: new UserActionError(e),
      })

      throw e
    }

    containerState.hooks?.onSeatDeleted?.({
      deletedSeatId: seatIdBeingDeleted,
      directReportSeatIds: null,
    })
  })

  const getConfirmDeleteOrgChartSeatModalActions = useComputed(
    () => {
      return {
        onDeleteSeat,
        onDirectReportsAcquired: action(() => {
          // if a seat has direct reports, we can't delete it
          overlazyController.closeOverlazy({
            type: 'Modal',
            name: 'ConfirmDeleteOrgChartSeatModal',
          })

          overlazyController.openOverlazy(
            'WarnCantDeleteSeatsWithDirectReportsModal',
            {
              getData: getConfirmDeleteOrgChartSeatModalData,
            }
          )
        }),
      }
    },
    {
      name: 'OrgChart-getConfirmDeleteOrgChartSeatModalActions',
    }
  )

  const onDeleteSeatRequested = useAction(({ seatId }: { seatId: Id }) => {
    const seat = getHierarchicalSeatsById()[seatId]

    containerState.confirmSeatDeleteInfo = {
      seatId,
      initialSupervisorSeatIdSuggestion: seat.supervisor?.id ?? null,
    }

    if (seat.directReports?.length) {
      overlazyController.openOverlazy(
        'WarnCantDeleteSeatsWithDirectReportsModal',
        {
          getData: getConfirmDeleteOrgChartSeatModalData,
        }
      )
      return
    } else {
      overlazyController.openOverlazy('ConfirmDeleteOrgChartSeatModal', {
        getData: getConfirmDeleteOrgChartSeatModalData,
        getActions: getConfirmDeleteOrgChartSeatModalActions,
      })
    }
  })

  const getActions = useComputed(
    () => {
      return {
        expandSeatDirectReportsById,
        collapseSeatDirectReportsById,
        onUpdateSeatSupervisor,
        onCollapseAllDirectReports,
        onExpandAllDirectReports,
        onDirectReportViewDepthChange,
        onEditSeatRequested,
        onDirectReportCreateRequested,
        onCreateSeatRequested,
        onCreateSeat,
        onDeleteSeatRequested,
        setHooks: action((hooks: OrgChartContainerHooks) => {
          containerState.hooks = hooks
        }),
      }
    },
    {
      name: 'OrgChart-getActions',
    }
  )

  return <props.children getData={getData} getActions={getActions} />
})
