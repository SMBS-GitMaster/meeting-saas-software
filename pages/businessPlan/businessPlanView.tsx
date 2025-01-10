import { observer } from 'mobx-react'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { css } from 'styled-components'

import { useDIResolver } from '@mm/core/di/resolver'
import { UnreachableCaseError } from '@mm/core/exceptions/switch'
import { throwLocallyLogInProd } from '@mm/core/exceptions/throwLocallyLogInProd'
import { SSRSuspense } from '@mm/core/ssr'

import {
  EBusinessPlanListCollectionListType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import BusinessPlanTileErrorBoundary from '@mm/core-web/router/customErrorBoundaries/businessPlanTileErrorBoundary'
import { BtnText, Loading, Text, useTheme } from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import businessPlanEmptyState from '@mm/bloom-web/pages/businessPlan/assets/businessPlanEmptyState.png'

import { useAction } from '../performance/mobx'
import { BusinessPlanHeader } from './businessPlanHeader'
import { BusinessPlanTilesGrid } from './businessPlanTilesGrid'
import {
  IBusinessPlanGetListCollectionToRenderOpts,
  IBusinessPlanViewProps,
  TBusinessPlanTileProps,
} from './businessPlanTypes'
import {
  BusinessPlanGoalsListCollection,
  BusinessPlanIssuesListCollection,
  BusinessPlanNumberedOrBulletedListCollection,
  BusinessPlanTextListCollection,
  BusinessPlanTitledListCollection,
} from './listCollections'
import { BusinessPlanPdfFullScreenIframePortal } from './pdfPreview'
import {
  BusinessPlanBhagTile,
  BusinessPlanCoreFocusTile,
  BusinessPlanCoreValuesTile,
  BusinessPlanGoalsTile,
  BusinessPlanIssuesTile,
  BusinessPlanStrategyTile,
  BusinessPlanVisionOneYearTile,
  BusinessPlanVisionThreeYearTile,
} from './tiles'

export const BusinessPlanView = observer(function BusinessPlanView(
  props: IBusinessPlanViewProps
) {
  const terms = useBloomCustomTerms()
  const theme = useTheme()
  const diResolver = useDIResolver()
  const { openOverlazy } = useOverlazyController()

  const { t } = useTranslation()

  const { isCreateScreen, getData, getActions } = props

  const getListCollectionToRender = useAction(
    (opts: IBusinessPlanGetListCollectionToRenderOpts) => {
      const {
        listCollection,
        getIsEditingDisabled,
        getTileData,
        isPdfPreview,
        textListCollectionCountForStrategyTile,
        onHandleCreateContextAwareIssueFromBusinessPlan,
      } = opts

      const listType = listCollection.listType

      switch (listType) {
        case EBusinessPlanListCollectionListType.Text: {
          return (
            <BusinessPlanTextListCollection
              getData={getData}
              getActions={getActions}
              getIsEditingDisabled={getIsEditingDisabled}
              isPdfPreview={isPdfPreview}
              listCollection={listCollection}
              getTileData={getTileData}
              textListCollectionCountForStrategyTile={
                textListCollectionCountForStrategyTile
              }
              onHandleCreateContextAwareIssueFromBusinessPlan={
                onHandleCreateContextAwareIssueFromBusinessPlan
              }
            />
          )
        }
        case EBusinessPlanListCollectionListType.NumberedList:
        case EBusinessPlanListCollectionListType.BulletedList: {
          return (
            <BusinessPlanNumberedOrBulletedListCollection
              getData={getData}
              getActions={getActions}
              getIsEditingDisabled={getIsEditingDisabled}
              listCollection={listCollection}
              getTileData={getTileData}
              isPdfPreview={isPdfPreview}
              onHandleCreateContextAwareIssueFromBusinessPlan={
                onHandleCreateContextAwareIssueFromBusinessPlan
              }
            />
          )
        }
        case EBusinessPlanListCollectionListType.TitledList: {
          return (
            <BusinessPlanTitledListCollection
              getData={getData}
              getActions={getActions}
              getIsEditingDisabled={getIsEditingDisabled}
              listCollection={listCollection}
              isPdfPreview={isPdfPreview}
              getTileData={getTileData}
              onHandleCreateContextAwareIssueFromBusinessPlan={
                onHandleCreateContextAwareIssueFromBusinessPlan
              }
            />
          )
        }
        case EBusinessPlanListCollectionListType.GoalsList: {
          return (
            <BusinessPlanTileErrorBoundary
              diResolver={diResolver}
              key={listCollection.id}
            >
              <BusinessPlanGoalsListCollection
                isPdfPreview={isPdfPreview}
                getData={getData}
                getIsEditingDisabled={getIsEditingDisabled}
                listCollection={listCollection}
                getTileData={getTileData}
              />
            </BusinessPlanTileErrorBoundary>
          )
        }
        case EBusinessPlanListCollectionListType.IssuesList: {
          return (
            <BusinessPlanTileErrorBoundary
              diResolver={diResolver}
              key={listCollection.id}
            >
              <BusinessPlanIssuesListCollection
                getData={getData}
                isPdfPreview={isPdfPreview}
                getIsEditingDisabled={getIsEditingDisabled}
                listCollection={listCollection}
                getTileData={getTileData}
              />
            </BusinessPlanTileErrorBoundary>
          )
        }
        default: {
          throwLocallyLogInProd(
            diResolver,
            new UnreachableCaseError({
              eventType: listType,
              errorMessage: `The listType ${listType} does not exist in getListCollectionToRender fn for business plans`,
            } as never)
          )
          return null
        }
      }
    }
  )

  const getTileToRender = useAction(
    (tile: TBusinessPlanTileProps, pdfPreview?: boolean) => {
      switch (tile.tileType) {
        case 'CORE_VALUES':
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanCoreValuesTile
                tileId={() => tile.id}
                getData={getData}
                getListCollectionToRender={getListCollectionToRender}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )

        case 'CORE_FOCUS': {
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanCoreFocusTile
                tileId={() => tile.id}
                getListCollectionToRender={getListCollectionToRender}
                getData={getData}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )
        }

        case 'BHAG': {
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanBhagTile
                tileId={() => tile.id}
                getData={getData}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )
        }
        case 'STRATEGY': {
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanStrategyTile
                tileId={() => tile.id}
                getListCollectionToRender={getListCollectionToRender}
                getData={getData}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )
        }
        case 'VISION_THREE_YEAR': {
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanVisionThreeYearTile
                tileId={() => tile.id}
                getListCollectionToRender={getListCollectionToRender}
                getData={getData}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )
        }
        case 'VISION_ONE_YEAR': {
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanVisionOneYearTile
                tileId={() => tile.id}
                getListCollectionToRender={getListCollectionToRender}
                getData={getData}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )
        }
        case 'VISION_QUARTERLY': {
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanGoalsTile
                tileId={() => tile.id}
                getListCollectionToRender={getListCollectionToRender}
                getData={getData}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )
        }
        case 'ISSUES': {
          const dataForThisTile =
            getData().getRecordOfTileIdToTileData()[tile.id]

          if (!dataForThisTile) {
            return null
          }

          return (
            <div
              css={css`
                height: 100%;
              `}
            >
              <BusinessPlanIssuesTile
                tileId={() => tile.id}
                getListCollectionToRender={getListCollectionToRender}
                getData={getData}
                getActions={getActions}
                isPdfPreview={!!pdfPreview}
              />
            </div>
          )
        }

        default: {
          throwLocallyLogInProd(
            diResolver,
            new UnreachableCaseError({
              eventType: tile,
              errorMessage: `The tileType ${tile.tileType} does not exist in renderTile fn for business plans`,
            } as never)
          )
          return null
        }
      }
    }
  )

  return (
    <div
      css={css`
        width: 100%;
        height: auto;
      `}
    >
      <Helmet>
        <title>{t('Business Plan')}</title>
      </Helmet>
      <SSRSuspense
        fallback={
          <div
            css={css`
              height: 100vh;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Loading size='large' />
          </div>
        }
      >
        <BusinessPlanHeader getData={getData} getActions={getActions} />

        {isCreateScreen || !getData().businessPlan ? (
          <div
            css={css`
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            `}
          >
            <div
              css={css`
                display: flex;
                align-items: center;
                flex-flow: column nowrap;
              `}
            >
              <img
                src={businessPlanEmptyState}
                alt={t('You have no {{bp}}', {
                  bp: terms.businessPlan.lowercasePlural,
                })}
                css={css`
                  object-fit: contain;
                  object-position: center;
                `}
              />
              <Text
                weight='semibold'
                css={css`
                  padding-bottom: ${theme.sizes.spacing24};
                `}
              >
                {!getData().businessPlan && !isCreateScreen
                  ? t('{{bp}} not found', {
                      bp: terms.businessPlan.singular,
                    })
                  : t('You have no {{bp}}', {
                      bp: terms.businessPlan.lowercasePlural,
                    })}
              </Text>
              <BtnText
                intent='secondary'
                ariaLabel={t('Add a {{bp}}', {
                  bp: terms.businessPlan.lowercaseSingular,
                })}
                onClick={() => {
                  openOverlazy('CreateBusinessPlanModal', {})
                }}
                css={css`
                  align-self: flex-end;
                  margin-top: ${theme.sizes.spacing16};
                `}
              >
                {t('Add a {{bp}}', {
                  bp: terms.businessPlan.lowercaseSingular,
                })}
              </BtnText>
            </div>
          </div>
        ) : (
          <>
            {getData().isLoadingSecondSubscription ||
            getData().pageState.isLoadingGridstack ? (
              <Loading
                css={css`
                  height: 100vh;
                `}
              />
            ) : (
              <>
                <BusinessPlanTilesGrid
                  key={getData().businessPlan?.id}
                  getData={getData}
                  getActions={getActions}
                  getTileToRender={getTileToRender}
                />
                {getData().pageState.renderPDFPreview && (
                  <BusinessPlanPdfFullScreenIframePortal
                    getData={getData}
                    getActions={getActions}
                    getTileToRender={getTileToRender}
                  />
                )}
              </>
            )}
          </>
        )}
      </SSRSuspense>
    </div>
  )
})
