import React, { useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { MeetingIssueVoting } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnIcon,
  BtnText,
  Clickable,
  ColoredSelectInput,
  CommonSelectionOptionProperties,
  Expandable,
  IColoredSelectInputOption,
  Icon,
  SearchInput,
  SelectInputMultipleSelection,
  SelectInputSingleSelection,
  SelectQuickAddUserSelection,
  SelectUserInputSingleSelection,
  SelectVotingTypeInputSelection,
  Text,
  TextAreaInput,
  TextInput,
  TextInputSmall,
  toREM,
} from '@mm/core-web/ui'
import { SelectUserInputMultipleSelection } from '@mm/core-web/ui/components/inputs/selectInputMultipleSelection/selectUserInputMultipleSelection'

export const DropdownsAndFieldsDemo = () => {
  const agendaRowRef = React.createRef<HTMLDivElement>()
  const { t } = useTranslation()
  const [textInputValue, setTextInputValue] = useState<string>('Stuff')
  const [selectInputMultipleArrayValue, setSelectInputMultipleArrayValue] =
    useState<Array<string>>(['Neptunium'])
  const [selectInputSingleArrayValue, setSelectInputSingleArrayValue] =
    useState<string>('Neptunium')
  const [itemsToSearch, setItemsToSearch] = useState<Array<string>>([
    'Americium',
    'Curium',
    'Berkelium',
    'Californium',
    'Einsteinium',
    'Einsteinium',
  ])
  const [selectedUser, setSelectedUser] = useState<Maybe<Id>>(null)
  const [selectedUsers, setSelectedUsers] = useState<Maybe<Array<Id>>>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleSelectInputArrayChange = (value: Array<string>) => {
    setSelectInputMultipleArrayValue(value)
  }
  const handleSelectInputChange = (value: string) => {
    setSelectInputSingleArrayValue(value)
  }
  const handleTextInputChange = (value: string) => {
    setTextInputValue(value)
  }
  const handleSearch = (keyword: string) => {
    const searchedItems = itemsToSearch.filter((item) =>
      item.toLowerCase().includes(keyword)
    )
    setItemsToSearch(searchedItems)
  }

  return (
    <Expandable title='Dropdowns and Fields'>
      <>
        <Text type='h3' display='block'>
          Agenda small text inputs
        </Text>

        <div
          ref={agendaRowRef}
          css={css`
            display: inline-flex;
            width: 216px;
            justify-content: center;
            padding: 8px;
            border: 1px solid rebeccapurple;
          `}
        >
          <TextInputSmall
            name={'textInputSmall'}
            id={'123456546546645645'}
            value={textInputValue}
            onChange={handleTextInputChange}
            outsideClickProps={{
              clickOutsideRef: agendaRowRef,
              onClickOutside: () => setIsEditing(false),
            }}
            isEditing={isEditing}
            css={css`
              margin-right: 8px;
            `}
          />

          <TextInputSmall
            name={'textInputSmaller'}
            id={'123456456645645465645645'}
            height={'24px'}
            width={'40px'}
            value={'5m'}
            isEditing={isEditing}
            outsideClickProps={{
              clickOutsideRef: agendaRowRef,
              onClickOutside: () => setIsEditing(false),
            }}
            onChange={() => null}
          />

          <Clickable clicked={() => setIsEditing(true)}>
            <Icon iconName={'editIcon'} iconSize={'md'} />
          </Clickable>
        </div>

        <Text type='h3' display='block'>
          {t('Text area input')}
        </Text>
        <div
          css={css`
            padding: ${(props) => props.theme.sizes.spacing20};
            width: ${toREM(600)};
          `}
        >
          <TextAreaInput
            name={'textInputBasic'}
            id={'123'}
            placeholder={'Placeholder text'}
            value={textInputValue}
            onChange={handleTextInputChange}
            customEditModeFooterContent={() => (
              <div
                css={css`
                  display: flex;
                  flex-flow: row-nowrap;
                  justify-content: space-between;
                `}
              >
                <BtnIcon
                  intent='tertiaryTransparent'
                  size='md'
                  iconProps={{
                    iconName: 'trashIcon',
                  }}
                  tooltip={{
                    msg: t('Delete note'),
                    type: 'light',
                    position: 'bottom center',
                  }}
                  ariaLabel={t('delete')}
                  tag={'span'}
                  onClick={() => {
                    console.log('delete note')
                  }}
                />

                <div>
                  <BtnText
                    intent='tertiary'
                    ariaLabel={t('Cancel')}
                    onClick={() => console.log('cancel note')}
                  >
                    {t('Cancel')}
                  </BtnText>

                  <BtnText
                    intent='primary'
                    ariaLabel={t('save')}
                    onClick={() => console.log('save note')}
                    disabled={false}
                  >
                    {t('Save')}
                  </BtnText>
                </div>
              </div>
            )}
          />
        </div>

        <Text type='h3' display='block'>
          Basic text inputs
        </Text>
        <TextInput
          name={'textInputBasic'}
          id={'123'}
          clearable={true}
          formControl={{
            label: 'Placeholder text',
            caption: 'caption here',
          }}
          placeholder={'Placeholder text'}
          value={textInputValue}
          onChange={handleTextInputChange}
        />

        <TextInput
          name={'textInputRequired'}
          id={'123'}
          formControl={{
            label: 'Placeholder text',
            required: true,
          }}
          clearable={true}
          placeholder={'Placeholder text'}
          value={textInputValue}
          onChange={handleTextInputChange}
        />
        <TextInput
          name={'textInputError'}
          id={'123'}
          formControl={{
            label: 'Placeholder text',
            caption: 'caption here',
            required: true,
          }}
          placeholder={'Placeholder text'}
          value={textInputValue}
          onChange={handleTextInputChange}
        />
        <TextInput
          name={'textInputDisabled'}
          id={'123'}
          formControl={{
            label: 'Placeholder text',
          }}
          tooltip={{
            msg: 'This field is inactive.',
            position: 'top center',
          }}
          disabled={true}
          value={'I am a disabled input with alot of text and stuff inside it'}
          onChange={handleTextInputChange}
        />

        <TextInput
          name={'textInput'}
          id={'textInputFullWidth'}
          clearable={true}
          formControl={{
            label: 'Placeholder text',
            caption: 'caption here',
          }}
          placeholder={'Placeholder text'}
          value={textInputValue}
          onChange={handleTextInputChange}
        />

        <Text type='h3' display='block'>
          Search inputs with items to search
        </Text>

        <SearchInput
          id={'searchInputBasic'}
          name={'searchInput'}
          onSearch={handleSearch}
          formControl={{
            label: 'Placeholder text',
          }}
        />

        {itemsToSearch.map((item, i) => {
          return (
            <Text key={i} type='body' display='block'>
              {item}
            </Text>
          )
        })}

        <SearchInput
          id={'searchInputWithError'}
          name={'searchInput'}
          onSearch={handleSearch}
          error={'Error Text'}
          formControl={{
            label: 'Placeholder text',
            caption: 'caption here',
          }}
        />

        <SearchInput
          id={'searchInputDisabled'}
          name={'searchInput'}
          onSearch={handleSearch}
          disabled={true}
          tooltip={{
            msg: 'This field is inactive.',
            position: 'top center',
          }}
          formControl={{
            label: 'Placeholder text',
            caption: 'caption here',
          }}
        />

        <SearchInput
          id={'searchInputFullWidth'}
          name={'searchInput'}
          onSearch={() => {
            return null
          }}
          formControl={{
            label: 'Placeholder text',
          }}
        />

        <Text type='h3' display='block'>
          Dropdowns for single selection
        </Text>
        <SelectInputSingleSelection
          id={'selectInputSingle'}
          unknownItemText={'Unknown stuff'}
          value={selectInputSingleArrayValue}
          placeholder={'Placeholder text'}
          options={optionsForSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
          formControl={{
            label: 'Placeholder text',
            required: true,
          }}
        />

        <SelectInputSingleSelection
          id={'selectInputSingleWithNoValueAndError'}
          value={'' as string}
          placeholder={'Placeholder text'}
          unknownItemText={'Unknown stuff'}
          options={optionsForSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={'Error Text'}
          formControl={{
            label: 'Placeholder text',
            caption: 'caption here',
            required: true,
          }}
        />

        <SelectInputSingleSelection
          id={'selectInputSingleDisabled'}
          value={selectInputSingleArrayValue}
          placeholder={'Placeholder text'}
          unknownItemText={'Unknown stuff'}
          options={optionsForSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          disabled={true}
          tooltip={{
            msg: 'This field is inactive.',
            position: 'top center',
          }}
          error={undefined}
          formControl={{
            label: 'Placeholder text',
            required: true,
          }}
        />

        <SelectInputSingleSelection
          id={'selectInputSingleFullWidth'}
          unknownItemText={'Unknown stuff'}
          value={selectInputSingleArrayValue}
          placeholder={'Placeholder text'}
          options={optionsForSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
        />

        <SelectUserInputSingleSelection
          unknownItemText={'Unknown stuff'}
          id={'selectInputSingleCustomRenderOptions'}
          value={selectedUser}
          placeholder={'Select a user'}
          options={[
            {
              value: 'user-id-1',
              metadata: {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                avatar: null,
                userAvatarColor: 'COLOR1',
              },
            },
          ]}
          name={'selectInput'}
          onChange={setSelectedUser}
          error={undefined}
          formControl={{
            label: 'Select a user',
            required: true,
          }}
        />

        <Text type='h3' display='block'>
          Issue Voting Types dropdown
        </Text>

        <div
          css={css`
            width: 259px;
          `}
        >
          <SelectVotingTypeInputSelection
            placeholder={'Select a voting type'}
            id={'votingTypeDropdown'}
            unknownItemText={'Unknown stuff'}
            value={selectInputSingleArrayValue as MeetingIssueVoting}
            name={'votingTypeDropdown'}
            onChange={handleSelectInputChange}
            error={undefined}
            width='100%'
            formControl={{
              label: 'Voting Types Dropdown',
              required: true,
            }}
          />
        </div>
        <Text type='h3' display='block'>
          Meeting Rating Types dropdown
        </Text>

        <Text type='h3' display='block'>
          Quick add user avatar only dropdown
        </Text>

        <SelectQuickAddUserSelection
          id={'selectInputSingleCustomRenderOptions'}
          value={selectedUser}
          unknownItemText={'Unknown stuff'}
          placeholder={'Select a user'}
          options={[
            {
              value: 'user-id-1',
              metadata: {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                avatar: null,
                userAvatarColor: 'COLOR1',
              },
            },
            {
              value: 'user-id-2',
              metadata: {
                firstName: 'Doe',
                lastName: 'John',
                fullName: 'Doe John',
                avatar: null,
                userAvatarColor: 'COLOR1',
              },
            },
          ]}
          name={'selectInput'}
          onChange={setSelectedUser}
          error={undefined}
          width='56px'
        />

        <Text type='h3' display='block'>
          Colored Dropdown
        </Text>
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWith'}
          value={'off_track'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
        />
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWithOnTrack'}
          value={'on_track'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
        />
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWithCompleted'}
          value={'completed'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
        />
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWith'}
          value={'off_track'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
          formControl={{
            label: 'Readonly',
            required: true,
          }}
          readonly
        />
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWithOnTrack'}
          value={'on_track'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
          readonly
        />
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWithCompleted'}
          value={'completed'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
          readonly
        />

        <Text type='h3' display='block'>
          Colored Dropdown Pill
        </Text>
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWith'}
          value={'completed'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
          pill={{
            size: 'sm',
          }}
          width={'auto'}
        />
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWith'}
          value={'on_track'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
          pill={{
            size: 'sm',
          }}
          width={'auto'}
        />
        <ColoredSelectInput
          unknownItemText={'Unknown status'}
          id={'coloredSelectInputFillWith'}
          value={'off_track'}
          placeholder={'Placeholder text'}
          options={optionsForColoredSelectInput}
          name={'selectInput'}
          onChange={handleSelectInputChange}
          error={undefined}
          pill={{
            size: 'lg',
          }}
          width={'auto'}
        />

        <Text type='h3' display='block'>
          Dropdowns for multiple selection
        </Text>
        <SelectInputMultipleSelection
          id={'selectInputMultiple'}
          placeholder={'Placeholder text'}
          unknownItemText={'Unknown stuff'}
          options={optionsForSelectInput}
          value={selectInputMultipleArrayValue}
          onChange={handleSelectInputArrayChange}
          showSearchIcon={true}
          name={'selectInputMultiple'}
          error={undefined}
          formControl={{
            label: 'Placeholder text',
            required: true,
          }}
        />

        <SelectInputMultipleSelection
          id={'selectInputMultipleError'}
          value={selectInputMultipleArrayValue}
          placeholder={'Placeholder text'}
          unknownItemText={'Unknown stuff'}
          options={optionsForSelectInput}
          name={'selectInputMultipleError'}
          onChange={handleSelectInputArrayChange}
          error={'Error Text'}
          formControl={{
            label: 'Placeholder text',
            required: true,
            caption: 'caption here',
          }}
        />

        <SelectInputMultipleSelection
          id={'selectInputMultipleDisabled'}
          value={selectInputMultipleArrayValue}
          placeholder={'Placeholder text'}
          unknownItemText={'Unknown stuff'}
          options={optionsForSelectInput}
          onChange={handleSelectInputArrayChange}
          name={'selectInputDisabled'}
          disabled={true}
          tooltip={{
            msg: 'This field is inactive.',
            position: 'top center',
          }}
          formControl={{
            caption: 'caption here',
            label: 'Placeholder text',
            required: true,
          }}
        />

        <SelectInputMultipleSelection
          id={'selectInputMultipleFullWidth'}
          value={selectInputMultipleArrayValue}
          placeholder={'Placeholder text'}
          unknownItemText={'Unknown stuff'}
          options={optionsForSelectInput}
          name={'selectInputMultipleFullWidth'}
          onChange={handleSelectInputArrayChange}
          error={undefined}
          formControl={{
            label: 'Placeholder text',
            required: true,
          }}
        />

        <SelectUserInputMultipleSelection
          id={'selectInputMultipleCustomRenderOptions'}
          value={selectedUsers}
          unknownItemText={'Unknown user'}
          placeholder={'Select users'}
          options={[
            {
              value: 'user-id-1',
              metadata: {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                avatar: null,
                userAvatarColor: 'COLOR1',
              },
            },
            {
              value: 'user-id-2',
              metadata: {
                firstName: 'Jane',
                lastName: 'Doe',
                fullName: 'Jane Doe',
                avatar: null,
                userAvatarColor: 'COLOR1',
              },
            },
          ]}
          name={'selectInput'}
          onChange={setSelectedUsers}
          error={undefined}
          formControl={{
            label: 'Select a user',
            required: true,
          }}
        />
      </>
    </Expandable>
  )
}

export const optionsForColoredSelectInput: Array<IColoredSelectInputOption> = [
  {
    text: 'Off track',
    value: 'off_track',
    intent: 'warning',
  },
  {
    text: 'On track',
    value: 'on_track',
    intent: 'primary',
  },
  {
    text: 'Completed',
    value: 'completed',
    intent: 'success',
  },
]
export const optionsForSelectInput: Array<
  CommonSelectionOptionProperties & { text: string }
> = [
  {
    text: 'Neptunium Neptunium Neptunium Neptunium Neptunium Neptunium Neptunium Neptunium Neptunium Neptunium Neptunium',
    value: 'Neptunium',
  },
  {
    text: 'Plutonium-disabled',
    value: 'Plutonium',
    disabled: true,
  },
  {
    text: 'Americium',
    value: 'Americium',
  },
  {
    text: 'Curium',
    value: 'Curium',
  },
  {
    text: 'Berkelium',
    value: 'Berkelium',
  },
  {
    text: 'Californium',
    value: 'Californium',
  },
  {
    text: 'Einsteinium',
    value: 'Einsteinium',
  },
  {
    text: 'Fermium',
    value: 'Fermium',
  },
  {
    text: 'Mendelevium',
    value: 'Mendelevium',
  },
  {
    text: 'Nobelium',
    value: 'Nobelium',
  },
  {
    text: 'Lawrencium',
    value: 'Lawrencium',
  },
  {
    text: 'Rutherfordium',
    value: 'Rutherfordium',
  },
  {
    text: 'Dubnium',
    value: 'Dubnium',
  },
  {
    text: 'Seaborgium',
    value: 'Seaborgium',
  },
  {
    text: 'Bohrium',
    value: 'Bohrium',
  },
  {
    text: 'Hassium',
    value: 'Hassium',
  },
  {
    text: 'Meitnerium',
    value: 'Meitnerium',
  },
  {
    text: 'Darmstadtium',
    value: 'Darmstadtium',
  },
  {
    text: 'Roentgenium',
    value: 'Roentgenium',
  },
  {
    text: 'Copernicium',
    value: 'Copernicium',
  },
  {
    text: 'Nihonium',
    value: 'Nihonium',
  },
  {
    text: 'Flerovium',
    value: 'Flerovium',
  },
  {
    text: 'Moscovium',
    value: 'Moscovium',
  },
  {
    text: 'Livermorium',
    value: 'Livermorium',
  },
  {
    text: 'Tennessine',
    value: 'Tennessine',
  },
  {
    text: 'Oganesson',
    value: 'Oganesson',
  },
]
