import { observer } from 'mobx-react'
import React from 'react'

import { useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import { useBloomUserMutations } from '@mm/core-bloom'
import { useAuthenticatedBloomUserQueryDefinition } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useAction, useComputed } from '@mm/bloom-web/pages/performance/mobx'

import type {
  IHomePageContainerProps,
  IHomePageViewActions,
  IHomePageViewData,
} from './homePageTypes'

export const HomePageContainer = observer(function HomePageContainer(
  props: IHomePageContainerProps
) {
  const { editAuthenticatedUserSettings } = useBloomUserMutations()
  const { openOverlazy } = useOverlazyController()
  const { t } = useTranslation()

  const homePageSubscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ settings }) => ({
          settings,
        }),
      }),
    },
    {
      subscriptionId: `HomePageContainer`,
    }
  )

  const onSetPrimaryWorkspace: IHomePageViewActions['onSetPrimaryWorkspace'] =
    useAction(async (opts) => {
      try {
        await editAuthenticatedUserSettings({
          workspaceHomeType: opts.workspaceType,
          workspaceHomeId: opts.meetingOrWorkspaceId,
        })
        openOverlazy('Toast', {
          type: 'success',
          text: t(`Primary workspace set`),
          undoClicked: () => null,
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t(`There was an issue setting your primary workspace`),
          error: new UserActionError(error),
        })
      }
    })

  const getData = useComputed(
    () => {
      const currentUserSettings =
        homePageSubscription().data.currentUser.settings

      const data: IHomePageViewData = {
        workspaceHomeId: currentUserSettings.workspaceHomeId,
        workspaceHomeType: currentUserSettings.workspaceHomeType,
      }
      return data
    },
    { name: 'HomePageContainer-getData' }
  )

  const getActions = useComputed(
    () => {
      const actions: IHomePageViewActions = {
        onSetPrimaryWorkspace,
      }
      return actions
    },
    { name: 'HomePageContainer-getActions' }
  )

  return <props.children data={getData} actions={getActions} />
})
