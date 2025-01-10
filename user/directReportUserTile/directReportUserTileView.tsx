import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import { type TWorkspaceStatsTileSelectedNodeFilter } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web'

import { useNavigation } from '@mm/core-web/router'
import {
  BtnText,
  Card,
  Text,
  TextEllipsis,
  Tooltip,
  getRecordOfUserAvatarColorToThemeColor,
  toREM,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import { paths } from '@mm/bloom-web/router/paths'
import {
  WorkspaceStatsTileDateRangeFilter,
  WorkspaceStatsTileGraph,
  WorkspaceStatsTileNodeFilterTag,
} from '@mm/bloom-web/stats'

import type { IDirectReportUserTileViewProps } from './directReportUserTileTypes'

export const DirectReportUserTileView = observer(
  function DirectReportUserTileView(props: IDirectReportUserTileViewProps) {
    const [tileViewEl, setTileViewEl] = useState<Maybe<HTMLDivElement>>(null)

    const theme = useTheme()
    const { navigate } = useNavigation()
    const { t } = useTranslation()
    const { width, ready } = useResizeObserver(tileViewEl)

    const user = props.data().user
    const firstInitial = user ? user.firstName[0].toUpperCase() : ''
    const lastInitial = user ? user.lastName[0].toUpperCase() : ''
    const profilePictureUrl = props.data().user?.profilePictureUrl

    const initialsBackgroundColor = user
      ? getRecordOfUserAvatarColorToThemeColor(theme)[user.userAvatarColor]
      : 'COLOR1'

    const selectedGraphNodes: Array<TWorkspaceStatsTileSelectedNodeFilter> = [
      'TODOS',
      'GOALS',
      'MILESTONES',
    ]

    return (
      <Card
        css={css`
          margin: ${toREM(12)};
          min-width: ${toREM(600)};
          width: ${toREM(700)};
        `}
      >
        <Card.Header
          renderLeft={
            <TextEllipsis lineLimit={1} wordBreak={true} type='h3'>
              {props.data().user?.firstName} {props.data().user?.lastName}
            </TextEllipsis>
          }
        />
        <Card.Body>
          <div
            css={css`
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              margin-top: ${toREM(8)};
              width: 100%;
            `}
          >
            <div
              css={css`
                align-items: center;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                text-align: center;
                width: 100%;
              `}
            >
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                `}
              >
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt={t('User avatar')}
                    css={css`
                      border-radius: ${(prop) => prop.theme.sizes.br2};
                      height: ${toREM(240)};
                      width: ${toREM(240)};
                    `}
                  />
                ) : (
                  <div
                    css={css`
                      align-items: center;
                      background-color: ${initialsBackgroundColor};
                      border-radius: ${(prop) => prop.theme.sizes.br2};
                      display: flex;
                      height: ${toREM(240)};
                      justify-content: center;
                      width: ${toREM(240)};
                    `}
                  >
                    <Text
                      type='h1'
                      css={css`
                        font-size: ${toREM(40)};
                      `}
                    >
                      {firstInitial}
                      {lastInitial}
                    </Text>
                  </div>
                )}
                <div
                  css={css`
                    display: flex;
                    flex-direction: column;
                    margin-top: ${toREM(16)};
                  `}
                >
                  {props.data().positionTitles.length > 1 ? (
                    <Tooltip
                      position={'bottom center'}
                      msg={
                        <span
                          css={css`
                            display: flex;
                            flex-direction: column;
                          `}
                        >
                          {props.data().positionTitles.map((positionTitle) => {
                            return (
                              <Text
                                key={positionTitle}
                                css={css`
                                  color: ${(prop) =>
                                    prop.theme.colors.tooltipLightFontColor};
                                  margin-bottom: ${toREM(4)};
                                `}
                              >
                                {positionTitle}
                              </Text>
                            )
                          })}
                        </span>
                      }
                    >
                      <span>
                        <TextEllipsis lineLimit={1} wordBreak={true}>
                          <Text>{props.data().positionTitles[0]}</Text>
                          {` `}
                          <Text fontStyle='italic'>{`+${props.data().positionTitles.length - 1}`}</Text>
                        </TextEllipsis>
                      </span>
                    </Tooltip>
                  ) : (
                    props.data().positionTitles.map((positionTitle) => {
                      return (
                        <TextEllipsis
                          key={positionTitle}
                          lineLimit={1}
                          wordBreak={true}
                          css={css`
                            margin-bottom: ${toREM(4)};
                          `}
                        >
                          {positionTitle}
                        </TextEllipsis>
                      )
                    })
                  )}
                </div>
              </div>
              <BtnText
                intent='secondary'
                ariaLabel={t('Go to meeting workspace')}
                // @TODO: DEV-131 (navigate to actual meetingId of QA)
                onClick={() =>
                  navigate(
                    paths.quarterlyAlignment({
                      meetingId: 123,
                      tab: 'WORKSPACE',
                    })
                  )
                }
                css={css`
                  margin-bottom: ${toREM(20)};
                  width: fit-content;
                `}
              >
                {t('Go to meeting workspace')}
              </BtnText>
            </div>
            <div
              css={css`
                background-color: ${(prop) =>
                  prop.theme.colors.directReportUserTileDivider};
                margin-bottom: ${toREM(20)};
                width: ${toREM(1)};
              `}
            />
            <div
              ref={setTileViewEl}
              css={css`
                display: flex;
                flex-direction: column;
                width: 100%;
              `}
            >
              {ready && (
                <WorkspaceStatsTileDateRangeFilter
                  getSelectedDateRange={() => props.data().selectedDateRange}
                  parentWidth={width}
                  onSetDateRange={props.actions().onSetDateRange}
                  css={css`
                    margin-bottom: ${toREM(16)};
                    padding-top: 0;
                  `}
                />
              )}
              <WorkspaceStatsTileGraph
                statsData={props.data().statsData}
                graphHeight={300}
                getSelectedDateRange={() => props.data().selectedDateRange}
                getSelectedNodes={() => selectedGraphNodes}
              />
              {ready && (
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
                        parentWidth={width}
                        hideCloseIcon={true}
                        onRemoveStatsNodeFilter={async () => {
                          // NO_OP
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    )
  }
)
