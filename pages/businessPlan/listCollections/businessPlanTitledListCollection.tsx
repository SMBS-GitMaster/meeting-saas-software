import { observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { css } from 'styled-components'

import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  ParentFormValidatorRule,
  formFieldArrayValidators,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'
import { useDocument } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web'

import {
  BtnIcon,
  TextInputAutoExpansion,
  toREM,
  useSortable,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import { useAction, useObservable } from '../../performance/mobx'
import {
  IBusinessPlanListCollection,
  IBusinessPlanTileData,
  IBusinessPlanTitledListItem,
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanTileTitledListItem } from '../components'
import {
  BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
  BUSINESS_PLAN_MAX_ITEM_LIMIT,
  BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS,
  RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_SHOW_FORM_ERRORS_ON_TOUCHED_FIELDS,
  RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_SHOW_LIST_COLLECTION_TITLE,
} from '../constants'
import {
  getBusinessPlanListCollectionTitlePlaceholder,
  getFutureDateDefaultBasedOnTileType,
  getListCollectionSortableClassNameFromTileAndListCollectionTypes,
  getListCollectionSortableIdFromTileAndListCollectionTypes,
  getRecordOfBusinessPlanTileTypeToMaxItemTooltipText,
  getTextTitleForListItems,
} from '../lookups'
import {
  getBusinessPlanListCollectionTitledListDateFieldValidator,
  getBusinessPlanListCollectionTitledListTextFieldValidator,
} from '../utils'

interface IBusinessPlanTitledListCollectionProps {
  listCollection: IBusinessPlanListCollection
  isPdfPreview: boolean
  getIsEditingDisabled: () => boolean
  getData: () => Pick<
    IBusinessPlanViewData,
    | 'businessPlan'
    | 'isLoadingFirstSubscription'
    | 'getCurrentUserPermissions'
    | 'pageState'
  >
  getTileData: () => IBusinessPlanTileData
  getActions: () => Pick<
    IBusinessPlanViewActions,
    | 'onHandleEditTitledListCollection'
    | 'onHandleSortAndReorderBusinessPlanListItems'
  >
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    textTitle: string
  }) => void
}

interface IBusinessPlanTitledListCollectionFormValues {
  title: string
  listItems: Array<IBusinessPlanTitledListItem>
}

