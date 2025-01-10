import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { css } from 'styled-components'

import {
  CreateForm,
  GetParentFormValidation,
  formValidators,
  maxLength,
  required,
} from '@mm/core/forms'
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
  TextInput,
  toREM,
  useResizeObserver,
  useTheme,
} from '@mm/core-web/ui'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import { MEETING_TITLES_CHAR_LIMIT } from '@mm/bloom-web/consts'

import {
  CreateEditWorkspaceDrawerButtonTile,
  CreateEditWorkspaceDrawerMeetingSectionHeader,
} from './createEditWorkspaceDrawerSharedComponents'
import type {
  TMeetingTile,
  TOtherTile,
  TPersonalTile,
} from './createEditWorkspaceDrawerSharedTypes'
import {
  ICreateWorkspaceDrawerViewProps,
  ICreateWorkspaceValues,
} from './createWorkspaceDrawerTypes'

const CREATE_WORKSPACE_DRAWER_ID = 'CreateWorkspaceDrawer'

export const CreateWorkspaceDrawerView = observer(
  function CreateWorkspaceDrawerView(props: ICreateWorkspaceDrawerViewProps) {
    const [meetingMenuPopup, setMeetingMenuPopup] =
      useState<Maybe<HTMLDivElement>>(null)

    const theme = useTheme()
    const window = useWindow()
    const { closeOverlazy } = useOverlazyController()

    const { height, ready } = useResizeObserver(meetingMenuPopup)
    const { t } = useTranslation()

    const isMeetingListOverflowing = ready && height > window.innerHeight
    const isCoreProcessEnabled = props.data().isCoreProcessEnabled

    return (
      <CreateForm
        isLoading={props.data().isLoading}
        disabled={false}
        disabledTooltip={undefined}
        values={{ title: '', createAnotherCheckedInDrawer: false }}
        validation={
          {
            title: formValidators.string({
              additionalRules: [
                required(),
                maxLength({
                  maxLength: MEETING_TITLES_CHAR_LIMIT,
                  customErrorMsg: t(`Can't exceed {{maxLength}} characters`, {
                    maxLength: MEETING_TITLES_CHAR_LIMIT,
                  }),
                }),
              ],
            }),
            createAnotherCheckedInDrawer: formValidators.boolean({
              additionalRules: [],
            }),
          } satisfies GetParentFormValidation<ICreateWorkspaceValues>
        }
        onSubmit={props.actions().onCreateWorkspace}
      >
        {({ hasError, values, onSubmit, onResetForm }) => {
          return (
            <Drawer
              id={CREATE_WORKSPACE_DRAWER_ID}
              type='create'
              showEmbeddedDrawer={false}
              headerText={t(`New workspace`)}
              footerText=''
              disableCreateAnother={true}
              saveButtonText={t('Create workspace')}
              saveDisabled={hasError}
              saveDisabledTooltip={undefined}
              drawerHasUnsavedChanges
              staticBackdrop
              onHandleCloseDrawerWithUnsavedChangesProtection={
                props.actions().onHandleCloseDrawerWithUnsavedChangesProtection
              }
              onSaveClicked={onSubmit}
              onResetForm={onResetForm}
              closeOverlazyDrawer={() => closeOverlazy({ type: 'Drawer' })}
              drawerBodyCustomYPadding={`${toREM(20)}`}
            >
              {({ isExpanded }) => {
                if (!values) {
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
                          padding-top: 0;
                        `}
                      >
                        <Text type='h3'>{t('Workspace title')}</Text>
                        <TextInput
                          id={'title'}
                          name={'title'}
                          placeholder={t('Type a title')}
                          width={'100%'}
                        />
                      </GridItem>
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
                          {Object.entries(
                            props.data().componentState.PERSONAL
                          ).map(([tileType, isSelected]) => {
                            return (
                              <CreateEditWorkspaceDrawerButtonTile
                                key={`PERSONAL-${tileType}`}
                                tileType={tileType as TPersonalTile}
                                isSelected={isSelected}
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
                          })}
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
                          {Object.entries(
                            props.data().componentState.OTHER
                          ).map(([tileType, isSelected]) => {
                            if (
                              tileType === 'PROCESSES' &&
                              !isCoreProcessEnabled
                            ) {
                              return null
                            }

                            return (
                              <CreateEditWorkspaceDrawerButtonTile
                                key={`OTHER-${tileType}`}
                                tileType={tileType as TOtherTile}
                                isSelected={isSelected}
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
                          })}
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
                                onDeleteMeetingSectionClicked={() =>
                                  props
                                    .actions()
                                    .onDeleteMeetingSectionClicked({
                                      meetingId: m.meetingId,
                                    })
                                }
                                onExpandClicked={() =>
                                  props
                                    .actions()
                                    .onExpandMeetingSectionClicked({
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
                                    ([tileType, isSelected]) => {
                                      return (
                                        <CreateEditWorkspaceDrawerButtonTile
                                          key={`${m.meetingId}-${tileType}`}
                                          tileType={tileType as TMeetingTile}
                                          isSelected={isSelected}
                                          onTileClicked={() =>
                                            props
                                              .actions()
                                              .onMeetingTileClicked({
                                                meetingId: m.meetingId,
                                                tileType:
                                                  tileType as TMeetingTile,
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
                                      {mL.isSelected && (
                                        <Icon iconName='checkIcon' />
                                      )}
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
        }}
      </CreateForm>
    )
  }
)
