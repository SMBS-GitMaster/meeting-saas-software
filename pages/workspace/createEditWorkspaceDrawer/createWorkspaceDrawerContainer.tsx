import { observer } from 'mobx-react'
import React from 'react'

import { useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  type ICreateWorkspaceNodeMutationTileOpt,
  TWorkspaceTileType,
  getUsersMeetingsLookup,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomUserMutations,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useNavigation } from '@mm/core-web/router'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import { paths } from '@mm/bloom-web/router/paths'
import { useEditMeetingsLookupSubscription } from '@mm/bloom-web/shared/hooks/useMeetingsLookupSubscription'

import { CREATE_WORKSPACE_NEW_MEETING_SUB_STATE } from './createWorkspaceDrawerContstants'
import type {
  ICreateWorkspaceDrawerActions,
  ICreateWorkspaceDrawerContainerProps,
  ICreateWorkspaceDrawerState,
} from './createWorkspaceDrawerTypes'

export const CreateWorkspaceDrawerContainer = observer(
  function CreateWorkspaceDrawerContainer(
    props: ICreateWorkspaceDrawerContainerProps
  ) {
    const componentState = useObservable<ICreateWorkspaceDrawerState>({
      PERSONAL: {
        PERSONAL_GOALS: false,
        PERSONAL_TODOS: false,
        PERSONAL_METRICS: false,
        PERSONAL_NOTES: false,
      },
      OTHER: {
        ROLES: false,
        MANAGE: false,
        VALUES: false,
        PROCESSES: false,
        USER_PROFILE: false,
      },
      MEETINGS: [],
    })

    const { createWorkspace } = useBloomWorkspaceMutations()
    const { navigate } = useNavigation()

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
      },
      {
        subscriptionId: `CreateWorkspaceDrawerContainer`,
      }
    )

    const { openOverlazy } = useOverlazyController()

    const { editAuthenticatedUserSettings } = useBloomUserMutations()
    const { t } = useTranslation()

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
        name: 'CreateWorkspaceDrawerContainer-getFilteredMeetingLookup',
      }
    )

    const onPersonalTileClicked: ICreateWorkspaceDrawerActions['onPersonalTileClicked'] =
      useAction((opts) => {
        componentState['PERSONAL'][opts.tileType] =
          !componentState['PERSONAL'][opts.tileType]
      })

    const onOtherTileClicked: ICreateWorkspaceDrawerActions['onOtherTileClicked'] =
      useAction((opts) => {
        componentState['OTHER'][opts.tileType] =
          !componentState['OTHER'][opts.tileType]
      })

    const onMeetingTileClicked: ICreateWorkspaceDrawerActions['onMeetingTileClicked'] =
      useAction((opts) => {
        componentState.MEETINGS = componentState.MEETINGS.map((m) => {
          if (m.meetingId === opts.meetingId) {
            const newBooleanStateForClickedTile = !m.tiles[opts.tileType]
            const newNumTilesSelected = newBooleanStateForClickedTile
              ? m.numTilesSelected + 1
              : m.numTilesSelected - 1

            return {
              ...m,
              numTilesSelected: newNumTilesSelected,
              tiles: {
                ...m.tiles,
                [opts.tileType]: newBooleanStateForClickedTile,
              },
            }
          } else {
            return m
          }
        })
      })

    const onAddMeetingClicked: ICreateWorkspaceDrawerActions['onAddMeetingClicked'] =
      useAction((opts) => {
        componentState.MEETINGS.push({
          ...CREATE_WORKSPACE_NEW_MEETING_SUB_STATE,
          meetingName: opts.meetingLookup.text,
          meetingId: opts.meetingLookup.value,
        })
      })

    const onDeleteMeetingSectionClicked: ICreateWorkspaceDrawerActions['onDeleteMeetingSectionClicked'] =
      useAction((opts) => {
        componentState.MEETINGS = componentState.MEETINGS.filter(
          (m) => m.meetingId !== opts.meetingId
        )
      })

    const onExpandMeetingSectionClicked: ICreateWorkspaceDrawerActions['onExpandMeetingSectionClicked'] =
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

    const onCreateWorkspace: ICreateWorkspaceDrawerActions['onCreateWorkspace'] =
      useAction(async (values) => {
        const selectedTiles: ICreateWorkspaceNodeMutationTileOpt[] = []

        Object.entries(componentState['PERSONAL']).forEach(
          ([tileType, isSelected]) => {
            if (isSelected) {
              selectedTiles.push({
                type: tileType as TWorkspaceTileType,
                meetingId: null,
              })
            }
          }
        )

        Object.entries(componentState['OTHER']).forEach(
          ([tileType, isSelected]) => {
            if (isSelected) {
              selectedTiles.push({
                type: tileType as TWorkspaceTileType,
                meetingId: null,
              })
            }
          }
        )

        componentState['MEETINGS'].forEach((meetingTileState) => {
          if (meetingTileState.numTilesSelected !== 0) {
            Object.entries(meetingTileState.tiles).forEach(
              ([tileType, isSelected]) => {
                if (isSelected) {
                  selectedTiles.push({
                    type: tileType as TWorkspaceTileType,
                    meetingId: meetingTileState.meetingId,
                  })
                }
              }
            )
          }
        })

        try {
          const response = await createWorkspace({
            name: values.title,
            tiles: selectedTiles,
          })

          if (response.length !== 0) {
            const newWorkspaceId = response[0].data.CreateWorkspace.id
            navigate(
              paths.workspace({
                workspaceId: newWorkspaceId,
              })
            )
          }
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('There was an issue creating your workspace'),
            error: new UserActionError(error),
          })
          throw error
        }
      })

    const onHandleChangeDrawerViewSetting: ICreateWorkspaceDrawerActions['onHandleChangeDrawerViewSetting'] =
      useAction(async (drawerView) => {
        await editAuthenticatedUserSettings({ drawerView })
      })

    const onHandleCloseDrawerWithUnsavedChangesProtection: ICreateWorkspaceDrawerActions['onHandleCloseDrawerWithUnsavedChangesProtection'] =
      useAction(({ onHandleLeaveWithoutSaving }) => {
        openOverlazy('UnsavedChangesModal', { onHandleLeaveWithoutSaving })
      })

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
      { name: 'CreateWorkspaceDrawerContainer-getData' }
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
          onCreateWorkspace,
          onHandleChangeDrawerViewSetting,
          onHandleCloseDrawerWithUnsavedChangesProtection,
        }
      },
      { name: 'CreateWorkspaceDrawerContainer-getActions' }
    )

    const CreateWorkspaceDrawerView = props.children
    return <CreateWorkspaceDrawerView data={getData} actions={getActions} />
  }
)
