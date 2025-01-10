import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React, { useEffect } from 'react'
import styled, { css } from 'styled-components'

import { Id, queryDefinition, useSubscription } from '@mm/gql'

import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useWindow } from '@mm/core/ssr'

import {
  EBloomPostHogFeatureFlag,
  useBloomBusinessPlanNode,
  useBloomOrgChartNode,
} from '@mm/core-bloom'

import { useBloomAuthHttp } from '@mm/core-bloom/auth'

import { useBrowserEnvironment } from '@mm/core-web/envs'
import { useTranslation } from '@mm/core-web/i18n'
import { useNavigation } from '@mm/core-web/router'
import {
  Badge,
  Clickable,
  Icon,
  Link,
  Menu,
  Text,
  toREM,
  useTheme,
} from '@mm/core-web/ui'
import { SingleColorIconName } from '@mm/core-web/ui/components/icons/iconTypes'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { paths } from '@mm/bloom-web/router/paths'
import { useMeetingColorController } from '@mm/bloom-web/shared'

import { V3_BUSINESS_PLAN_CREATE_PARAM } from '../../businessPlan'
import { useAction, useComputed, useObservable } from '../../performance/mobx'
import {
  EXPANDED_SIDE_NAV_ID,
  HEADER_HEIGHT,
  SIDE_NAV_COLLAPSED_WIDTH,
  SIDE_NAV_WIDTH,
} from '../consts'
import BloomGrowthLogo from './bloomGrowthLogo.svg'
import { MeetingsList, WorkspacesList } from './lists'
import { useSideNavController } from './sideNavController'
import { SideNavEntry } from './sideNavEntry'
import { SideNavExtension } from './sideNavExtension'
import {
  MAX_WORKSPACE_MEETINGS_ENTRIES_IN_SIDE_NAV,
  useSideNavDataQuery,
} from './sideNavQuery'
import { SideNavToolsList } from './sideNavToolsList'
import { SideNavUserMenu } from './sideNavUserMenu'
import { SupportPinCode } from './supportPinCode'

