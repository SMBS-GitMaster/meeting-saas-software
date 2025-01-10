import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { useTranslation } from '@mm/core-web/i18n'
import { Clickable, Icon, Menu, Text, toREM } from '@mm/core-web/ui'

import {
  PERSONAL_GOALS_LIST_CONTENT_SORTING_OPTS,
  PERSONAL_GOALS_LIST_GROUP_SORTING_OPTS,
} from './personalGoalsListConstants'
import { TPersonalGoalsListSortBy } from './personalGoalsListTypes'

interface IPersonalTodoListSortByProps {
  selectedGroupSort: TPersonalGoalsListSortBy
  selectedContentSort: TPersonalGoalsListSortBy
  setGroupSortBy: (sort: TPersonalGoalsListSortBy) => void
  setContentSortBy: (sort: TPersonalGoalsListSortBy) => void
}

export const PersonalTodoListSortBy = observer(function PersonalTodoListSortBy(
  props: IPersonalTodoListSortByProps
) {
  const { t } = useTranslation()

  return (
    <Menu
      maxWidth={toREM(330)}
      content={(close) => (
        <>
          <Menu.ListTitle title={t('Group sorting')} />
          {PERSONAL_GOALS_LIST_GROUP_SORTING_OPTS.map((sortOpt) => {
            return (
              <Menu.Item
                key={sortOpt.value}
                onClick={(e) => {
                  props.setGroupSortBy(sortOpt.value)
                  close(e)
                }}
              >
                <span
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <Text type={'body'}>{sortOpt.text}</Text>
                  {props.selectedGroupSort === sortOpt.value && (
                    <Icon
                      iconName='checkIcon'
                      iconSize='md'
                      css={css`
                        margin-left: ${(prop) => prop.theme.sizes.spacing4};
                      `}
                    />
                  )}
                </span>
              </Menu.Item>
            )
          })}
          <Menu.ListTitle title={t('Content sorting')} />
          {PERSONAL_GOALS_LIST_CONTENT_SORTING_OPTS.map((sortOpt) => {
            return (
              <Menu.Item
                key={sortOpt.value}
                onClick={(e) => {
                  props.setContentSortBy(sortOpt.value)
                  close(e)
                }}
              >
                <span
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <Text type={'body'}>{sortOpt.text}</Text>
                  {props.selectedContentSort === sortOpt.value && (
                    <Icon
                      iconName='checkIcon'
                      iconSize='md'
                      css={css`
                        margin-left: ${(prop) => prop.theme.sizes.spacing4};
                      `}
                    />
                  )}
                </span>
              </Menu.Item>
            )
          })}
        </>
      )}
    >
      <span
        css={css`
          margin-right: ${(prop) => prop.theme.sizes.spacing8};
        `}
      >
        <Clickable clicked={() => null}>
          <Icon iconName='sortIcon' iconSize='lg' />
        </Clickable>
      </span>
    </Menu>
  )
})
