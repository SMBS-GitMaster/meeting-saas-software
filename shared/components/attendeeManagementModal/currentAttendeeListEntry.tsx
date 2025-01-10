import React, { useMemo } from 'react'
import styled, { css } from 'styled-components'

import { getCanNominateNewMeetingLeaderInMeeting } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { Icon, Menu, Text, UserAvatar, toREM, useTheme } from '@mm/core-web/ui'

import { ICurrentAttendeeListEntryProps } from './attendeeManagmentTypes'

export const CurrentAttendeeListEntry = React.memo(
  function CurrentAttendeeListEntry(props: ICurrentAttendeeListEntryProps) {
    const { t } = useTranslation()
    const theme = useTheme()

    const [isOpen, setIsOpen] = React.useState<boolean>(false)

    const canNominateMeetingLeader = useMemo(() => {
      return getCanNominateNewMeetingLeaderInMeeting({
        currentUserPermissions: props.currentUserPermissions,
        isAttendeeForCurrentUser: props.currentUserId === props.attendee.id,
      })
    }, [props.currentUserPermissions, props.currentUserId, props.attendee.id])

    const handleOpen = () => setIsOpen((prev) => !prev)

    const handleMakeLeader = () => {
      handleOpen()
      props.onLeaderUpdated({ newLeaderId: props.attendee.id })
    }

    return (
      <tr>
        <StyledCenteredContentTD>
          <UserAvatar
            avatarUrl={props.attendee.avatar}
            firstName={props.attendee.firstName}
            lastName={props.attendee.lastName}
            userAvatarColor={props.attendee.userAvatarColor}
            adornments={{
              leaderCrown: props.isMeetingLeader,
              tooltip: true,
            }}
            size='s'
          />
        </StyledCenteredContentTD>
        <StyledCenteredContentTD
          css={css`
            text-align: left;
            padding-left: 0;

            /* make this column expand as much as possible */
            width: 100%;
          `}
        >
          <Text
            display='block'
            type={'body'}
            weight={'semibold'}
            ellipsis={{ widthPercentage: 100 }}
          >
            <>
              {props.attendee.fullName}
              {props.isMeetingLeader && (
                <Text
                  type={'small'}
                  weight={'normal'}
                  css={css`
                    font-style: italic;
                    padding-left: ${(props) => props.theme.sizes.spacing8};
                  `}
                >
                  {t('Leader')}
                </Text>
              )}
            </>
          </Text>
        </StyledCenteredContentTD>

        <StyledCenteredContentTD>
          <Menu
            position='right center'
            isOpen={isOpen}
            content={(close) => (
              <>
                <Menu.Item
                  disabled={
                    !props.isMeetingOngoing ||
                    props.isMeetingLeader ||
                    !canNominateMeetingLeader.allowed
                  }
                  tooltip={
                    props.isMeetingLeader
                      ? {
                          msg: t('This user is already the meeting leader'),
                          position: 'left center',
                        }
                      : !props.isMeetingOngoing
                        ? {
                            msg: t(
                              'Cannot update meeting leader while the meeting is not ongoing'
                            ),
                            position: 'left center',
                          }
                        : !canNominateMeetingLeader.allowed
                          ? {
                              msg: t(
                                'Contact an admin to perform those actions'
                              ),
                              position: 'left center',
                            }
                          : undefined
                  }
                  onClick={handleMakeLeader}
                >
                  <Text
                    type={'body'}
                    color={
                      !props.isMeetingOngoing ||
                      props.isMeetingLeader ||
                      !canNominateMeetingLeader.allowed
                        ? { color: theme.colors.buttonTextDisabled }
                        : { color: theme.colors.bodyTextDefault }
                    }
                  >
                    {t('Make leader')}
                  </Text>
                </Menu.Item>

                <Menu.Item
                  disabled={
                    props.isOnlyOneAttendeeLeftInMeeting ||
                    !props.canEditAttendeesInMeeting.allowed
                  }
                  tooltip={
                    !props.canEditAttendeesInMeeting.allowed
                      ? {
                          msg: props.canEditAttendeesInMeeting.message,
                          position: 'left center',
                        }
                      : props.isOnlyOneAttendeeLeftInMeeting
                        ? {
                            msg: t('Cannot remove the last meeting attendee'),
                            position: 'left center',
                          }
                        : undefined
                  }
                  onClick={(e) => {
                    props.onAttendeeRemoved({ attendeeId: props.attendee.id })
                    close(e)
                  }}
                >
                  <Text
                    type={'body'}
                    color={
                      props.isOnlyOneAttendeeLeftInMeeting ||
                      !props.canEditAttendeesInMeeting.allowed
                        ? {
                            color:
                              theme.colors
                                .addAttendeeRemoveAttendeeDisabledTextColor,
                          }
                        : { color: theme.colors.menuItemWarningColor }
                    }
                  >
                    {t('Remove from meeting')}
                  </Text>
                </Menu.Item>
              </>
            )}
          >
            <button
              type='button'
              css={css`
                cursor: pointer;
                border: 0;
                background: none;
              `}
              onClick={handleOpen}
            >
              <Icon iconName='moreVerticalIcon' iconSize='lg' />
            </button>
          </Menu>
        </StyledCenteredContentTD>
      </tr>
    )
  }
)

const StyledCenteredContentTD = styled.td`
  height: ${toREM(40)};
  padding-left: ${(props) => props.theme.sizes.spacing8};
  padding-right: ${(props) => props.theme.sizes.spacing8};
  text-align: center;

  &:first-of-type {
    padding-left: ${(props) => props.theme.sizes.spacing24};
  }

  &:last-of-type {
    padding-right: ${(props) => props.theme.sizes.spacing24};
  }
`
