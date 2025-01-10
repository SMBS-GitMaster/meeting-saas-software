import { observer } from 'mobx-react'
import React from 'react'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { Link, Text, useTheme } from '@mm/core-web/ui'

import { paths } from '@mm/bloom-web/router/paths'

import { StyledSideNavLI, StyledSideNavUL } from './containers'

interface IToolsExtensionProps {
  businessPlanId: string | undefined
}

export const ToolsExtension = observer(function ToolsExtension(
  props: IToolsExtensionProps
) {
  const toolsLinks = useToolsLinks(props.businessPlanId)

  const theme = useTheme()
  return (
    <StyledSideNavUL>
      {toolsLinks.map((link) => (
        <StyledSideNavLI isBulletedList={false} key={link.title}>
          <Link href={link.path}>
            <Text
              type={'body'}
              color={{ color: theme.colors.sideNavBarTextColorDefault }}
            >
              {link.title}
            </Text>
          </Link>
        </StyledSideNavLI>
      ))}
    </StyledSideNavUL>
  )
})

export function useToolsLinks(businessPlanId: string | undefined) {
  const terms = useBloomCustomTerms()

  const linkToBusinessPlan = businessPlanId
    ? paths.businessPlan({ businessPlanId })
    : null

  const links = [
    {
      title: terms.organizationalChart.singular,
      path: paths.orgChart,
    },
    {
      title: terms.rightPersonRightSeat.singular,
      path: paths.rightPersonRightSeat,
    },
    {
      title: terms.quarterlyOneOnOne.singular,
      path: paths.quarterlyOneOnOne,
    },
  ]

  if (linkToBusinessPlan) {
    links.push({
      title: terms.businessPlan.singular,
      path: linkToBusinessPlan,
    })
  }

  return links
}
