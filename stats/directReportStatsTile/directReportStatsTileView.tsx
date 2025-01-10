import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import {
  type TWorkspaceStatsTileSelectedNodeFilter,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { Card, TextEllipsis, toREM, useResizeObserver } from '@mm/core-web/ui'

import {
  WorkspaceStatsTileDateRangeFilter,
  WorkspaceStatsTileGraph,
  WorkspaceStatsTileNodeFilterTag,
} from '@mm/bloom-web/stats/workspaceStatsTile'

import type { IDirectReportStatsTileViewProps } from './directReportStatsTileTypes'

export const DirectReportStatsTileView = observer(
  function DirectReportStatsTileView(props: IDirectReportStatsTileViewProps) {
    const [cardBodyEl, setCardBodyEl] = useState<Maybe<HTMLDivElement>>(null)

    const terms = useBloomCustomTerms()
    const { t } = useTranslation()

    const selectedGraphNodes: Array<TWorkspaceStatsTileSelectedNodeFilter> = [
      'GOALS',
      'MILESTONES',
    ]

    const {
      width: cardBodyWidth,
      ready: cardBodyDimensionsReady,
      loadingUI: cardBodyLoadingUi,
    } = useResizeObserver(cardBodyEl)

    return (
      <Card
        css={css`
          height: 100%;
        `}
      >
        <Card.Header
          renderLeft={
            <div
              css={css`
                display: flex;
                justify-content: center;
                width: 100%;
              `}
            >
              <TextEllipsis lineLimit={1} wordBreak={true} type='h3'>
                {t('{{goals}} and {{milestones}}', {
                  goals: terms.goal.plural,
                  milestones: terms.milestone.lowercasePlural,
                })}
              </TextEllipsis>
            </div>
          }
        />
        <Card.Body>
          <div
            ref={setCardBodyEl}
            css={css`
              display: flex;
              flex-direction: column;
              width: 100%;
            `}
          >
            {cardBodyLoadingUi}
            {cardBodyDimensionsReady && (
              <>
                <WorkspaceStatsTileDateRangeFilter
                  getSelectedDateRange={() =>
                    props.data().pageState.selectedDateRange
                  }
                  parentWidth={cardBodyWidth}
                  onSetDateRange={async (newDateRange) => {
                    props.actions().onSetDateRange(newDateRange)
                  }}
                  css={css`
                    margin-bottom: ${toREM(16)};
                    padding-top: 0;
                  `}
                />
                <WorkspaceStatsTileGraph
                  statsData={props.data().pageState.statsData}
                  graphHeight={410}
                  getSelectedDateRange={() =>
                    props.data().pageState.selectedDateRange
                  }
                  getSelectedNodes={() => selectedGraphNodes}
                />
                <div
                  css={css`
                    display: flex;
                    flex-wrap: wrap;
                    padding-bottom: ${(prop) => prop.theme.sizes.spacing16};
                    padding-left: ${(prop) => prop.theme.sizes.spacing12};
                    padding-right: ${(prop) => prop.theme.sizes.spacing12};
                    padding-top: ${(prop) => prop.theme.sizes.spacing16};
                  `}
                >
                  {selectedGraphNodes.map((node) => {
                    return (
                      <WorkspaceStatsTileNodeFilterTag
                        key={node}
                        selectedNode={node}
                        numSelectedNodeFilters={selectedGraphNodes.length}
                        parentWidth={cardBodyWidth}
                        hideCloseIcon={true}
                        onRemoveStatsNodeFilter={async () => {
                          // NO_OP
                        }}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    )
  }
)
