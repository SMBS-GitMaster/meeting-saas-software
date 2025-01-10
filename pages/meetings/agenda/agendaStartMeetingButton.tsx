import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'

import { ESpecialSessionMeetingType } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnText,
  ITooltipProps,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useAction } from '../../performance/mobx'
import { IMeetingAgendaActionHandlers } from './agendaCardTypes'
import { getSpecialSessionsMenuItemsLookup } from './lookups'

interface IAgendaStartMeetingButtonProps {
  disabled: boolean
  meetingId: Id
  className?: string
  tooltipProps?: ITooltipProps
  getActionHandlers: () => Pick<IMeetingAgendaActionHandlers, 'onStartMeeting'>
}

export const AgendaStartMeetingButton = observer(
  (props: IAgendaStartMeetingButtonProps) => {
    const diResolver = useDIResolver()
    const theme = useTheme()
    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()

    const { className, meetingId, disabled, tooltipProps, getActionHandlers } =
      props

    const handleOpenSpecialSessionsModal = useAction(
      (opts: {
        meetingId: Id
        specialSessionType: ESpecialSessionMeetingType
      }) => {
        const { meetingId, specialSessionType } = opts
        openOverlazy('StartSpecialSessionModal', {
          meetingId,
          specialSessionType,
        })
      }
    )

    const handleStartMeeting = useAction(() => {
      getActionHandlers().onStartMeeting()
    })

    return (
      <>
        <div
          className={className}
          css={`
            display: inline-flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle;

            .meeting_type_dropdown_button {
              width: ${toREM(40)};
              border-left: 0;
              border-top-left-radius: unset;
              border-bottom-left-radius: unset;

              &:focus {
                border-left: 0;
              }
            }
          `}
        >
          <BtnText
            intent={'primary'}
            ariaLabel={t('Start Meeting')}
            width={'fitted'}
            disabled={disabled}
            tooltip={tooltipProps}
            onClick={handleStartMeeting}
            css={`
              width: ${toREM(143)};
              border-right: ${theme.sizes.smallSolidBorder}
                ${theme.colors.buttonDropdownDivider};
              border-top-right-radius: unset;
              border-bottom-right-radius: unset;

              &:focus {
                border-right: ${theme.sizes.smallSolidBorder};
              }
            `}
          >
            <TextEllipsis lineLimit={1} wordBreak={true} weight={'semibold'}>
              {t('Start Meeting')}
            </TextEllipsis>
          </BtnText>

          <Menu
            maxWidth={toREM(200)}
            content={(close) => {
              return (
                <>
                  <Menu.Item
                    isSectionHeader={true}
                    css={css`
                      border-bottom: ${theme.sizes.smallSolidBorder}
                        ${theme.colors.menuDividerColor};
                      align-items: center;
                      padding-bottom: ${theme.sizes.spacing8};
                    `}
                  >
                    <Text weight={'semibold'}>{t('Special Sessions')}</Text>
                  </Menu.Item>
                  {getSpecialSessionsMenuItemsLookup(diResolver).map(
                    (specialItem) => {
                      return (
                        <Menu.Item
                          key={specialItem.value}
                          onClick={(e) => {
                            handleOpenSpecialSessionsModal({
                              specialSessionType: specialItem.value,
                              meetingId,
                            })
                            close(e)
                          }}
                        >
                          <TextEllipsis
                            lineLimit={1}
                            wordBreak={true}
                            css={css`
                              text-align: left;
                            `}
                          >
                            {specialItem.text}
                          </TextEllipsis>
                        </Menu.Item>
                      )
                    }
                  )}
                </>
              )
            }}
            position='bottom left'
          >
            <BtnText
              className={'meeting_type_dropdown_button'}
              intent={'primary'}
              ariaLabel={t('Choose meeting type')}
              width={'fitted'}
              disabled={disabled}
            >
              <Icon iconName='chevronDownIcon' iconSize={'lg'} />
            </BtnText>
          </Menu>
        </div>
      </>
    )
  }
)
