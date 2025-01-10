import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'
import { queryDefinition, useSubscription } from '@mm/gql'

import { useTimeController } from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'

import {
  EBloomPostHogFeatureFlag,
  useAuthenticatedBloomUserQueryDefinition,
  useBloomCustomTerms,
  useBloomFavoriteMutations,
  useBloomWorkspaceNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { BtnIcon, Clickable, Icon, Menu, Text, useTheme } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { BloomHeader } from '@mm/bloom-web/pages/layout/header/bloomHeader'
import { useAction } from '@mm/bloom-web/pages/performance/mobx'
import { paths } from '@mm/bloom-web/router/paths'

import { type IWorkspacePageViewActions } from './workspacePageTypes'

interface IPersonalWorkspacePageHeaderProps {
  workspaceId: Id
  workspaceHomeId: Maybe<Id>
  onSetPrimaryWorkspace: IWorkspacePageViewActions['onSetPrimaryWorkspace']
}

export const PersonalWorkspacePageHeader = observer(
  function PersonalWorkspacePageHeader(
    props: IPersonalWorkspacePageHeaderProps
  ) {
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { createFavorite, deleteFavorite } = useBloomFavoriteMutations()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const isV3BusinessPlanEnabled = posthog.isFeatureEnabled(
      EBloomPostHogFeatureFlag.V3_BUSINESS_PLAN_ENABLED
    )

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ id, orgSettings }) => ({
            id,
            orgSettings: orgSettings({
              map: ({ businessPlanId, v3BusinessPlanId }) => ({
                businessPlanId,
                v3BusinessPlanId,
              }),
            }),
          }),
        }),
        workspace: queryDefinition({
          def: useBloomWorkspaceNode(),
          map: ({ name, favoriteId }) => ({
            name,
            favoriteId,
          }),
          target: {
            id: props.workspaceId,
          },
        }),
      },
      {
        subscriptionId: `PersonalWorkspacePageHeader-${props.workspaceId}`,
      }
    )

    const getLinkToBusinessPlanBasedOnFeatureFlag = useAction(
      (isV3BusinessPlanEnabled: boolean) => {
        if (isV3BusinessPlanEnabled) {
          const v3BusinessPlanId =
            subscription().data.currentUser?.orgSettings?.v3BusinessPlanId

          return v3BusinessPlanId
            ? paths.businessPlan({
                businessPlanId: v3BusinessPlanId,
              })
            : null
        } else {
          return subscription().data.currentUser?.orgSettings?.businessPlanId
            ? paths.businessPlan({
                businessPlanId:
                  subscription().data.currentUser.orgSettings.businessPlanId,
              })
            : null
        }
      }
    )

    const linkToBusinessPlan = getLinkToBusinessPlanBasedOnFeatureFlag(
      !!isV3BusinessPlanEnabled
    )

    const handleFavoriteWorkspace = useAction(async () => {
      const userId = subscription().data.currentUser.id
      try {
        await createFavorite({
          parentId: props.workspaceId,
          user: userId,
          parentType: 'Workspace',
          position: 0,
          postedTimestamp: getSecondsSinceEpochUTC(),
        })
      } catch (error) {
        openOverlazy('Toast', {
          type: 'error',
          text: t('Issue favoriting this workspace'),
          error: new UserActionError(error),
        })
      }
    })

    const handleUnfavoriteWorkspace = useAction(async () => {
      const favoriteId = subscription().data.workspace.favoriteId

      if (favoriteId) {
        try {
          await deleteFavorite({
            favoriteId: favoriteId,
            parentType: 'Workspace',
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t('Issue favoriting this workspace'),
            error: new UserActionError(error),
          })
        }
      }
    })

    return (
      <BloomHeader
        title={subscription().data.workspace.name}
        defaultPropsForDrawers={{ meetingId: null }}
        titleAdornment={
          subscription().data.workspace.favoriteId ? (
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
                await handleUnfavoriteWorkspace()
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
                await handleFavoriteWorkspace()
              }}
            />
          )
        }
        rightSection={
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            <Clickable
              clicked={() => {
                openOverlazy('EditWorkspaceDrawer', {
                  workspaceId: subscription().data.workspace.id,
                })
              }}
              css={css`
                align-items: center;
                display: flex;
                margin-right: ${({ theme }) => theme.sizes.spacing24};
              `}
            >
              <>
                <Icon iconName='plusIcon' iconSize='md' />
                <Text
                  color={{ color: theme.colors.buttonSecondaryTextDefault }}
                  weight='semibold'
                  css={css`
                    margin-left: ${({ theme }) => theme.sizes.spacing4};
                  `}
                >
                  {t('Add/remove tiles')}
                </Text>
              </>
            </Clickable>
            <Menu
              position={'top right'}
              margin={theme.sizes.spacing12}
              content={(close) => (
                <>
                  <Menu.Item
                    isSectionHeader={true}
                    // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
                    onClick={() => console.log('@TODO_BLOOM TTD-350')}
                  >
                    <Text type={'body'} weight={'semibold'}>
                      {t('Tools')}
                    </Text>
                  </Menu.Item>
                  {/* Commented in order to complete https://winterinternational.atlassian.net/browse/TTD-1521 */}
                  {/* <Menu.Item
                    // @TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-350
                    onClick={() => console.log('@TODO_BLOOM TTD-350')}
                  >
                    <Text type={'body'}>{t('WhiteBoard')}</Text>
                  </Menu.Item> */}
                  {linkToBusinessPlan && (
                    <Menu.Item href={linkToBusinessPlan}>
                      <Text type={'body'}>{terms.businessPlan.singular}</Text>
                    </Menu.Item>
                  )}

                  <Menu.Item href={paths.orgChart}>
                    <Text type={'body'}>
                      {terms.organizationalChart.singular}
                    </Text>
                  </Menu.Item>
                  <Menu.Item href={paths.rightPersonRightSeat}>
                    <Text type={'body'}>
                      {terms.rightPersonRightSeat.singular}
                    </Text>
                  </Menu.Item>
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

                  <Menu.Item
                    href={`${v1Url}L10/MeetingSummarySettings/${meetingId}`}
                  >
                    <Text type={'body'}>{t('Subscribe/summay')}</Text>
                  </Menu.Item> */}
                  <Menu.Item
                    disabled={props.workspaceHomeId === props.workspaceId}
                    tooltip={
                      props.workspaceHomeId === props.workspaceId
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
                        workspaceType: 'PERSONAL',
                        meetingOrWorkspaceId: props.workspaceId,
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
          </div>
        }
      />
    )
  }
)
