import React from 'react'
import styled, { css } from 'styled-components'

import { Expandable, Responsive, responsiveCSS } from '@mm/core-web/ui'

export function ResponsiveComponentsDemo() {
  return (
    <Expandable title='Responsive Components'>
      <>
        <Responsive
          xl={<>XL</>}
          l={<>L</>}
          m={<>M</>}
          s={<>S</>}
          xs={<>XS</>}
          xxs={<>XXS</>}
        />
        <ResponsiveDiv>
          Responsive div content. Color will change as screen changes size
        </ResponsiveDiv>
      </>
    </Expandable>
  )
}

const ResponsiveDiv = styled.div`
  ${responsiveCSS({
    xl: css`
      background: red;
    `,
    m: css`
      background: pink;
    `,
    xs: css`
      background: green;
      color: white;
    `,
  })}
`
