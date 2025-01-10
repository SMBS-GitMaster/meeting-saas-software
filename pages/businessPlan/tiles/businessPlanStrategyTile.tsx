import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { css, useTheme } from 'styled-components'

import { Id } from '@mm/gql'

import { useDIResolver } from '@mm/core/di/resolver'

import {
  Card,
  sharedWarningScrollbarStyles,
  useResizeObserver,
} from '@mm/core-web/ui'

import { useAction, useComputed, useObservable } from '../../performance/mobx'
import {
  IBusinessPlanGetListCollectionToRenderOpts,
  IBusinessPlanViewActions,
  IBusinessPlanViewData,
} from '../businessPlanTypes'
import { BusinessPlanTileHeader } from '../components'
import { getRecordOfBusinessPlanTileTypeToDefaultTileTitle } from '../lookups'

interface IBusinessPlanStrategyProps {
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
  getListCollectionToRender: (
    opts: IBusinessPlanGetListCollectionToRenderOpts
  ) => JSX.Element | null
  isPdfPreview: boolean
  getActions: () => Pick<
    IBusinessPlanViewActions,
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

export const BusinessPlanStrategyTile = observer(
  (props: IBusinessPlanStrategyProps) => {
    const diResolver = useDIResolver()
    const theme = useTheme()

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
      { name: 'businessPlanStrategyTile-getTileData' }
    )

    const getIsEditingDisabled = useComputed(
      () => {
        return (
          getData().pageState.businessPlanMode !== 'EDIT' ||
          !getData().getCurrentUserPermissions().canEditBusinessPlan.allowed
        )
      },
      { name: 'businessPlanStrategyTile-getIsEditingDisabled' }
    )

    const onHandleCreateContextAwareIssueFromBusinessPlan = useAction(
      (opts: { text: string; textTitle?: string }) => {
        const { text, textTitle } = opts
        return getActions().onHandleCreateContextAwareIssueFromBusinessPlan({
          context: {
            type: 'BusinessPlanStrategy',
            businessPlanPage: getData().pageState.parentPageType,
            title: textTitle ? `${textTitle}: ${text}` : text,
            tile:
              getTileData().title ||
              getRecordOfBusinessPlanTileTypeToDefaultTileTitle({ diResolver })[
                getTileData().tileType
              ],
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
          {getTileData().listCollections.nodes.map((listCollection, index) => {
            return (
              <div
                key={listCollection.id}
                css={css`
                  ${index > 0 &&
                  css`
                    padding-top: ${theme.sizes.spacing16};

                    ${isPdfPreview &&
                    css`
                      padding-top: ${theme.sizes.spacing4} !important;
                    `}
                  `}
                `}
              >
                {getListCollectionToRender({
                  textListCollectionCountForStrategyTile: index,
                  getIsEditingDisabled,
                  listCollection,
                  getTileData,
                  isPdfPreview,
                  onHandleCreateContextAwareIssueFromBusinessPlan,
                })}
              </div>
            )
          })}
        </Card.Body>
      </div>
    )
  }
)
