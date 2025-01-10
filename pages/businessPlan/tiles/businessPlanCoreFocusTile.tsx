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

interface IBusinessPlanCoreFocusProps {
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
    | 'onHandleEditTitledListCollection'
    | 'onHandleCreateContextAwareIssueFromBusinessPlan'
    | 'onHandleSortAndReorderBusinessPlanListItems'
    | 'onHandleEditBusinessPlanGoalOptionsMenuItems'
    | 'onHandleUpdateIssueListColumnSize'
  >
}

export const BusinessPlanCoreFocusTile = observer(
  (props: IBusinessPlanCoreFocusProps) => {
    const diResolver = useDIResolver()
    const theme = useTheme()

    const pageState = useObservable({
      renderScrollOverflowIndicator: false,
      cardBodyEl: null as Maybe<HTMLDivElement>,
    })

    const { height, ready, scrollHeight } = useResizeObserver(
      pageState.cardBodyEl
    )

    const {
      tileId,
      getData,
      getListCollectionToRender,
      isPdfPreview,
      getActions,
    } = props

    const getTileData = useComputed(
      () => {
        return getData().getRecordOfTileIdToTileData()[tileId()]
      },
      { name: 'businessPlanCoreFocusTile-getTileData' }
    )

    const getIsEditingDisabled = useComputed(
      () => {
        return (
          getData().pageState.businessPlanMode !== 'EDIT' ||
          !getData().getCurrentUserPermissions().canEditBusinessPlan.allowed
        )
      },
      {
        name: 'businessPlanCoreFocusTile-getIsEditingDisabled',
      }
    )

    const onHandleCreateContextAwareIssueFromBusinessPlan = useAction(
      (opts: { text: string; textTitle?: string }) => {
        const { text, textTitle } = opts

        return getActions().onHandleCreateContextAwareIssueFromBusinessPlan({
          context: {
            type: 'BusinessPlanCoreFocus',
            businessPlanPage: getData().pageState.parentPageType,
            tile:
              getTileData().title ||
              getRecordOfBusinessPlanTileTypeToDefaultTileTitle({ diResolver })[
                getTileData().tileType
              ],
            title: `${textTitle || ''}: ${text}`,
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
          {getTileData().listCollections.nodes.map((listCollection) => {
            return (
              <React.Fragment key={listCollection.id}>
                {getListCollectionToRender({
                  getIsEditingDisabled,
                  listCollection,
                  getTileData,
                  isPdfPreview,
                  onHandleCreateContextAwareIssueFromBusinessPlan,
                })}
              </React.Fragment>
            )
          })}
        </Card.Body>
      </div>
    )
  }
)
