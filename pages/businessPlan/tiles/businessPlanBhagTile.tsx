import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { css, useTheme } from 'styled-components'

import { Id } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'
import {
  EditForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'

import {
  Card,
  sharedWarningScrollbarStyles,
  useResizeObserver,
} from '@mm/core-web/ui'

import { useAction, useComputed, useObservable } from '../../performance/mobx'
import {
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import {
  BusinessPlanTileHeader,
  BusinessPlanTileTextField,
} from '../components'
import { BUSINESS_PLAN_MAX_CHARACTER_LIMIT } from '../constants'
import { getRecordOfBusinessPlanTileTypeToDefaultTileTitle } from '../lookups'

interface IBusinessPlanBhagProps {
  tileId: () => Id
  getData: () => Pick<
    IBusinessPlanViewData,
    | 'pageState'
    | 'getCurrentUserPermissions'
    | 'getRecordOfTileIdToTileData'
    | 'isLoadingFirstSubscription'
    | 'businessPlan'
    | 'v3BusinessPlanId'
  >
  isPdfPreview: boolean
  getActions: () => Pick<
    IBusinessPlanViewActions,
    | 'onHandleEditBusinessPlanTileText'
    | 'onHandleHideTile'
    | 'onHandleDuplicateTile'
    | 'onHandleMoveTileToOtherPage'
    | 'onHandleRenameTile'
    | 'onHandleCreateContextAwareIssueFromBusinessPlan'
    | 'onHandleSortAndReorderBusinessPlanListItems'
    | 'onHandleEditBusinessPlanGoalOptionsMenuItems'
    | 'onHandleUpdateIssueListColumnSize'
  >
}

export const BusinessPlanBhagTile = observer(
  (props: IBusinessPlanBhagProps) => {
    const diResolver = useDIResolver()
    const theme = useTheme()

    const pageState = useObservable({
      renderScrollOverflowIndicator: false,
      cardBodyEl: null as Maybe<HTMLDivElement>,
    })

    const { height, ready, scrollHeight } = useResizeObserver(
      pageState.cardBodyEl
    )

    const { tileId, getData, isPdfPreview, getActions } = props

    const getTileData = useComputed(
      () => {
        return getData().getRecordOfTileIdToTileData()[tileId()]
      },
      { name: 'businessPlanBhagTile-getTileData' }
    )

    const getIsEditingDisabled = useComputed(
      () => {
        return (
          getData().pageState.businessPlanMode !== 'EDIT' ||
          !getData().getCurrentUserPermissions().canEditBusinessPlan.allowed
        )
      },
      {
        name: 'businessPlanBhagTile-getIsEditingDisabled',
      }
    )

    const sectionText = getTileData().text
    const memoizedFormValues = useMemo(() => {
      return {
        text: sectionText,
      }
    }, [sectionText])

    const onHandleCreateContextAwareIssueFromBusinessPlan = useAction(
      (opts: { text: string }) => {
        const { text } = opts

        return getActions().onHandleCreateContextAwareIssueFromBusinessPlan({
          context: {
            type: 'BusinessPlanBhag',
            businessPlanPage: getData().pageState.parentPageType,
            tile:
              getTileData().title ||
              getRecordOfBusinessPlanTileTypeToDefaultTileTitle({ diResolver })[
                getTileData().tileType
              ],
            title: text,
          },
          meetingId: getData().businessPlan?.meetingId || null,
        })
      }
    )

    const setCardBodyEl = useAction((cardBodyEl: Maybe<HTMLDivElement>) => {
      pageState.cardBodyEl = cardBodyEl
    })

    useEffect(() => {
      const tileScrollerContent = pageState.cardBodyEl

      if (tileScrollerContent && ready) {
        const scrollHeight = tileScrollerContent.scrollHeight
        const clientHeight = tileScrollerContent.clientHeight

        if (
          scrollHeight > clientHeight &&
          !pageState.renderScrollOverflowIndicator
        ) {
          runInAction(() => {
            pageState.renderScrollOverflowIndicator = true
          })
        } else if (
          scrollHeight <= clientHeight &&
          pageState.renderScrollOverflowIndicator
        ) {
          runInAction(() => {
            pageState.renderScrollOverflowIndicator = false
          })
        }
      }
    }, [
      pageState.renderScrollOverflowIndicator,
      pageState.cardBodyEl,
      height,
      scrollHeight,
      ready,
    ])

    return (
      <div
        css={css`
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        `}
      >
        <BusinessPlanTileHeader
          getData={getData}
          getTileData={getTileData}
          getActions={getActions}
          getIsEditingDisabled={getIsEditingDisabled}
          renderMenuOptions={{ move: true, duplicate: true, hide: true }}
          isPdfPreview={isPdfPreview}
          renderScrollOverflowIndicator={
            pageState.renderScrollOverflowIndicator
          }
        />

        <Card.Body
          ref={setCardBodyEl}
          css={css`
            padding: ${theme.sizes.spacing8} 0 ${theme.sizes.spacing16} 0;
            overflow-y: auto;
            height: 100%;
            overflow-x: hidden;

            ${isPdfPreview &&
            css`
              padding: ${theme.sizes.spacing4} 0 0 0 !important;
            `}

            ${pageState.renderScrollOverflowIndicator &&
            getData().pageState.businessPlanMode === 'EDIT' &&
            getData().pageState.renderPDFPreview &&
            isPdfPreview &&
            css`
              ${sharedWarningScrollbarStyles}

              @media print {
                ::-webkit-scrollbar {
                  display: none;
                }
              }
            `}
          `}
        >
          <EditForm
            isLoading={getData().isLoadingFirstSubscription}
            disabled={getIsEditingDisabled()}
            values={
              memoizedFormValues as {
                text: string
              }
            }
            validation={
              {
                text: formValidators.string({
                  additionalRules: [
                    required(),
                    maxLength({
                      maxLength: BUSINESS_PLAN_MAX_CHARACTER_LIMIT,
                    }),
                  ],
                }),
              } satisfies GetParentFormValidation<{
                text: string
              }>
            }
            onSubmit={async (values) => {
              await getActions().onHandleEditBusinessPlanTileText({
                tileId: getTileData().id,
                text: values.text || '',
              })
            }}
          >
            {({ fieldNames, values, onFieldChange }) => {
              return (
                <BusinessPlanTileTextField
                  fieldName={fieldNames.text}
                  isPdfPreview={isPdfPreview}
                  getIsEditingDisabled={getIsEditingDisabled}
                  text={values?.text || null}
                  onHandleFieldChange={(value: string) =>
                    onFieldChange(fieldNames.text, value)
                  }
                  onHandleCreateContextAwareIssueFromBusinessPlan={
                    onHandleCreateContextAwareIssueFromBusinessPlan
                  }
                />
              )
            }}
          </EditForm>
        </Card.Body>
      </div>
    )
  }
)