export const BusinessPlanTitledListCollection = observer(
  (props: IBusinessPlanTitledListCollectionProps) => {
    const document = useDocument()
    const diResolver = useDIResolver()
    const theme = useTheme()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const componentState = useObservable({
      showItems: true,
    })

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

    const displayErrorsOnceFormIsTouched =
      RECORD_OF_BUSINESS_PLAN_TILE_TYPE_TO_SHOW_FORM_ERRORS_ON_TOUCHED_FIELDS[
        getTileData().tileType
      ]

    // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/CT-138
    const stringyListCollection = JSON.stringify(listCollection)
    const tileType = getTileData().tileType
    const createdTime = getData().businessPlan?.createdTime ?? null
    const memoizedListCollectionFormValues = useMemo(() => {
      return {
        title: listCollection.title ?? titlePlaceholder,
        listItems: listCollection.listItems.nodes.map((listItem, index) => {
          return {
            id: listItem.id,
            text: listItem.text,
            textTitle:
              listItem.textTitle ||
              getTextTitleForListItems({
                diResolver,
                listItemType: listItem.listItemType,
                tileType,
                isFirstItem: index === 0,
              }),
            sortOrder: listItem.sortOrder,
            listItemType: listItem.listItemType,
            date: listItem.date
              ? listItem.date
              : listItem.listItemType === 'DATE'
                ? getFutureDateDefaultBasedOnTileType({
                    diResolver,
                    tileType,
                    businessPlanCreatedTimeISOString: createdTime,
                  })
                : null,
          }
        }),
      }
    }, [
      stringyListCollection,
      listCollection,
      tileType,
      diResolver,
      createdTime,
      getTextTitleForListItems,
      getFutureDateDefaultBasedOnTileType,
    ])

    const titleFormValidation: ParentFormValidatorRule<
      string,
      IBusinessPlanTitledListCollectionFormValues
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

    const onHandleToggleItems = useAction(() => {
      componentState.showItems = !componentState.showItems
    })

    return (
      <EditForm
        isLoading={getData().isLoadingFirstSubscription}
        disabled={getIsEditingDisabled()}
        values={
          memoizedListCollectionFormValues as IBusinessPlanTitledListCollectionFormValues
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
          } satisfies GetParentFormValidation<IBusinessPlanTitledListCollectionFormValues>
        }
        displayErrorsOnceFormIsTouched={displayErrorsOnceFormIsTouched}
        onSubmit={async (values, onListItemCreated) => {
          await getActions().onHandleEditTitledListCollection({
            listCollectionId: listCollection.id,
            values,
            tileId: getTileData().id,
            onListItemCreated,
          })
        }}
      >
        {({ fieldNames, hasError }) => {
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
                  <BtnIcon
                    data-html2canvas-ignore
                    className={BUSINESS_PLAN_NO_DISPLAY_ON_PRINT_CLASS}
                    intent='naked'
                    size='lg'
                    iconProps={{
                      iconName: componentState.showItems
                        ? 'chevronDownIcon'
                        : 'chevronUpIcon',
                    }}
                    onClick={onHandleToggleItems}
                    ariaLabel={t('Show Items')}
                    tag={'button'}
                    css={css`
                      padding-left: ${theme.sizes.spacing8};
                    `}
                  />
                </div>
              )}
              <div id={sortableId}>
                <FormFieldArray<{
                  parentFormValues: IBusinessPlanTitledListCollectionFormValues
                  arrayFieldName: typeof fieldNames.listItems
                }>
                  name={fieldNames.listItems}
                  validation={{
                    textTitle: formValidators.string({
                      additionalRules: [
                        required(),
                        maxLength({
                          maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
                        }),
                      ],
                    }),
                    text: formFieldArrayValidators.string({
                      additionalRules: [
                        getBusinessPlanListCollectionTitledListTextFieldValidator(),
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
                      optional: true,
                    }),
                    date: formFieldArrayValidators.number({
                      additionalRules: [
                        getBusinessPlanListCollectionTitledListDateFieldValidator(),
                      ],
                      optional: true,
                    }),
                  }}
                >
                  {({
                    values,
                    fieldArrayPropNames,
                    onFieldChange,
                    onRemoveFieldArrayItem,
                    onAddFieldArrayItem,
                    onSetIsFocusedByFieldName,
                    onSetIsTouchedByFieldName,
                    generateFieldName,
                  }) => {
                    return (
                      <table
                        css={css`
                          border-collapse: collapse;
                          width: 100%;
                        `}
                      >
                        <tbody>
                          {values.map((item, index) => {
                            const countOfDateItems = values.filter(
                              (listItem) => listItem.listItemType === 'DATE'
                            ).length
                            const countOfTextItems = values.filter(
                              (listItem) => listItem.listItemType !== 'DATE'
                            ).length

                            const disabledDeleteItem =
                              item.listItemType === 'DATE'
                                ? countOfDateItems <= 1
                                : countOfTextItems <= 1

                            return (
                              <React.Fragment key={item.id}>
                                {componentState.showItems && (
                                  <BusinessPlanTileTitledListItem
                                    key={item.id}
                                    disableDeleteItem={disabledDeleteItem}
                                    fieldArrayPropNames={fieldArrayPropNames}
                                    getData={getData}
                                    getTileData={getTileData}
                                    getIsEditingDisabled={getIsEditingDisabled}
                                    hasFormError={hasError}
                                    index={index}
                                    listItem={item}
                                    listItems={values}
                                    maxItemLimitTooltipText={
                                      maxItemsTooltipText
                                    }
                                    renderUppercaseTitle={
                                      getTileData().tileType === 'CORE_FOCUS'
                                    }
                                    renderColonSeperator={
                                      item.listItemType !== 'DATE' &&
                                      getTileData().tileType !== 'CORE_FOCUS'
                                    }
                                    sortableItemClassName={
                                      sortableItemClassName
                                    }
                                    isPdfPreview={isPdfPreview}
                                    generateFieldName={generateFieldName}
                                    onAddFieldArrayItem={onAddFieldArrayItem}
                                    onFieldChange={onFieldChange}
                                    onRemoveFieldArrayItem={
                                      onRemoveFieldArrayItem
                                    }
                                    onSetIsFocusedByFieldName={
                                      onSetIsFocusedByFieldName
                                    }
                                    onSetIsTouchedByFieldName={
                                      onSetIsTouchedByFieldName
                                    }
                                    onHandleCreateContextAwareIssueFromBusinessPlan={
                                      onHandleCreateContextAwareIssueFromBusinessPlan
                                    }
                                  />
                                )}
                              </React.Fragment>
                            )
                          })}
                        </tbody>
                      </table>
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
