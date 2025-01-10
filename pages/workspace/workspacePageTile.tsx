import { observer } from 'mobx-react'
import posthog from 'posthog-js'
import React from 'react'
import { css } from 'styled-components'

import type { Id } from '@mm/gql'

import { EBloomPostHogFeatureFlag, useBloomCustomTerms } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { Card, Loading } from '@mm/core-web/ui'

import { CoreValues } from '@mm/bloom-web/coreValues'
import { MeetingGoalsList, PersonalGoalsList } from '@mm/bloom-web/goals'
import { HeadlinesList } from '@mm/bloom-web/headlines'
import { IssueList } from '@mm/bloom-web/issues'
import { PersonalMetricsTable } from '@mm/bloom-web/metrics'
import { MetricsTable } from '@mm/bloom-web/metrics/metricsTable/metricsTable'
import {
  MeetingNotesTile,
  WorkspacePersonalNotesTile,
} from '@mm/bloom-web/notes'
import { useComputed } from '@mm/bloom-web/pages/performance/mobx'
import { RolesTile } from '@mm/bloom-web/roles'
import emptyCoreValuesImg from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateAssets/emptyCoreValues.svg'
import emptyDirectReportsImg from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateAssets/emptyDirectReports.svg'
import emptyProcesses from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateAssets/emptyProcesses.svg'
import { WorkspaceStatsTile } from '@mm/bloom-web/stats'
import { MeetingTodoList, PersonalTodoList } from '@mm/bloom-web/todos'
import { UserProfileTile } from '@mm/bloom-web/user'

import { isMeetingWorkspace as isMeetingWorkspaceComputed } from './computed'
import { WorkspacePageInProgressTile } from './workspacePageInProgressTile'
import type { TWorkspacePageTile } from './workspacePageTypes'

interface IWorkspacePageTileProps {
  workspaceId: Maybe<Id>
  tile: TWorkspacePageTile
}

export const WorkspacePageTile = observer(function WorkspacePageTile(
  props: IWorkspacePageTileProps
) {
  const terms = useBloomCustomTerms()
  const { t } = useTranslation()

  const isV3BusinessPlanEnabled = posthog.isFeatureEnabled(
    EBloomPostHogFeatureFlag.V3_BUSINESS_PLAN_ENABLED
  )

  const renderTile = useComputed(
    () => {
      const tile = props.tile
      if (tile.meetingId !== null) {
        switch (tile.tileType) {
          case 'MEETING_GOALS':
            return (
              <MeetingGoalsList
                workspaceTileId={tile.id}
                meetingId={tile.meetingId}
                pageType='WORKSPACE'
                workspaceType={tile.workspaceType}
                getPageToDisplayData={() => {
                  return {
                    pageName: isMeetingWorkspaceComputed(tile)
                      ? tile.tileTitle
                      : '',
                  }
                }}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'MEETING_HEADLINES':
            return (
              <HeadlinesList
                workspaceTileId={tile.id}
                meetingId={tile.meetingId}
                getPageToDisplayData={() => {
                  return {
                    pageName: isMeetingWorkspaceComputed(tile)
                      ? tile.tileTitle
                      : '',
                  }
                }}
                pageType='WORKSPACE'
                workspaceType={tile.workspaceType}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'MEETING_ISSUES':
            return (
              <IssueList
                workspaceTileId={tile.id}
                meetingId={tile.meetingId}
                pageType='WORKSPACE'
                workspaceType={tile.workspaceType}
                getPageToDisplayData={() => {
                  return {
                    pageName: isMeetingWorkspaceComputed(tile)
                      ? tile.tileTitle
                      : '',
                  }
                }}
              />
            )

          case 'MEETING_METRICS':
            return (
              <MetricsTable
                workspaceTileId={tile.id}
                meetingId={tile.meetingId}
                pageType='WORKSPACE'
                workspaceType={tile.workspaceType}
                getPageToDisplayData={() => {
                  return {
                    pageName: isMeetingWorkspaceComputed(tile)
                      ? tile.tileTitle
                      : '',
                  }
                }}
              />
            )

          case 'MEETING_TODOS':
            return (
              <MeetingTodoList
                workspaceTileId={tile.id}
                meetingId={tile.meetingId}
                pageType='WORKSPACE'
                workspaceType={tile.workspaceType}
                getPageToDisplayData={() => {
                  return {
                    pageName: isMeetingWorkspaceComputed(tile)
                      ? tile.tileTitle
                      : '',
                  }
                }}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'MEETING_NOTES':
            return (
              <MeetingNotesTile
                workspaceTileId={tile.id}
                meetingId={tile.meetingId}
                pageType='WORKSPACE'
                workspaceType={tile.workspaceType}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'MEETING_STATS':
            return (
              <WorkspaceStatsTile
                workspaceTileId={tile.id}
                meetingId={tile.meetingId}
                workspaceType={tile.workspaceType}
              />
            )

          default:
            null
        }
      }

      if (tile.meetingId === null) {
        switch (tile.tileType) {
          case 'PERSONAL_TODOS':
            return (
              <PersonalTodoList
                workspaceTileId={tile.id}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'PERSONAL_NOTES':
            return (
              <WorkspacePersonalNotesTile
                workspaceId={props.workspaceId}
                workspaceTileId={tile.id}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'PERSONAL_GOALS':
            return <PersonalGoalsList workspaceTileId={tile.id} />

          case 'PERSONAL_METRICS':
            return (
              <PersonalMetricsTable workspaceTileId={tile.id} userId={null} />
            )

          case 'USER_PROFILE':
            return (
              <UserProfileTile
                workspaceTileId={tile.id}
                userId={null}
                css={css`
                  height: 100%;
                `}
              />
            )

          case 'VALUES': {
            return isV3BusinessPlanEnabled ? (
              <CoreValues
                workspaceTileId={tile.id}
                displayTileWorkspaceOptions={true}
              />
            ) : (
              <WorkspacePageInProgressTile
                workspaceTileId={tile.id}
                workspaceId={props.workspaceId}
                tileType={tile.tileType}
                tileName={terms.coreValues.plural}
                tileImgSrc={emptyCoreValuesImg}
              />
            )
          }

          case 'MANAGE':
            return (
              <WorkspacePageInProgressTile
                workspaceTileId={tile.id}
                workspaceId={props.workspaceId}
                tileType={tile.tileType}
                tileName={t('Direct Reports')}
                tileImgSrc={emptyDirectReportsImg}
              />
            )

          case 'ROLES':
            return (
              <RolesTile
                workspaceTileId={tile.id}
                userId={null}
                onHandleUpdateTileHeight={() => null}
              />
            )

          case 'PROCESSES':
            return (
              <WorkspacePageInProgressTile
                workspaceTileId={tile.id}
                workspaceId={props.workspaceId}
                tileType={tile.tileType}
                tileName={t('Processes')}
                tileImgSrc={emptyProcesses}
              />
            )

          default:
            return null
        }
      }

      return null
    },
    { name: 'workspacePageTile-renderTile' }
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
})
