import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnText,
  Clickable,
  Icon,
  Modal,
  Text,
  UserAvatar,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { IMeetingAgendaViewData } from '../agenda/agendaCardTypes'
import { IMeetingPageViewActionHandlers } from '../meetingPageTypes'

type ChangeLeaderModalProps = {
  meetingAttendees: IMeetingAgendaViewData['meetingAttendees']
  meetingLeader: IMeetingAgendaViewData['currentMeetingLeader']
  meetingInstanceId: Maybe<Id>
  currentPageId: Id
  updateMeetingLeader: IMeetingPageViewActionHandlers['onUpdateMeetingLeader']
}

export const ChangeLeaderModal: React.FC<ChangeLeaderModalProps> = observer(
  function ChangeLeaderModal({
    meetingAttendees,
    meetingLeader,
    meetingInstanceId,
    currentPageId,
    updateMeetingLeader,
  }) {
    const { t } = useTranslation()
    const theme = useTheme()
    const { closeOverlazy } = useOverlazyController()

    const [selectedAttendee, setSelectedAttendee] = useState<{
      id: Id
      fullName: string
      firstName: string
      lastName: string
      avatar: string | null
      userAvatarColor: UserAvatarColorType
      isPresent: boolean
    }>()

    if (!meetingInstanceId || !meetingLeader) {
      return null
    }

    const sortedAttendeesLeaderFirst = meetingAttendees.nodes
      .slice()
      .sort((a, b) => {
        if (a.id === meetingLeader.id) return -1
        if (b.id === meetingLeader.id) return 1
        return 0
      })

    return (
      <Modal
        id={'ChangeLeaderModal'}
        onHide={() =>
          closeOverlazy({ type: 'Modal', name: 'ChangeLeaderModal' })
        }
      >
        <Modal.Header>
          <Text type={'h1'} weight={'semibold'}>
            {t('Change leader')}
          </Text>
        </Modal.Header>
        <Modal.Body>
          {sortedAttendeesLeaderFirst.map((attendee) => {
            const attendeeIsLeader = attendee.id === meetingLeader.id
            return (
              <Clickable
                key={attendee.id}
                clicked={() => {
                  setSelectedAttendee(attendee)
                }}
                css={css`
                  display: flex;
                  width: 100%;
                `}
              >
                <div
                  key={attendee.id}
                  css={css`
                    display: flex;
                    width: 100%;
                    align-items: center;
                    padding: ${theme.sizes.spacing8} 0;
                  `}
                >
                  <UserAvatar
                    size={'s'}
                    avatarUrl={attendee.avatar}
                    firstName={attendee.firstName}
                    lastName={attendee.lastName}
                    userAvatarColor={attendee.userAvatarColor}
                    adornments={
                      attendeeIsLeader ? { leaderCrown: true } : undefined
                    }
                    css={css`
                      padding-right: ${(props) => props.theme.sizes.spacing8};
                    `}
                  />
                  <Text weight='semibold'>{`${attendee.firstName} ${attendee.lastName}`}</Text>
                  {attendeeIsLeader && (
                    <Text
                      type='caption'
                      fontStyle='italic'
                      css={css`
                        padding-left: ${theme.sizes.spacing8};
                      `}
                    >
                      {t('Leader')}
                    </Text>
                  )}
                  {(selectedAttendee?.id === attendee.id ||
                    (!selectedAttendee && attendeeIsLeader)) && (
                    <Icon
                      iconSize={'lg'}
                      iconName={'checkIcon'}
                      css={css`
                        margin-left: auto;
                      `}
                    />
                  )}
                </div>
              </Clickable>
            )
          })}
        </Modal.Body>
        <Modal.Footer>
          <BtnText
            onClick={() => {
              closeOverlazy({ type: 'Modal', name: 'ChangeLeaderModal' })
            }}
            intent={'tertiaryTransparent'}
            ariaLabel={t('cancel')}
            css={css`
              margin-right: ${theme.sizes.spacing8};
            `}
          >
            {t('Cancel')}
          </BtnText>
          <BtnText
            intent='primary'
            disabled={
              !selectedAttendee || selectedAttendee.id === meetingLeader.id
            }
            ariaLabel={t('Change leader')}
            width={'medium'}
            onClick={() => {
              updateMeetingLeader({
                meetingInstanceId: meetingInstanceId,
                newLeaderId: selectedAttendee?.id || meetingLeader.id,
                currentPageId,
              })
              closeOverlazy({ type: 'Modal', name: 'ChangeLeaderModal' })
            }}
          >
            {t('Change leader')}
          </BtnText>
        </Modal.Footer>
      </Modal>
    )
  }
)

export default ChangeLeaderModal
