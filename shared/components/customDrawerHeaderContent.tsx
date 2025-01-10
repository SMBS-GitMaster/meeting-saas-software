import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import {
  PermissionCheckResult,
  UserDrawerViewType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  DRAWER_HEADER_EMBEDDED_STYLES_BREAKPOINT,
  Icon,
  Menu,
  Text,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import {
  TCreateContextAwareItemOpts,
  getContextAwareIssueText,
  getContextAwareTodoText,
} from '../contextAware'

interface ICustomGoalHeaderContent {
  meetingId: Maybe<Id>
  drawerHeaderWidth: number
  context?: TCreateContextAwareItemOpts
  renderContextIssueOptions?: {
    canCreateIssuesInMeeting: PermissionCheckResult
  }
  renderContextTodoOptions?: {
    canCreateTodosInMeeting: PermissionCheckResult
  }
  renderDrawerViewMenuOptions?: {
    drawerView: UserDrawerViewType
    onHandleChangeDrawerViewSetting: (drawerView: UserDrawerViewType) => void
  }
  customContentForMenuItem?: (
    close: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  ) => React.ReactNode
  customContentForButtons?: () => React.ReactNode
}

export const CustomDrawerHeaderContent = observer(
  function CustomDrawerHeaderContent(props: ICustomGoalHeaderContent) {
    const terms = useBloomCustomTerms()
    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()

    const theme = useTheme()

    const {
      meetingId,
      drawerHeaderWidth,
      context,
      renderContextIssueOptions,
      renderContextTodoOptions,
      renderDrawerViewMenuOptions,
      customContentForMenuItem,
      customContentForButtons,
    } = props

    const renderContextTodos = context && renderContextTodoOptions
    const renderContextIssues = context && renderContextIssueOptions
    const renderOptionsInMenuView = !!(
      ((renderContextTodos && renderContextIssues) ||
        (renderContextTodos && customContentForMenuItem) ||
        (renderContextIssues && customContentForMenuItem)) &&
      drawerHeaderWidth &&
      drawerHeaderWidth < DRAWER_HEADER_EMBEDDED_STYLES_BREAKPOINT
    )

    const renderContextAwareInMenuViewForEmbeddedDrawers = () => {
      return (
        <Menu
          minWidthRems={16}
          position='bottom right'
          content={(close) => (
            <>
              {renderContextIssues && (
                <Menu.Item
                  onClick={(e) => {
                    openOverlazy('CreateIssueDrawer', {
                      meetingId,
                      context,
                      initialItemValues: {
                        title: context.title,
                      },
                    })
                    close(e)
                  }}
                  disabled={
                    !renderContextIssueOptions.canCreateIssuesInMeeting.allowed
                  }
                  tooltip={
                    !renderContextIssueOptions.canCreateIssuesInMeeting.allowed
                      ? {
                          msg: renderContextIssueOptions
                            .canCreateIssuesInMeeting.message,
                          position: 'top left',
                        }
                      : undefined
                  }
                  css={css`
                    padding: ${theme.sizes.spacing8} ${theme.sizes.spacing16};
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      justify-content: flex-start;
                      white-space: nowrap;
                    `}
                  >
                    <Icon
                      iconName={'issuesIcon'}
                      iconSize={'lg'}
                      css={css`
                        margin-right: ${theme.sizes.spacing8};
                      `}
                    />
                    <Text type={'body'}>{getContextAwareIssueText(terms)}</Text>
                  </div>
                </Menu.Item>
              )}
              {renderContextTodos && (
                <Menu.Item
                  disabled={
                    !renderContextTodoOptions.canCreateTodosInMeeting.allowed
                  }
                  tooltip={
                    !renderContextTodoOptions.canCreateTodosInMeeting.allowed
                      ? {
                          msg: renderContextTodoOptions.canCreateTodosInMeeting
                            .message,
                          position: 'top left',
                        }
                      : undefined
                  }
                  onClick={(e) => {
                    openOverlazy('CreateTodoDrawer', {
                      context,
                      meetingId,
                    })
                    close(e)
                  }}
                  css={css`
                    padding: ${theme.sizes.spacing8} ${theme.sizes.spacing16};
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      justify-content: flex-start;
                      white-space: nowrap;
                    `}
                  >
                    <Icon
                      iconName={'toDoCompleteIcon'}
                      iconSize={'lg'}
                      css={css`
                        margin-right: ${theme.sizes.spacing8};
                      `}
                    />
                    <Text type={'body'}>{getContextAwareTodoText(terms)}</Text>
                  </div>
                </Menu.Item>
              )}

              {customContentForMenuItem && customContentForMenuItem(close)}
            </>
          )}
        >
          <BtnIcon
            intent='tertiaryTransparent'
            iconProps={{
              iconName: 'moreVerticalIcon',
              iconSize: 'lg',
            }}
            ariaLabel={t('View context-aware items')}
            tag={'button'}
          />
        </Menu>
      )
    }

    const renderContextAwareAsButtonsForSlideDrawerOrSingleContextItem = () => {
      return (
        <>
          {renderContextIssues && (
            <BtnIcon
              intent='tertiaryTransparent'
              size='md'
              iconProps={{
                iconName: 'issuesIcon',
                iconSize: 'lg',
              }}
              onClick={() => {
                openOverlazy('CreateIssueDrawer', {
                  meetingId,
                  context,
                  initialItemValues: {
                    title: context.title,
                  },
                })
              }}
              disabled={
                !renderContextIssueOptions.canCreateIssuesInMeeting.allowed
              }
              tooltip={
                !renderContextIssueOptions.canCreateIssuesInMeeting.allowed
                  ? {
                      msg: renderContextIssueOptions.canCreateIssuesInMeeting
                        .message,
                      position: 'top left',
                    }
                  : {
                      msg: getContextAwareIssueText(terms),
                      position: 'bottom center',
                      offset: `${toREM(-8)}`,
                    }
              }
              ariaLabel={getContextAwareIssueText(terms)}
              tag={'span'}
              css={css`
                padding: 0;
                margin: 0 0 0 ${theme.sizes.spacing8};
              `}
            />
          )}

          {renderContextTodos && (
            <BtnIcon
              intent='tertiaryTransparent'
              size='md'
              iconProps={{
                iconName: 'toDoCompleteIcon',
                iconSize: 'lg',
              }}
              disabled={
                !renderContextTodoOptions.canCreateTodosInMeeting.allowed
              }
              tooltip={
                !renderContextTodoOptions.canCreateTodosInMeeting.allowed
                  ? {
                      msg: renderContextTodoOptions.canCreateTodosInMeeting
                        .message,
                      position: 'top left',
                    }
                  : {
                      msg: getContextAwareTodoText(terms),
                      position: 'bottom center',
                      offset: `${toREM(-8)}`,
                    }
              }
              onClick={() => {
                openOverlazy('CreateTodoDrawer', {
                  context,
                  meetingId,
                })
              }}
              ariaLabel={getContextAwareTodoText(terms)}
              tag={'span'}
              css={css`
                padding: ${({ theme }) => theme.sizes.spacing8} 0;
                margin: 0 0 0 ${theme.sizes.spacing8};
              `}
            />
          )}

          {customContentForButtons && customContentForButtons()}
        </>
      )
    }

    return (
      <>
        {renderDrawerViewMenuOptions && (
          <Menu
            position='bottom right'
            content={(close) => (
              <>
                <Menu.Item
                  onClick={(e) => {
                    renderDrawerViewMenuOptions.onHandleChangeDrawerViewSetting(
                      'SLIDE'
                    )
                    close(e)
                  }}
                >
                  <div
                    css={css`
                      display: flex;
                    `}
                  >
                    <Icon
                      iconName={'slideDrawerIcon'}
                      iconSize={'lg'}
                      css={css`
                        margin-right: ${theme.sizes.spacing8};
                      `}
                    />
                    <Text type={'body'}>{t('Slide over')}</Text>
                  </div>
                </Menu.Item>
                <Menu.Item
                  onClick={(e) => {
                    renderDrawerViewMenuOptions.onHandleChangeDrawerViewSetting(
                      'EMBEDDED'
                    )
                    close(e)
                  }}
                >
                  <div
                    css={css`
                      display: flex;
                    `}
                  >
                    <Icon
                      iconName={'embeddedDrawerIcon'}
                      iconSize={'lg'}
                      css={css`
                        margin-right: ${theme.sizes.spacing8};
                      `}
                    />
                    <Text type={'body'}>{t('Side by side')}</Text>
                  </div>
                </Menu.Item>
              </>
            )}
          >
            <BtnIcon
              intent='tertiaryTransparent'
              size={'md'}
              iconProps={{
                iconName:
                  renderDrawerViewMenuOptions.drawerView === 'EMBEDDED'
                    ? 'embeddedDrawerIcon'
                    : 'slideDrawerIcon',
                iconSize: 'lg',
                iconColor: { color: theme.colors.iconDefault },
              }}
              ariaLabel={t('View drawer embedded options')}
              tag={'button'}
            />
          </Menu>
        )}
        {renderOptionsInMenuView
          ? renderContextAwareInMenuViewForEmbeddedDrawers()
          : renderContextAwareAsButtonsForSlideDrawerOrSingleContextItem()}
      </>
    )
  }
)
