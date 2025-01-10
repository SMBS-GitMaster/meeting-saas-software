import { observer } from 'mobx-react'
import React from 'react'

import { useSubscription } from '@mm/gql'

import {
  RoutingException,
  RoutingExceptionType,
} from '@mm/core/exceptions/routing'

import { useAuthenticatedBloomUserQueryDefinition } from '@mm/core-bloom'

import { useCurrentRoute } from '@mm/core-web/router'

import { type TMeetingTab } from '@mm/bloom-web/pages/meetings'
import { useComputed } from '@mm/bloom-web/pages/performance/mobx'

import { useAction, useObservable } from '../performance/mobx'
import {
  IQuarterlyAlignmentPageActions,
  IQuarterlyAlignmentPageContainerProps,
  IQuarterlyAlignmentPageState,
  IQuarterlytAlignmentPageData,
} from './quarterlyAlignmentPageTypes'

export const QuarterlyAlignmentPageContainer = observer(
  function QuarterlyAlignmentPageContainer(
    props: IQuarterlyAlignmentPageContainerProps
  ) {
    const getCurrentRoute = useCurrentRoute<
      Record<string, unknown>,
      { meetingId: string; tab: TMeetingTab }
    >()

    const pageState = useObservable<IQuarterlyAlignmentPageState>({
      activeTab: getCurrentRoute().urlParams?.tab ?? 'WORKSPACE',
    })

    const meetingId =
      Number(getCurrentRoute().urlParams.meetingId) ||
      getCurrentRoute().urlParams.meetingId

    if (!meetingId) {
      throw new RoutingException({
        type: RoutingExceptionType.InvalidParams,
        description: 'No meetingId id found in the url params',
      })
    }

    // @BLOOM_QA_TODO: this is hardcoded, we want the alignementUserId to be the user that is getting aligned.
    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id }) => ({
            id,
          }),
          useSubOpts: {
            doNotSuspend: true,
          },
        }),
      },
      {
        subscriptionId: `QuarterlyAlignmentPageContainer`,
      }
    )

    const onSetActiveTab: IQuarterlyAlignmentPageActions['onSetActiveTab'] =
      useAction((newTab) => {
        pageState.activeTab = newTab
      })

    const getData = useComputed(
      () => {
        const data: IQuarterlytAlignmentPageData = {
          pageState,
          meetingId,
          alignmentUser: subscription().data.currentUser,
        }
        return data
      },
      {
        name: `QuarterlyAlignmentPageContainer-getData`,
      }
    )

    const getActions = useComputed(
      () => {
        const actions: IQuarterlyAlignmentPageActions = {
          onSetActiveTab,
        }
        return actions
      },
      {
        name: `QuarterlyAlignmentPageContainer-getActions`,
      }
    )

    return <props.children data={getData} actions={getActions} />
  }
)
