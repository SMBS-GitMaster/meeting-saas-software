import React from 'react'
import styled from 'styled-components'

import {
  BtnIcon,
  BtnText,
  Expandable,
  Icon,
  Menu,
  Text,
  useTheme,
} from '@mm/core-web/ui'

export const MenuDemo = () => {
  const theme = useTheme()

  return (
    <Expandable title='Menus'>
      <>
        <Text type='h3'>Menu Flyout Component</Text>
        <br />
        <ButtonSpacer>
          <Menu
            content={() => (
              <>
                <Menu.Item
                  tooltip={{ msg: 'Can touch this.', position: 'right center' }}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'}>Option</Text>
                </Menu.Item>
                <Menu.Item
                  tooltip={{
                    msg: 'Supports all tooltip positions',
                    position: 'bottom left',
                  }}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'}>Option</Text>
                </Menu.Item>
                <Menu.Item
                  tooltip={{
                    msg: 'Supports all tooltip positions',
                    position: 'bottom right',
                  }}
                  disabled={true}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'}>Option</Text>
                </Menu.Item>
                <Menu.Item
                  tooltip={{
                    msg: 'Supports all tooltip positions',
                    position: 'left center',
                  }}
                  isSectionHeader={true}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'} weight={'bold'}>
                    Section Header
                  </Text>
                </Menu.Item>
                <Menu.Item
                  tooltip={{
                    msg: 'Supports all tooltip positions',
                    position: 'top right',
                  }}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'}>Option</Text>
                </Menu.Item>
                <Menu.Item
                  tooltip={{
                    msg: 'Supports all tooltip positions',
                    position: 'top left',
                  }}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'}>Option</Text>
                </Menu.Item>
              </>
            )}
          >
            <BtnIcon
              intent='warning'
              size='sm'
              iconProps={{
                iconName: 'plusIcon',
                iconSize: 'xs',
              }}
              onClick={() => console.log('clicked')}
              ariaLabel={'plus'}
              tag={'span'}
            />
          </Menu>
        </ButtonSpacer>
        <br />
        <Menu
          position={'right center'}
          flowing={true}
          content={() => (
            <>
              <Menu.Item
                tooltip={{ msg: 'Can touch this.', position: 'right center' }}
                onClick={() => console.log('Menu item click')}
              >
                <Text type={'body'}>Menu Item</Text>
              </Menu.Item>
              <Menu.Item
                tooltip={{
                  msg: 'Supports all tooltip positions',
                  position: 'bottom left',
                }}
                href={`https://www.youtube.com/watch?v=dQw4w9WgXcQ`}
                target={'_blank'}
                onClick={() => console.log('Menu item click')}
              >
                <Text type={'body'}>
                  Menu item that expands and mantains 16px padding
                </Text>
              </Menu.Item>
              <Menu.Item
                tooltip={{
                  msg: 'Supports all tooltip positions',
                  position: 'bottom left',
                }}
                disabled={true}
                onClick={() => console.log('Menu item click')}
              >
                <Text type={'body'}>Disabled</Text>
              </Menu.Item>
            </>
          )}
        >
          <BtnText
            intent='secondary'
            width='small'
            ariaLabel={'plus button'}
            iconProps={{
              iconName: 'plusCircleOutline',
            }}
            onClick={() => console.log('clicked')}
          >
            Menu stuff
          </BtnText>
        </Menu>
        <br />
        <Menu
          position={'right center'}
          flowing={true}
          content={() => (
            <>
              <Menu.Item
                tooltip={{ msg: 'Can touch this.', position: 'right center' }}
                onClick={() => console.log('Menu item click')}
              >
                <Text type={'body'}>Menu Item</Text>
              </Menu.Item>
              <Menu.Item onClick={() => console.log('Menu item click')}>
                <Text type={'body'}>Menu Item 2</Text>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item onClick={() => console.log('Menu item click')}>
                <Text type={'body'}>Menu Item 3</Text>
              </Menu.Item>
            </>
          )}
        >
          <BtnText
            intent='secondary'
            width='small'
            ariaLabel={'plus button'}
            iconProps={{
              iconName: 'plusCircleOutline',
            }}
            onClick={() => console.log('clicked')}
          >
            Menu with divider
          </BtnText>
        </Menu>
        <br />
        <ButtonSpacer>
          <Menu
            minWidthRems={10}
            position={'bottom right'}
            content={() => (
              <>
                <Menu.Item
                  isUniversalAdd={true}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'} weight={'semibold'}>
                    Headline
                  </Text>{' '}
                  <Icon
                    iconSize={'md'}
                    iconName={'headlineIcon'}
                    iconColor={{ color: theme.colors.textFieldCaptionDefault }}
                  />
                </Menu.Item>
                <Menu.Item
                  isUniversalAdd={true}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'} weight={'semibold'}>
                    Issue
                  </Text>{' '}
                  <Icon
                    iconSize={'md'}
                    iconName={'issuesIcon'}
                    iconColor={{ color: theme.colors.textFieldCaptionDefault }}
                  />
                </Menu.Item>
                <Menu.Item
                  isUniversalAdd={true}
                  onClick={() => console.log('Menu item click')}
                >
                  <Text type={'body'} weight={'semibold'}>
                    To-do
                  </Text>{' '}
                  <Icon
                    iconSize={'md'}
                    iconName={'addToDoIcon'}
                    iconColor={{ color: theme.colors.textFieldCaptionDefault }}
                  />
                </Menu.Item>
              </>
            )}
          >
            <BtnIcon
              intent='primary'
              size='sm'
              iconProps={{
                iconName: 'plusIcon',
                iconSize: 'xs',
              }}
              onClick={() => console.log('clicked')}
              ariaLabel={'plus'}
              tag={'span'}
            />
          </Menu>
        </ButtonSpacer>
      </>
    </Expandable>
  )
}

const ButtonSpacer = styled.span`
  padding: 0 100px;
`
