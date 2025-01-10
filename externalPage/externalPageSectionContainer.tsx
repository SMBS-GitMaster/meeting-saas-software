import { observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'

import { queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomMeetingMutations,
  useBloomMeetingNode,
  useBloomMeetingPageNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useMeetingIdUrlParamGuard } from '@mm/core-web/router'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { getExternalPageSectionPermissions } from './externalPageSectionPermissions'
import {
  IExternalPageSectionActions,
  IExternalPageSectionContainerProps,
} from './externalPageSectionTypes'
import { ExternalPageSectionView } from './externalPageSectionView'

export const ExternalPageSectionContainer = observer(
  function ExternalPageSectionContainer(
    props: IExternalPageSectionContainerProps
  ) {
    const { iframeEmbedCheck, editMeetingPage } = useBloomMeetingMutations()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()
    const { meetingId } = useMeetingIdUrlParamGuard({ meetingIdViaProps: null })

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id }) => ({
            id,
          }),
        }),
        externalPage: queryDefinition({
          def: useBloomMeetingPageNode(),
          map: ({ id, externalPageUrl, pageName }) => ({
            id,
            externalPageUrl,
            pageName,
          }),
          target: {
            id: props.meetingPageId,
          },
        }),
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ currentMeetingAttendee }) => ({
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
          }),
          target: { id: meetingId },
        }),
      },
      {
        subscriptionId: `ExternalPageSectionContainer-${props.meetingPageId}`,
      }
    )

    const currentUserPermissions = useMemo(() => {
      return getExternalPageSectionPermissions(
        subscription().data.meeting?.currentMeetingAttendee.permissions ?? null
      )
    }, [subscription().data.meeting?.currentMeetingAttendee.permissions])

    const onCheckIfUrlIsEmbeddable: IExternalPageSectionActions['onCheckIfUrlIsEmbeddable'] =
      useCallback(
        async (urlToEmbed: string) => {
          try {
            const response = await iframeEmbedCheck({ url: urlToEmbed })
            return response.iframeEmbedCheck
          } catch (e) {
            return false
          }
        },
        [iframeEmbedCheck]
      )

    const onUpdateExternalLink: IExternalPageSectionActions['onUpdateExternalLink'] =
      useCallback(
        async (values) => {
          try {
            await editMeetingPage({
              meetingPageId: props.meetingPageId,
              externalPageUrl: values.url || '',
            })
          } catch (error) {
            openOverlazy('Toast', {
              type: 'error',
              text: t('Issue updating the external page'),
              error: new UserActionError(error),
            })
          }
        },
        [props.meetingPageId, editMeetingPage, openOverlazy, t]
      )

    return (
      <ExternalPageSectionView
        data={{
          currentUserPermissions,
          page: subscription().data.externalPage,
          isLoading: subscription().querying,
        }}
        actions={{
          onUpdateExternalLink,
          onCheckIfUrlIsEmbeddable,
        }}
      />
    )
  }
)
