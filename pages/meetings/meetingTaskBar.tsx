import { observer } from 'mobx-react'
import React from 'react'
import { Portal } from 'react-portal'
import styled, { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { useDocument } from '@mm/core/ssr'

import {
  PermissionCheckResult,
  UserAvatarColorType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import {
  ChartableMetricUnits,
  UNIT_TYPE_TO_DISPLAY_TEXT,
  UNIT_TYPE_TO_SYMBOL,
} from '@mm/core-bloom/metrics'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  Clickable,
  Icon,
  IconName,
  IconProps,
  Menu,
  Tabs,
  Text,
  UserAvatar,
  getTextStyles,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

import {
  TabNodeCollection,
  useMetricsTabsController,
} from '@mm/bloom-web/metrics/metricsTabs/metricsTabsController'
import { MEETING_PAGE_BOTTOM_PORTAL_ID } from '@mm/bloom-web/pages/meetings/meetingPageView'
import { VideoConferenceLinkButton } from '@mm/bloom-web/shared'

export const MEETING_TASK_BAR_HEIGHT = 40

// component that displays the tabs at the bottom of the screen.
export const MeetingTaskBarView = observer(function MeetingTaskBarView(props: {
  meetingId: Id
  isMeetingOngoing: boolean
  onMetricsMeetingPage: boolean
}) {
  const theme = useTheme()
  const {
    getCanCreateMetricsTabsInMeeting,
    tabsToDisplay,
    setActiveTab,
    dismissActiveTab,
    getActiveTab,
    isTabData,
    deleteTabById,
    unpinTabById,
    getSharedTabs,
    goToNextTab,
    goToPreviousTab,
  } = useMetricsTabsController()
  const document = useDocument()
  const { canCreateMetricsTabsInMeeting } = getCanCreateMetricsTabsInMeeting()
  const { meetingId, isMeetingOngoing, onMetricsMeetingPage } = props

  const activeTab = getActiveTab()

  const displayEmptyTab = React.useCallback(() => {
    setActiveTab({ newTab: true })
  }, [setActiveTab])

  const onOpenSharedTab = React.useCallback(
    (tabId: Id) => {
      setActiveTab({ id: tabId })
    },
    [setActiveTab]
  )

  React.useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (!activeTab) return

      if (e.shiftKey && e.altKey && e.key === 'ArrowRight') {
        goToNextTab()
        return false
      }

      if (e.shiftKey && e.altKey && e.key === 'ArrowLeft') {
        goToPreviousTab()
        return false
      }
    }

    document.addEventListener('keydown', onKeydown)
    return () => {
      document.removeEventListener('keydown', onKeydown)
    }
  }, [goToNextTab, document, goToPreviousTab, activeTab])

  if (!meetingId) return null
  return (
    <Portal node={document.getElementById(MEETING_PAGE_BOTTOM_PORTAL_ID)}>
      <VideoConferenceButton
        isMeetingOngoing={isMeetingOngoing}
        meetingId={meetingId}
      />
      {tabsToDisplay && onMetricsMeetingPage && (
        <>
          <MetricButtons
            canCreateMetricsTabsInMeeting={canCreateMetricsTabsInMeeting}
            onNewChartButtonClicked={displayEmptyTab}
            getTabsSharedToMeeting={getSharedTabs}
            onOpenSharedTab={onOpenSharedTab}
          />
          <Tabs
            backgroundColor={theme.colors.bodyBackgroundColor}
            tabs={tabsToDisplay}
            activeTabId={isTabData(activeTab) ? activeTab.id : null}
            renderTabButton={(tab) =>
              !isTabData(tab) ? null : (
                <TabButton
                  isActive={isTabData(activeTab) && activeTab.id === tab.id}
                  key={tab.id}
                  tabId={tab.id}
                  isSharedToMeeting={tab.isSharedToMeeting}
                  name={tab.name}
                  units={tab.units}
                  creator={tab.creator}
                  onClick={() => {
                    if (isTabData(activeTab) && activeTab.id === tab.id) {
                      dismissActiveTab()
                    } else {
                      setActiveTab({ id: tab.id })
                    }
                  }}
                  deleteTabById={deleteTabById}
                  unpinTabById={unpinTabById}
                />
              )
            }
          />
        </>
      )}
    </Portal>
  )
})