export const BloomSideNav = observer(function BloomSideNav() {
  const pageState = useObservable({
    openList: null as Maybe<'MEETINGS' | 'WORKSPACES'>,
  })

  const bloomAuthHttp = useBloomAuthHttp()
  const bloomBusinessPlanNode = useBloomBusinessPlanNode()
  const meetingColorController = useMeetingColorController()
  const orgChartNode = useBloomOrgChartNode()
  const sideNav = useSideNavController()
  const theme = useTheme()
  const window = useWindow()
  const { openOverlazy } = useOverlazyController()

  const { navigate } = useNavigation()
  const { t } = useTranslation()
  const { v1Url } = useBrowserEnvironment()

  const isV3BusinessPlanEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_BUSINESS_PLAN_ENABLED
  )

  const isV3QuarterlyAlignmentEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_QUARTERLY_ALIGNMENT_ENABLED
  )

  const isExpandedSideNav = sideNav.sideNavExpanded

  const sideNavSubscription = useSubscription(useSideNavDataQuery(), {
    subscriptionId: 'BloomSideNav',
  })

  const subscriptionForV3BusinessPlans = useSubscription(
    {
      businessPlans: isV3BusinessPlanEnabled
        ? queryDefinition({
            def: bloomBusinessPlanNode,
            map: ({ id, currentUserPermissions }) => ({
              id,
              currentUserPermissions: currentUserPermissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
            useSubOpts: { doNotSuspend: true },
          })
        : null,
    },
    {
      subscriptionId: `sideNav-v3BusinessPlans`,
    }
  )

  const orgChartId = sideNavSubscription().data.user?.orgChartId
  const orgChartSubscription = useSubscription(
    {
      orgChart: orgChartId
        ? queryDefinition({
            def: orgChartNode,
            map: ({ seats }) => ({
              seats: seats({
                map: ({ id, users, directReports }) => ({
                  id,
                  users: users({
                    map: ({ id, fullName }) => ({ id, fullName }),
                  }),
                  directReports: directReports({ map: ({ id }) => ({ id }) }),
                }),
              }),
            }),
            useSubOpts: { doNotSuspend: true },
            target: { id: orgChartId },
          })
        : null,
    },
    {
      subscriptionId: `sideNav-orgChartSubscription`,
    }
  )

  // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/TTD-2381
  // note: subscription messages ignore the itemsPerPage param, this is a hack to make sure incoming sub messages do not
  // override that itemPerPage 'limit' here.
  const subscriptionProtectedPaginatedFavoritedWorkspaceResults = useComputed(
    () => {
      const workspaces =
        sideNavSubscription().data.user?.favoriteWorkspaces.nodes.slice(
          0,
          MAX_WORKSPACE_MEETINGS_ENTRIES_IN_SIDE_NAV
        ) ?? []

      return workspaces.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
        link: paths.workspace({
          isMeetingWorkspace: workspace.workspaceType === 'MEETING',
          workspaceId:
            workspace.workspaceType === 'MEETING'
              ? (workspace.workspaceParentId as Id)
              : workspace.id,
        }),
      }))
    },
    {
      name: `SideNav-subscriptionProtectedPaginatedFavoritedWorkspaceResults`,
    }
  )

  const subscriptionProtectedPaginatedFavoritedMeetingResults = useComputed(
    () => {
      const meetings =
        sideNavSubscription().data.user?.favoriteMeetings.nodes.slice(
          0,
          MAX_WORKSPACE_MEETINGS_ENTRIES_IN_SIDE_NAV
        ) ?? []

      return meetings.map((meeting) => ({
        id: meeting.id,
        name: meeting.name,
        link: paths.meeting({
          meetingId: meeting.id,
        }),
      }))
    },
    {
      name: `SideNav-subscriptionProtectedPaginatedFavoritedMeetingResults`,
    }
  )

  const getCoachToolsUrlId = useComputed(
    () => {
      const coachToolsUrl = sideNavSubscription().data.user?.coachToolsUrl
      if (!coachToolsUrl) {
        return null
      }

      const coachToolsUrlArray = coachToolsUrl.split('/')
      const coachToolsId = coachToolsUrlArray[coachToolsUrlArray.length - 1]

      return coachToolsId
    },
    { name: 'sideNav-getCoachToolsUrlId' }
  )

  const getReferSideNavEntry = useComputed(
    () => {
      return sideNavSubscription().data.user?.coachToolsUrl
        ? {
            title: t('Refer a client'),
            href: 'https://share.hsforms.com/1aiSeZR2DQ9KsColq5ZI3rw5f3td',
          }
        : {
            title: t('Refer and earn'),
            href: 'https://referrals.bloomgrowth.com/v2/7/register',
          }
    },
    { name: 'sideNave-getReferSideNavEntry' }
  )

  const doesUserHaveDirectReports = useComputed(
    () => {
      const currentUserId = sideNavSubscription().data.user?.id
      const orgChartSeats = orgChartSubscription().data.orgChart?.seats.nodes

      if (!currentUserId) {
        return false
      }

      let doesUserHaveDirectReports = false

      orgChartSeats?.forEach((seat) => {
        if (!doesUserHaveDirectReports) {
          const currentUserInSeat = seat.users.nodes.filter((userInSeat) => {
            return userInSeat.id === currentUserId
          })
          const isSeatHasDirectReports = seat.directReports.nodes.length !== 0

          if (currentUserInSeat.length !== 0 && isSeatHasDirectReports) {
            doesUserHaveDirectReports = true
          }
        }
      })

      return doesUserHaveDirectReports
    },
    {
      name: `SideNav-doesUserHaveDirectReports`,
    }
  )

  const closeList = useAction(() => {
    pageState.openList = null
  })

  const openWorkspacesList = useAction(() => {
    pageState.openList = 'WORKSPACES'
  })

  const openMeetingsList = useAction(() => {
    pageState.openList = 'MEETINGS'
  })

  const onSideNavClose = useAction(() => {
    closeList()
    sideNav.closeSideNav()
  })

  const onSideNavOpen = useAction(() => {
    sideNav.openSideNav()
  })

  const logout = useAction(async () => {
    try {
      await bloomAuthHttp.logout(v1Url)
      window.location.replace(
        `${v1Url}Account/Login?ReturnUrl=${window.location.origin}`
      )
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error logging out`),
        error: new UserActionError(error),
      })
    }
  })

  const getLinkToBusinessPlanBasedOnFeatureFlag = useAction(
    (isV3BusinessPlanEnabled: boolean) => {
      if (isV3BusinessPlanEnabled) {
        const v3BusinessPlanId = getData().v3BusinessPlanId

        if (v3BusinessPlanId) {
          return v3BusinessPlanId.toString()
        } else {
          // Note - in this case with no main org bp we just want to route to the first business plan the user has permissions over.
          // If they have no permissions over any plan, then we returned the first shared org plan.
          // If no plans at all, return the create URL for the bp landing page.
          const firstBusinessPlanWithPermissions = getData().businessPlans.find(
            (bp) => {
              return bp.currentUserPermissions !== null
            }
          )

          if (firstBusinessPlanWithPermissions) {
            return firstBusinessPlanWithPermissions.id.toString()
          }

          const firstSharedOrgBusinessPlan = getData().businessPlans[0]

          return firstSharedOrgBusinessPlan
            ? firstSharedOrgBusinessPlan.id.toString()
            : V3_BUSINESS_PLAN_CREATE_PARAM
        }
      } else {
        const v1BusinessPlanId = getData().v1BusinessPlanId

        return v1BusinessPlanId ? v1BusinessPlanId : undefined
      }
    }
  )

  const allUserMeetings = sideNavSubscription().data.user?.allMeetings
  useEffect(() => {
    if (allUserMeetings) {
      const meetingIds = allUserMeetings.nodes.map((m) => m.id)
      meetingColorController.setMeetingColors({ meetingIds, theme })
    }
  }, [allUserMeetings])

  const getData = useComputed(
    () => {
      return {
        currentUser: sideNavSubscription().data.user,
        getReferSideNavEntry,
        pageState,
        v3BusinessPlanId:
          sideNavSubscription().data.user?.orgSettings?.v3BusinessPlanId ||
          null,
        v1BusinessPlanId:
          sideNavSubscription().data.user?.orgSettings?.businessPlanId || null,
        businessPlans:
          subscriptionForV3BusinessPlans().data.businessPlans?.nodes || [],
      }
    },
    { name: 'sideNav-getData' }
  )

  const getActions = useComputed(
    () => {
      return { closeList, logout, getLinkToBusinessPlanBasedOnFeatureFlag }
    },
    { name: 'sideNav-getActions' }
  )

  const currentUserIsBaseUser =
    !getData().currentUser?.isOrgSupervisor &&
    !getData().currentUser?.isOrgAdmin

  return (
    <>
      <StyledSideNavWrapper
        id={EXPANDED_SIDE_NAV_ID}
        expanded={sideNav.sideNavExpanded}
      >
        <SideNavLists getData={getData} getActions={getActions} />
        <StyledSideNav expanded={isExpandedSideNav}>
          <StyledSideNavLogoSection>
            <StyledLogoContainer>
              <Link href={window.location.origin}>
                <Icon
                  iconName={'bloomGrowthIcon'}
                  iconSize={'lg'}
                  iconColor={{ color: theme.colors.sideNavLogoColor }}
                  css={
                    isExpandedSideNav &&
                    css`
                      display: none;
                    `
                  }
                />
                <img
                  src={BloomGrowthLogo}
                  alt={t('Bloom Growth')}
                  css={css`
                    height: ${toREM(24)};
                    width: ${toREM(137)};
                    ${!isExpandedSideNav &&
                    css`
                      display: none;
                    `}
                  `}
                />
              </Link>
            </StyledLogoContainer>
          </StyledSideNavLogoSection>
          <StyledSideNavTopSection>
            <SideNavUserMenu
              isExpandedSideNav={isExpandedSideNav}
              getData={getData}
              getActions={getActions}
            />
          </StyledSideNavTopSection>
          <StyledSideNavCenterSection>
            {isV3QuarterlyAlignmentEnabled && doesUserHaveDirectReports() && (
              <SideNavEntry
                image={<SideNavIcon iconName='peopleIcon' />}
                text={t('Direct reports')}
                expanded={isExpandedSideNav}
                actionable={
                  <Badge
                    intent='primary'
                    text={t('New')}
                    textType='body'
                    css={css`
                      margin-right: ${(prop) => prop.theme.sizes.spacing12};
                    `}
                  />
                }
                onClick={() => navigate(paths.directReports)}
              />
            )}

            {sideNavSubscription().data.user && (
              <SideNavEntry
                image={<SideNavIcon iconName='workspaceIcon' />}
                text={t('Workspace list ({{workspaceCount}})', {
                  workspaceCount:
                    sideNavSubscription().data.user?.allWorkspaces.totalCount,
                })}
                expanded={isExpandedSideNav}
                extension={
                  <SideNavExtension
                    type='WORKSPACES'
                    favorites={subscriptionProtectedPaginatedFavoritedWorkspaceResults()}
                  />
                }
                actionable={
                  <SideNavActionableAddButton
                    onClick={() => openOverlazy('CreateWorkspaceDrawer', {})}
                  />
                }
                onClick={openWorkspacesList}
              />
            )}

            {sideNavSubscription().data.user && (
              <SideNavEntry
                image={<SideNavIcon iconName='oneOnOneIcon' />}
                text={t('Meetings list ({{meetingsCount}})', {
                  meetingsCount:
                    sideNavSubscription().data.user?.allMeetings.totalCount,
                })}
                expanded={isExpandedSideNav}
                extension={
                  <SideNavExtension
                    type='MEETINGS'
                    favorites={subscriptionProtectedPaginatedFavoritedMeetingResults()}
                  />
                }
                actionable={
                  !currentUserIsBaseUser && (
                    <SideNavActionableAddButton
                      onClick={() => navigate(paths.createMeeting)}
                    />
                  )
                }
                css={css`
                  & #sideNavContainerCenter {
                    left: 10px;
                  }
                `}
                onClick={openMeetingsList}
              />
            )}

            <SideNavToolsList
              isV3BusinessPlanEnabled={!!isV3BusinessPlanEnabled}
              getActions={getActions}
            />

            <SideNavEntry
              image={<SideNavIcon iconName='documentIcon' />}
              subEntry={true}
              expanded={isExpandedSideNav}
              text={t('Documents')}
              onClick={() => navigate(paths.documents)}
            />
            {getCoachToolsUrlId() && (
              <SideNavEntry
                image={<SideNavIcon iconName='coachIcon' />}
                subEntry={true}
                expanded={isExpandedSideNav}
                text={t('Coach tools')}
                onClick={() => {
                  const coachToolsId = getCoachToolsUrlId()
                  if (coachToolsId) {
                    navigate(
                      paths.coachTools({
                        coachToolsId,
                      })
                    )
                  }
                }}
              />
            )}
          </StyledSideNavCenterSection>
          <StyledSideNavBottomSection>
            <SideNavEntry
              image={
                <SideNavIcon
                  iconName='blueStars'
                  iconColor={theme.colors.newFeatureExploreColor}
                />
              }
              subEntry={true}
              expanded={isExpandedSideNav}
              text={t('Explore new features')}
              textColor={theme.colors.newFeatureExploreColor}
              onClick={() => {
                openOverlazy('BloomNewFeaturesModal', {})
              }}
            />
            <StyledIconReturn>
              <SideNavEntry
                image={<SideNavIcon iconName='returnIcon' />}
                subEntry={true}
                expanded={isExpandedSideNav}
                text={t('Return to legacy')}
                useTextEllipsis={true}
                textColor={theme.colors.inputTextFieldTextColor}
                onClick={() => window.open(v1Url, '_self')}
              />
            </StyledIconReturn>
            <Menu
              position={'left center'}
              offset={'-102px'}
              content={(close) => (
                <>
                  <Menu.Item
                    onClick={(e) => {
                      openOverlazy('FeedbackModal', {})
                      close(e)
                    }}
                  >
                    {' '}
                    <Text type={'body'}>{t('Give feedback')}</Text>
                  </Menu.Item>{' '}
                  {/* <Menu.Item href=''>
                    {' '}
                    <Text type={'body'}>{t('Shortcuts')}</Text>
                  </Menu.Item>{' '} */}
                  <Menu.Item
                    href='https://help.bloomgrowth.com/'
                    target='_blank'
                  >
                    {' '}
                    <Text type={'body'}>{t('Knowledge Base')}</Text>
                  </Menu.Item>{' '}
                  <Menu.Item
                    href='https://bloomgrowth.com/upload-data/'
                    target='_blank'
                  >
                    {' '}
                    <Text type={'body'}>{t('Request upload')}</Text>
                  </Menu.Item>{' '}
                  <Menu.Item
                    href='https://www.bloomgrowth.com/gethelp'
                    target='_blank'
                  >
                    {' '}
                    <Text type={'body'}>{t('Contact us')}</Text>
                  </Menu.Item>{' '}
                  {sideNavSubscription().data.user?.supportContactCode && (
                    <Menu.Item>
                      <Text
                        type={'body'}
                        css={`
                          display: inline-flex;
                          align-items: center;
                          gap: ${theme.sizes.spacing8};
                        `}
                      >
                        {t('Support Pin')}
                        <SupportPinCode
                          code={
                            sideNavSubscription().data.user
                              ?.supportContactCode || ''
                          }
                        />
                      </Text>
                    </Menu.Item>
                  )}
                </>
              )}
            >
              <SideNavEntry
                image={<SideNavIcon iconName='questionCircleSolid' />}
                text={t('Help / Give feedback')}
                expanded={isExpandedSideNav}
              />
            </Menu>
            <Menu
              position={'left center'}
              offset={'-37px'}
              content={(close) => (
                <>
                  <Menu.Item href={paths.orgSettings} onClick={close}>
                    <Text type={'body'}>{t('Organization settings')}</Text>
                  </Menu.Item>
                  <Menu.Item href={paths.manageUsers} onClick={close}>
                    <Text type={'body'}>{t('Manage users')}</Text>
                  </Menu.Item>
                  <Menu.Item href={paths.switchOrg} onClick={close}>
                    <Text type={'body'}>{t('Switch organizations')}</Text>
                  </Menu.Item>
                </>
              )}
            >
              <SideNavEntry
                expanded={isExpandedSideNav}
                useTextEllipsis={true}
                image={
                  sideNavSubscription().data.user?.currentOrgAvatar ? (
                    <StyledOrgAvatarPicture
                      src={
                        sideNavSubscription().data.user?.currentOrgAvatar || ''
                      }
                    />
                  ) : (
                    <SideNavIcon iconName='robotIcon' />
                  )
                }
                text={
                  sideNavSubscription().data.user?.currentOrgName ||
                  t('Company')
                }
              />
            </Menu>
          </StyledSideNavBottomSection>
        </StyledSideNav>
      </StyledSideNavWrapper>

      <StyledCollapseButton
        expanded={isExpandedSideNav}
        onClick={sideNav.sideNavExpanded ? onSideNavClose : onSideNavOpen}
        type='button'
        css={css`
          top: ${toREM(150)};
        `}
      >
        <Icon
          iconName={
            sideNav.sideNavExpanded ? 'chevronLeftIcon' : 'chevronRightIcon'
          }
          iconColor={{ color: theme.colors.iconDefault }}
          iconSize='lg'
        />
      </StyledCollapseButton>
    </>
  )
})

const SideNavLists = observer(
  (props: {
    getData: () => { pageState: { openList: Maybe<'WORKSPACES' | 'MEETINGS'> } }
    getActions: () => { closeList: () => void }
  }) => {
    const { getData, getActions } = props

    return (
      <>
        {getData().pageState.openList === 'WORKSPACES' && (
          <WorkspacesList getActions={getActions} />
        )}
        {getData().pageState.openList === 'MEETINGS' && (
          <MeetingsList getActions={getActions} />
        )}
      </>
    )
  }
)

interface IStyledSideNavProps {
  expanded: boolean
}

const StyledSideNavWrapper = styled.div<IStyledSideNavProps>`
  height: 100%;
  width: ${({ expanded }) =>
    expanded ? toREM(SIDE_NAV_WIDTH) : toREM(SIDE_NAV_COLLAPSED_WIDTH)};
  transition: width 200ms;

  z-index: ${(props) => props.theme.zIndices.sideNavExpandedOverContent};

  & #sideNavContainerCenter {
    left: ${({ expanded }) =>
      expanded ? toREM(SIDE_NAV_WIDTH) : toREM(SIDE_NAV_COLLAPSED_WIDTH)};
  }

  @media print {
    display: none !important;
  }
`

const StyledSideNav = styled.div<IStyledSideNavProps>`
  position: absolute;
  top: 0;
  display: flex;
  height: 100%;
  flex-direction: column;
  max-height: 100vh;
  background-color: ${(props) =>
    props.theme.colors.sideNavBarBackgroundDefault};
  overflow-x: hidden;
  min-width: ${toREM(SIDE_NAV_COLLAPSED_WIDTH)};
  width: ${({ expanded }) =>
    expanded ? toREM(SIDE_NAV_WIDTH) : toREM(SIDE_NAV_COLLAPSED_WIDTH)};

  & > * {
    /* prevents children from shrinking as sideNav is collapsing */
    width: ${({ expanded }) =>
      expanded ? toREM(SIDE_NAV_WIDTH) : toREM(SIDE_NAV_COLLAPSED_WIDTH)};
  }

  transition: width 200ms;
`

const StyledSideNavLogoSection = styled.div`
  display: flex;
  align-items: center;
  height: ${toREM(HEADER_HEIGHT)};
  background-color: ${(props) =>
    props.theme.colors.sideNavLogoSectionBackground};
  padding: ${(props) => props.theme.sizes.spacing12};
`

const StyledCollapseButton = styled.button<{
  expanded: boolean
}>`
  border: none;
  border-radius: ${(props) => props.theme.sizes.br5};
  box-shadow: ${(props) => props.theme.sizes.bs2};
  padding: 0;
  cursor: pointer;
  background-color: ${(props) =>
    props.theme.colors.sideNavBarExpandIconBackgroundColor};
  position: fixed;
  z-index: ${(props) => props.theme.zIndices.sideNavCollapseButton};
  margin-left: ${({ expanded }) => (expanded ? toREM(236) : toREM(36))};
  transition: margin-left 200ms;

  @media print {
    display: none !important;
  }
`

const StyledLogoContainer = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`

const StyledSideNavTopSection = styled.div`
  padding: 0 0 ${(props) => props.theme.sizes.spacing16} 0;
  position: relative;
  border-bottom: ${toREM(2)} solid
    ${(props) => props.theme.colors.sideNavSeparatorBackground};
`

interface ISideNavIconProps {
  iconName: SingleColorIconName
  iconColor?: string
}

export function SideNavIcon(props: ISideNavIconProps) {
  const theme = useTheme()

  return (
    <Icon
      iconName={props.iconName}
      iconSize={'lg'}
      iconColor={{
        color: props.iconColor ?? theme.colors.sideNavBarIconColorDefault,
      }}
    />
  )
}

const StyledSideNavCenterSection = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: ${(props) => props.theme.sizes.spacing16} 0 0 0;
  border-bottom: ${(props) =>
    `${props.theme.sizes.mediumSolidBorder} ${props.theme.colors.sideNavSeparatorBackground}`};

  ::-webkit-scrollbar {
    background: ${(props) => props.theme.colors.scrollSideNavBackgroundColor};

    &-thumb {
      background: ${(props) => props.theme.colors.scrollThumbColor};
    }
  }

  & #sideNavContainerCenter {
    left: 10px;
  }
