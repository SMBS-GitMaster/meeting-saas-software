import { observer } from 'mobx-react'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { getShortDateDisplay } from '@mm/core/date'
import { useDIResolver } from '@mm/core/di/resolver'
import { OnFieldChange } from '@mm/core/forms'
import { uuid } from '@mm/core/utils'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  Clickable,
  DatePickerInput,
  GridstackFriendlyDragHandle,
  Icon,
  Menu,
  TextEllipsis,
  TextInputAutoExpansion,
  Tooltip,
  toREM,
  useTheme,
} from '@mm/core-web/ui'

import {
  IBusinessPlanTileData,
  IBusinessPlanTitledListItem,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import {
  BUSINESS_PLAN_MAX_ITEM_LIMIT,
  BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS,
} from '../constants'
import { getTextTitleForListItems } from '../lookups'

interface IBusinessPlanTileTitledListItemProps {
  disableDeleteItem: boolean
  fieldArrayPropNames: Record<
    keyof Omit<IBusinessPlanTitledListItem, 'id'>,
    keyof Omit<IBusinessPlanTitledListItem, 'id'>
  >
  getData: () => Pick<
    IBusinessPlanViewData,
    'getCurrentUserPermissions' | 'pageState'
  >
  getTileData: () => Pick<IBusinessPlanTileData, 'tileType'>
  getIsEditingDisabled: () => boolean
  hasFormError: boolean
  index: number
  isPdfPreview: boolean
  listItem: IBusinessPlanTitledListItem
  listItems: Array<IBusinessPlanTitledListItem>
  maxItemLimitTooltipText: string
  renderUppercaseTitle: boolean
  renderColonSeperator: boolean
  sortableItemClassName: string
  generateFieldName: (opts: {
    id: Id
    propName: keyof IBusinessPlanTitledListItem
  }) => keyof IBusinessPlanTitledListItem
  onAddFieldArrayItem: (
    index: number,
    item: IBusinessPlanTitledListItem
  ) => void
  onFieldChange: OnFieldChange<IBusinessPlanTitledListItem>
  onSetIsFocusedByFieldName: (fieldName: string) => void
  onSetIsTouchedByFieldName: (fieldName: string) => void
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    textTitle: string
  }) => void
  onRemoveFieldArrayItem: (id: Id) => void
}

