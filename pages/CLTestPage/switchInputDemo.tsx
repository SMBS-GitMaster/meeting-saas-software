import React, { useState } from 'react'
import styled, { css, keyframes } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Expandable,
  SwitchInput,
  SwitchInputCustomOptions,
  Text,
  toREM,
} from '@mm/core-web/ui'

type TabOptions = 'MEETING' | 'WORKSPACE' | 'CATS'

export const SwitchInputDemo = () => {
  const [activeTab, setActiveTab] = useState<TabOptions>('MEETING')
  const [switchValue, setSwitchValue] = useState<boolean>(false)
  const { t } = useTranslation()
  const isOngoingMeeting = true

  const handleSetActiveTab = (tab: TabOptions) => {
    setActiveTab(tab)
  }

  return (
    <Expandable title='Switch Inputs'>
      <div
        css={css`
          background: white;
        `}
      >
        <Text type='h1' display='block'>
          Switch Input Demo
        </Text>
        <br />
        <SwitchInput
          onChange={setSwitchValue}
          id='SwitchInputCustomOptionsDemoWithoutOptions'
          name='SwitchInputCustomOptionsDemoWithoutOptions'
          value={switchValue}
          size='default'
          text={'Switch Input Text'}
        />
        <br />
        <SwitchInput
          onChange={setSwitchValue}
          id='SwitchInputCustomOptionsDemoWithoutOptions'
          name='SwitchInputCustomOptionsDemoWithoutOptions'
          value={switchValue}
          size='large'
        />
        <br />
        <SwitchInputCustomOptions<TabOptions>
          value={activeTab}
          name={'SwitchInputCustomOptionsDemo'}
          onChange={handleSetActiveTab}
          options={[
            {
              value: 'MEETING',
              content: function renderContent() {
                return (
                  <div
                    css={css`
                      width: ${toREM(103)};
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                    `}
                  >
                    {isOngoingMeeting && <FlashingDot />}
                    <Text weight={'semibold'} type={'body'}>
                      {t('Meetings')}
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
                      width: ${toREM(124)};
                    `}
                  >
                    <Text weight={'semibold'} type={'body'}>
                      {t('Workspaces')}
                    </Text>
                  </div>
                )
              },
            },
          ]}
        />

        <SwitchInputCustomOptions<TabOptions>
          value={activeTab}
          name={'SwitchInputCustomOptionsDemo2'}
          onChange={handleSetActiveTab}
          options={[
            {
              value: 'MEETING',
              content: function renderContent() {
                return (
                  <div
                    css={css`
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                    `}
                  >
                    {isOngoingMeeting && <FlashingDot />}
                    <Text weight={'semibold'} type={'body'}>
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
                  <div>
                    <Text weight={'semibold'} type={'body'}>
                      {t('Workspace')}
                    </Text>
                  </div>
                )
              },
            },
            {
              value: 'CATS',
              content: function renderContent() {
                return (
                  <>
                    <Text weight={'semibold'} type={'body'}>
                      {t('Cats')}
                    </Text>
                  </>
                )
              },
            },
          ]}
        />
      </div>
    </Expandable>
  )
}

const FlashingDot = styled.div`
  animation: ${() => blink} 1.4s infinite;
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