`

const StyledSideNavBottomSection = styled.div`
  padding: ${(props) => props.theme.sizes.spacing8} 0
    ${(props) => props.theme.sizes.spacing16} 0;
`

const StyledOrgAvatarPicture = styled.img`
  vertical-align: top;
  overflow: hidden;
  border-radius: ${(props) => props.theme.sizes.br6};
  width: ${toREM(24)};
  height: ${toREM(24)};
  display: inline-flex;
  justify-content: center;
  align-items: center;
  object-fit: cover;
  object-position: top;
`

const StyledIconReturn = styled.div`
  & img {
    height: ${toREM(19)};
    width: ${toREM(24)};
  }

  & h4 {
    font-weight: 400;
    font-size: ${toREM(16)};
    color: ${({ theme }) => theme.colors.returnLegacyButtonText};
  }
`

interface ISideNavActionableAddButtonProps {
  onClick: () => void
}

const SideNavActionableAddButton = observer(function SideNavActionableAddButton(
  props: ISideNavActionableAddButtonProps
) {
  const theme = useTheme()

  return (
    <Clickable
      clicked={(e) => {
        e.stopPropagation()
        props.onClick()
      }}
    >
      <div
        css={css`
          background-color: ${(prop) =>
            prop.theme.colors.sideNavAddButtonBackgroundDefault};
          border-radius: ${(prop) => prop.theme.sizes.br1};
        `}
      >
        <Icon
          iconName='plusIcon'
          iconSize='lg'
          iconColor={{
            color: theme.colors.sideNavActionableAddButtonIconColor,
          }}
        />
      </div>
    </Clickable>
  )
})
