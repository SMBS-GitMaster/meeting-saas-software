import React from 'react'

import { Expandable, GridContainer, GridItem, Text } from '@mm/core-web/ui'

export function GridDemo() {
  return (
    <Expandable title='Grid'>
      <>
        <Text type='h2'>12 column grid</Text>
        <GridContainer columns={12}>
          {new Array(12).fill(null).map((_, i) => (
            <GridItem key={i} xl={1}>
              <div
                css={'background: pink; text-align: center; padding: 5px 0;'}
              >
                {i + 1}
              </div>
            </GridItem>
          ))}
        </GridContainer>
        <Text type='h2'>5 column grid</Text>
        <GridContainer columns={5}>
          <GridItem xl={3} l={5}>
            <div css={'background: pink; text-align: center; padding: 5px 0;'}>
              3 columns on XL, 5 on L or smaller
            </div>
          </GridItem>
          <GridItem xl={2} l={5}>
            <div css={'background: red; text-align: center; padding: 5px 0;'}>
              2 columns on XL, 5 on L or smaller
            </div>
          </GridItem>
          <GridItem xl={2} l={5}>
            <div css={'background: red; text-align: center; padding: 5px 0;'}>
              2 columns on XL, 5 on L or smaller
            </div>
          </GridItem>
        </GridContainer>
      </>
    </Expandable>
  )
}
