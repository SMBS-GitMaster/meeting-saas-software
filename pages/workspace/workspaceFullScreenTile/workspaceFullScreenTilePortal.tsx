import { observer } from 'mobx-react'
import React from 'react'
import { Portal } from 'react-portal'
import { css } from 'styled-components'

import { useDocument } from '@mm/core/ssr'

import { BLOOM_WORKSPACE_EXPANDED_PORTAL_OUT_ID } from '@mm/core-bloom'

import { ExpandedComponent, Icon, toREM, useTheme } from '@mm/core-web/ui'

import { useWorkspaceFullScreenTileController } from './workspaceFullScreenTileController'
import { WorkspaceFullScreenTileText } from './workspaceFullScreenTileText'

interface IWorkspaceFullScreenTilePortalProps {
  children: React.JSX.Element
}

export const WorkspaceFullScreenTilePortal = observer(
  function WorkspaceFullScreenTilePortal(
    props: IWorkspaceFullScreenTilePortalProps
  ) {
    const document = useDocument()
    const { minimizeTile, nextTile, previousTile } =
      useWorkspaceFullScreenTileController()

    const onArrowClicked = (direction: 'LEFT' | 'RIGHT') => {
      direction === 'LEFT' ? previousTile() : nextTile()
    }

    const onBackdropClicked = () => {
      minimizeTile()
    }

    return (
      <>
        <Portal
          node={
            document.getElementById(
              BLOOM_WORKSPACE_EXPANDED_PORTAL_OUT_ID
            ) as Maybe<HTMLDivElement>
          }
        >
          <ExpandedComponent
            backdropClicked={onBackdropClicked}
            arrowLeft={<WorkspaceFullScreenTileArrows arrowDirection='LEFT' />}
            arrowRight={
              <WorkspaceFullScreenTileArrows arrowDirection='RIGHT' />
            }
            arrowClicked={onArrowClicked}
          >
            {props.children}
          </ExpandedComponent>
        </Portal>
        <WorkspaceFullScreenTileText />
      </>
    )
  }
)

interface IWorkspaceFullScreenTileArrowsProps {
  arrowDirection: 'LEFT' | 'RIGHT'
}

const WorkspaceFullScreenTileArrows = observer(
  function WorkspaceFullScreenTileArrows(
    props: IWorkspaceFullScreenTileArrowsProps
  ) {
    const theme = useTheme()

    return (
      <div
        css={css`
          align-items: center;
          display: flex;
          flex-direction: column;
          height: ${toREM(80)};
          justify-content: center;
          padding-left: ${(prop) => prop.theme.sizes.spacing40};
          padding-right: ${(prop) => prop.theme.sizes.spacing40};
          width: ${toREM(80)};
        `}
      >
        <div
          css={css`
            align-items: center;
            background-color: ${(props) =>
              props.theme.colors.cardBackgroundColor};
            border-radius: ${(props) => props.theme.sizes.br50};
            box-shadow: ${(props) => props.theme.sizes.bs2};
            display: flex;
            height: ${toREM(40)};
            justify-content: center;
            width: ${toREM(40)};

            .WorkspaceFullScreenTileArrows {
              height: ${toREM(30)};
              width: ${toREM(30)};
            }
          `}
        >
          <Icon
            className='WorkspaceFullScreenTileArrows'
            iconName={
              props.arrowDirection === 'LEFT'
                ? 'chevronLeftIcon'
                : 'chevronRightIcon'
            }
            iconSize={'lg'}
            iconColor={{ color: theme.colors.iconDefault }}
          />
        </div>
      </div>
    )
  }
)
