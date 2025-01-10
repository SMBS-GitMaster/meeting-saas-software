import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

import { queryDefinition, useSubscription } from '@mm/gql'

import { useBloomMeetingNode } from '@mm/core-bloom'

import { useCurrentRoute } from '@mm/core-web/router'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { useBloomPostMessage } from '@mm/bloom-web/shared/hooks/useBloomPostMessage'

import { ISSUE_VOTING } from './bloomStarVotingModalTypes'

export const BloomStarVotingModalPageContainer = observer(
  function BloomStarVotingModalPageContainer() {
    const { openOverlazy, closeOverlazy } = useOverlazyController()

    const { sendMessage } = useBloomPostMessage()

    const getCurrentRoute = useCurrentRoute<
      Record<string, unknown>,
      { meetingId: string }
    >()
    const meetingId =
      Number(getCurrentRoute().urlParams.meetingId) ||
      getCurrentRoute().urlParams.meetingId

    const subscription = useSubscription(
      {
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          map: ({ name, issueVoting, attendees, currentMeetingInstance }) => ({
            name,
            issueVoting,
            attendees: attendees({
              map: ({
                id,
                firstName,
                lastName,
                fullName,
                avatar,
                isUsingV3,
                isPresent,
                permissions,
                user,
              }) => ({
                id,
                firstName,
                lastName,
                fullName,
                isUsingV3,
                avatar,
                isPresent,
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
                user: user({
                  map: ({ id }) => ({ id }),
                }),
              }),
            }),
            currentMeetingInstance: currentMeetingInstance({
              map: ({ isPaused, leaderId, issueVotingHasEnded }) => ({
                isPaused,
                leaderId,
                issueVotingHasEnded,
              }),
            }),
          }),
          target: {
            id: meetingId,
            allowNullResult: true,
          },
        }),
      },
      {
        subscriptionId: `BloomStarVotingModalPageContainer-${meetingId}`,
      }
    )

    useEffect(() => {
      const { meeting } = subscription().data
      const currentMeetingInstance = meeting?.currentMeetingInstance

      const isLeaderInV3 = meeting?.attendees.nodes.find(
        (item) => item.id === currentMeetingInstance?.leaderId
      )?.isUsingV3

      if (
        meeting?.issueVoting === ISSUE_VOTING.STAR &&
        currentMeetingInstance &&
        isLeaderInV3 &&
        !currentMeetingInstance?.issueVotingHasEnded
      ) {
        sendMessage({
          popup: 'starVotingModal',
          isOpen: true,
        })
        openOverlazy('BloomStarVotingModal', { isAutoOpened: false, meetingId })
      } else {
        sendMessage({
          popup: 'starVotingModal',
          isOpen: false,
        })
        closeOverlazy({
          type: 'Modal',
          name: 'BloomStarVotingModal',
        })
      }
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [
      subscription().data.meeting?.currentMeetingInstance?.leaderId,
      subscription().data.meeting?.issueVoting,
      subscription().data.meeting?.currentMeetingInstance?.issueVotingHasEnded,
    ])

    return (
      <>
        <Helmet
          style={[
            {
              cssText: `
            body{
              background-color: transparent;
            }
            [class^="StyledPageContainer"] {
                background-color: transparent;
            }
        `,
            },
          ]}
        />
      </>
    )
  }
)
