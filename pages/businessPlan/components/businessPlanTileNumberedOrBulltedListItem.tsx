import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { OnFieldChange } from '@mm/core/forms'
import { uuid } from '@mm/core/utils'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  GridstackFriendlyDragHandle,
  Icon,
  Menu,
  Text,
  TextInputAutoExpansion,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import {
  IBusinessPlanGenericListItem,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BUSINESS_PLAN_MAX_ITEM_LIMIT } from '../constants'

interface IBusinessPlanTileNumberedOrBulltedListItemProps {
  disableDeleteItem: boolean
  fieldArrayPropNames: Record<
    keyof Omit<IBusinessPlanGenericListItem, 'id'>,
    keyof Omit<IBusinessPlanGenericListItem, 'id'>
  >
  getData: () => Pick<
    IBusinessPlanViewData,
    'getCurrentUserPermissions' | 'pageState'
  >
  getIsEditingDisabled: () => boolean
  hasFormError: boolean
  index: number
  isPdfPreview: boolean
  listItem: IBusinessPlanGenericListItem
  listItems: Array<IBusinessPlanGenericListItem>
  showNumberedItems: boolean
  sortableItemClassName: string
  maxItemLimitTooltipText: string
  textTitleForContextAware: Maybe<string>
  generateFieldName: (opts: {
    id: Id
    propName: keyof IBusinessPlanGenericListItem
  }) => keyof IBusinessPlanGenericListItem
  onAddFieldArrayItem: (
    index: number,
    item: IBusinessPlanGenericListItem
  ) => void
  onFieldChange: OnFieldChange<IBusinessPlanGenericListItem>
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    textTitle?: string
  }) => void
  onRemoveFieldArrayItem: (id: Id) => void
}

export const BusinessPlanTileNumberedOrBulltedListItem = observer(
  (props: IBusinessPlanTileNumberedOrBulltedListItemProps) => {
    const theme = useTheme()
    const { t } = useTranslation()

    const {
      disableDeleteItem,
      fieldArrayPropNames,
      getData,
      getIsEditingDisabled,
      hasFormError,
      listItem,
      listItems,
      maxItemLimitTooltipText,
      index,
      showNumberedItems,
      sortableItemClassName,
      textTitleForContextAware,
      isPdfPreview,
      generateFieldName,
      onAddFieldArrayItem,
      onFieldChange,
      onHandleCreateContextAwareIssueFromBusinessPlan,
      onRemoveFieldArrayItem,
    } = props

    return (
      <div
        id={`${listItem.id}`}
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: ${theme.sizes.spacing4} 0;
          min-height: ${toREM(32)};

          ${isPdfPreview &&
          css`
            padding: 0 !important;
            min-height: ${toREM(24)};
          `}

          .business-plan-list-hover-options {
            visibility: hidden;
          }

          &:hover,
          &:focus,
          &:focus-within {
            background-color: ${theme.colors
              .businessPlanTileItemBackgroundColorHover};

            ${!getIsEditingDisabled() &&
            css`
              .business-plan-list-hover-options {
                visibility: visible;
              }
            `}
          }
        `}
      >
        <div
          css={css`
            display: inline-flex;
            align-items: flex-start;
            flex-grow: 1;
            max-width: calc(100% - ${toREM(24)});
          `}
        >
          <GridstackFriendlyDragHandle
            sortableItemClassName={sortableItemClassName}
            className={'business-plan-list-hover-options'}
            disabled={getIsEditingDisabled() || hasFormError}
            disabledTooltipProps={{
              msg: hasFormError
                ? t('Finish editing your item to drag sort.')
                : undefined,
              position: 'right center',
            }}
          />

          <Text
            type={'body'}
            weight={'semibold'}
            css={css`
              width: ${toREM(24)};
              height: ${toREM(21)};
              display: flex;
              justify-content: center;
              align-items: flex-start;
            `}
          >
            {showNumberedItems ? `${index + 1}${t('.')}` : '•'}
          </Text>

          <TextInputAutoExpansion
            name={generateFieldName({
              id: listItem.id,
              propName: fieldArrayPropNames.text,
            })}
            id={'businessPlanListItem'}
            width={'100%'}
            placeholder={t('Type details here')}
            textStyles={{ type: 'body' }}
          />
        </div>

        {getData().pageState.businessPlanMode === 'EDIT' &&
          getData().getCurrentUserPermissions().canEditBusinessPlan.allowed && (
            <div className={'business-plan-list-hover-options'}>
              <Menu
                minWidthRems={1}
                position='right center'
                content={(close) => (
                  <>
                    <Menu.Item
                      css={css`
                        padding: 0;
                        width: ${toREM(40)};
                      `}
                      onClick={(e) => {
                        onHandleCreateContextAwareIssueFromBusinessPlan({
                          text: listItem.text,
                          textTitle: textTitleForContextAware ?? undefined,
                        })
                        close(e)
                      }}
                    >
                      <div
                        css={css`
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          width: 100%;
                        `}
                      >
                        <Icon
                          iconName={'contextAwareIssueIcon'}
                          iconSize={'lg'}
                        />
                      </div>
                    </Menu.Item>
                    <Menu.Item
                      css={css`
                        padding: 0;
                        width: ${toREM(40)};
                      `}
                      disabled={
                        listItems.length >= BUSINESS_PLAN_MAX_ITEM_LIMIT
                      }
                      tooltip={
                        listItems.length >= BUSINESS_PLAN_MAX_ITEM_LIMIT
                          ? {
                              msg: maxItemLimitTooltipText,
                              position: 'left center',
                              maxWidth: 232,
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        const newIndex = index + 1
                        const newSortOrder =
                          listItems[newIndex] == null
                            ? listItems[listItems.length - 1].sortOrder + 1
                            : listItems[newIndex].sortOrder

                        onAddFieldArrayItem(index + 1, {
                          text: '',
                          sortOrder: newSortOrder,
                          id: uuid(),
                          listItemType: 'TEXT',
                        })
                        close(e)
                      }}
                    >
                      <div
                        css={css`
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          width: 100%;
                        `}
                      >
                        <Icon iconName={'plusCircleOutline'} iconSize={'lg'} />
                      </div>
                    </Menu.Item>
                    <Menu.Item
                      css={css`
                        padding: 0;
                        width: ${toREM(40)};
                      `}
                      disabled={disableDeleteItem && listItem.text === ''}
                      tooltip={
                        disableDeleteItem && listItem.text === ''
                          ? {
                              msg: t('Cannot delete last item'),
                              position: 'left center',
                            }
                          : undefined
                      }
                      onClick={(e) => {
                        close(e)

                        if (disableDeleteItem) {
                          onFieldChange(
                            generateFieldName({
                              id: listItem.id,
                              propName: fieldArrayPropNames.text,
                            }),
                            ''
                          )
                        } else {
                          onRemoveFieldArrayItem(listItem.id)
                        }
                      }}
                    >
                      <div
                        css={css`
                          display: flex;
                          justify-content: center;
                          align-items: center;
                          width: 100%;
                        `}
                      >
                        <Icon iconName={'trashIcon'} iconSize={'lg'} />
                      </div>
                    </Menu.Item>
                  </>
                )}
              >
                <BtnIcon
                  intent='naked'
                  size='lg'
                  iconProps={{
                    iconName: 'moreVerticalIcon',
                  }}
                  ariaLabel={t('more options')}
                  tag={'span'}
                />
              </Menu>
            </div>
          )}
      </div>
    )
  }
)