function TabButton(props: {
  isSharedToMeeting: boolean
  isActive: boolean
  tabId: Id
  name: Maybe<string>
  units: ChartableMetricUnits
  creator: {
    avatar: Maybe<string>
    firstName: string
    lastName: string
    userAvatarColor: UserAvatarColorType
  }
  onClick: () => void
  deleteTabById: (id: Id) => Promise<void>
  unpinTabById: (id: Id) => Promise<void>
}) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()

  function getIconOrAvatar() {
    if (props.isSharedToMeeting) {
      return (
        <UserAvatar
          firstName={props.creator.firstName}
          lastName={props.creator.lastName}
          avatarUrl={props.creator.avatar}
          userAvatarColor={props.creator.userAvatarColor}
          size='l'
          adornments={{ tooltip: true }}
          css={css`
            .user_avatar_initials,
            .user_avatar_picture {
              height: ${toREM(48)};
              width: ${toREM(48)};
              border-radius: ${(props) => props.theme.sizes.br1} 0 0 0;
              vertical-align: middle;
            }
          `}
        />
      )
    } else {
      return UNIT_TYPE_TO_SYMBOL[props.units]
    }
  }

  function getNameOrUnits() {
    if (props.name) {
      return props.name
    } else {
      return UNIT_TYPE_TO_DISPLAY_TEXT[props.units]
    }
  }

  return (
    <StyledMetricsTab isActive={props.isActive} noBackground>
      <Clickable
        clicked={props.onClick}
        css={css`
          height: 100%;
        `}
      >
        <div
          className='metrics-tab-button__icon-area'
          css={css`
            ${getTextStyles({ type: 'h2', weight: 'semibold' })}
            height: 100%;
            border-radius: ${({ theme }) => theme.sizes.br1} 0 0 0;
            color: ${({ theme }) => theme.colors.metricsTabButtonIcon};
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${props.isSharedToMeeting ? toREM(40) : toREM(24)};
            background-color: ${({ theme }) =>
              theme.colors.metricsTabButtonIconBackground};
            overflow: hidden;
          `}
        >
          {getIconOrAvatar()}
        </div>
      </Clickable>
      <Clickable
        clicked={props.onClick}
        css={css`
          height: 100%;
        `}
      >
        <div
          className='metrics-tab-button__text-area'
          css={css`
            border: ${({ theme }) =>
              `${theme.sizes.smallSolidBorder} ${theme.colors.metricsTabButtonTextBackground}`};
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            border-radius: 0 ${({ theme }) => theme.sizes.br1} 0 0;
            background: ${({ theme }) =>
              theme.colors.metricsTabButtonTextBackground};
            padding: ${toREM(14)} ${({ theme }) => theme.sizes.spacing16}
              ${toREM(14)} ${({ theme }) => theme.sizes.spacing8};
            max-width: ${toREM(210)};
          `}
        >
          <span
            css={css`
              ${getTextStyles({
                type: 'body',
                weight: 'semibold',
                color: theme.colors.bodyTextDefault,
              })};
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            `}
          >
            {getNameOrUnits()}
          </span>
        </div>
      </Clickable>

      <BtnIcon
        iconProps={
          props.isSharedToMeeting
            ? {
                iconName: 'pinIcon',
                iconSize: 'md',
              }
            : {
                iconName: 'closeIcon',
                iconSize: 'md',
              }
        }
        className={'show_metric_close_btn_on_hover'}
        intent='naked'
        ariaLabel={t('delete {{metric}} tab', {
          metric: terms.metric.lowercaseSingular,
        })}
        tag='button'
        tooltip={
          props.isSharedToMeeting
            ? { msg: t('Unpin shared chart'), position: 'top center' }
            : { msg: t('Delete chart'), position: 'top center' }
        }
        onClick={() => {
          props.isSharedToMeeting
            ? props.unpinTabById(props.tabId)
            : props.deleteTabById(props.tabId)
        }}
        css={css`
          position: absolute;
          right: 0;
          top: 0;

          ${props.isSharedToMeeting &&
          css`
            right: ${(props) => props.theme.sizes.spacing4};
            top: ${(props) => props.theme.sizes.spacing4};
          `}
        `}
      />
    </StyledMetricsTab>
  )
}

