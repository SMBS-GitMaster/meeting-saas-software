import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { css, useTheme } from 'styled-components'

import { Id } from '@mm/gql'

import { useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import {
  BtnText,
  Card,
  TextEllipsis,
  sharedWarningScrollbarStyles,
  toREM,
  useResizeObserver,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import emptyCoreValuesImg from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateAssets/emptyCoreValues.svg'

import { useAction, useComputed, useObservable } from '../../performance/mobx'
import {
  IBusinessPlanGetListCollectionToRenderOpts,
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanTileHeader } from '../components'

interface IBusinessPlanCoreValuesProps {
  tileId: () => Id
  getListCollectionToRender: (
    opts: IBusinessPlanGetListCollectionToRenderOpts
  ) => JSX.Element | null
  getData: () => Pick<
    IBusinessPlanViewData,
    | 'pageState'
    | 'getCurrentUserPermissions'
    | 'getRecordOfTileIdToTileData'
    | 'isLoadingFirstSubscription'
    | 'getMainOrgBusinessPlanCoreValuesTileData'
    | 'businessPlan'
    | 'v3BusinessPlanId'
  >
  isPdfPreview: boolean
  getActions: () => Pick<
    IBusinessPlanViewActions,
    | 'onHandleHideTile'
    | 'onHandleDuplicateTile'
    | 'onHandleMoveTileToOtherPage'
    | 'onHandleRenameTile'
    | 'onHandleEditNumberedOrBulletedListCollection'
    | 'onHandleCreateContextAwareIssueFromBusinessPlan'
    | 'onHandleSortAndReorderBusinessPlanListItems'
    | 'onHandleEditBusinessPlanGoalOptionsMenuItems'
    | 'onHandleUpdateIssueListColumnSize'
  >
}

export const BusinessPlanCoreValuesTile = observer(
  (props: IBusinessPlanCoreValuesProps) => {
    const terms = useBloomCustomTerms()
    const theme = useTheme()
    const { t } = useTranslation()
    const { openOverlazy } = useOverlazyController()

    const {
      tileId,
      getData,
      getListCollectionToRender,
      isPdfPreview,
      getActions,
    } = props

    const pageState = useObservable({
      renderScrollOverflowIndicator: false,
      cardBodyEl: null as Maybe<HTMLDivElement>,
    })

    const { height, ready, scrollHeight } = useResizeObserver(
      pageState.cardBodyEl
    )

    const getTileData = useComputed(
      () => {
        return getData().getRecordOfTileIdToTileData()[tileId()]
      },
      { name: 'businessPlanCoreValuesTile-getTileData' }
    )

    const getIsEditingDisabled = useComputed(
      () => {
        return (
          !getData().businessPlan?.isMainOrgBusinessPlan({
            v3BusinessPlanId: getData().v3BusinessPlanId,
          }) ||
          getData().pageState.businessPlanMode !== 'EDIT' ||
          !getData().getCurrentUserPermissions().canEditBusinessPlan.allowed
        )
      },
      { name: 'businessPlanCoreValuesTile-getIsEditingDisabled' }
    )

    const getIsEditingDisabledForMenuItemsInHeader = useComputed(
      () => {
        return (
          getData().pageState.businessPlanMode !== 'EDIT' ||
          !getData().getCurrentUserPermissions().canEditBusinessPlan.allowed
        )
      },
      { name: 'businessPlanCoreValuesTile-getIsEditingDisabled' }
    )
    const onHandleCreateContextAwareIssueFromBusinessPlan = useAction(
      (opts: { text: string }) => {
        const { text } = opts

        return getActions().onHandleCreateContextAwareIssueFromBusinessPlan({
          context: {
            type: 'BusinessPlanCoreValues',
            businessPlanPage: getData().pageState.parentPageType,
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
          getIsEditingDisabledForMenuItemsInHeader={
            getIsEditingDisabledForMenuItemsInHeader
          }
          renderMenuOptions={{ move: true, duplicate: false, hide: true }}
          renderScrollOverflowIndicator={
            pageState.renderScrollOverflowIndicator
          }
          isPdfPreview={isPdfPreview}
          css={css`
            ${getIsEditingDisabled() &&
            css`
              cursor: default !important;
            `}
          `}
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

            ${getIsEditingDisabled() &&
            css`
              cursor: default !important;
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
          {!!getData().getMainOrgBusinessPlanCoreValuesTileData() ? (
            <>
              {getTileData().listCollections.nodes.map((listCollection) => {
                return (
                  <React.Fragment key={listCollection.id}>
                    {getListCollectionToRender({
                      getIsEditingDisabled,
                      listCollection,
                      getTileData,
                      onHandleCreateContextAwareIssueFromBusinessPlan,
                      isPdfPreview,
                    })}
                  </React.Fragment>
                )
              })}
            </>
          ) : (
            <div
              css={css`
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
              `}
            >
              <img
                src={emptyCoreValuesImg}
                alt={t('Core values')}
                css={css`
                  height: ${toREM(104)};
                  object-fit: contain;
                  object-position: center;
                  width: ${toREM(104)};
                `}
              />
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  justify-content: center;
                `}
              >
                <TextEllipsis type={'body'} lineLimit={3} weight={'semibold'}>
                  {t(
                    '{{cv}} will be displayed once a main business plan is chosen.',
                    { cv: terms.coreValues.plural }
                  )}
                </TextEllipsis>
                {getData().getCurrentUserPermissions().isOrgAdmin &&
                  getData().pageState.businessPlanMode === 'EDIT' && (
                    <BtnText
                      intent='secondary'
                      ariaLabel={t('Select main plan')}
                      onClick={() => {
                        openOverlazy('AdminBusinessPlanSettingsModal', {})
                      }}
                      css={css`
                        margin-top: ${theme.sizes.spacing16};
                        align-self: center;
                      `}
                    >
                      {t('Select main plan')}
                    </BtnText>
                  )}
              </div>
            </div>
          )}
        </Card.Body>
      </div>
    )
  }
)
