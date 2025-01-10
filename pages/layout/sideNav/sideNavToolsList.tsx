import { observer } from 'mobx-react'
import React from 'react'
import styled from 'styled-components'

import { useTranslation } from '@mm/core-web'

import { BtnIcon, Menu, Text, toREM, useTheme } from '@mm/core-web/ui'

import { useAction, useObservable } from '../../performance/mobx'
import { SideNavIcon } from './sideNav'
import { useSideNavController } from './sideNavController'
import { SideNavEntry } from './sideNavEntry'
import { ToolsExtension, useToolsLinks } from './toolsExtension'

export const SideNavToolsList = observer(
  (props: {
    isV3BusinessPlanEnabled: boolean
    getActions: () => {
      getLinkToBusinessPlanBasedOnFeatureFlag: (
        isV3BusinessPlanEnabled: boolean
      ) => string | undefined
    }
  }) => {
    const componentState = useObservable({
      toolsListOpen: false,
    })

    const sideNav = useSideNavController()

    const { isV3BusinessPlanEnabled, getActions } = props

    const isExpandedSideNav = sideNav.sideNavExpanded

    const businessPlanIdForToolsLinks =
      getActions().getLinkToBusinessPlanBasedOnFeatureFlag(
        !!isV3BusinessPlanEnabled
      )

    const setToolsListOpen = useAction((toolsListOpen: boolean) => {
      componentState.toolsListOpen = toolsListOpen
    })

    const toolsLinks = useToolsLinks(businessPlanIdForToolsLinks)

    return (
      <>
        {sideNav.sideNavExpanded ? (
          <ToolsSideNavEntry
            isExpandedSideNav={isExpandedSideNav}
            toolsListOpen={componentState.toolsListOpen}
            businessPlanIdForToolsLinks={businessPlanIdForToolsLinks}
            setToolsListOpen={setToolsListOpen}
          />
        ) : (
          <Menu
            onChange={(_, isOpen) => {
              setToolsListOpen(isOpen)
            }}
            position='left center'
            offset={toREM(600)}
            content={(close) => (
              <>
                {toolsLinks.map((link) => (
                  <Menu.Item href={link.path} onClick={close} key={link.title}>
                    {' '}
                    <Text type={'body'}>{link.title}</Text>
                  </Menu.Item>
                ))}
              </>
            )}
          >
            <span>
              <ToolsSideNavEntry
                isExpandedSideNav={isExpandedSideNav}
                toolsListOpen={componentState.toolsListOpen}
                businessPlanIdForToolsLinks={businessPlanIdForToolsLinks}
                setToolsListOpen={setToolsListOpen}
              />
            </span>
          </Menu>
        )}
      </>
    )
  }
)

const ToolsSideNavEntry = observer(
  (props: {
    isExpandedSideNav: boolean
    toolsListOpen: boolean
    businessPlanIdForToolsLinks: string | undefined
    setToolsListOpen: (open: boolean) => void
  }) => {
    const theme = useTheme()
    const { t } = useTranslation()

    const {
      businessPlanIdForToolsLinks,
      isExpandedSideNav,
      toolsListOpen,
      setToolsListOpen,
    } = props
    return (
      <SideNavEntry
        onClick={() => setToolsListOpen(!toolsListOpen)}
        image={<SideNavIcon iconName='toolIcon' />}
        subEntry={true}
        expanded={isExpandedSideNav}
        text={t('Tools')}
        actionable={
          <StyledSideNavDropdownExpander>
            <BtnIcon
              tag={'button'}
              onClick={() => setToolsListOpen(!toolsListOpen)}
              iconProps={{
                iconColor: { color: theme.colors.sideNavBarIconColorDefault },
                iconName: toolsListOpen
                  ? 'chevronDownIcon'
                  : 'chevronRightIcon',
              }}
              size='lg'
              intent='naked'
              ariaLabel={t('Expand tools list')}
            />
          </StyledSideNavDropdownExpander>
        }
        extension={
          toolsListOpen && (
            <ToolsExtension businessPlanId={businessPlanIdForToolsLinks} />
          )
        }
      />
    )
  }
)

const StyledSideNavDropdownExpander = styled.div`
  border: 0;
  padding: 0;
  display: inline-flex;
  justify-content: center;
  background: none;
`
