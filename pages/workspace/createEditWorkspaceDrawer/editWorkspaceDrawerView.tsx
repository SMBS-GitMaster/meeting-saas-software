import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import { useWindow } from '@mm/core/ssr'

import { useTranslation } from '@mm/core-web/i18n'
import {
  BtnText,
  Drawer,
  GridContainer,
  GridItem,
  Icon,
  Loading,
  Menu,
  Text,
  toREM,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'

import {
  CreateEditWorkspaceDrawerButtonTile,
  CreateEditWorkspaceDrawerMeetingSectionHeader,
} from './createEditWorkspaceDrawerSharedComponents'
import type {
  TMeetingTile,
  TOtherTile,
  TPersonalTile,
} from './createEditWorkspaceDrawerSharedTypes'
import type { IEditWorkspaceDrawerViewProps } from './editWorkspaceDrawerTypes'

const EDIT_WORKSPACE_DRAWER_ID = 'EditWorkspaceDrawer'

export const EditWorkspaceDrawerView = observer(
  function EditWorkspaceDrawerView(props: IEditWorkspaceDrawerViewProps) {
    const [meetingMenuPopup, setMeetingMenuPopup] =
      useState<Maybe<HTMLDivElement>>(null)

    const theme = useTheme()
    const window = useWindow()
    const { closeOverlazy, openOverlazy } = useOverlazyController()

    const { height, ready } = useResizeObserver(meetingMenuPopup)
    const { t } = useTranslation()

    const isMeetingListOverflowing = ready && height > window.innerHeight
    const isCoreProcessEnabled = props.data().isCoreProcessEnabled

    return (
      <Drawer
        id={EDIT_WORKSPACE_DRAWER_ID}
        type='create'
        showEmbeddedDrawer={false}
        headerText={t(`Manage tiles`)}
        disableCreateAnother={true}
        saveButtonText={t('Save')}
        saveDisabled={false}
        saveDisabledTooltip={undefined}
        drawerHasUnsavedChanges
        staticBackdrop
        footerInfoSection={
          <div
            css={css`
              align-items: center;
              display: flex;
              width: 100%;
            `}
          >
            <Icon
              iconName='infoCircleSolid'
              iconSize='md2'
              css={css`
                margin-right: ${(prop) => prop.theme.sizes.spacing4};
              `}
            />
            <Text>
              {t(
                'Tiles will be added into the first space that is available in your workspace.'
              )}
            </Text>
          </div>
        }
        onHandleCloseDrawerWithUnsavedChangesProtection={() => {
          closeOverlazy({
            type: 'Drawer',
          })
        }}
        onSaveClicked={props.actions().onUpdateWorkspace}
        onResetForm={() => null}
        closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
        drawerBodyCustomYPadding={`${toREM(20)}`}
      >
        {({ isExpanded }) => {
          if (props.data().isLoading) {
            return <Loading size='small' />
          } else {
            return (
              <GridContainer
                columns={12}
                withoutMargin={isExpanded ? false : true}
              >
                <GridItem
                  m={12}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing24}
                  css={css`
                    padding-bottom: 0;
                  `}
                >
                  <div
                    css={css`
                      display: flex;
                      flex-direction: column;
                    `}
                  >
                    <Text type='h3'>{t('Personal')}</Text>
                    <Text type='body' weight='normal'>
                      {t('See all items attached to you.')}
                    </Text>
                  </div>
                </GridItem>
                <GridItem
                  m={12}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing4}
                >
                  <div
                    css={css`
                      display: flex;
                      flex-wrap: wrap;
                    `}
                  >
                    {Object.entries(props.data().componentState.PERSONAL).map(
                      ([tileType, tileOpts]) => {
                        return (
                          <CreateEditWorkspaceDrawerButtonTile
                            key={`PERSONAL-${tileType}`}
                            tileType={tileType as TPersonalTile}
                            isSelected={tileOpts.isSelected}
                            onTileClicked={() =>
                              props.actions().onPersonalTileClicked({
                                tileType: tileType as TPersonalTile,
                              })
                            }
                            css={css`
                              margin-right: ${(prop) =>
                                prop.theme.sizes.spacing16};
                              margin-top: ${(prop) =>
                                prop.theme.sizes.spacing8};
                              margin-bottom: ${(prop) =>
                                prop.theme.sizes.spacing8};
                            `}
                          />
                        )
                      }
                    )}
                  </div>
                </GridItem>
                <GridItem
                  m={12}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing24}
                  css={css`
                    padding-bottom: 0;
                  `}
                >
                  <Text type='h3'>{t('Other')}</Text>
                </GridItem>
                <GridItem
                  m={12}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing4}
                >
                  <div
                    css={css`
                      display: flex;
                      flex-wrap: wrap;
                    `}
                  >
                    {Object.entries(props.data().componentState.OTHER).map(
                      ([tileType, tileOpts]) => {
                        if (tileType === 'PROCESSES' && !isCoreProcessEnabled) {
                          return null
                        }

                        return (
                          <CreateEditWorkspaceDrawerButtonTile
                            key={`OTHER-${tileType}`}
                            tileType={tileType as TOtherTile}
                            isSelected={tileOpts.isSelected}
                            onTileClicked={() =>
                              props.actions().onOtherTileClicked({
                                tileType: tileType as TOtherTile,
                              })
                            }
                            css={css`
                              margin-right: ${(prop) =>
                                prop.theme.sizes.spacing16};
                              margin-top: ${(prop) =>
                                prop.theme.sizes.spacing8};
                              margin-bottom: ${(prop) =>
                                prop.theme.sizes.spacing8};
                            `}
                          />
                        )
                      }
                    )}
                  </div>
                </GridItem>
                <GridItem
                  m={12}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing24}
                  css={css`
                    padding-bottom: 0;
                    padding-top: ${toREM(32)};
                  `}
                >
                  <Text type='h3'>{t('Meeting')}</Text>
                </GridItem>
                {props.data().componentState.MEETINGS.map((m) => {
                  return (
                    <GridItem
                      key={m.meetingId}
                      m={12}
                      withoutXPadding={true}
                      rowSpacing={theme.sizes.spacing24}
                    >
                      <div
                        css={css`
                          display: flex;
                          flex-direction: column;
                        `}
                      >
                        <CreateEditWorkspaceDrawerMeetingSectionHeader
                          meetingName={m.meetingName}
                          isExpanded={m.isExpanded}
                          numTilesSelected={m.numTilesSelected}
                          onDeleteMeetingSectionClicked={() => {
                            if (m.numTilesSelected === 0) {
                              props.actions().onDeleteMeetingSectionClicked({
                                meetingId: m.meetingId,
                              })
                            } else {
                              openOverlazy(
                                'RemoveMeetingFromWorkspaceConfirmModal',
                                {
                                  numTilesThatWillBeRemoved: m.numTilesSelected,
                                  onDeleteClicked: () => {
                                    props
                                      .actions()
                                      .onDeleteMeetingSectionClicked({
                                        meetingId: m.meetingId,
                                      })
                                  },
                                }
                              )
                            }
                          }}
                          onExpandClicked={() =>
                            props.actions().onExpandMeetingSectionClicked({
                              meetingId: m.meetingId,
                            })
                          }
                          css={css`
                            margin-bottom: ${(prop) =>
                              prop.theme.sizes.spacing12};
                          `}
                        />
                        {m.isExpanded && (
                          <div
                            css={css`
                              display: flex;
                              flex-wrap: wrap;
                            `}
                          >
                            {Object.entries(m.tiles).map(
                              ([tileType, tileOpts]) => {
                                return (
                                  <CreateEditWorkspaceDrawerButtonTile
                                    key={`${m.meetingId}-${tileType}`}
                                    tileType={tileType as TMeetingTile}
                                    isSelected={tileOpts.isSelected}
                                    onTileClicked={() =>
                                      props.actions().onMeetingTileClicked({
                                        meetingId: m.meetingId,
                                        tileType: tileType as TMeetingTile,
                                      })
                                    }
                                    css={css`
                                      margin-right: ${(prop) =>
                                        prop.theme.sizes.spacing16};
                                      margin-top: ${(prop) =>
                                        prop.theme.sizes.spacing8};
                                      margin-bottom: ${(prop) =>
                                        prop.theme.sizes.spacing8};
                                    `}
                                  />
                                )
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </GridItem>
                  )
                })}
                <GridItem
                  m={12}
                  withoutXPadding={true}
                  rowSpacing={theme.sizes.spacing24}
                >
                  <Menu
                    content={(close) => (
                      <div ref={setMeetingMenuPopup}>
                        {props.data().meetingLookup.map((mL) => {
                          return (
                            <Menu.Item
                              key={mL.value}
                              disabled={mL.isSelected}
                              onClick={(e) => {
                                props.actions().onAddMeetingClicked({
                                  meetingLookup: mL,
                                })
                                close(e)
                              }}
                            >
                              <div
                                css={css`
                                  align-items: center;
                                  display: flex;
                                  justify-content: space-between;
                                  width: 100%;
                                `}
                              >
                                <Text
                                  css={css`
                                    text-align: left;
                                  `}
                                >
                                  {mL.text}
                                </Text>
                                {mL.isSelected && <Icon iconName='checkIcon' />}
                              </div>
                            </Menu.Item>
                          )
                        })}
                      </div>
                    )}
                    css={css`
                      ${isMeetingListOverflowing &&
                      css`
                        height: 98%;
                        overflow: auto;
                      `}
                    `}
                  >
                    <div
                      css={css`
                        width: fit-content;
                      `}
                    >
                      <BtnText
                        css={css`
                          padding: ${(props) =>
                            `${props.theme.sizes.spacing10} ${props.theme.sizes.spacing16}`};

                          span {
                            align-items: center;
                            display: flex;
                          }
                        `}
                        ariaLabel={t('Add meeting to workspace icon')}
                        intent='secondary'
                      >
                        <Icon
                          iconName='plusIcon'
                          css={css`
                            margin-right: ${(props) =>
                              props.theme.sizes.spacing8};
                          `}
                        />
                        <Text
                          weight='semibold'
                          css={css`
                            color: ${(prop) =>
                              `${prop.theme.colors.createEditWorkspaceDrawerAddMeetingButtonFontColor}`};
                          `}
                        >
                          {t('Add a meeting')}
                        </Text>
                      </BtnText>
                    </div>
                  </Menu>
                </GridItem>
              </GridContainer>
            )
          }
        }}
      </Drawer>
    )
  }
)
