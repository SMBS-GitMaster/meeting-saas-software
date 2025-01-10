import { observer } from 'mobx-react'
import React from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomUserNode,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction, useComputed } from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'

import type {
  IUserProfileTileContainerProps,
  IUserProfileTileViewActions,
} from './userProfileTileTypes'

export const UserProfileTileContainer = observer(
  function UserProfileTileContainer(props: IUserProfileTileContainerProps) {
    const authenticatedBloomUserNode = useAuthenticatedBloomUserQueryDefinition
    const userNode = useBloomUserNode()
    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { openOverlazy } = useOverlazyController()
    const { t } = useTranslation()

    const isExpandedInWorkspace =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const subscription = useSubscription(
      {
        user: props.userId
          ? queryDefinition({
              def: userNode,
              target: { id: props.userId },
              map: ({
                id,
                firstName,
                lastName,
                profilePictureUrl,
                userAvatarColor,
              }) => ({
                id,
                firstName,
                lastName,
                profilePictureUrl,
                userAvatarColor,
              }),
            })
          : authenticatedBloomUserNode({
              map: ({
                id,
                firstName,
                lastName,
                profilePictureUrl,
                userAvatarColor,
              }) => ({
                id,
                firstName,
                lastName,
                profilePictureUrl,
                userAvatarColor,
              }),
            }),
      },
      {
        subscriptionId: `UserProfileTileContainer-${props.workspaceTileId}`,
      }
    )

    const onDeleteTile: IUserProfileTileViewActions['onDeleteTile'] = useAction(
      async () => {
        try {
          await editWorkspaceTile({
            id: props.workspaceTileId,
            meetingId: null,
            archived: true,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue deleting the tile`),
            error: new UserActionError(error),
          })
          throw error
        }
      }
    )

    const getData = useComputed(
      () => {
        const user = subscription().data.user
        return {
          workspaceTileId: props.workspaceTileId,
          isExpandedInWorkspace,
          isCurrentUser: props.userId === null,
          user: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            profilePictureUrl: user?.profilePictureUrl ?? '',
            userAvatarColor: user?.userAvatarColor ?? 'COLOR1',
          },
        }
      },
      {
        name: `UserProfileTileContainer-getData`,
      }
    )

    const getActions = useComputed(
      () => ({
        onDeleteTile,
      }),
      {
        name: `UserProfileTileContainer-getActions`,
      }
    )

    const UserProfileTileView = (
      <props.children
        className={props.className}
        getData={getData}
        getActions={getActions}
      />
    )

    if (isExpandedInWorkspace) {
      return (
        <WorkspaceFullScreenTilePortal>
          {UserProfileTileView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return UserProfileTileView
    }
  }
)
