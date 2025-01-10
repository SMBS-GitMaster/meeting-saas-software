import { observer } from 'mobx-react'
import React from 'react'
import styled, { css, keyframes } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { SwitchInputCustomOptions, Text, useTheme } from '@mm/core-web/ui'

import { type TMeetingTab } from '../../meetings'

interface IMeetingWorkspaceSwitchButtonProps {
  activeTab: TMeetingTab
  isOngoingMeeting: boolean
  setActiveTab: (tab: TMeetingTab) => void
}

export const MeetingWorkspaceSwitchButton = observer(
  function MeetingWorkspaceSwitchButton(
    props: IMeetingWorkspaceSwitchButtonProps
  ) {
    const theme = useTheme()
    const { t } = useTranslation()

    const showDot =
      props.isOngoingMeeting && props.activeTab === 'WORKSPACE' ? (
        <FlashingDot />
      ) : props.isOngoingMeeting && props.activeTab === 'MEETING' ? (
        <NonFlashingDot />
      ) : null

    return (
      <StyledMeetingWorkspaceToggleContainer>
        <SwitchInputCustomOptions<TMeetingTab>
          value={props.activeTab}
          name={'SwitchInputCustomOptionsTopNav'}
          onChange={props.setActiveTab}
          options={[
            {
              value: 'MEETING',
              content: function renderContent() {
                return (
                  <div
                    css={css`
                      padding: 0 ${theme.sizes.spacing24};
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                    `}
                  >
                    {showDot}
                    <Text
                      weight={'semibold'}
                      type={'body'}
                      color={
                        props.activeTab === 'MEETING'
                          ? { color: theme.colors.bodyTextDefault }
                          : {
                              color: theme.colors.topNavBarToggleTextInactive,
                            }
                      }
                    >
                      {t('Meeting')}
                    </Text>
                  </div>
                )
              },
            },
            {
              value: 'WORKSPACE',
              content: function renderContent() {
                return (
                  <div
                    css={css`
                      padding: 0 ${theme.sizes.spacing24};
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                    `}
                  >
                    <Text
                      weight={'semibold'}
                      type={'body'}
                      color={
                        props.activeTab === 'WORKSPACE'
                          ? { color: theme.colors.bodyTextDefault }
                          : {
                              color: theme.colors.topNavBarToggleTextInactive,
                            }
                      }
                    >
                      {t('Workspace')}
                    </Text>
                  </div>
                )
              },
            },
          ]}
        />
      </StyledMeetingWorkspaceToggleContainer>
    )
  }
)

const StyledMeetingWorkspaceToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const FlashingDot = styled.div`
  animation: ${() => blink} 1.4s infinite;
  background-color: ${(props) => props.theme.colors.breadcrumbDotDark};
  border-radius: ${(props) => props.theme.sizes.br50};
  height: ${(props) => props.theme.sizes.spacing8};
  margin-right: ${(props) => props.theme.sizes.spacing4};
  width: ${(props) => props.theme.sizes.spacing8};
`

const NonFlashingDot = styled.div`
  background-color: ${(props) => props.theme.colors.breadcrumbDotDark};
  border-radius: ${(props) => props.theme.sizes.br50};
  height: ${(props) => props.theme.sizes.spacing8};
  margin-right: ${(props) => props.theme.sizes.spacing4};
  width: ${(props) => props.theme.sizes.spacing8};
`

const blink = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`
