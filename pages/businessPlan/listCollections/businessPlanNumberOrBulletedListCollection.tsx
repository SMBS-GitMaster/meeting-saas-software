import { observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { css } from 'styled-components'

import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  ParentFormValidatorRule,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'
import { useDocument } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web'

import {
  TextInputAutoExpansion,
  toREM,
  useSortable,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import {
  IBusinessPlanGenericListItem,
  IBusinessPlanListCollection,
  IBusinessPlanTileData,
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanTileNumberedOrBulltedListItem } from '../components'
import {
  BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
  BUSINESS_PLAN_MAX_ITEM_LIMIT,
  RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_SHOW_LIST_COLLECTION_TITLE,
} from '../constants'
import {
  getBusinessPlanListCollectionTitlePlaceholder,
  getListCollectionSortableClassNameFromTileAndListCollectionTypes,
  getListCollectionSortableIdFromTileAndListCollectionTypes,
  getRecordOfBusinessPlanTileTypeToMaxItemTooltipText,
} from '../lookups'

interface IBusinessPlanNumberedOrBulletedListCollectionProps {
  listCollection: IBusinessPlanListCollection
  isPdfPreview: boolean
  getIsEditingDisabled: () => boolean
  getData: () => Pick<
    IBusinessPlanViewData,
    'isLoadingFirstSubscription' | 'getCurrentUserPermissions' | 'pageState'
  >
  getTileData: () => IBusinessPlanTileData
  getActions: () => Pick<
    IBusinessPlanViewActions,
    | 'onHandleEditNumberedOrBulletedListCollection'
    | 'onHandleSortAndReorderBusinessPlanListItems'
  >
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    textTitle?: string
  }) => void
}

