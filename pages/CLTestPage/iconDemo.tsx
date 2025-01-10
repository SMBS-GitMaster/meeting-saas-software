import React from 'react'

import {
  Expandable,
  GridContainer,
  GridItem,
  Icon,
  Text,
  useTheme,
} from '@mm/core-web/ui'

export function IconDemo() {
  const theme = useTheme()

  return (
    <Expandable title='Icons'>
      <>
        <Text type='h3'>By size</Text>
        <br />
        xxs: <Icon iconName={'robotIcon'} iconSize={'xxs'} />
        <br />
        xs: <Icon iconName={'robotIcon'} iconSize={'xs'} />
        <br />
        sm: <Icon iconName={'robotIcon'} iconSize={'sm'} />
        <br />
        md: <Icon iconName={'robotIcon'} iconSize={'md'} />
        <br />
        lg: <Icon iconName={'robotIcon'} iconSize={'lg'} />
        <br />
        xl: <Icon iconName={'robotIcon'} iconSize={'xl'} />
        <br />
        <Text type='h3'>All icons</Text>
        <GridContainer columns={20}>
          {(
            Object.keys({
              ...theme.singleColorIcons,
              ...theme.multiColorIcons,
            }) as Array<any>
          )
            .sort((a, b) => (a as string).localeCompare(b))
            .map((iconName) => (
              <GridItem key={iconName} xl={2} l={4} m={5}>
                {iconName}
                <br />
                <Icon iconName={iconName} iconSize={'lg'} />
              </GridItem>
            ))}
        </GridContainer>
        <Text type='h3'>Multi Color Icon</Text>
        <br />
        <Icon
          iconName='checkCircleOnDisabled'
          iconSize='lg'
          iconColor={{ color: 'red' }}
          checkmarkColor={{ color: 'blue' }}
        />
      </>
    </Expandable>
  )
}