export const BusinessPlanTileTitledListItem = observer(
  (props: IBusinessPlanTileTitledListItemProps) => {
    const theme = useTheme()
    const diResolver = useDIResolver()
    const { t } = useTranslation()

    const {
      disableDeleteItem,
      fieldArrayPropNames,
      getData,
      getTileData,
      getIsEditingDisabled,
      hasFormError,
      listItem,
      listItems,
      maxItemLimitTooltipText,
      index,
      renderUppercaseTitle,
      renderColonSeperator,
      sortableItemClassName,
      isPdfPreview,
      generateFieldName,
      onAddFieldArrayItem,
      onFieldChange,
      onSetIsFocusedByFieldName,
      onSetIsTouchedByFieldName,
      onHandleCreateContextAwareIssueFromBusinessPlan,
      onRemoveFieldArrayItem,
    } = props

    return (
      <tr
        id={`${listItem.id}`}
        css={css`
          min-height: ${toREM(32)};
          width: 100%;

          ${isPdfPreview &&
          css`
            height: ${toREM(24)};
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
        <td
          css={css`
            width: ${toREM(24)};
            padding: ${theme.sizes.spacing4} 0;

            ${isPdfPreview &&
            css`
              padding: 0 !important;
            `}
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
        </td>

        <td
          css={css`
            padding: ${theme.sizes.spacing4} ${theme.sizes.spacing24}
              ${theme.sizes.spacing4} 0;
            min-width: auto;
            overflow: hidden;

            ${isPdfPreview &&
            css`
              padding: 0 ${theme.sizes.spacing24} 0 0 !important;
            `}
          `}
        >
          <TextInputAutoExpansion
            name={generateFieldName({
              id: listItem.id,
              propName: fieldArrayPropNames.textTitle,
            })}
            id={'businessPlanListItem-textTitle'}
            width={'100%'}
            placeholder={t('Title')}
            appendText={renderColonSeperator ? t(':') : undefined}
            renderSecondaryStyles={renderUppercaseTitle}
            textStyles={{
              type: 'body',
              weight: 'semibold',
            }}
            css={css`
              text-align: left;
              width: max-content;
              white-space: normal;
              max-width: ${toREM(120)};
            `}
          />
        </td>

        <td
          css={css`
            padding: ${theme.sizes.spacing4} 0;
            min-width: auto;
            overflow-y: hidden;
            width: 100%;

            ${isPdfPreview &&
            css`
              padding: 0 !important;
            `}

            ${getData().pageState.businessPlanMode === 'PRESENTATION' &&
            css`
              padding-right: ${toREM(26)};
            `}
          `}
        >
          {listItem.listItemType === 'DATE' ? (
            <>
              <DatePickerInput
                id={'businessPlanListItem-date'}
                name={generateFieldName({
                  id: listItem.id,
                  propName: fieldArrayPropNames.date,
                })}
                showCaret={false}
                width={'fit-content'}
                customInput={({
                  value,
                  disabled,
                  isOpen,
                  errorMessage,
                  onClick,
                }) => {
                  const dateValue = value ? value : t('00/00/0000')

                  return (
                    <Clickable
                      css={css`
                        display: flex;
                        justify-content: flex-start;
                        width: fit-content;
                      `}
                      disabled={disabled}
                      clicked={() => onClick && onClick()}
                      onFocus={() => {
                        onSetIsFocusedByFieldName(
                          generateFieldName({
                            id: listItem.id,
                            propName: fieldArrayPropNames.date,
                          })
                        )
                      }}
                      onBlur={() =>
                        onSetIsTouchedByFieldName(
                          generateFieldName({
                            id: listItem.id,
                            propName: fieldArrayPropNames.date,
                          })
                        )
                      }
                    >
                      <Tooltip
                        msg={errorMessage ?? undefined}
                        position={'top center'}
                      >
                        <div
                          css={css`
                            display: inline-flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            height: ${toREM(24)};
                            border-radius: ${theme.sizes.br1};

                            ${errorMessage &&
                            css`
                              background-color: ${theme.colors
                                .textInputSmallErrorBackgroundColorSecondary};
                            `}
                          `}
                        >
                          <TextEllipsis
                            lineLimit={1}
                            type='body'
                            weight='normal'
                          >
                            {dateValue}
                          </TextEllipsis>

                          {getData().pageState.businessPlanMode === 'EDIT' && (
                            <Icon
                              data-html2canvas-ignore
                              className={
                                BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS
                              }
                              iconName={
                                isOpen ? 'chevronUpIcon' : 'chevronDownIcon'
                              }
                              iconSize='lg'
                            />
                          )}
                        </div>
                      </Tooltip>
                    </Clickable>
                  )
                }}
              />
            </>
          ) : (
            <TextInputAutoExpansion
              name={generateFieldName({
                id: listItem.id,
                propName: fieldArrayPropNames.text,
              })}
              id={'businessPlanListItem-text'}
              width={'100%'}
              placeholder={t('Type details here')}
              textStyles={{ type: 'body' }}
            />
          )}
        </td>

        {getData().pageState.businessPlanMode === 'EDIT' &&
          getData().getCurrentUserPermissions().canEditBusinessPlan.allowed && (
            <td
              css={css`
                width: ${toREM(24)};
                padding: ${theme.sizes.spacing4} 0;

                ${isPdfPreview &&
                css`
                  padding: 0 !important;
                `}
              `}
              className={'business-plan-list-hover-options'}
            >
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
                          text:
                            listItem.listItemType === 'DATE'
                              ? listItem.date
                                ? getShortDateDisplay({
                                    secondsSinceEpochUTC: listItem.date,
                                  })
                                : t('00/00/0000')
                              : listItem.text,
                          textTitle: listItem.textTitle,
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
                          textTitle: getTextTitleForListItems({
                            diResolver,
                            listItemType: listItems[index].listItemType,
                            tileType: getTileData().tileType,
                          }),
                          text: '',
                          sortOrder: newSortOrder,
                          id: uuid(),
                          listItemType: listItems[index].listItemType,
                          date:
                            listItems[index].listItemType === 'DATE'
                              ? listItems[index].date
                              : null,
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
                          onFieldChange(
                            generateFieldName({
                              id: listItem.id,
                              propName: fieldArrayPropNames.textTitle,
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
            </td>
          )}
      </tr>
    )
  }
)
