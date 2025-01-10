import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  Clickable,
  Icon,
  Menu,
  Text,
  Tooltip,
  UserAvatar,
  toREM,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { IMeetingPageViewActionHandlers } from '../meetingPageTypes'
import { IMeetingAgendaViewData } from './agendaCardTypes'

export interface IMeetingAgendaFollowLeaderProps {
  currentUserId: Id
  currentMeetingLeader: IMeetingAgendaViewData['currentMeetingLeader']
  meetingAttendees: IMeetingAgendaViewData['meetingAttendees']
  currentUserPermissions: IMeetingAgendaViewData['currentUser']['permissions']
  followLeader: boolean
  collapsedView: boolean
  meetingInstanceId: Maybe<Id>
  currentPageId: Id
  currentUserIsAdmin: boolean
  setFollowLeader: (isFollowing: boolean) => void
  pauseMeeting?: () => void
  updateMeetingLeader: IMeetingPageViewActionHandlers['onUpdateMeetingLeader']
}

export const MeetingAgendaFollowLeader = observer(
  function MeetingAgendaFollowLeader(props: IMeetingAgendaFollowLeaderProps) {
    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()
    const [meetingPaused, setMeetingPaused] = React.useState(false)
    const [openNonAdminChangeLeaderMenu, setOpenNonAdminChangeLeaderMenu] =
      React.useState<boolean>(false)

    const currentUserIsLeader =
      props.currentMeetingLeader?.id === props.currentUserId

    const handleOpenNonAdminChangeLeader = () => {
      setOpenNonAdminChangeLeaderMenu(true)
    }

    const handleCloseNonAdminChangeLeaderMenu = () => {
      setOpenNonAdminChangeLeaderMenu(false)
    }

    const handleClickOnUserAvatar = useCallback(() => {
      if (
        props.currentUserIsAdmin ||
        props.currentUserPermissions.currentUserIsMeetingAdmin
      ) {
        openOverlazy('ChangeLeaderModal', {
          meetingAttendees: props.meetingAttendees,
          meetingLeader: props.currentMeetingLeader,
          meetingInstanceId: props.meetingInstanceId,
          currentPageId: props.currentPageId,
          updateMeetingLeader: props.updateMeetingLeader,
        })
      } else if (!props.currentUserIsAdmin && !currentUserIsLeader) {
        handleOpenNonAdminChangeLeader()
      }
    }, [props])

    if (props.currentMeetingLeader == null) {
      return null
    }

    const ClickableUserAvatar = (
      <Clickable clicked={handleClickOnUserAvatar}>
        <UserAvatar
          size={props.collapsedView ? 's' : 'm'}
          avatarUrl={props.currentMeetingLeader.avatar}
          firstName={props.currentMeetingLeader.firstName}
          lastName={props.currentMeetingLeader.lastName}
          userAvatarColor={props.currentMeetingLeader.userAvatarColor}
          adornments={{ leaderCrown: true }}
          css={css`
            padding-left: ${(props) => props.theme.sizes.spacing8};
          `}
        />
      </Clickable>
    )

    const leaderView = (
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        {!props.currentUserIsAdmin &&
        !props.currentUserPermissions.currentUserIsMeetingAdmin ? (
          <>
            <Text>{t('You are the leader')}</Text>
            <Tooltip
              position='left center'
              msg={t(
                'Need to change leader? Ask one of your teammates to become the leader.'
              )}
            >
              {ClickableUserAvatar}
            </Tooltip>
          </>
        ) : props.collapsedView ? (
          <BtnText
            fontWeight='bold'
            type='button'
            height='medium'
            intent='tertiary'
            ariaLabel={t('Pause and resume meeting')}
            disabled={true}
            tooltip={{
              msg: t('Coming soon!'),
              position: 'top center',
            }}
            onClick={() => {
              setMeetingPaused(!meetingPaused)
              props.pauseMeeting
            }}
          >
            {meetingPaused ? t('Resume meeting') : t('Pause meeting')}
          </BtnText>
        ) : (
          <>
            <Text>{t('You are the leader')}</Text>
            {ClickableUserAvatar}
          </>
        )}
      </div>
    )

    const followerView = (
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <BtnIcon
          css={css`
            padding-right: ${(props) => props.theme.sizes.spacing8};
            padding-top: ${(props) => props.theme.sizes.spacing4};
          `}
          iconProps={{
            iconName: props.followLeader
              ? 'toggleOnEnabled'
              : 'toggleOffEnabled',
          }}
          size='lg'
          intent='tertiaryTransparent'
          ariaLabel={t('Follow Leader')}
          tag='button'
          tooltip={{
            msg: props.followLeader
              ? t("Turn this feature off to stop mirroring the leader's agenda")
              : t(
                  "Turn this feature on to start mirroring the leader's agenda"
                ),
            position: 'top center',
            offset: `${toREM(-10)}`,
            type: 'light',
          }}
          onClick={() => props.setFollowLeader(!props.followLeader)}
        />
        <Text type='body' weight='semibold'>
          {t('Follow leader')}
        </Text>

        {!props.currentUserIsAdmin && !currentUserIsLeader ? (
          <>
            <Menu
              position='left center'
              isOpen={openNonAdminChangeLeaderMenu}
              margin={toREM(20)}
              offset={toREM(5)}
              onClose={handleCloseNonAdminChangeLeaderMenu}
              content={(close) => (
                <Menu.Item
                  onClick={async (e) => {
                    await props.updateMeetingLeader({
                      meetingInstanceId: props.meetingInstanceId
                        ? props.meetingInstanceId
                        : '',
                      newLeaderId: props.currentUserId,
                      currentPageId: props.currentPageId,
                    })
                    close(e)
                    handleCloseNonAdminChangeLeaderMenu()
                  }}
                >
                  <Icon iconName={'crownIcon'} iconSize={'lg'} />
                  <Text
                    type={'body'}
                    css={css`
                      white-space: nowrap;
                      margin-top: ${toREM(2)};
                      margin-left: ${(props) => props.theme.sizes.spacing4};
                    `}
                  >
                    {'Make myself meeting leader'}
                  </Text>
                </Menu.Item>
              )}
            >
              {ClickableUserAvatar}
            </Menu>
          </>
        ) : (
          <>{ClickableUserAvatar}</>
        )}
      </div>
    )
    if (currentUserIsLeader) {
      return <>{leaderView}</>
    }
    return <>{followerView}</>
  }
)
