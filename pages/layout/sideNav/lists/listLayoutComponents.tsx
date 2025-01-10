import { observer } from 'mobx-react'
import React from 'react'
import styled, { css } from 'styled-components'

import { type Id, NodesCollection } from '@mm/gql'

import { UserAvatarColorType } from '@mm/core-bloom'

import { Icon, Menu, Text, UserAvatar, toREM, useTheme } from '@mm/core-web/ui'

import {
  HEADER_HEIGHT,
  SIDE_NAV_LIST_WIDTH,
  SIDE_NAV_WIDTH,
} from '@mm/bloom-web/pages/layout/consts'
import { SortByOption } from '@mm/bloom-web/shared/components/sortBy'

export function EmptyState({ text }: { text: string }) {
  return (
    <div
      css={css`
        text-align: center;
        max-width: ${toREM(SIDE_NAV_LIST_WIDTH * 0.6)};
        margin: 0 auto;
      `}
    >
      <Text type='h4' fontStyle='italic'>
        {text}
      </Text>
    </div>
  )
}

interface IUserAvatarListProps {
  users: NodesCollection<{
    TItemType: {
      id: Id
      firstName: string
      lastName: string
      userAvatarColor: UserAvatarColorType
      avatar: Maybe<string>
    }
    TIncludeTotalCount: true
  }>
  maxNumberOfAvatarsDisplayed: number
}
export function UserAvatarList({
  users,
  maxNumberOfAvatarsDisplayed,
}: IUserAvatarListProps) {
  const usersToDisplay = users.nodes.slice(0, maxNumberOfAvatarsDisplayed)
  const restCount = users.totalCount - usersToDisplay.length

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1;

        > * {
          box-sizing: border-box;
          margin-right: ${(props) => props.theme.sizes.spacing4};

          &:last-child {
            margin-right: 0;
          }
        }
      `}
    >
      {restCount > 0 && <Text type='body'>+{restCount}</Text>}
      {usersToDisplay.map((user) => (
        <UserAvatar
          size={'s'}
          key={user.id}
          firstName={user.firstName}
          lastName={user.lastName}
          avatarUrl={user.avatar}
          userAvatarColor={user.userAvatarColor}
          adornments={{ tooltip: true }}
        />
      ))}
    </div>
  )
}

interface ISideNavSearcheableListProps {
  header: string
  searchArea: React.ReactNode
  tabs?: Array<{ id: Id; title: string }>
  onTabChange?: (newTab: string) => void
  activeTab?: string
  content: React.ReactNode
}

export const SideNavSearcheableList = observer(
  React.forwardRef(function SideNavSearcheableList(
    props: ISideNavSearcheableListProps,
    ref: any
  ) {
    return (
      <StyledListLayoutBackdrop>
        <StyledSideNavListContainer id='sideNavContainerCenter' ref={ref}>
          <StyledSideNavListHeaderContainer>
            <Text type={'h3'}>{props.header}</Text>
          </StyledSideNavListHeaderContainer>
          <StyledSideNavListSearchAreaContainer>
            {props.searchArea}
          </StyledSideNavListSearchAreaContainer>
          {props.tabs && (
            <SideNavListTabs
              tabs={props.tabs}
              activeTab={props.activeTab as Id}
              onTabChange={props.onTabChange as (newTab: Id) => void}
            />
          )}
          <StyledSideNavListContentContainer>
            {props.content}
          </StyledSideNavListContentContainer>
        </StyledSideNavListContainer>
      </StyledListLayoutBackdrop>
    )
  })
)

interface ISideNavSortButtonProps<TSortOption extends string> {
  // Record<value, displayText>
  sortingOptions: Record<TSortOption, string>
  onSetSorting: (newSorting: TSortOption) => void
  selectedOption: TSortOption
}

export function SideNavSortButton<TSortOption extends string>(
  props: ISideNavSortButtonProps<TSortOption>
) {
  return (
    <Menu
      content={(close) => (
        <>
          {Object.entries(props.sortingOptions).map(
            ([sortingOptionValue, sortingOptionText]) => (
              <SortByOption
                key={sortingOptionValue}
                onClick={(e) => {
                  props.onSetSorting(sortingOptionValue as TSortOption)
                  close(e)
                }}
              >
                {sortingOptionText as string}
                {props.sortingOptions[props.selectedOption] ===
                  sortingOptionText && (
                  <>
                    <span
                      css={css`
                        width: ${(props) => props.theme.sizes.spacing8};
                      `}
                    />
                    <Icon iconName={'checkIcon'} iconSize={'sm'} />
                  </>
                )}
              </SortByOption>
            )
          )}
        </>
      )}
    >
      {({ isOpen }) => (
        <button
          type='button'
          css={css`
            margin-left: ${(props) => props.theme.sizes.spacing12};
            padding: 0;
            display: flex;
            align-items: center;
            cursor: pointer;
            background: none;
            border: 0;
          `}
        >
          <Icon
            css={css`
              margin-right: ${(props) => props.theme.sizes.spacing4};
            `}
            iconSize='lg'
            iconName={'sortIcon'}
          />
          <Text type='body'>{props.sortingOptions[props.selectedOption]}</Text>
          <Icon
            iconSize='sm'
            iconName={isOpen ? 'chevronUpIcon' : 'chevronDownIcon'}
          />
        </button>
      )}
    </Menu>
  )
}

interface ISideNavListTabsProps<
  TTabs extends Array<{ id: Id; title: string }>,
> {
  activeTab: Id
  onTabChange: (tabId: Id) => void
  tabs: TTabs
}
function SideNavListTabs<TTabs extends Array<{ id: Id; title: string }>>({
  activeTab,
  onTabChange,
  tabs,
}: ISideNavListTabsProps<TTabs>) {
  const theme = useTheme()

  return (
    <div
      css={css`
        padding-top: ${(props) => props.theme.sizes.spacing12};
        margin-bottom: ${(props) => props.theme.sizes.spacing36};
        border-bottom: ${toREM(2)} solid
          ${(props) => props.theme.colors.sideNavListSeparatorBackground};
      `}
    >
      {tabs.map((tab) => (
        <button
          onClick={() => onTabChange(tab.id)}
          key={tab.id}
          type='button'
          css={css`
            transform: translateY(${toREM(2)});
            background: none;
            border: 0;
            cursor: pointer;
            margin-left: ${(props) => props.theme.sizes.spacing16};
            padding-bottom: ${(props) => props.theme.sizes.spacing4};
            ${tab.id === activeTab &&
            css`
              border-bottom: ${toREM(2)} solid
                ${(props) => props.theme.colors.sideNavListTabActiveBorder};
            `}
          `}
        >
          <Text
            type='body'
            weight='semibold'
            color={{
              color:
                tab.id === activeTab
                  ? theme.colors.sideNavListTabActiveColor
                  : theme.colors.sideNavListTabInactiveColor,
            }}
          >
            {tab.title}
          </Text>
        </button>
      ))}
    </div>
  )
}

export const StyledSideNavListContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: ${(props) => props.theme.zIndices.menuLists};
  top: 0;
  left: ${toREM(SIDE_NAV_WIDTH)};
  height: 100vh;
  width: ${toREM(SIDE_NAV_LIST_WIDTH)};
  background: ${(props) => props.theme.colors.sideNavListBackground};
`

export const StyledListLayoutBackdrop = styled.div`
  &::after {
    background-color: ${(props) => props.theme.colors.overlayBackgroundColor};
    bottom: 0;
    content: '';
    opacity: 32%;
    top: 0;
    position: absolute;
    right: 0;
    width: calc(
      100vw - ${`${toREM(SIDE_NAV_WIDTH)} + ${toREM(SIDE_NAV_LIST_WIDTH)}`}
    );
  }
`

export const StyledSideNavListHeaderContainer = styled.div`
  height: ${toREM(HEADER_HEIGHT)};
  display: flex;
  align-items: center;
  padding-left: ${(props) => props.theme.sizes.spacing16};
  border-bottom: ${toREM(2)} solid
    ${(props) => props.theme.colors.sideNavListSeparatorBackground};
`

const StyledSideNavListSearchAreaContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: ${(props) =>
    `${props.theme.sizes.spacing24} ${props.theme.sizes.spacing16} ${props.theme.sizes.spacing12} ${props.theme.sizes.spacing16} `};
`

const StyledSideNavListContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`
