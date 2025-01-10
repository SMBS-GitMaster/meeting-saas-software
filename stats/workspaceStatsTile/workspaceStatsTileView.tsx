import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import {
  TWorkspaceStatsTileSelectedDateRangeFilter,
  TWorkspaceStatsTileSelectedNodeFilter,
  TWorkspaceType,
  useBloomCustomTerms,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Card,
  Clickable,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  toREM,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'

import {
  DATE_RANGE_FILTER_TO_LABEL_MAP,
  DATE_RANGE_FILTER_TO_LABEL_MAP_MOBILE,
  getWorkspaceStatsTileNodeFilterLookup,
  getWorkspaceStatsTileSelectedNodeTerm,
} from './workspaceStatsTileConstants'
import { WorkspaceStatsTileGraph } from './workspaceStatsTileGraph'
import {
  IWorkspaceStatsTileActions,
  IWorkspaceStatsTileViewProps,
} from './workspaceStatsTileTypes'

export const WorkspaceStatsTileView = observer(function WorkspaceStatsTileView(
  props: IWorkspaceStatsTileViewProps
) {
  const [tileViewEl, setTileViewEl] = useState<Maybe<HTMLDivElement>>(null)

  const [cardBodyEl, setCardBodyEl] = useState<Maybe<HTMLDivElement>>(null)

  const [nodeFiltersEl, setNodeFiltersEl] =
    useState<Maybe<HTMLDivElement>>(null)

  const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
  const { t } = useTranslation()
  const { height: cardBodyHeight, ready: cardBodyDimensionsReady } =
    useResizeObserver(cardBodyEl)
  const { height: nodeFiltersHeight, ready: nodeFiltersDimensionsReady } =
    useResizeObserver(nodeFiltersEl)
  const {
    width: tileWidth,
    ready: tileDimensionsReady,
    loadingUI: tileDimensionsLoadingUI,
  } = useResizeObserver(tileViewEl)

  const isExpandedOnWorkspacePage =
    activeFullScreenTileId !== null &&
    activeFullScreenTileId === props.data().workspaceTileId

  const graphHeight = useMemo(() => {
    if (!cardBodyDimensionsReady || !nodeFiltersDimensionsReady) return 0
    return cardBodyHeight - nodeFiltersHeight - 50
  }, [
    cardBodyHeight,
    nodeFiltersHeight,
    cardBodyDimensionsReady,
    nodeFiltersDimensionsReady,
  ])

  return (
    <Card
      ref={setTileViewEl}
      className={props.data().className}
      css={css`
        height: 100%;
      `}
    >
      <Card.Header
        renderLeft={
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            <TextEllipsis type='h3' lineLimit={1} wordBreak={true}>
              {`${t('{{statsCapital}}', { statsCapital: 'Stats' })}: ${
                props.data().meeting.name
              }`}
            </TextEllipsis>
          </div>
        }
        renderRight={
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <WorkspaceStatsTileDropdownFilters
              getSelectedNodes={props.data().statsTileSettings.getSelectedNodes}
              onAddStatsNodeFilter={props.actions().onAddStatsNodeFilter}
              onRemoveStatsNodeFilter={props.actions().onRemoveStatsNodeFilter}
            />
            <WorkspaceStatsTileOptionsMenu
              workspaceTileId={props.data().workspaceTileId}
              workspaceType={props.data().workspaceType}
              isExpandedOnWorkspacePage={isExpandedOnWorkspacePage}
              onDeleteTile={props.actions().onDeleteTile}
            />
          </div>
        }
      >
        {tileDimensionsReady && (
          <WorkspaceStatsTileDateRangeFilter
            getSelectedDateRange={
              props.data().statsTileSettings.getSelectedDateRange
            }
            parentWidth={tileWidth}
            onSetDateRange={props.actions().onSetDateRange}
          />
        )}
      </Card.Header>
      <Card.Body>
        {tileDimensionsLoadingUI}
        {tileDimensionsReady && (
          <div
            ref={setCardBodyEl}
            css={css`
              display: flex;
              flex-direction: column;
              height: 100%;
              justify-content: space-around;
            `}
          >
            <div
              css={css`
                padding-left: ${(prop) => prop.theme.sizes.spacing8};
                padding-right: ${(prop) => prop.theme.sizes.spacing8};
                padding-top: ${(prop) => prop.theme.sizes.spacing20};
              `}
            >
              <WorkspaceStatsTileGraph
                statsData={props.data().statsData}
                graphHeight={isExpandedOnWorkspacePage ? null : graphHeight}
                getSelectedDateRange={
                  props.data().statsTileSettings.getSelectedDateRange
                }
                getSelectedNodes={
                  props.data().statsTileSettings.getSelectedNodes
                }
              />
            </div>
            <div
              ref={setNodeFiltersEl}
              css={css`
                display: flex;
                flex-wrap: wrap;
                padding-bottom: ${(prop) => prop.theme.sizes.spacing16};
                padding-left: ${(prop) => prop.theme.sizes.spacing12};
                padding-right: ${(prop) => prop.theme.sizes.spacing12};
                padding-top: ${(prop) => prop.theme.sizes.spacing16};
              `}
            >
              {props
                .data()
                .statsTileSettings.getSelectedNodes()
                .map((node) => {
                  return (
                    <WorkspaceStatsTileNodeFilterTag
                      key={node}
                      selectedNode={node}
                      numSelectedNodeFilters={
                        props.data().statsTileSettings.getSelectedNodes().length
                      }
                      parentWidth={tileWidth}
                      onRemoveStatsNodeFilter={
                        props.actions().onRemoveStatsNodeFilter
                      }
                    />
                  )
                })}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
})

interface IWorkspaceStatsTileDropdownFiltersProps {
  getSelectedNodes: () => Array<TWorkspaceStatsTileSelectedNodeFilter>
  onAddStatsNodeFilter: IWorkspaceStatsTileActions['onAddStatsNodeFilter']
  onRemoveStatsNodeFilter: IWorkspaceStatsTileActions['onRemoveStatsNodeFilter']
}

export const WorkspaceStatsTileDropdownFilters = observer(
  function WorkspaceStatsTileDropdownFilters(
    props: IWorkspaceStatsTileDropdownFiltersProps
  ) {
    const terms = useBloomCustomTerms()

    const nodeFiltersLookup = getWorkspaceStatsTileNodeFilterLookup({
      selectedNodes: props.getSelectedNodes(),
      terms,
    })

    return (
      <Menu
        content={(close) => (
          <>
            {Object.entries(nodeFiltersLookup).map(
              ([nodeFilterKey, lookup]) => {
                return (
                  <Menu.Item
                    key={nodeFilterKey}
                    onClick={(e) => {
                      if (lookup.isEnabled) {
                        props.onRemoveStatsNodeFilter(
                          nodeFilterKey as TWorkspaceStatsTileSelectedNodeFilter
                        )
                      } else {
                        props.onAddStatsNodeFilter(
                          nodeFilterKey as TWorkspaceStatsTileSelectedNodeFilter
                        )
                      }
                      close(e)
                    }}
                  >
                    <div
                      css={css`
                        align-items: center;
                        display: flex;
                      `}
                    >
                      <Text type={'body'}>{lookup.text}</Text>
                      {lookup.isEnabled && (
                        <Icon
                          iconName='checkIcon'
                          iconSize='lg'
                          css={css`
                            margin-left: ${(prop) => prop.theme.sizes.spacing8};
                          `}
                        />
                      )}
                    </div>
                  </Menu.Item>
                )
              }
            )}
          </>
        )}
      >
        <span>
          <Clickable clicked={() => null}>
            <Icon
              iconName='filterIcon'
              iconSize='lg'
              css={css`
                margin-left: ${(prop) => prop.theme.sizes.spacing12};
                margin-right: ${(prop) => prop.theme.sizes.spacing8};
              `}
            />
          </Clickable>
        </span>
      </Menu>
    )
  }
)

interface IWorkspaceStatsTileOptionsMenuProps {
  workspaceTileId: Maybe<Id>
  workspaceType: TWorkspaceType
  isExpandedOnWorkspacePage: boolean
  onDeleteTile: IWorkspaceStatsTileActions['onDeleteTile']
}

export const WorkspaceStatsTileOptionsMenu = observer(
  function WorkspaceStatsTileOptionsMenu(
    props: IWorkspaceStatsTileOptionsMenuProps
  ) {
    const { fullScreenTile, minimizeTile } =
      useWorkspaceFullScreenTileController()
    const { t } = useTranslation()

    if (props.isExpandedOnWorkspacePage) {
      return (
        <Clickable clicked={() => minimizeTile()}>
          <Icon
            iconName='closeIcon'
            iconSize='lg'
            css={css`
              margin-left: ${(prop) => prop.theme.sizes.spacing4};
            `}
          />
        </Clickable>
      )
    } else {
      return (
        <Menu
          content={(close) => (
            <>
              <Menu.Item
                onClick={(e) => {
                  close(e)
                  if (props.workspaceTileId) {
                    fullScreenTile(props.workspaceTileId)
                  }
                }}
              >
                <Text type={'body'}>
                  {t('{{viewInFullScreenLabel}}', {
                    viewInFullScreenLabel: 'View in full screen',
                  })}
                </Text>
              </Menu.Item>
              {props.workspaceType === 'PERSONAL' && (
                <Menu.Item
                  onClick={(e) => {
                    close(e)
                    props.onDeleteTile()
                  }}
                >
                  <Text type={'body'}>{t('Delete tile')}</Text>
                </Menu.Item>
              )}
            </>
          )}
        >
          <span>
            <Clickable clicked={() => null}>
              <Icon iconName='moreVerticalIcon' iconSize='lg' />
            </Clickable>
          </span>
        </Menu>
      )
    }
  }
)

interface IWorkspaceStatsTileDateRangeFilterProps {
  parentWidth: number
  className?: string
  getSelectedDateRange: () => TWorkspaceStatsTileSelectedDateRangeFilter
  onSetDateRange: IWorkspaceStatsTileActions['onSetDateRange']
}

export const WorkspaceStatsTileDateRangeFilter = observer(
  function WorkspaceStatsTileDateRangeFilter(
    props: IWorkspaceStatsTileDateRangeFilterProps
  ) {
    const dateRangeFiltersMap = useMemo(() => {
      return props.parentWidth < 500
        ? DATE_RANGE_FILTER_TO_LABEL_MAP_MOBILE
        : DATE_RANGE_FILTER_TO_LABEL_MAP
    }, [props.parentWidth])

    return (
      <div
        className={props.className}
        css={css`
          align-items: center;
          display: flex;
          flex-direction: row;
          padding-left: ${(prop) => prop.theme.sizes.spacing16};
          padding-right: ${(prop) => prop.theme.sizes.spacing16};
          padding-top: ${(prop) => prop.theme.sizes.spacing4};
        `}
      >
        {Object.entries(dateRangeFiltersMap).map(
          ([filterValue, filterText]) => {
            return (
              <Clickable
                key={filterValue}
                clicked={() => {
                  props.onSetDateRange(
                    filterValue as TWorkspaceStatsTileSelectedDateRangeFilter
                  )
                }}
                css={css`
                  border-radius: ${(props) => props.theme.sizes.br1};
                  display: flex;
                  align-items: center;
                  margin-right: ${(prop) => prop.theme.sizes.spacing8};
                  padding-left: ${(prop) => prop.theme.sizes.spacing4};
                  padding-right: ${(prop) => prop.theme.sizes.spacing4};

                  ${filterValue === props.getSelectedDateRange()
                    ? css`
                        background-color: ${(prop) =>
                          prop.theme.colors
                            .workspaceDateRangeFilterSelectedBadgeBackgroundColor};
                      `
                    : css`
                        background-color: ${(prop) =>
                          prop.theme.colors
                            .workspaceDateRangeFilterBadgeBackgroundColor};
                      `}
                `}
              >
                <Text
                  type='small'
                  weight='bold'
                  css={css`
                    ${filterValue === props.getSelectedDateRange()
                      ? css`
                          color: ${(prop) =>
                            prop.theme.colors
                              .workspaceDateRangeFilterSelectedBadgeTexTColor};
                        `
                      : css`
                          color: ${(prop) =>
                            prop.theme.colors
                              .workspaceDateRangeFilterBadgeTextColor};
                        `}
                  `}
                >
                  {filterText}
                </Text>
              </Clickable>
            )
          }
        )}
      </div>
    )
  }
)

interface IWorkspaceStatsTileNodeFilterTagProps {
  selectedNode: TWorkspaceStatsTileSelectedNodeFilter
  numSelectedNodeFilters: number
  parentWidth: number
  hideCloseIcon?: boolean
  onRemoveStatsNodeFilter: IWorkspaceStatsTileActions['onRemoveStatsNodeFilter']
}

export const WorkspaceStatsTileNodeFilterTag = observer(
  function WorkspaceStatsTileNodeFilteTag(
    props: IWorkspaceStatsTileNodeFilterTagProps
  ) {
    const terms = useBloomCustomTerms()
    const theme = useTheme()

    const hideCloseIcon = props.hideCloseIcon || false

    const tagWidthRem = useMemo(() => {
      if (props.numSelectedNodeFilters === 4 && props.parentWidth <= 500) {
        if (props.parentWidth <= 350) {
          return toREM(80)
        } else {
          return toREM(140)
        }
      }

      if (props.numSelectedNodeFilters === 3 && props.parentWidth <= 500) {
        if (props.parentWidth <= 300) {
          return toREM(80)
        } else if (props.parentWidth <= 400) {
          return toREM(120)
        } else {
          return toREM(160)
        }
      }

      return toREM(200)
    }, [props.parentWidth, props.numSelectedNodeFilters])

    const termsLabel = getWorkspaceStatsTileSelectedNodeTerm(
      props.selectedNode,
      terms
    )

    const tagBackgroundColor: Record<
      TWorkspaceStatsTileSelectedNodeFilter,
      string
    > = {
      GOALS: theme.colors.workspaceStatsTileGoalsNodeFilterBackgroundColor,
      ISSUES: theme.colors.workspaceStatsTileIssuesNodeFilterBackgroundColor,
      MILESTONES:
        theme.colors.workspaceStatsTileMilestonesNodeFilterBackgroundColor,
      TODOS: theme.colors.workspaceStatsTileTodosNodeFilterBackgroundColor,
    }

    const tagIconColor: Record<TWorkspaceStatsTileSelectedNodeFilter, string> =
      {
        GOALS: theme.colors.workspaceStatsTileGoalsNodeFilterIconColor,
        ISSUES: theme.colors.workspaceStatsTileIssuesNodeFilterIconColor,
        MILESTONES:
          theme.colors.workspaceStatsTileMilestonesNodeFilterIconColor,
        TODOS: theme.colors.workspaceStatsTileTodosNodeFilterIconColor,
      }

    return (
      <Clickable
        clicked={() => {
          props.onRemoveStatsNodeFilter(props.selectedNode)
        }}
      >
        <div
          css={css`
            align-items: center;
            background: ${tagBackgroundColor[props.selectedNode]};
            border-radius: ${(props) => props.theme.sizes.br1};
            display: flex;
            margin: ${(prop) => prop.theme.sizes.spacing4};
            max-width: ${tagWidthRem};
            padding-bottom: ${toREM(2)};
            padding-left: ${(prop) => prop.theme.sizes.spacing4};
            padding-right: ${(prop) => prop.theme.sizes.spacing4};
            padding-top: ${toREM(2)};
          `}
        >
          <Icon
            iconName='searchDataIcon'
            iconSize='lg'
            iconColor={{ color: tagIconColor[props.selectedNode] }}
          />
          <TextEllipsis
            lineLimit={1}
            wordBreak={true}
            css={css`
              margin-left: ${(prop) => prop.theme.sizes.spacing4};
              margin-right: ${(prop) => prop.theme.sizes.spacing4};
            `}
          >
            {termsLabel}
          </TextEllipsis>
          {!hideCloseIcon && <Icon iconName='closeIcon' iconSize='md' />}
        </div>
      </Clickable>
    )
  }
)
