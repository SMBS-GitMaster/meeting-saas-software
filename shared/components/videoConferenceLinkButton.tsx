import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { css } from 'styled-components'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import { useWindow } from '@mm/core/ssr'

import { useBloomMeetingNode } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { BtnText, Menu, Text, toREM, useTheme } from '@mm/core-web/ui'
import { Icon } from '@mm/core-web/ui/components/icon'
import { addHttps } from '@mm/core-web/utils'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

interface IVideoConferenceLinkButtonProps {
  meetingId: Id
  smallButton?: boolean
}

export const VideoConferenceLinkButton = observer(
  function VideoConferenceLinkButton(props: IVideoConferenceLinkButtonProps) {
    const { meetingId, smallButton } = props
    const { t } = useTranslation()
    const { openOverlazy, updateOverlazyProps } = useOverlazyController()

    const theme = useTheme()
    const window = useWindow()
    const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false)

    const bloomMeetingNode = useBloomMeetingNode()

    const subscription = useSubscription(
      {
        meeting: queryDefinition({
          def: bloomMeetingNode,
          target: { id: meetingId },
          map: ({ videoConferenceLink }) => ({ videoConferenceLink }),
          useSubOpts: { doNotSuspend: true },
        }),
      },
      {
        subscriptionId: `VideoConferenceLinkButton-${meetingId}`,
      }
    )

    const hasLink = !!subscription().data.meeting?.videoConferenceLink

    const openVideoConferenceModal = React.useCallback(() => {
      openOverlazy('VideoConferenceModal', {
        link: subscription().data.meeting?.videoConferenceLink ?? '',
        meetingId,
      })
    }, [subscription().data.meeting, meetingId, openOverlazy])

    const handleIsMenuOpen = (__: any, isOpen: boolean) => {
      setIsMenuOpen(isOpen)
    }

    const handleMenu = React.useCallback(() => {
      if (!hasLink) {
        openVideoConferenceModal()
      } else {
        handleIsMenuOpen(undefined, true)
      }
    }, [hasLink, openVideoConferenceModal])

    const link = subscription().data.meeting?.videoConferenceLink
    const handleNavigateToLinkInNewWindow = React.useCallback(() => {
      if (link) {
        const linkWithHttps = addHttps(link)
        return window.open(linkWithHttps, '_blank')
      }
    }, [window, link, addHttps])

    useEffect(() => {
      updateOverlazyProps('VideoConferenceModal', {
        link: subscription().data.meeting?.videoConferenceLink,
      })
    }, [subscription().data.meeting?.videoConferenceLink, updateOverlazyProps])

    return (
      <div
        css={css`
          box-shadow: ${(props) => props.theme.sizes.bs6};
          display: inline-flex;
          justify-content: center;
        `}
      >
        <CssClassSupplier
          css={css`
            color: ${(props) =>
              props.theme.colors.videoConferenceLinkButtonTextColor};
            border: none;
            height: ${(props) => props.theme.sizes.spacing40};
            max-height: unset;
            outline: none !important;
            padding-left: 0;
            padding-right: 0;
            text-decoration: none !important;
            width: ${(props) => props.theme.sizes.spacing48};

            &:hover,
            &:focus {
              img {
                filter: brightness(0) saturate(100%) invert(12%) sepia(11%)
                  saturate(2888%) hue-rotate(164deg) brightness(98%)
                  contrast(93%) !important;
              }
            }

            ${!smallButton &&
            css`
              padding-left: ${(props) => props.theme.sizes.spacing16};
              padding-right: ${(props) => props.theme.sizes.spacing16};
              width: ${toREM(209)};
            `}
          `}
        >
          {(toggleClass) => (
            <Menu
              minWidthRems={10}
              css={css`
                width: ${toREM(209)};

                &.ui.popup {
                  margin-left: 0 !important;
                  margin-right: 0 !important;
                }
              `}
              position={'top left'}
              isOpen={isMenuOpen}
              openOnTriggerClick={false}
              onChange={handleIsMenuOpen}
              content={(handleCloseMenu) => (
                <>
                  <Menu.Item
                    onClick={openVideoConferenceModal}
                    closeMenu={handleCloseMenu}
                  >
                    <Text type={'body'} weight={'normal'}>
                      {hasLink ? t('Edit link') : t('Add a link')}
                    </Text>{' '}
                  </Menu.Item>
                  {hasLink && (
                    <Menu.Item
                      closeMenu={handleCloseMenu}
                      onClick={handleNavigateToLinkInNewWindow}
                    >
                      <Text type={'body'} weight={'normal'}>
                        {t('Join now')}
                      </Text>
                    </Menu.Item>
                  )}
                </>
              )}
            >
              <BtnText
                intent='secondary'
                width={smallButton ? 'small' : 'large'}
                ariaLabel={t('Video conference')}
                onClick={handleMenu}
                className={toggleClass}
                customChild
              >
                <>
                  {smallButton ? (
                    <Icon
                      className='icon'
                      iconName='cameraIcon'
                      iconSize={'lg'}
                    />
                  ) : (
                    <>
                      <Icon
                        className='icon'
                        iconName='cameraIcon'
                        iconSize={'lg'}
                      />
                      <Text
                        type={'body'}
                        weight='semibold'
                        css={css`
                          padding-left: ${theme.sizes.spacing8};
                          line-height: ${theme.sizes.spacing16};
                        `}
                      >
                        {t('Video conference')}
                      </Text>
                      {hasLink && (
                        <Icon
                          className='icon'
                          iconName={
                            isMenuOpen ? 'chevronUpIcon' : 'chevronDownIcon'
                          }
                          iconSize={'lg'}
                        />
                      )}
                    </>
                  )}
                </>
              </BtnText>
            </Menu>
          )}
        </CssClassSupplier>
      </div>
    )
  }
)

const CssClassSupplier = (props: {
  className?: string
  children: (cssClass: string | undefined) => React.ReactNode
}) => {
  return <React.Fragment>{props.children(props.className)}</React.Fragment>
}
