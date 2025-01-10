import { observer } from 'mobx-react'
import React, { useMemo } from 'react'
import { css } from 'styled-components'

import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  FormFieldArray,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import { TextInputAutoExpansion, toREM, useTheme } from '@mm/core-web/ui'

import {
  IBusinessPlanListCollection,
  IBusinessPlanTextListCollection,
  IBusinessPlanTileData,
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanTileTextField } from '../components/businessPlanTileTextField'
import { BUSINESS_PLAN_MAX_CHARACTER_LIMIT } from '../constants'
import { getRecordOfBusinessPlanTileTypeToTextTitlePlaceholder } from '../lookups'

interface IBusinessPlanTextListCollectionProps {
  listCollection: IBusinessPlanListCollection
  isPdfPreview: boolean
  getIsEditingDisabled: () => boolean
  getData: () => Pick<
    IBusinessPlanViewData,
    'isLoadingFirstSubscription' | 'getCurrentUserPermissions' | 'pageState'
  >
  getTileData: () => IBusinessPlanTileData
  textListCollectionCountForStrategyTile?: number
  getActions: () => Pick<
    IBusinessPlanViewActions,
    'onHandleEditTextListCollection'
  >
  onHandleCreateContextAwareIssueFromBusinessPlan: (opts: {
    text: string
    textTitle?: string
  }) => void
}

export const BusinessPlanTextListCollection = observer(
  (props: IBusinessPlanTextListCollectionProps) => {
    const diResolver = useDIResolver()
    const theme = useTheme()

    const {
      listCollection,
      isPdfPreview,
      getData,
      getTileData,
      getIsEditingDisabled,
      textListCollectionCountForStrategyTile,
      getActions,
      onHandleCreateContextAwareIssueFromBusinessPlan,
    } = props

    const textTitlePlaceholder =
      getRecordOfBusinessPlanTileTypeToTextTitlePlaceholder({
        diResolver,
      })[getTileData().tileType][
        textListCollectionCountForStrategyTile
          ? textListCollectionCountForStrategyTile
          : 0
      ] ?? ''

    // @BLOOM_TODO: https://winterinternational.atlassian.net/browse/CT-138
    const stringyListCollection = JSON.stringify(listCollection)
    const memoizedFormValues = useMemo(() => {
      return {
        title: listCollection.title ?? textTitlePlaceholder,
        listItems: listCollection.listItems.nodes.map((listItem) => {
          return {
            id: listItem.id,
            text: listItem.text,
            listItemType: listItem.listItemType,
          }
        }),
      }
    }, [listCollection, textTitlePlaceholder, stringyListCollection])

    return (
      <EditForm
        isLoading={getData().isLoadingFirstSubscription}
        disabled={getIsEditingDisabled()}
        values={memoizedFormValues as IBusinessPlanTextListCollection}
        validation={
          {
            title: formValidators.string({
              additionalRules: [
                required(),
                maxLength({
                  maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
                }),
              ],
            }),
            listItems: formValidators.arrayOfNodes({
              additionalRules: [required()],
            }),
          } satisfies GetParentFormValidation<IBusinessPlanTextListCollection>
        }
        onSubmit={async (values, onListItemCreated) => {
          await getActions().onHandleEditTextListCollection({
            listCollectionId: listCollection.id,
            values,
            tileId: getTileData().id,
            onListItemCreated,
          })
        }}
      >
        {({ fieldNames, values: parentFormValues }) => {
          return (
            <>
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
                  placeholder={textTitlePlaceholder}
                  renderSecondaryStyles={true}
                  textStyles={{ type: 'body', weight: 'semibold' }}
                />
              </div>

              <FormFieldArray<{
                parentFormValues: {
                  listItems: Array<
                    IBusinessPlanTextListCollection['listItems'][0]
                  >
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
                  generateFieldName,
                }) => {
                  return (
                    <>
                      {values.map((item) => {
                        return (
                          <BusinessPlanTileTextField
                            key={item.id}
                            text={item.text}
                            isPdfPreview={isPdfPreview}
                            fieldName={generateFieldName({
                              id: item.id,
                              propName: fieldArrayPropNames.text,
                            })}
                            getIsEditingDisabled={getIsEditingDisabled}
                            textTitleForContextAware={parentFormValues?.title}
                            onHandleFieldChange={(value: string) =>
                              onFieldChange(
                                generateFieldName({
                                  id: item.id,
                                  propName: fieldArrayPropNames.text,
                                }),
                                value
                              )
                            }
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
            </>
          )
        }}
      </EditForm>
    )
  }
)
