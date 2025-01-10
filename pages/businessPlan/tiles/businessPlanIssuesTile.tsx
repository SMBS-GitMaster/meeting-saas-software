import { runInAction } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { css, useTheme } from 'styled-components'

import { Id } from '@mm/gql'

import {
  EBusinessPlanListCollectionListType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

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

interface IBusinessPlanIssuesTileProps {
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
    | 'onHandleEditBusinessPlanGoalOptionsMenuItems'
    | 'onHandleUpdateIssueListColumnSize'
  >
}

export const BusinessPlanIssuesTile = observer(
  (props: IBusinessPlanIssuesTileProps) => {
    const theme = useTheme()
    const terms = useBloomCustomTerms()

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
      { name: 'businessPlanIssuesTile-getTileData' }
    )

    const getIsEditingDisabled = useComputed(
      () => {
        return (
          getData().pageState.businessPlanMode !== 'EDIT' ||
          !getData().getCurrentUserPermissions().canEditBusinessPlan.allowed
        )
      },
      { name: 'businessPlanIssuesTile-getIsEditingDisabled' }
    )

    const getListCollection = useComputed(
      () => {
        // Note - this is assuming we have only one numbered or bulleted list collection per tile.
        // If we have more than one, we need to modify this to allow multiple numbered or bulleted list collections per tile,
        // and this menu should probably per on a per list collection basis, not tile basis. This is mvp.
        const listCollection = getTileData().listCollections.nodes.find(
          (listCollection) => {
            return (
              listCollection.listType ===
              EBusinessPlanListCollectionListType.IssuesList
            )
          }
        )

        if (!listCollection) {
          return null
        }

        return listCollection
      },
      {
        name: 'businessPlanIssuesTile-getListCollection',
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
          renderIssueColumnMenu={true}
          isPdfPreview={isPdfPreview}
          renderMenuOptions={{
            move: true,
            duplicate: false,
            hide: true,
            goalOptions: {
              showOwner: true,
              showNumberedList: true,
              goalCustomTerm: terms.issue.singular,
              getListCollection,
            },
          }}
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

            ${getIsEditingDisabled() &&
            css`
              cursor: default !important;
            `}

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
          {getTileData().listCollections.nodes.map((listCollection) => {
            return (
              <div key={listCollection.id}>
                {getListCollectionToRender({
                  getIsEditingDisabled,
                  listCollection,
                  getTileData,
                  isPdfPreview,
                  // no-op
                  onHandleCreateContextAwareIssueFromBusinessPlan: () => null,
                })}
              </div>
            )
          })}
        </Card.Body>
      </div>
    )
  }
)
