import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import {
  getSimpleTimeDisplay,
  guessTimezone,
  useTimeController,
} from '@mm/core/date'
import { useDocument } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  Card,
  Clickable,
  Icon,
  Menu,
  Text,
  Tooltip,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { MeetingAgendaTimer } from '@mm/core-web/ui/components/agenda/timer'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { BloomPageEmptyStateTooltipProvider } from '@mm/bloom-web/shared'

import { useComputed } from '../../performance/mobx'
import { AgendaCardMeetingTimer } from './agendaCardMeetingTimer'
import { IMeetingAgendaViewProps } from './agendaCardTypes'
import { AgendaSections } from './agendaSections'
import { AgendaStartMeetingButton } from './agendaStartMeetingButton'
import { Countdown } from './countdown'
import { MeetingAgendaFollowLeader } from './followLeader'

export const AgendaCardView = observer(
  React.forwardRef(function AgendaCardView(
    props: IMeetingAgendaViewProps,
    ref: React.Ref<HTMLDivElement>
  ) {
    const document = useDocument()
    const theme = useTheme()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { closeOverlazy, openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const [showCountdown, setShowCountdown] = useState(false)
    const [currentTime, setCurrentTime] = useState<string>('')
    const [showBoxShadow, setShowBoxShadow] = useState<boolean>(false)

    const currentUserIsAdmin = props.getData().currentUser.isOrgAdmin

    const userTimezone =
      props.getData().currentUser.settings.timezone || guessTimezone()

    const {
      currentUser: {
        permissions: {
          currentUserIsMeetingLeader: isLeader,
          canCreateMeetingPagesInMeeting,
        },
      },
      agendaIsCollapsed,
      isCurrentUserAMeetingAttendee,
      meetingId,
    } = props.getData()

    const getCurrentLeaderActiveMeetingPage = useComputed(
      () => {
        return props.getData().meetingPages.nodes.find((page) => {
          return (
            // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2771
            `${page.id}` ===
            `${props.getData().currentMeetingInstance?.currentPageId}`
          )
        })
      },
      {
        name: `AgendaCardView-currentLeaderActiveMeetingPage`,
      }
    )

    // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2771
    const getIsUserOnSamePageAsMeetingLeader = useComputed(
      () => {
        const currentLeaderActiveMeetingPage =
          getCurrentLeaderActiveMeetingPage()
        return (
          `${props.getData().activePageId}` ===
          `${currentLeaderActiveMeetingPage?.id}`
        )
      },
      {
        name: `AgendaCardView-isUserOnSamePageAsMeetingLeader`,
      }
    )

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(
          getSimpleTimeDisplay({
            secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
            userTimezone,
            lowerCase: true,
          })
        )
      }, 1000)
      return () => clearInterval(interval)
    }, []) /* eslint-disable-line react-hooks/exhaustive-deps */

    const noRenderCountdown = useCallback(() => {
      setShowCountdown(false)
    }, [setShowCountdown])

    const handleOpenAttendeeModal = useCallback(() => {
      openOverlazy('AttendeeManagementModal', {
        meetingId,
      })
    }, [openOverlazy, meetingId])

    const agendaSectionsElementForScroll = document.getElementById(
      `agenda_sections_element`
    )

    const detectScrollPosition = useCallback(() => {
      if (
        agendaSectionsElementForScroll &&
        agendaSectionsElementForScroll.scrollTop > 0 &&
        !showBoxShadow
      ) {
        setShowBoxShadow(true)
      } else if (
        agendaSectionsElementForScroll &&
        agendaSectionsElementForScroll.scrollTop === 0
      ) {
        setShowBoxShadow(false)
      }
    }, [agendaSectionsElementForScroll, showBoxShadow, setShowBoxShadow])

    useEffect(() => {
      agendaSectionsElementForScroll &&
        agendaSectionsElementForScroll.addEventListener(
          'scroll',
          detectScrollPosition
        )

      return () => {
        agendaSectionsElementForScroll &&
          agendaSectionsElementForScroll.removeEventListener(
            'scroll',
            detectScrollPosition
          )
      }
    }, [agendaSectionsElementForScroll, detectScrollPosition])

    const expectedMeetingDurationInMinutes = useComputed(
      () => {
        return props.getData().meetingPages.nodes.reduce((total, node) => {
          return total + node.expectedDurationS / 60
        }, 0)
      },
      { name: `AgendaCardView-expectedMeetingDurationInMinutes` }
    )

    const getAgendaSectionsData = useComputed(
      () => ({
        isLoading: props.getData().isLoading,
        activePage: props.getData().pageToDisplay,
        activeLeaderPageId: getCurrentLeaderActiveMeetingPage()?.id || null,
        currentMeetingInstance: props.getData().currentMeetingInstance,
        expectedMeetingDurationFromAgendaInMinutes:
          expectedMeetingDurationInMinutes(),
        sections: props.getData().meetingPages,
        permissions: props.getData().currentUser.permissions,
        meetingPageNavigationStatus:
          props.getData().meetingPageNavigationStatus,
      }),
      {
        name: `AgendaSections.getAgendaSectionsData`,
      }
    )

    const getAgendaSectionsActionHandlers = useComputed(
      () => ({
        onSetCurrentUserPage: props.getActionHandlers().onSetCurrentUserPage,
        onUpdateMeetingPageOrder:
          props.getActionHandlers().onUpdateMeetingPageOrder,
        onUpdateAgendaSections:
          props.getActionHandlers().onUpdateAgendaSections,
      }),
      {
        name: `AgendaSections.getAgendaSectionsActionHandlers`,
      }
    )

    useEffect(() => {
      closeOverlazy({ type: 'StickyDrawer' })
    }, [props.getData().meetingId, closeOverlazy])

    const expandedView = (
      <Card
        ref={ref}
        className={props.className}
        css={css`
          border: ${({ theme }) =>
            `${theme.sizes.smallSolidBorder} ${theme.colors.cardBorderColor}`};
          border-radius: ${({ theme }) => theme.sizes.br1};
          box-shadow: ${({ theme }) => theme.sizes.bs1};
        `}
      >
        <Card.Header
          padding={theme.sizes.spacing8}
          renderLeft={
            <div
              css={css`
                display: flex;
                flex-direction: row;
                vertical-align: middle;
              `}
            >
              <BtnIcon
                css={css`
                  display: inline-block;
                  height: ${(props) => props.theme.sizes.spacing40};
                  padding: 0 !important;
                `}
                ariaLabel={t('Collapse agenda')}
                type='button'
                intent='tertiaryTransparent'
                iconProps={{
                  iconName: 'collapseIcon',
                  iconSize: 'lg',
                }}
                tag='button'
                size='sm'
                onClick={() => props.getData().setAgendaIsCollapsed(true)}
              />
              <Card.Title
                css={css`
                  padding-left: ${(props) => props.theme.sizes.spacing8};
                  align-items: center;
                  display: flex;
                `}
              >
                {t('Agenda')}
              </Card.Title>
            </div>
          }
          renderRight={
            <div
              css={css`
                display: flex;
                flex-direction: row;
                align-items: flex-end;
              `}
            >
              <Text
                css={`
                  position: relative;
                `}
                type={'body'}
              >
                {currentTime}
              </Text>
              <BloomPageEmptyStateTooltipProvider emptyStateId='externalMenuContent'>
                {(tooltipProps) => (
                  <Menu
                    position='bottom left'
                    content={(close) => (
                      <>
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            handleOpenAttendeeModal()
                          }}
                        >
                          <>
                            <Icon iconName={'addUserIcon'} iconSize={'lg'} />
                            <Text
                              type='body'
                              css={css`
                                padding-left: ${(props) =>
                                  props.theme.sizes.spacing8};
                              `}
                            >
                              {t('Add/view attendees')}
                            </Text>
                          </>
                        </Menu.Item>
                      </>
                    )}
                  >
                    <BtnIcon
                      intent='tertiaryTransparent'
                      size='sm'
                      iconProps={{
                        iconName: 'moreVerticalIcon',
                        iconSize: 'md',
                      }}
                      tooltip={
                        tooltipProps
                          ? { ...tooltipProps, position: 'right bottom' }
                          : undefined
                      }
                      onClick={() => null}
                      ariaLabel={t('More options')}
                      tag={'span'}
                    />
                  </Menu>
                )}
              </BloomPageEmptyStateTooltipProvider>
            </div>
          }
        />
        <Card.Body
          css={css`
            display: flex;
            justify-content: center;
            overflow-x: hidden;
            overflow-y: hidden;
          `}
        >
          <CollapseAgenda
            animate={agendaIsCollapsed ? 'collapsed' : 'open'}
            css={css`
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              overflow: hidden;
              flex-grow: 1;
            `}
          >
            <div
              css={css`
                flex-shrink: 0;
              `}
            >
              {props.getData().currentMeetingInstance ? (
                <div
                  css={css`
                    display: flex;
                    justify-content: center;
                    flex-direction: column;
                    align-items: center;
                    height: ${toREM(85)};
                    padding-top: ${(props) => props.theme.sizes.spacing8};
                  `}
                >
                  <AgendaCardMeetingTimer
                    meetingTimeInMinutes={
                      props.getData().expectedMeetingDurationFromAgendaInMinutes
                    }
                    isPaused={false}
                    isCollapsedView={agendaIsCollapsed}
                    meetingStartTime={
                      props.getData().currentMeetingInstance?.meetingStartTime
                    }
                    expectedMeetingDuration={
                      props.getData().expectedMeetingDurationFromAgendaInMinutes
                    }
                  />
                  {isLeader && (
                    <div
                      css={css`
                        margin-top: ${(props) => props.theme.sizes.spacing16};
                      `}
                    >
                      <BtnText
                        css={css`
                          padding-bottom: ${(props) =>
                            props.theme.sizes.spacing16};
                          padding-top: ${(props) => props.theme.sizes.spacing8};
                        `}
                        fontWeight='semibold'
                        type='button'
                        height='small'
                        intent='tertiary'
                        ariaLabel={t('Pause and resume meeting')}
                        disabled
                        tooltip={{
                          msg: t('Coming soon!'),
                          position: 'top center',
                        }}
                      >
                        {t('Pause meeting')}
                        {/* @TODO_BLOOM this is the logic that should be used once we no longer use mock data */}
                        {/* {props.getData().currentMeetingInstance.isPaused
                      ? t('Resume meeting')
                      : t('Pause meeting')} */}
                      </BtnText>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  css={css`
                    display: flex;
                    margin-top: ${(props) => props.theme.sizes.spacing12};
                    justify-content: center;
                    align-items: center;
                  `}
                >
                  <div
                    css={css`
                      max-width: ${toREM(183)} !important;
                    `}
                  >
                    <AgendaStartMeetingButton
                      meetingId={meetingId}
                      disabled={!isCurrentUserAMeetingAttendee}
                      tooltipProps={
                        !isCurrentUserAMeetingAttendee
                          ? {
                              msg: t(
                                'You must be a meeting attendee to start this meeting'
                              ),
                            }
                          : undefined
                      }
                      getActionHandlers={props.getActionHandlers}
                    />
                  </div>
                </div>
              )}

              <div
                css={css`
                  display: flex;
                  justify-content: center;
                `}
              >
                {showCountdown && (
                  <Countdown
                    onComplete={noRenderCountdown}
                    onCancel={noRenderCountdown}
                  />
                )}
                {!props.getData().currentMeetingInstance && (
                  <Text
                    type='caption'
                    fontStyle='italic'
                    css={css`
                      text-align: center;
                      margin-top: ${(props) => props.theme.sizes.spacing8};
                      margin-bottom: ${(props) => props.theme.sizes.spacing16};
                      padding-left: ${toREM(13)};
                      padding-right: ${toREM(13)};
                    `}
                  >
                    {t('Are you leading the meeting? Start now.')}
                  </Text>
                )}
              </div>
              {!props.getData().currentMeetingInstance && (
                <Text
                  type='small'
                  css={css`
                    align-items: center;
                    justify-content: center;
                    display: flex;
                    padding-bottom: ${(props) => props.theme.sizes.spacing8};
                  `}
                >
                  {t('Total')}{' '}
                  {props.expectedMeetingDurationFromAgendaInMinutes} {t('min')}
                </Text>
              )}
            </div>
            <div
              id={`agenda_sections_element`}
              css={css`
                display: flex;
                flex-shrink: 1;
                overflow-x: hidden;
                overflow-y: auto;
                width: 100%;

                ${showBoxShadow &&
                css`
                  box-shadow:
                    inset ${(props) => props.theme.sizes.bs1},
                    inset ${(props) => props.theme.sizes.bs1};
                `}
              `}
            >
              <AgendaSections
                getData={getAgendaSectionsData}
                getActionHandlers={getAgendaSectionsActionHandlers}
              />
            </div>
            <div
              css={css`
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                flex-shrink: 0;
                width: 100%;
                border-top: ${({ theme }) =>
                  `${theme.sizes.smallSolidBorder} ${theme.colors.dividerStrokeDefault}`};
              `}
            >
              {!props.getData().currentMeetingInstance && (
                <>
                  {canCreateMeetingPagesInMeeting.allowed ? (
                    <Menu
                      content={(close) => (
                        <>
                          {props
                            .getData()
                            .meetingPagesFilteredByCurrentMeetingPages.map(
                              (page, index) => {
                                return (
                                  <Menu.Item
                                    key={`addMeetingSectionMenu_${page.value}_${index}`}
                                    onClick={(e) => {
                                      props
                                        .getActionHandlers()
                                        .onAddAgendaSectionToMeeting({
                                          pageType: page.value,
                                          pageName: page.text,
                                        })
                                      close(e)
                                    }}
                                  >
                                    <Text type='body'>{page.text}</Text>
                                  </Menu.Item>
                                )
                              }
                            )}
                        </>
                      )}
                    >
                      <div
                        css={css`
                          display: flex;
                          flex-direction: row;
                          align-items: center;
                          justify-content: center;

                          width: 100%;
                          height: ${toREM(56)};
                        `}
                      >
                        <div
                          css={css`
                            display: inline-flex;
                            align-items: center;
                          `}
                        >
                          <Icon
                            iconName='plusIcon'
                            iconSize='sm'
                            css={css`
                              margin-right: ${(props) =>
                                props.theme.sizes.spacing4};
                            `}
                          />
                          <Text
                            type='body'
                            weight='semibold'
                            color={{
                              color: theme.colors.bodyTextDefault,
                            }}
                          >
                            {t('Add meeting section')}
                          </Text>
                        </div>
                      </div>
                    </Menu>
                  ) : (
                    <div
                      css={css`
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: ${toREM(56)};
                        padding: ${(props) => props.theme.sizes.spacing16};
                      `}
                    >
                      <Tooltip
                        msg={canCreateMeetingPagesInMeeting.message}
                        position={'right center'}
                        offset={theme.sizes.spacing14}
                      >
                        <div
                          css={css`
                            display: inline-flex;
                            align-items: center;
                          `}
                        >
                          <Icon
                            iconName='plusIcon'
                            iconSize='sm'
                            css={css`
                              margin-right: ${(props) =>
                                props.theme.sizes.spacing4};
                            `}
                          />
                          <Text
                            type='body'
                            weight='semibold'
                            color={{
                              color: theme.colors.bodyTextDefault,
                            }}
                          >
                            {t('Add meeting section')}
                          </Text>
                        </div>
                      </Tooltip>
                    </div>
                  )}
                </>
              )}

              {props.getData().currentMeetingInstance && (
                <div
                  css={css`
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: ${toREM(56)};
                    padding: ${(props) => props.theme.sizes.spacing16};
                  `}
                >
                  <div
                    css={css`
                      display: inline-flex;
                      align-items: center;
                    `}
                  >
                    <MeetingAgendaFollowLeader
                      collapsedView={false}
                      currentUserId={props.getData().currentUser.id}
                      currentUserPermissions={
                        props.getData().currentUser.permissions
                      }
                      currentUserIsAdmin={currentUserIsAdmin}
                      currentMeetingLeader={
                        props.getData().currentMeetingLeader
                      }
                      meetingAttendees={props.getData().meetingAttendees}
                      followLeader={props.getData().isFollowingLeader}
                      meetingInstanceId={
                        props.getData().currentMeetingInstance?.id || null
                      }
                      currentPageId={props.getData().activePageId}
                      setFollowLeader={props.getData().setIsFollowingLeader}
                      updateMeetingLeader={
                        props.getActionHandlers().onUpdateMeetingLeader
                      }
                    />
                  </div>
                </div>
              )}
              <MeetingNotesContent>
                <BtnIcon
                  css={css`
                    padding-bottom: ${({ theme }) => theme.sizes.spacing16};
                  `}
                  iconProps={{
                    iconName: 'meetingNotesIcon',
                  }}
                  size='lg'
                  intent='tertiaryTransparent'
                  ariaLabel={t('Meeting Notes')}
                  tag='button'
                  onClick={() =>
                    openOverlazy('MeetingNotesStickyTile', {
                      meetingId: meetingId,
                      stickToElementRef: props.meetingNotesStickToElementRef,
                    })
                  }
                />
                <Clickable
                  clicked={() =>
                    openOverlazy('MeetingNotesStickyTile', {
                      meetingId: meetingId,
                      stickToElementRef: props.meetingNotesStickToElementRef,
                    })
                  }
                >
                  <Text type='body' weight='semibold'>
                    {t('Meeting Notes')}
                  </Text>
                </Clickable>
              </MeetingNotesContent>
              {props.getData().currentMeetingInstance && (
                <div
                  css={css`
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: ${toREM(68)};
                    width: 100%;
                    padding: ${(props) => props.theme.sizes.spacing16};
                  `}
                >
                  <BtnText
                    width={'fitted'}
                    intent={'secondary'}
                    ariaLabel={t('Tangent Alert')}
                    onClick={() => {
                      props.getActionHandlers().tangentClicked()
                    }}
                  >
                    {t('Tangent Alert')}
                  </BtnText>
                </div>
              )}
            </div>
          </CollapseAgenda>
        </Card.Body>
      </Card>
    )

    const collapsedView = (
      <div
        ref={ref}
        className={props.className}
        css={css`
          display: flex;
        `}
      >
        <Card
          css={css`
            flex: 1;
            border: ${({ theme }) =>
              `${theme.sizes.smallSolidBorder} ${theme.colors.cardBorderColor}`};
            border-radius: ${({ theme }) => theme.sizes.br1};
            height: ${toREM(48)};
          `}
        >
          <Card.SectionHeader
            padding='small'
            css={css`
              display: flex;
              justify-content: space-between;
              gap: ${toREM(24)};
              align-items: center;
              height: ${(prop) => prop.theme.sizes.spacing40};
            `}
          >
            <div
              css={css`
                display: flex;
                flex-direction: row;
              `}
            >
              <BtnIcon
                ariaLabel={t('Collapse agenda')}
                type='button'
                intent='tertiaryTransparent'
                iconProps={{
                  iconName: props.getData().agendaIsCollapsed
                    ? 'expandIcon'
                    : 'collapseIcon',
                }}
                tag='button'
                size='lg'
                onClick={() => props.getData().setAgendaIsCollapsed(false)}
                css={css`
                  padding-left: ${(props) => props.theme.sizes.spacing4};
                `}
              />
              {props.getData().currentMeetingInstance && (
                <AgendaCardMeetingTimer
                  meetingTimeInMinutes={
                    props.getData().expectedMeetingDurationFromAgendaInMinutes
                  }
                  isPaused={false}
                  isCollapsedView={agendaIsCollapsed}
                  meetingStartTime={
                    props.getData().currentMeetingInstance?.meetingStartTime
                  }
                  expectedMeetingDuration={
                    props.getData().expectedMeetingDurationFromAgendaInMinutes
                  }
                />
              )}

              {props.getData().currentMeetingInstance ? (
                <div
                  css={css`
                    display: inline-flex;
                    vertical-align: middle;
                    padding-left: ${(props) => props.theme.sizes.spacing8};
                  `}
                >
                  <MeetingAgendaFollowLeader
                    currentUserId={props.getData().currentUser.id}
                    collapsedView={true}
                    currentUserPermissions={
                      props.getData().currentUser.permissions
                    }
                    currentUserIsAdmin={currentUserIsAdmin}
                    currentMeetingLeader={props.getData().currentMeetingLeader}
                    meetingAttendees={props.getData().meetingAttendees}
                    followLeader={props.getData().isFollowingLeader}
                    meetingInstanceId={
                      props.getData().currentMeetingInstance?.id || null
                    }
                    currentPageId={props.getData().activePageId}
                    setFollowLeader={props.getData().setIsFollowingLeader}
                    updateMeetingLeader={
                      props.getActionHandlers().onUpdateMeetingLeader
                    }
                  />
                </div>
              ) : (
                <>
                  {canCreateMeetingPagesInMeeting.allowed ? (
                    <Menu
                      content={(close) => (
                        <>
                          {props
                            .getData()
                            .meetingPagesFilteredByCurrentMeetingPages.map(
                              (page, index) => {
                                return (
                                  <Menu.Item
                                    key={`addMeetingSectionMenu_collapsedView${page.value}_${index}`}
                                    onClick={(e) => {
                                      props
                                        .getActionHandlers()
                                        .onAddAgendaSectionToMeeting({
                                          pageType: page.value,
                                          pageName: page.text,
                                        })
                                      close(e)
                                    }}
                                  >
                                    <Text type='body'>{page.text}</Text>
                                  </Menu.Item>
                                )
                              }
                            )}
                        </>
                      )}
                    >
                      <div
                        css={css`
                          display: inline-flex;
                          vertical-align: middle;
                          padding-left: ${(props) =>
                            props.theme.sizes.spacing8};
                        `}
                      >
                        <BtnText
                          iconProps={{ iconName: 'plusIcon', iconSize: 'md' }}
                          width={'fitted'}
                          intent={'tertiary'}
                          ariaLabel={t('Add meeting section')}
                          onClick={() => null}
                        >
                          {t('Add meeting section')}
                        </BtnText>
                      </div>
                    </Menu>
                  ) : (
                    <div
                      css={css`
                        display: inline-flex;
                        vertical-align: middle;
                        padding-left: ${(props) => props.theme.sizes.spacing8};
                      `}
                    >
                      <BtnText
                        iconProps={{ iconName: 'plusIcon', iconSize: 'md' }}
                        width={'fitted'}
                        intent={'tertiary'}
                        ariaLabel={t('Add meeting section')}
                        disabled={true}
                        tooltip={{
                          msg: canCreateMeetingPagesInMeeting.message,
                          position: 'bottom center',
                        }}
                        onClick={() => null}
                      >
                        {t('Add meeting section')}
                      </BtnText>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              css={css`
                display: inline-flex;
                vertical-align: middle;
                align-items: center;
                justify-content: center;
              `}
            >
              <BtnIcon
                tooltip={{
                  msg: props.getData().meetingPageNavigationStatus.message,
                }}
                disabled={props.getData().meetingPageNavigationStatus.disabled}
                iconProps={{
                  iconName: 'agendaBackIcon',
                }}
                size='md'
                intent='tertiaryTransparent'
                ariaLabel={t('prevBtn')}
                tag='button'
                onClick={props.getActionHandlers().handlePrevPage}
              />
              <Text
                type='h4'
                css={css`
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  max-width: ${toREM(480)};
                  width: 100%;
                `}
              >
                {props.getData().pageToDisplay?.pageName}
              </Text>
              <BtnIcon
                tooltip={{
                  msg: props.getData().meetingPageNavigationStatus.message,
                }}
                disabled={props.getData().meetingPageNavigationStatus.disabled}
                iconProps={{
                  iconName: 'agendaNextIcon',
                }}
                size='md'
                intent='tertiaryTransparent'
                ariaLabel={t('nextBtn')}
                tag='button'
                onClick={props.getActionHandlers().handleNextPage}
              />
            </div>
            <div
              css={css`
                flex-direction: row;
                display: flex;
                vertical-align: middle;
                align-items: center;
                justify-content: flex-end;
                padding-right: ${(props) => props.theme.sizes.spacing4};
              `}
            >
              <BtnIcon
                iconProps={{
                  iconName: 'meetingNotesIcon',
                }}
                size='lg'
                intent='tertiaryTransparent'
                ariaLabel={t('Meeting Notes')}
                tag='button'
                onClick={() =>
                  openOverlazy('MeetingNotesStickyTile', {
                    meetingId: meetingId,
                    stickToElementRef: props.meetingNotesStickToElementRef,
                  })
                }
                css={css`
                  padding-right: ${(props) => props.theme.sizes.spacing16};
                  padding-left: ${(props) => props.theme.sizes.spacing4};
                `}
              />
              <BloomPageEmptyStateTooltipProvider emptyStateId='externalMenuContent'>
                {(tooltipProps) => (
                  <Menu
                    position='bottom left'
                    content={(close) => (
                      <>
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            handleOpenAttendeeModal()
                          }}
                        >
                          <>
                            <Icon iconName={'addUserIcon'} iconSize={'lg'} />
                            <Text
                              type='body'
                              css={css`
                                padding-left: ${(props) =>
                                  props.theme.sizes.spacing8};
                              `}
                            >
                              {t('Add/view attendees')}
                            </Text>
                          </>
                        </Menu.Item>
                      </>
                    )}
                  >
                    <BtnIcon
                      intent='naked'
                      size='sm'
                      iconProps={{
                        iconName: 'moreVerticalIcon',
                        iconSize: 'lg',
                      }}
                      tooltip={
                        tooltipProps
                          ? { ...tooltipProps, position: 'bottom center' }
                          : undefined
                      }
                      onClick={() => null}
                      ariaLabel={t('More options')}
                      tag={'span'}
                    />
                  </Menu>
                )}
              </BloomPageEmptyStateTooltipProvider>
            </div>
          </Card.SectionHeader>
          {getIsUserOnSamePageAsMeetingLeader() && (
            <Card.Body
              css={css`
                overflow-y: hidden;
              `}
            >
              <Card.BodySafeArea
                css={css`
                  padding: 0 !important;
                  height: ${(prop) => prop.theme.sizes.spacing8};
                `}
              >
                <MeetingAgendaTimer
                  meetingPages={props.getData().meetingPages}
                  currentPage={props.getData().pageToDisplay}
                  meetingIsPaused={
                    props.getData().currentMeetingInstance?.isPaused || false
                  }
                  expectedMeetingDurationFromAgendaInMinutes={
                    props.expectedMeetingDurationFromAgendaInMinutes
                  }
                />
              </Card.BodySafeArea>
            </Card.Body>
          )}
        </Card>
        {props.getData().currentMeetingInstance && (
          <div
            css={css`
              padding-left: ${(props) => props.theme.sizes.spacing16};
              justify-content: center;
              align-items: center;
              align-self: center;
            `}
          >
            <BtnText
              width={'fitted'}
              height='large'
              intent={'secondary'}
              ariaLabel={t('Tangent Alert')}
              onClick={() => {
                props.getActionHandlers().tangentClicked()
              }}
            >
              {t('Tangent Alert')}
            </BtnText>
          </div>
        )}
        {!props.getData().currentMeetingInstance && (
          <div
            css={css`
              padding-left: ${(props) => props.theme.sizes.spacing16};
              justify-content: center;
              align-items: center;
            `}
          >
            <AgendaStartMeetingButton
              meetingId={meetingId}
              disabled={!isCurrentUserAMeetingAttendee}
              tooltipProps={
                !isCurrentUserAMeetingAttendee
                  ? {
                      msg: t(
                        'You must be a meeting attendee to start this meeting'
                      ),
                    }
                  : undefined
              }
              getActionHandlers={props.getActionHandlers}
            />
          </div>
        )}
      </div>
    )
    if (agendaIsCollapsed) {
      return collapsedView
    }
    return expandedView
  })
)

const CollapseAgenda = styled.div<{ animate: string }>`
  transition: height 0.3s ease-in-out;
  align-items: flex-start;

  .open {
    height: auto;
    opacity: 1;
    transition: just 0.5s;
  }

  .collapsed {
    opacity: 0;
    height: 0;
    transition: just 0.5s;
  }
`

const MeetingNotesContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  padding: ${(props) => props.theme.sizes.spacing16};
  height: ${toREM(56)};
`