function VideoConferenceButton(props: {
  isMeetingOngoing: boolean
  meetingId: Id
}) {
  const theme = useTheme()
  const { isMeetingOngoing, meetingId } = props

  return (
    <div
      css={css`
        margin-right: ${theme.sizes.spacing16};
        flex: 0 0 ${toREM(48)};
        border-right: ${`${theme.sizes.smallSolidBorder} ${theme.colors.dividerStrokeDefault}`};
      `}
    >
      <VideoConferenceLinkButton
        meetingId={meetingId}
        smallButton={isMeetingOngoing}
      />
    </div>
  )
}

function MetricButtons(props: {
  canCreateMetricsTabsInMeeting: PermissionCheckResult
  onNewChartButtonClicked: () => void
  getTabsSharedToMeeting: () => Maybe<TabNodeCollection>
  onOpenSharedTab: (id: Id) => void
}) {
  const {
    canCreateMetricsTabsInMeeting,
    getTabsSharedToMeeting,
    onOpenSharedTab,
    onNewChartButtonClicked,
  } = props

  const terms = useBloomCustomTerms()
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <>
      <StyledMetricsTab
        css={css`
          flex: 0 0 ${toREM(48)};
        `}
      >
        <BtnIcon
          intent='naked'
          iconProps={{
            iconName: 'addGraph',
            iconColor: { color: theme.colors.metricsTabButtonIcon },
            iconSize: 'xl',
          }}
          onClick={onNewChartButtonClicked}
          disabled={!canCreateMetricsTabsInMeeting.allowed}
          tooltip={
            !canCreateMetricsTabsInMeeting.allowed
              ? {
                  msg: canCreateMetricsTabsInMeeting.message,
                  position: 'top center',
                }
              : undefined
          }
          ariaLabel={t('Create new {{metric}} tab', {
            metric: terms.metric.lowercaseSingular,
          })}
          tag='button'
        />
      </StyledMetricsTab>

      <MetricTabButtonMenu
        iconProps={{ iconName: 'meetings' }}
        label={t('Shared tabs')}
        maxWidth={
          (getTabsSharedToMeeting()?.nodes || []).length
            ? undefined
            : toREM(219)
        }
        menuContent={
          (getTabsSharedToMeeting()?.nodes || []).length ? (
            (close) => (
              <>
                <Menu.Item onClick={() => null} isSectionHeader={true}>
                  <Text
                    type={'body'}
                    weight={'semibold'}
                    color={{ color: theme.colors.bodyTextDefault }}
                  >
                    {t('Shared Charts')}
                  </Text>
                </Menu.Item>
                {(getTabsSharedToMeeting()?.nodes || []).map((tab) => {
                  return (
                    <Menu.Item
                      key={tab.id}
                      onClick={(e) => {
                        close(e)
                        onOpenSharedTab(tab.id)
                      }}
                    >
                      <div
                        css={css`
                          display: inline-flex;
                          align-items: center;
                        `}
                      >
                        <UserAvatar
                          firstName={tab.creator.firstName}
                          lastName={tab.creator.lastName}
                          avatarUrl={tab.creator.avatar}
                          userAvatarColor={tab.creator.userAvatarColor}
                          size='s'
                          css={css`
                            margin-right: ${(props) =>
                              props.theme.sizes.spacing8};
                          `}
                        />
                        <TextEllipsis
                          lineLimit={1}
                          type={'body'}
                          tooltipProps={{ position: 'right center' }}
                          color={{ color: theme.colors.bodyTextDefault }}
                        >
                          {tab.name}
                        </TextEllipsis>
                      </div>
                    </Menu.Item>
                  )
                })}
              </>
            )
          ) : (
            <NoSharedMetricsMenuDisplay />
          )
        }
      />
    </>
  )
}

