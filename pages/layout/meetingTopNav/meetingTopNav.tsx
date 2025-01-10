import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'
import { queryDefinition, useAction, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  required,
} from '@mm/core/forms'

import {
  EBloomPostHogFeatureFlag,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomBusinessPlanMutations,
  useBloomCustomTerms,
  useBloomFavoriteMutations,
  useBloomMeetingNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useNavigation } from '@mm/core-web/router/hooks'
import {
  BtnIcon,
  CheckBoxInput,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { paths } from '@mm/bloom-web/router/paths'

import {
  IMeetingPageViewActionHandlers,
  type TMeetingTab,
} from '../../meetings'
import { BloomHeader } from '../header/bloomHeader'
import { getTopNavPermissions } from './meetingTopNavPermissions'
import { MeetingWorkspaceSwitchButton } from './meetingWorkspaceSwitchButton'

export const MeetingTopNav = observer(function MeetingTopNav(props: {
  meetingId: Id
  activeTab: TMeetingTab
  workspaceHomeId: Maybe<Id>
  hideActiveTab?: boolean
  hideMeetingSpecificKebabMenuOpts?: boolean
  setActiveTab: (tab: TMeetingTab) => void
  onViewArchiveClick: () => void
  onViewAdvancedSettingsClick: () => void
  onEditMeetingClick: () => void
  onSetPrimaryWorkspace: IMeetingPageViewActionHandlers['onSetPrimaryWorkspace']
}) {
  const theme = useTheme()
  const terms = useBloomCustomTerms()
  const { createBusinessPlanForMeeting } = useBloomBusinessPlanMutations()
  const { createFavorite, deleteFavorite } = useBloomFavoriteMutations()
  const { getSecondsSinceEpochUTC } = useTimeController()
  const { navigate } = useNavigation()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const isV3BusinessPlanEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_BUSINESS_PLAN_ENABLED
  )

  const hideActiveTab = props.hideActiveTab || false
  const hideMeetingSpecificKebabMenuOpts =
    props.hideMeetingSpecificKebabMenuOpts || false

  const subscription = useSubscription(
    {
      currentUser: useAuthenticatedBloomUserQueryDefinition({
        map: ({ id, isOrgAdmin }) => ({
          id,
          isOrgAdmin,
        }),
      }),
      meeting: queryDefinition({
        def: useBloomMeetingNode(),
        map: ({
          name,
          businessPlanId,
          favoriteId,
          favoritedTimestamp,
          meetingType,
          currentMeetingInstance,
          workspace,
          currentMeetingAttendee,
        }) => ({
          name,
          businessPlanId,
          favoriteId,
          favoritedTimestamp,
          meetingType,
          currentMeetingInstance: currentMeetingInstance({
            map: ({}) => ({}),
          }),
          workspace: workspace({ map: ({ favorited }) => ({ favorited }) }),
          currentMeetingAttendee: currentMeetingAttendee({
            map: ({ isUsingV3, permissions }) => ({
              isUsingV3,
              permissions: permissions({
                map: ({ view, edit, admin }) => ({ view, edit, admin }),
              }),
            }),
          }),
        }),
        target: {
          id: props.meetingId,
        },
      }),
    },
    {
      subscriptionId: `TopNav-${props.meetingId}`,
    }
  )

  const isOrgAdmin = subscription().data.currentUser.isOrgAdmin
  const currentUserPermissions = useMemo(() => {
    return getTopNavPermissions({
      currentUserPermissions:
        subscription().data.meeting?.currentMeetingAttendee.permissions ?? null,
      isOrgAdmin,
    })
  }, [
    subscription().data.meeting?.currentMeetingAttendee.permissions,
    isOrgAdmin,
  ])

  const isOngoingMeeting = !!subscription().data.meeting.currentMeetingInstance

  const isFavorited = !!subscription().data.meeting.favoriteId

  const onFavoriteMeetingClicked = async () => {
    try {
      await createFavorite({
        parentId: props.meetingId,
        user: subscription().data.currentUser.id,
        parentType: 'Meeting',
        position: 0,
        postedTimestamp: getSecondsSinceEpochUTC(),
      })
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t('Issue favoriting this meeting'),
        error: new UserActionError(error),
      })
    }
  }

  const onUnFavoriteMeetingClicked = async () => {
    const favoriteId = subscription().data.meeting.favoriteId
    if (favoriteId) {
      try {
        await deleteFavorite({
          favoriteId,
          parentType: 'Meeting',
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Issue removing meeting as favorite'),
          error: new UserActionError(error),
        })
      }
    }
  }

  const onHandleCreateBusinessPlanForMeeting = useAction(async () => {
    try {
      await createBusinessPlanForMeeting({
        meetingId: subscription().data.meeting.id,
      })

      openOverlazy('Toast', {
        type: 'success',
        text: t(`{{bp}} attached`, {
          bp: terms.businessPlan.singular,
        }),
        undoClicked: () => {
          console.log(
            '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
          )
        },
      })
    } catch (error) {
      openOverlazy('Toast', {
        type: 'error',
        text: t(`Error creating {{bp}}`, {
          bp: terms.businessPlan.lowercaseSingular,
        }),
        error: new UserActionError(error),
      })
    }
  })

  const onHandleNavigateToBusinessPlan = useAction(() => {
    const businessPlanId = subscription().data.meeting.businessPlanId

    if (businessPlanId) {
      return navigate(paths.businessPlan({ businessPlanId }))
    }
  })

  const titleStar = isFavorited ? (
    <BtnIcon
      intent='tertiaryTransparent'
      size='lg'
      iconProps={{
        iconName: 'starFullIcon',
        iconSize: 'lg',
      }}
      ariaLabel={t('unfavorite meeting/workspace')}
      tag={'span'}
      onClick={async () => {
        await onUnFavoriteMeetingClicked()
      }}
      css={css`
        background-color: ${theme.colors.topNavBackground};
      `}
    />
  ) : (
    <BtnIcon
      intent='tertiaryTransparent'
      size='lg'
      iconProps={{
        iconColor: { color: theme.colors.starNavBarUnselected },
        iconName: 'starEmptyIcon',
        iconSize: 'lg',
      }}
      ariaLabel={t('favorite meeting/workspace')}
      tag={'span'}
      onClick={async () => {
        await onFavoriteMeetingClicked()
      }}
    />
  )

  const threeDotMenu = (
    <Menu
      position={'top right'}
      margin={theme.sizes.spacing12}
      content={(close) => (
        <>
          {/* Commented in order to complete https://winterinternational.atlassian.net/browse/TTD-1521 */}
          {/* <Menu.Item
              // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
              onClick={() => console.log('@TODO_BLOOM TTD-350')}
            >
              <Text type={'body'}>{t('WhiteBoard')}</Text>
            </Menu.Item> */}
          {/* Commented in order to complete https://winterinternational.atlassian.net/browse/TTD-1521 */}
          {/* <Menu.Item
              isSectionHeader={true}
              // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
              onClick={() => console.log('@TODO_BLOOM TTD-350')}
            >
              <Text type={'body'} weight={'semibold'}>
                {t('Print')}
              </Text>
            </Menu.Item>
            <Menu.Item href={`${v1Url}L10/printout/${meetingId}`}>
              <Text type={'body'}>{t('Meeting printout')}</Text>
            </Menu.Item>
            <Menu.Item
              // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
              onClick={() => console.log('@TODO_BLOOM TTD-350')}
            >
              <Text type={'body'}>{t('Quarterly printout')}</Text>
            </Menu.Item> */}
          {/* <Menu.Item
            isSectionHeader={true}
            // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
            onClick={() => console.log('@TODO_BLOOM TTD-350')}
          >
            <Text type={'body'} weight={'semibold'}>
              {t('Other')}
            </Text>
          </Menu.Item> */}
          {!hideMeetingSpecificKebabMenuOpts && (
            <Menu.Item
              onClick={(e) => {
                close(e)
                props.onEditMeetingClick()
              }}
            >
              <Text type={'body'}>{'Edit meeting'}</Text>
            </Menu.Item>
          )}
          {isV3BusinessPlanEnabled && !hideMeetingSpecificKebabMenuOpts && (
            <>
              {subscription().data.meeting.businessPlanId ? (
                <Menu.Item
                  onClick={(e) => {
                    close(e)
                    onHandleNavigateToBusinessPlan()
                  }}
                >
                  <TextEllipsis
                    lineLimit={2}
                    wordBreak={true}
                    type='body'
                    weight={'normal'}
                    css={css`
                      text-align: left;
                    `}
                  >
                    {t('View {{bp}}', { bp: terms.businessPlan.singular })}
                  </TextEllipsis>
                </Menu.Item>
              ) : (
                <Menu.Item tag={'div'}>
                  <EditForm
                    isLoading={subscription().querying}
                    values={{ attachBpToMeeting: false }}
                    disabled={
                      !currentUserPermissions.canAttachBusinessPlanToMeeting
                        .allowed
                    }
                    disabledTooltip={
                      !currentUserPermissions.canAttachBusinessPlanToMeeting
                        .allowed
                        ? {
                            msg: currentUserPermissions
                              .canAttachBusinessPlanToMeeting.message,
                          }
                        : undefined
                    }
                    validation={
                      {
                        attachBpToMeeting: formValidators.boolean({
                          additionalRules: [required()],
                        }),
                      } satisfies GetParentFormValidation<{
                        attachBpToMeeting: boolean
                      }>
                    }
                    onSubmit={() => onHandleCreateBusinessPlanForMeeting()}
                  >
                    {({ values, fieldNames }) => {
                      return (
                        <CheckBoxInput
                          id='attachBusinessPlanToMeeting'
                          name={fieldNames.attachBpToMeeting}
                          disabled={
                            !!values?.attachBpToMeeting ||
                            !currentUserPermissions
                              .canAttachBusinessPlanToMeeting.allowed
                          }
                          text={
                            <TextEllipsis
                              lineLimit={1}
                              wordBreak={true}
                              type='body'
                              weight={'normal'}
                              css={css`
                                margin-left: ${theme.sizes.spacing8};
                              `}
                            >
                              {t('Attach {{bp}}', {
                                bp: terms.businessPlan.singular,
                              })}
                            </TextEllipsis>
                          }
                          css={css`
                            justify-content: center;
                            text-align: left;
                          `}
                        />
                      )
                    }}
                  </EditForm>
                </Menu.Item>
              )}
            </>
          )}
          {!hideMeetingSpecificKebabMenuOpts && (
            <>
              <Menu.Item
                onClick={(e) => {
                  close(e)
                  props.onViewArchiveClick()
                }}
              >
                <Text type={'body'}>{t('Meeting Archive')}</Text>
              </Menu.Item>
              {/* Commented in order to complete https://winterinternational.atlassian.net/browse/TTD-1521 */}
              {/* <Menu.Item
              // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
              onClick={() => console.log('@TODO_BLOOM TTD-350')}
            >
              <Text type={'body'}>{t('Send to implementor')}</Text>
            </Menu.Item>
            <Menu.Item
              // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
              onClick={() => console.log('@TODO_BLOOM TTD-350')}
            >
              <Text type={'body'}>{t('Texting actions')}</Text>
            </Menu.Item>

            <Menu.Item href={`${v1Url}L10/MeetingSummarySettings/${meetingId}`}>
              <Text type={'body'}>{t('Subscribe/summay')}</Text>
            </Menu.Item> */}
              <Menu.Item
                onClick={(e) => {
                  close(e)
                  props.onViewAdvancedSettingsClick()
                }}
                disabled={
                  !currentUserPermissions.canEditMeetingAdvancedSettings.allowed
                }
                tooltip={
                  !currentUserPermissions.canEditMeetingAdvancedSettings.allowed
                    ? {
                        msg: currentUserPermissions
                          .canEditMeetingAdvancedSettings.message,
                        position: 'bottom center',
                      }
                    : undefined
                }
              >
                <Text type={'body'}>{'Advanced settings'}</Text>
              </Menu.Item>
            </>
          )}
          <Menu.Item
            disabled={props.workspaceHomeId === props.meetingId}
            tooltip={
              props.workspaceHomeId === props.meetingId
                ? {
                    msg: t(
                      'This is currently set as your primary workspace. Select another to replace it.'
                    ),
                    position: 'top center',
                  }
                : undefined
            }
            onClick={async (e) => {
              close(e)
              await props.onSetPrimaryWorkspace({
                workspaceType: 'MEETING',
                meetingOrWorkspaceId: props.meetingId,
              })
            }}
          >
            <div
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              <Icon
                iconName='homeIcon'
                css={css`
                  margin-right: ${(prop) => prop.theme.sizes.spacing8};
                `}
              />
              <Text type={'body'}>{t('Set as primary workspace')}</Text>
            </div>
          </Menu.Item>
        </>
      )}
    >
      <BtnIcon
        intent='tertiaryTransparent'
        size='lg'
        iconProps={{
          iconName: 'moreVerticalIcon',
          iconSize: 'lg',
        }}
        onClick={() => null}
        ariaLabel={t('more options')}
        tag={'span'}
      />
    </Menu>
  )

  const meetingWorkspaceSwitchButton = (
    <MeetingWorkspaceSwitchButton
      activeTab={props.activeTab}
      isOngoingMeeting={isOngoingMeeting}
      setActiveTab={props.setActiveTab}
    />
  )

  return (
    <BloomHeader
      title={subscription().data.meeting.name}
      titleAdornment={titleStar}
      middleSection={hideActiveTab ? undefined : meetingWorkspaceSwitchButton}
      rightSection={threeDotMenu}
      defaultPropsForDrawers={{
        meetingId: props.meetingId,
      }}
    />
  )
})
