import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { ITooltipProps, Tooltip, useTheme } from '@mm/core-web/ui'

import { useBloomPageEmptyStateController } from './bloomPageEmptyStateController'
import { BloomPageEmptyStateTooltipTypes } from './bloomPageEmptyStateTypes'

type childrenType = (
  opt?: ITooltipProps & { isHover?: boolean }
) => React.ReactNode

interface IBloomPageEmptyStateTooltipProvider {
  emptyStateId: BloomPageEmptyStateTooltipTypes
  children: childrenType | React.ReactNode
}

export const BloomPageEmptyStateTooltipProvider = observer(
  function BloomPageEmptyStateTooltipProvider(
    props: IBloomPageEmptyStateTooltipProvider
  ) {
    const { pageData, showTooltips, showHoverState } =
      useBloomPageEmptyStateController()
    const theme = useTheme()

    const getFullOffsetById = () => {
      switch (props.emptyStateId) {
        case 'navPlusBtn':
          return `${theme.sizes.spacing6}, ${theme.sizes.spacing4}`
        case 'pageTitlePlusIcon':
        case 'externalMenuContent':
          return `0, ${theme.sizes.spacing4}`
        case 'quickCreation':
          return `0, -${theme.sizes.spacing10}`
        default:
          return undefined
      }
    }
    const getPositionById: () => ITooltipProps['position'] = () => {
      switch (props.emptyStateId) {
        case 'navPlusBtn':
          return 'bottom right'
        case 'quickCreation':
          return 'bottom left'
        default:
          return 'bottom center'
      }
    }
    const getArrowPositionById: () => ITooltipProps['position'] = () => {
      switch (props.emptyStateId) {
        case 'quickCreation':
          return 'bottom center'
        default:
          return undefined
      }
    }

    const tooltipData: ITooltipProps & { isHover?: boolean } =
      pageData &&
      pageData.tooltipsData &&
      pageData.tooltipsData[props.emptyStateId]
        ? {
            msg: pageData.tooltipsData[props.emptyStateId]?.text,
            disabled: pageData.tooltipsData[props.emptyStateId]?.disabled,
            isOpen: showTooltips,
            position: getPositionById(),
            variant: 'skinny',
            fullOffset: getFullOffsetById(),
            contentCss: css`
              padding: ${`${theme.sizes.spacing8} ${theme.sizes.spacing16}`} !important;
            `,
            arrowPosition: getArrowPositionById(),
            isHover: showHoverState,
          }
        : {
            msg: '',
            disabled: true,
          }

    if (typeof props.children !== 'function') {
      return <Tooltip {...tooltipData}>{props.children}</Tooltip>
    }

    return <>{props.children(tooltipData)}</>
  }
)
