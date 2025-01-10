import React from 'react'
import { css } from 'styled-components'

import {
  ActionButton,
  BtnDropdown,
  BtnIcon,
  BtnRating,
  BtnText,
  Expandable,
  Menu,
  Text,
} from '@mm/core-web/ui'

export const ButtonDemo = () => {
  const [selected, setSelected] = React.useState(true)

  return (
    <Expandable title='Buttons'>
      <>
        <Text type='body'>Primary Fitted</Text>
        <BtnText
          intent='primary'
          width='fitted'
          ariaLabel={'button'}
          iconProps={{
            iconName: 'plusCircleOutline',
          }}
          onClick={() => console.log('clicked')}
        >
          Button
        </BtnText>
        <br />
        <Text type='body'>Secondary Small</Text>
        <BtnText
          intent='secondary'
          width='small'
          ariaLabel={'button'}
          iconProps={{
            iconName: 'plusCircleOutline',
          }}
          onClick={() => console.log('clicked')}
        >
          Button
        </BtnText>
        <br />
        <Text type='body'>Tertiary Medium with Plus Icon</Text>
        <BtnText
          intent='tertiary'
          width='medium'
          ariaLabel={'plus button'}
          iconProps={{
            iconName: 'plusCircleOutline',
          }}
          onClick={() => console.log('clicked')}
        >
          Button
        </BtnText>
        <br />
        <Text type='body'>Icon Button Warning Small</Text>
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
        <br />
        <Text type='body'>Icon Button With Multi Color Icon</Text>
        <BtnIcon
          intent='tertiary'
          size='md'
          iconProps={{
            iconName: 'checkCircleOnEnabled',
            iconColor: { color: 'tomato' },
            iconSize: 'md',
          }}
          onClick={() => console.log('clicked')}
          ariaLabel={'plus'}
          tag={'span'}
        />
        <br />
        <Text type='body'>Icon Button Tertiary Medium</Text>
        <BtnIcon
          intent='tertiary'
          size='sm'
          iconProps={{
            iconName: 'chevronUpIcon',
            iconSize: 'sm',
          }}
          onClick={() => console.log('clicked')}
          ariaLabel={'open'}
          tag={'span'}
        />
        <br />
        <Text type='body'>Dropdown Button Primary Medium</Text>
        <BtnDropdown
          intent='primary'
          width='medium'
          iconProps={{
            iconName: 'chevronDownIcon',
            position: 'right',
          }}
          ariaLabel={'dropdown button'}
          btnText={'Vision Building 1'}
          onClick={() => console.log('clicked')}
        >
          <Menu.Item>Content</Menu.Item>
          <Menu.Item>Content 1</Menu.Item>
          <Menu.Item>Content 2</Menu.Item>
        </BtnDropdown>
        <br />
        <br />
        <div
          css={css`
            background: white;
            width: 400px;
            padding: 16px;
          `}
        >
          <Text type='body'>Button Rounded</Text>
          <br />
          <BtnRating
            selected={selected}
            onClick={() => setSelected((prev) => !prev)}
            ariaLabel='Score'
            rating={9}
          />
        </div>
        <br />
        <br />
        <ActionButton
          id='1'
          name='1'
          type='TOGGLE'
          text={'Solved'}
          value={false}
          onChange={() => null}
        />
        <br />
        <br />
        <ActionButton
          id='2'
          name='2'
          type='TOGGLE'
          text={'Solved'}
          value={false}
          disabled={true}
          onChange={() => null}
        />
        <br />
        <br />
        <ActionButton
          id='3'
          name='3'
          type='TOGGLE'
          text={'Solved'}
          value={true}
          onChange={() => null}
        />
        <br />
        <br />
        <ActionButton
          id='4'
          name='4'
          type='TOGGLE'
          text={'Solved'}
          value={true}
          disabled={true}
          onChange={() => null}
        />
        <br />
        <br />
        <ActionButton
          id='5'
          name='5'
          text={'Submit votes'}
          type='BUTTON'
          onClick={() => console.log('Action Button Clicked')}
        />
      </>
    </Expandable>
  )
}