const NoSharedMetricsMenuDisplay = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <>
      <Text
        type={'body'}
        weight={'semibold'}
        color={{ color: theme.colors.bodyTextDefault }}
        css={css`
          border-bottom: ${(props) => props.theme.sizes.smallSolidBorder}
            ${(props) => props.theme.colors.dividerStrokeDefault};
          padding: ${toREM(9)} ${(props) => props.theme.sizes.spacing16};
          width: 100%;
        `}
      >
        {t('Shared Charts')}
      </Text>
      <Text
        type={'body'}
        color={{ color: theme.colors.bodyTextDefault }}
        css={css`
          padding: ${(props) => props.theme.sizes.spacing16};
          width: 100%;
        `}
      >
        {t('You have no shared charts.')}
      </Text>
    </>
  )
}

function MetricTabButtonMenu(props: {
  className?: string
  iconProps: IconProps<IconName>
  label: string
  maxWidth?: string
  menuContent:
    | React.ReactNode
    | ((
        close: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
      ) => React.ReactNode)
}) {
  const theme = useTheme()

  return (
    <Menu
      maxWidth={props.maxWidth}
      content={props.menuContent}
      position={'top left'}
      css={css`
        &.ui.popup {
          margin: 0 0 ${toREM(10)} 0 !important;
        }
      `}
    >
      <StyledMetricsTab
        css={css`
          flex: 0 0 ${toREM(48)};
        `}
      >
        <Icon
          {...props.iconProps}
          iconColor={{ color: theme.colors.metricsTabButtonIcon }}
          iconSize='xl'
        />
      </StyledMetricsTab>
    </Menu>
  )
}

const StyledMetricsTab = styled.div<{
  isActive?: boolean
  noBackground?: boolean
}>`
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.sizes.br1}
    ${({ theme }) => theme.sizes.br1} 0 0;
  border: 0;
  padding: 0;
  box-shadow: ${({ theme }) => theme.sizes.bs3};
  ${({ noBackground }) =>
    noBackground
      ? ''
      : css`
          background-color: ${({ theme }) =>
            theme.colors.metricsTabButtonIconBackground};
        `}
  height: ${toREM(MEETING_TASK_BAR_HEIGHT)};
  margin-right: ${({ theme }) => theme.sizes.spacing16};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .show_metric_close_btn_on_hover {
    display: none;
  }

  &:hover,
  &:focus {
    .show_metric_close_btn_on_hover {
      display: block;
    }
  }

  ${({ isActive }) =>
    isActive &&
    css`
      .metrics-tab-button__text-area {
        border-color: ${({ theme }) =>
          theme.colors.metricsTabButtonTextBackgroundActive};
        background-color: ${({ theme }) =>
          theme.colors.metricsTabButtonTextBackgroundActive};
      }
    `}

  ${({ isActive }) =>
    !isActive &&
    css`
      &:hover,
      &:focus {
        .metrics-tab-button__text-area {
          background-color: ${({ theme }) =>
            theme.colors.metricsTabButtonTextBackgroundHover};
          border: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.metricsTabButtonBorder};
        }

        .metrics-tab-button__icon-area {
          border: ${({ theme }) => theme.sizes.smallSolidBorder}
            ${({ theme }) => theme.colors.metricsTabButtonBorder};
        }
      }
    `}
`

export default MeetingTaskBarView
