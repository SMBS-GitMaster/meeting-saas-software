import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  type TEditWorkspaceBloomNodeTileOpt,
  type TWorkspaceTileType,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomWorkspaceMutations,
  useBloomWorkspaceNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import {
  isStringMeetingTile,
  isStringOtherTile,
  isStringPersonalTile,
} from './createEditWorkspaceDrawerSharedHelpers'
import { EDIT_WORKSPACE_NEW_MEETING_SUB_STATE } from './editWorkspaceDrawerConstants'
import type {
  IEditWorkspaceDrawerActions,
  IEditWorkspaceDrawerContainerProps,
} from './editWorkspaceDrawerTypes'
import type {
  IEditWorkspaceDrawerMeetingSubState,
  IEditWorkspaceDrawerState,
} from './editWorkspaceDrawerTypes'

export const EditWorkspaceDrawerContainer = observer(
  function EditWorkspaceDrawerContainer(
    props: IEditWorkspaceDrawerContainerProps
  ) {
    const componentState = useObservable<IEditWorkspaceDrawerState>({
      PERSONAL: {
        PERSONAL_GOALS: { tileId: null, isSelected: false },
        PERSONAL_TODOS: { tileId: null, isSelected: false },
        PERSONAL_METRICS: { tileId: null, isSelected: false },
        PERSONAL_NOTES: { tileId: null, isSelected: false },
      },
      OTHER: {
        ROLES: { tileId: null, isSelected: false },
        MANAGE: { tileId: null, isSelected: false },
        VALUES: { tileId: null, isSelected: false },
        PROCESSES: { tileId: null, isSelected: false },
        USER_PROFILE: { tileId: null, isSelected: false },
      },
      MEETINGS: [],
    })

    const { openOverlazy } = useOverlazyController()

    const { editWorkspace } = useBloomWorkspaceMutations()
    const { t } = useTranslation()

    const meetingsLookupSubscription = useEditMeetingsLookupSubscription()

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id, orgSettings }) => ({
            id,
            orgSettings: orgSettings({
              map: ({ id, isCoreProcessEnabled }) => ({
                id,
                isCoreProcessEnabled,
              }),
            }),
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
        workspace: queryDefinition({
          def: useBloomWorkspaceNode(),
          map: ({ id, tiles }) => ({
            id,
            tiles: tiles({
              map: ({ id, tileType, meetingId }) => ({
                id,
                tileType,
                meetingId,
              }),
            }),
          }),
          target: { id: props.workspaceId },
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `EditWorkspaceDrawerContainer-${props.workspaceId}`,
      }
    )

    const getFilteredMeetingLookup = useComputed(
      () => {
        const selectedMeetingIds = componentState.MEETINGS.map(
          (m) => m.meetingId
        )
        const meetings = getUsersMeetingsLookup({
          meetings: meetingsLookupSubscription().data.user?.meetings.nodes,
          includePersonalMeeting: false,
        })

        return meetings
          .map((m) => {
            return {
              ...m,
              isSelected: selectedMeetingIds.some(
                (smId) => Number(smId) === Number(m.value)
              ),
            }
          })
          .sort((a, b) => a.text.localeCompare(b.text))
      },
      {
        name: `EditWorkspaceDrawerContainer-${props.workspaceId}-getFilteredMeetingLookup`,
      }
    )

    const setSelectedTileState = useAction(() => {
      const allTiles = subscription().data.workspace?.tiles.nodes

      const meetingTilesByMeetingId: Record<
        Id,
        IEditWorkspaceDrawerMeetingSubState
      > = {}

      if (allTiles) {
        allTiles.forEach((tile) => {
          if (isStringPersonalTile(tile.tileType)) {
            componentState['PERSONAL'][tile.tileType] = {
              tileId: tile.id,
              isSelected: true,
            }
          }

          if (isStringOtherTile(tile.tileType)) {
            componentState['OTHER'][tile.tileType] = {
              tileId: tile.id,
              isSelected: true,
            }
          }

          if (isStringMeetingTile(tile.tileType) && tile.meetingId) {
            if (tile.meetingId in meetingTilesByMeetingId) {
              meetingTilesByMeetingId[tile.meetingId]['tiles'][tile.tileType] =
                {
                  tileId: tile.id,
                  isSelected: true,
                }
              meetingTilesByMeetingId[tile.meetingId]['numTilesSelected'] += 1
            } else {
              const meetingLookup =
                meetingsLookupSubscription().data.user?.meetings.nodes.find(
                  (lu) => lu.id === tile.meetingId
                )

              meetingTilesByMeetingId[tile.meetingId] = {
                meetingId: tile.meetingId,
                meetingName: meetingLookup?.name ?? '',
                numTilesSelected: 1,
                isExpanded: false,
                tiles: {
                  ...EDIT_WORKSPACE_NEW_MEETING_SUB_STATE.tiles,
                  [tile.tileType]: { tileId: tile.id, isSelected: true },
                },
              }
            }
          }
        })

        componentState['MEETINGS'] = [...Object.values(meetingTilesByMeetingId)]
      }
    })

    const onPersonalTileClicked: IEditWorkspaceDrawerActions['onPersonalTileClicked'] =
      useAction((opts) => {
        componentState['PERSONAL'][opts.tileType]['isSelected'] =
          !componentState['PERSONAL'][opts.tileType]['isSelected']
      })

    const onOtherTileClicked: IEditWorkspaceDrawerActions['onOtherTileClicked'] =
      useAction((opts) => {
        componentState['OTHER'][opts.tileType]['isSelected'] =
          !componentState['OTHER'][opts.tileType]['isSelected']
      })

    const onMeetingTileClicked: IEditWorkspaceDrawerActions['onMeetingTileClicked'] =
      useAction((opts) => {
        componentState.MEETINGS = componentState.MEETINGS.map((m) => {
          if (m.meetingId === opts.meetingId) {
            const newBooleanStateForClickedTile =
              !m.tiles[opts.tileType].isSelected
            const newNumTilesSelected = newBooleanStateForClickedTile
              ? m.numTilesSelected + 1
              : m.numTilesSelected - 1

            return {
              ...m,
              numTilesSelected: newNumTilesSelected,
              tiles: {
                ...m.tiles,
                [opts.tileType]: {
                  ...m.tiles[opts.tileType],
                  isSelected: newBooleanStateForClickedTile,
                },
              },
            }
          } else {
            return m
          }
        })
      })

    const onAddMeetingClicked: IEditWorkspaceDrawerActions['onAddMeetingClicked'] =
      useAction((opts) => {
        componentState.MEETINGS.push({
          ...EDIT_WORKSPACE_NEW_MEETING_SUB_STATE,
          meetingName: opts.meetingLookup.text,
          meetingId: opts.meetingLookup.value,
        })
      })

    const onDeleteMeetingSectionClicked: IEditWorkspaceDrawerActions['onDeleteMeetingSectionClicked'] =
      useAction((opts) => {
        componentState.MEETINGS = componentState.MEETINGS.filter(
          (m) => m.meetingId !== opts.meetingId
        )
      })

    const onExpandMeetingSectionClicked: IEditWorkspaceDrawerActions['onExpandMeetingSectionClicked'] =
      useAction((opts) => {
        componentState.MEETINGS = componentState.MEETINGS.map((m) => {
          if (m.meetingId === opts.meetingId) {
            return {
              ...m,
              isExpanded: !m.isExpanded,
            }
          }
          return m
        })
      })

    const onUpdateWorkspace: IEditWorkspaceDrawerActions['onUpdateWorkspace'] =
      useAction(async () => {
        const workspaceId = subscription().data.workspace?.id

        if (workspaceId) {
          try {
            const tilesToSave: TEditWorkspaceBloomNodeTileOpt[] = []

            Object.entries(componentState.PERSONAL).forEach(
              ([tileType, tileOpts]) => {
                if (tileOpts.isSelected) {
                  const tile: TEditWorkspaceBloomNodeTileOpt = {
                    id: tileOpts.tileId,
                    type: tileType as TWorkspaceTileType,
                    meetingId: null,
                  }
                  tilesToSave.push(tile)
                }
              }
            )

            Object.entries(componentState.OTHER).forEach(
              ([tileType, tileOpts]) => {
                if (tileOpts.isSelected) {
                  const tile: TEditWorkspaceBloomNodeTileOpt = {
                    id: tileOpts.tileId,
                    type: tileType as TWorkspaceTileType,
                    meetingId: null,
                  }
                  tilesToSave.push(tile)
                }
              }
            )

            componentState.MEETINGS.forEach((m) => {
              Object.entries(m.tiles).forEach(([tileType, tileOpts]) => {
                if (tileOpts.isSelected) {
                  const tile: TEditWorkspaceBloomNodeTileOpt = {
                    id: tileOpts.tileId,
                    type: tileType as TWorkspaceTileType,
                    meetingId: m.meetingId,
                  }
                  tilesToSave.push(tile)
                }
              })
            })

            await editWorkspace({
              workspaceId: workspaceId,
              tiles: tilesToSave,
            })
            openOverlazy('Toast', {
              type: 'success',
              text: t('Workspace updated'),
              undoClicked: () =>
                console.log(
                  '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
                ),
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t('There was an issue editing your workspace'),
              error: new UserActionError(error),
            })
            throw error
          }
        }
      })

    useEffect(() => {
      if (!meetingsLookupSubscription().querying && !subscription().querying) {
        setSelectedTileState()
      }
    }, [meetingsLookupSubscription().querying, subscription().querying])

    const getData = useComputed(
      () => {
        const isCoreProcessEnabled =
          subscription().data.currentUser?.orgSettings.isCoreProcessEnabled ??
          false

        return {
          isLoading:
            meetingsLookupSubscription().querying || subscription().querying,
          componentState,
          isCoreProcessEnabled,
          meetingLookup: getFilteredMeetingLookup(),
        }
      },
      { name: 'EditWorkspaceDrawerContainer-getData' }
    )

    const getActions = useComputed(
      () => {
        return {
          onPersonalTileClicked,
          onOtherTileClicked,
          onMeetingTileClicked,
          onAddMeetingClicked,
          onDeleteMeetingSectionClicked,
          onExpandMeetingSectionClicked,
          onUpdateWorkspace,
        }
      },
      { name: 'EditWorkspaceDrawerContainer-getActions' }
    )

    const EditWorkspaceDrawerView = props.children
    return <EditWorkspaceDrawerView data={getData} actions={getActions} />
  }
)