export const BusinessPlanNumberedOrBulletedListCollection = observer(
  (props: IBusinessPlanNumberedOrBulletedListCollectionProps) => {
    const document = useDocument()
    const diResolver = useDIResolver()
    const theme = useTheme()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const {
      listCollection,
      isPdfPreview,
      getData,
      getTileData,
      getIsEditingDisabled,
      getActions,
      onHandleCreateContextAwareIssueFromBusinessPlan,
    } = props

    const sortableId =
      getListCollectionSortableIdFromTileAndListCollectionTypes({
        listCollectionId: listCollection.id,
        tileType: getTileData().tileType,
      })

    const sortableItemClassName =
      getListCollectionSortableClassNameFromTileAndListCollectionTypes({
        listCollectionId: listCollection.id,
        tileType: getTileData().tileType,
      })

    const maxItemsTooltipText =
      getRecordOfBusinessPlanTileTypeToMaxItemTooltipText({ diResolver })[
        getTileData().tileType
      ]

    const renderListCollectionTitle =
      RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_SHOW_LIST_COLLECTION_TITLE[
        getTileData().tileType
      ]

    const titlePlaceholder = getBusinessPlanListCollectionTitlePlaceholder({
      diResolver,
      listType: listCollection.listType,
      tileType: getTileData().tileType,
    })

    // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/CT-138
    const stringyListCollection = JSON.stringify(listCollection)
    const memoizedListCollectionFormValues = useMemo(() => {
      return {
        title: listCollection.title ?? titlePlaceholder,
        listItems: listCollection.listItems.nodes.map((listItem) => {
          return {
            id: listItem.id,
            text: listItem.text,
            sortOrder: listItem.sortOrder,
            listItemType: listItem.listItemType,
          }
        }),
      }
    }, [listCollection, stringyListCollection])

    const { createSortable } = useSortable({
      sorter: async (_, newIndex, sortedItem) => {
        if (!sortedItem) return
        const listItemId = sortedItem.id

        const currentListItemAtNewIndex =
          listCollection.listItems.nodes[newIndex]

        if (!currentListItemAtNewIndex) {
          return openOverlazy('Toast', {
            type: 'error',
            text: t(`Failed to drag sort`),
            error: new Error(
              `Invalid sorting selection for listitem at id ${listItemId}, there is no listItem at index ${newIndex} in the listItem collection to get the sortOrder from.`
            ),
          })
        }

        return await getActions().onHandleSortAndReorderBusinessPlanListItems({
          listItemId,
          tileId: getTileData().id,
          listCollectionId: listCollection.id,
          sortOrder: currentListItemAtNewIndex.sortOrder,
        })
      },
      sortableOptions: {
        handle: `.${sortableItemClassName}`,
      },
    })

    useEffect(() => {
      setTimeout(() => {
        const sortableCoreValuesContainer = document.getElementById(sortableId)

        if (
          sortableCoreValuesContainer &&
          listCollection.listItems.nodes.length > 0
        ) {
          createSortable(sortableCoreValuesContainer)
        }
      }, 0)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const titleFormValidation: ParentFormValidatorRule<
      string,
      {
        title: string
        listItems: Array<IBusinessPlanGenericListItem>
      }
    >[] = renderListCollectionTitle
      ? [
          maxLength({
            maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
          }),
          required(),
        ]
      : [
          maxLength({
            maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
          }),
        ]

    return (
      <EditForm
        isLoading={getData().isLoadingFirstSubscription}
        disabled={getIsEditingDisabled()}
        values={
          memoizedListCollectionFormValues as {
            title: string
            listItems: Array<IBusinessPlanGenericListItem>
          }
        }
        validation={
          {
            title: formValidators.string({
              additionalRules: titleFormValidation,
            }),
            listItems: formValidators.arrayOfNodes({
              additionalRules: [
                required(),
                maxLength({ maxLength: BUSINESS_PLAN_MAX_ITEM_LIMIT }),
              ],
            }),
          } satisfies GetParentFormValidation<{
            title: string
            listItems: Array<IBusinessPlanGenericListItem>
          }>
        }
        displayErrorsOnceFormIsTouched={true}
        onSubmit={async (values, onListItemCreated) => {
          await getActions().onHandleEditNumberedOrBulletedListCollection({
            listCollectionId: listCollection.id,
            values,
            tileId: getTileData().id,
            onListItemCreated,
          })
        }}
      >
        {({ fieldNames, values: parentFormValues, hasError }) => {
          return (
            <>
              {renderListCollectionTitle && (
                <div
                  css={css`
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                    padding: ${theme.sizes.spacing4} 0 ${theme.sizes.spacing4}
                      ${theme.sizes.spacing24};
                    min-height: ${toREM(32)};
                    max-width: 100%;

                    ${isPdfPreview &&
                    css`
                      padding: 0 0 0 ${theme.sizes.spacing24} !important;
                      min-height: ${toREM(24)};
                    `}

                    ${getData().pageState.businessPlanMode === 'EDIT' &&
                    css`
                      &:hover,
                      &:focus,
                      &:focus-within {
                        background-color: ${theme.colors
                          .businessPlanTileItemBackgroundColorHover};
                      }
                    `}
                  `}
                >
                  <TextInputAutoExpansion
                    name={fieldNames.title}
                    id={'businessPlanListItem-title'}
                    width={'fit-content'}
                    placeholder={titlePlaceholder}
                    renderSecondaryStyles={true}
                    textStyles={{ type: 'body', weight: 'semibold' }}
                  />
                </div>
              )}
              <div id={sortableId}>
                <FormFieldArray<{
                  parentFormValues: {
                    listItems: Array<IBusinessPlanGenericListItem>
                  }
                  arrayFieldName: typeof fieldNames.listItems
                }>
                  name={fieldNames.listItems}
                  validation={{
                    text: formValidators.string({
                      additionalRules: [
                        maxLength({
                          maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
                        }),
                      ],
                    }),
                    sortOrder: formValidators.number({
                      additionalRules: [],
                      optional: true,
                    }),
                    listItemType: formValidators.string({
                      additionalRules: [],
                    }),
                  }}
                >
                  {({
                    values,
                    fieldArrayPropNames,
                    onFieldChange,
                    onRemoveFieldArrayItem,
                    onAddFieldArrayItem,
                    generateFieldName,
                  }) => {
                    return (
                      <>
                        {values.map((item, index) => {
                          return (
                            <BusinessPlanTileNumberedOrBulltedListItem
                              key={item.id}
                              disableDeleteItem={values.length <= 1}
                              fieldArrayPropNames={fieldArrayPropNames}
                              getIsEditingDisabled={getIsEditingDisabled}
                              getData={getData}
                              hasFormError={hasError}
                              index={index}
                              listItem={item}
                              listItems={values}
                              maxItemLimitTooltipText={maxItemsTooltipText}
                              textTitleForContextAware={
                                renderListCollectionTitle &&
                                parentFormValues?.title
                                  ? parentFormValues.title
                                  : null
                              }
                              isPdfPreview={isPdfPreview}
                              showNumberedItems={listCollection.isNumberedList}
                              sortableItemClassName={sortableItemClassName}
                              generateFieldName={generateFieldName}
                              onAddFieldArrayItem={onAddFieldArrayItem}
                              onFieldChange={onFieldChange}
                              onRemoveFieldArrayItem={onRemoveFieldArrayItem}
                              onHandleCreateContextAwareIssueFromBusinessPlan={
                                onHandleCreateContextAwareIssueFromBusinessPlan
                              }
                            />
                          )
                        })}
                      </>
                    )
                  }}
                </FormFieldArray>
              </div>
            </>
          )
        }}
      </EditForm>
    )
  }
)
