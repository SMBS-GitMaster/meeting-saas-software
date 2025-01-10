import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React from 'react'
import { css } from 'styled-components'

import { Id } from '@mm/gql'

import { EBloomPostHogFeatureFlag, useBloomCustomTerms } from '@mm/core-bloom'

import { Card, Loading } from '@mm/core-web/ui'

import { CoreValues } from '@mm/bloom-web/coreValues'
import { PersonalGoalsList } from '@mm/bloom-web/goals'
import { PersonalMetricsTable } from '@mm/bloom-web/metrics'
import { RolesTile } from '@mm/bloom-web/roles'
import emptyCoreValuesImg from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateAssets/emptyCoreValues.svg'
import { DirectReportStatsTile } from '@mm/bloom-web/stats'
import { UserProfileTile } from '@mm/bloom-web/user'

import { useComputed } from '../../performance/mobx'
import { WorkspacePageInProgressTile } from '../../workspace/workspacePageInProgressTile'
import {
  CORE_VALUES_TILE_COLLAPSED_HEIGHT,
  CORE_VALUES_TILE_EXPANDED_HEIGHT,
} from './constants'
import {
  type IQuarterlyAlignmentWorkspaceData,
  type IQuarterlyAlignmentWorkspaceTile,
} from './quarterlyAlignmentWorkspaceTypes'
import { QuarterlyAlignmentWorkspaceTodos } from './todos/quarterlyAlignmentWorkspaceTodos'

interface IQuarterlyAlignmentWorkspaceTileProps {
  tile: IQuarterlyAlignmentWorkspaceTile
  data: () => Pick<IQuarterlyAlignmentWorkspaceData, 'alignmentUser'>
  onHandleUpdateTileHeight: (opts: { tileId: Id; height: number }) => void
}

export const QuarterlyAlignmentWorkspaceTile = observer(
  function QuarterlyAlignmentWorkspaceTile(
    props: IQuarterlyAlignmentWorkspaceTileProps
  ) {
    const terms = useBloomCustomTerms()

    const isV3BusinessPlanEnabled = posthog.isFeatureEnabled(
      EBloomPostHogFeatureFlag.V3_BUSINESS_PLAN_ENABLED
    )

    const renderTile = useComputed(
      () => {
        const tile = props.tile

        switch (tile.tileType) {
          case 'DIRECT_REPORT_STATS':
            return (
              <DirectReportStatsTile
                userId={props.data().alignmentUser?.id ?? null}
              />
            )

          case 'PERSONAL_GOALS':
            return (
              <PersonalGoalsList
                workspaceTileId={tile.id}
                userId={props.data().alignmentUser?.id}
              />
            )

          case 'PERSONAL_METRICS':
            return (
              <PersonalMetricsTable
                workspaceTileId={tile.id}
                userId={props.data().alignmentUser?.id ?? null}
              />
            )

          case 'PERSONAL_TODOS':
            return (
              <QuarterlyAlignmentWorkspaceTodos
                alignmentUser={props.data().alignmentUser}
                tileId={tile.id}
                onHandleUpdateTileHeight={props.onHandleUpdateTileHeight}
              />
            )

          case 'ROLES':
            return (
              <RolesTile
                workspaceTileId={tile.id}
                userId={props.data().alignmentUser?.id ?? null}
                onHandleUpdateTileHeight={props.onHandleUpdateTileHeight}
              />
            )

          case 'USER_PROFILE':
            return (
              <UserProfileTile
                workspaceTileId={props.tile.id}
                userId={props.data().alignmentUser?.id ?? null}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'VALUES':
            return isV3BusinessPlanEnabled ? (
              <CoreValues
                workspaceTileId={tile.id}
                expandableTileOptions={{
                  expandedHeight: CORE_VALUES_TILE_EXPANDED_HEIGHT,
                  collapsedHeight: CORE_VALUES_TILE_COLLAPSED_HEIGHT,
                  isInitiallyExpanded: true,
                  onHandleUpdateTileHeight: props.onHandleUpdateTileHeight,
                }}
              />
            ) : (
              <WorkspacePageInProgressTile
                workspaceTileId={tile.id}
                workspaceId={null}
                tileType={tile.tileType}
                tileName={terms.coreValues.plural}
                tileImgSrc={emptyCoreValuesImg}
                renderContentInRow={true}
                hideMenuOptions={true}
              />
            )

          default:
            return null
        }
      },
      { name: 'quarterlyAlignmentWorkspaceTile-renderTile' }
    )

    return (
      <React.Suspense
        fallback={
          <Card
            css={css`
              height: 100%;
            `}
          >
            <Loading size='small' />
          </Card>
        }
      >
        {renderTile()}
      </React.Suspense>
    )
  }
)
