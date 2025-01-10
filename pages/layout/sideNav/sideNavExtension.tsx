import React from 'react'

import { type Id } from '@mm/gql'

import { Link, useTheme } from '@mm/core-web/ui'
import { TextEllipsis } from '@mm/core-web/ui/components/textEllipsis'

import { StyledSideNavLI, StyledSideNavUL } from './containers'

interface IFavorite {
  id: Id
  name: string
  link: string
}

interface ISideNavExtensionProps {
  type: 'MEETINGS' | 'WORKSPACES'
  favorites: Array<IFavorite>
}

export function SideNavExtension(props: ISideNavExtensionProps) {
  const theme = useTheme()

  if (props.favorites.length === 0) {
    return null
  }

  return (
    <>
      <StyledSideNavUL>
        {props.favorites.map((favorite) => (
          <StyledSideNavLI isBulletedList={true} key={favorite.id}>
            <Link href={favorite.link}>
              <TextEllipsis
                lineLimit={1}
                type='body'
                color={{ color: theme.colors.sideNavBarTextColorDefault }}
              >
                {favorite.name}
              </TextEllipsis>
            </Link>
          </StyledSideNavLI>
        ))}
      </StyledSideNavUL>
    </>
  )
}
