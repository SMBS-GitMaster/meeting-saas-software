import { observer } from 'mobx-react'
import React, { useContext, useMemo, useState } from 'react'
import { css } from 'styled-components'

import { type Id } from '@mm/gql'

import { SaveStateType } from '@mm/core/forms'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Card,
  Clickable,
  Icon,
  Menu,
  Text,
  TextEllipsis,
  useResizeObserver,
} from '@mm/core-web/ui'
import { DrawerContext } from '@mm/core-web/ui/components/drawer/drawerContext'

import { useAction, useObservable } from '@mm/bloom-web/pages/performance/mobx'
import { useWorkspaceFullScreenTileController } from '@mm/bloom-web/pages/workspace'

import {
  NotesTileAddNoteButton,
  NotesTileEmptyState,
  NotesTileNoteListEntry,
  NotesTileSelectedNote,
  NotesTileSortButton,
  NotesTileViewAllNotesButton,
} from '../notesTileSharedComponents'
import { NOTES_TILE_SAVE_STATE_TO_TEXT_MAP } from '../notesTileSharedConstants'
import { IUpdateNoteTileNoteValues } from '../notesTileSharedTypes'
import { IMeetingNotesTileViewProps } from './meetingNotesTileTypes'

export const MeetingNotesTileView = observer(function MeetingNotesTileView(
  props: IMeetingNotesTileViewProps
) {
  const pageState = useObservable<{
    saveState: Maybe<SaveStateType>
  }>({
    saveState: null,
  })

  const [notesTileEl, setNotesTileEl] = useState<Maybe<HTMLDivElement>>(null)

  const drawerContext = useContext(DrawerContext)
  const { fullScreenTile, minimizeTile } =
    useWorkspaceFullScreenTileController()
  const { t } = useTranslation()
  const { width, loadingUI, ready } = useResizeObserver(notesTileEl)

  const selectedNote = props.data().selectedNote

  const permissions = props.data().permissions

  const isWorkspaceView = props.data().pageType === 'WORKSPACE'

  const workspaceType = props.data().workspaceType

  const workspaceTileId = props.data().workspaceTileId

  const isDisplayEmptyState =
    props.data().notes.length === 0 && !props.data().selectedNote

  const RESPONSIVE_SIZE = useMemo(() => {
    if (!ready) return 'UNKNOWN'
    if (width <= 450) return 'SMALL'
    if (width <= 900) return 'MEDIUM'
    return 'LARGE'
  }, [width, ready])

  const handleUpdateNote = useAction(
    async (values: IUpdateNoteTileNoteValues) => {
      await props.actions().onUpdateNote({
        meetingNoteId: values.id,
        notesId: values.notesId,
        title: values.title,
      })
    }
  )

  const handleArchiveNote = useAction(async (opts: { id: Id }) => {
    await props.actions().onArchiveNote({
      meetingNoteId: opts.id,
    })
  })

  const setSaveState = useAction((newSaveState: Maybe<SaveStateType>) => {
    pageState.saveState = newSaveState
  })

  return (
    <Card ref={setNotesTileEl} className={props.data().className}>
      <Card.Header
        renderLeft={
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            {!isWorkspaceView ? (
              <TextEllipsis type={'h3'} lineLimit={1} wordBreak={true}>
                {t('Meeting Notes')}
              </TextEllipsis>
            ) : (
              <TextEllipsis type='h3' lineLimit={1}>
                {`${t('Notes:')} ${props.data().meetingName}`}
              </TextEllipsis>
            )}
          </div>
        }
        renderRight={
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            <TextEllipsis
              lineLimit={1}
              wordBreak={true}
              css={css`
                margin-left: ${(prop) => prop.theme.sizes.spacing16};
                margin-right: ${(prop) => prop.theme.sizes.spacing8};
              `}
            >
              {selectedNote && pageState.saveState
                ? NOTES_TILE_SAVE_STATE_TO_TEXT_MAP[pageState.saveState]
                : ''}
            </TextEllipsis>
            {isWorkspaceView && (
              <>
                <Menu
                  content={(close) => (
                    <>
                      <Menu.Item
                        disabled={!permissions.canCreateNotes.allowed}
                        tooltip={
                          !permissions.canCreateNotes.allowed
                            ? {
                                msg: permissions.canCreateNotes.message,
                                position: 'top left',
                              }
                            : undefined
                        }
                        onClick={(e) => {
                          close(e)
                          props.actions().onCreateNoteEntry()
                        }}
                      >
                        <Text type={'body'}>{t('Create a new note')}</Text>
                      </Menu.Item>
                      <Menu.Item
                        onClick={(e) => {
                          close(e)
                          if (workspaceTileId) {
                            fullScreenTile(workspaceTileId)
                          }
                        }}
                      >
                        <Text type={'body'}>{t('View in full screen')}</Text>
                      </Menu.Item>
                      {workspaceType === 'PERSONAL' && (
                        <Menu.Item
                          onClick={(e) => {
                            close(e)
                            props.actions().onDeleteTile()
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
                {props.data().isExpandedOnWorkspacePage && (
                  <Clickable clicked={() => minimizeTile()}>
                    <Icon
                      iconName='closeIcon'
                      iconSize='lg'
                      css={css`
                        margin-left: ${(prop) => prop.theme.sizes.spacing8};
                      `}
                    />
                  </Clickable>
                )}
              </>
            )}
            {!isWorkspaceView && (
              <>
                <Clickable
                  clicked={() =>
                    drawerContext.onExpand && drawerContext.onExpand()
                  }
                  css={css`
                    margin-left: ${(prop) => prop.theme.sizes.spacing8};
                    margin-right: ${(prop) => prop.theme.sizes.spacing8};
                  `}
                >
                  {drawerContext.expanded ? (
                    <Icon iconName='collapseIcon' iconSize='lg' />
                  ) : (
                    <Icon iconName='expandIcon' iconSize='lg' />
                  )}
                </Clickable>
                <Clickable
                  clicked={() =>
                    drawerContext.onClose && drawerContext.onClose()
                  }
                >
                  <Icon iconName='closeIcon' iconSize='lg' />
                </Clickable>
              </>
            )}
          </div>
        }
        css={css`
          padding-bottom: ${(prop) => prop.theme.sizes.spacing12};
          padding-left: ${(prop) => prop.theme.sizes.spacing8};
          padding-right: ${(prop) => prop.theme.sizes.spacing8};
          padding-top: ${(prop) => prop.theme.sizes.spacing12};

          ${!isWorkspaceView &&
          css`
            background-color: ${(prop) =>
              prop.theme.colors.drawerHeaderAndFooterBackgroundColor};
          `}
        `}
      />
      <Card.SubHeader useBaseBackgroundColor>
        <div
          css={css`
            align-items: center;
            display: flex;
            justify-content: space-between;
            padding-left: ${(prop) => prop.theme.sizes.spacing4};
            padding-right: ${(prop) => prop.theme.sizes.spacing4};
          `}
        >
          {selectedNote ? (
            <NotesTileViewAllNotesButton
              notesCount={props.data().notes.length}
              onViewAllNotes={props.actions().onViewAllNotes}
            />
          ) : (
            <NotesTileAddNoteButton
              canCreateNotePermission={permissions.canCreateNotes}
              onCreateNoteEntry={props.actions().onCreateNoteEntry}
            />
          )}
          <div
            css={css`
              align-items: center;
              display: flex;
            `}
          >
            {!selectedNote && (
              <NotesTileSortButton
                sortBy={props.data().sortBy}
                onSortClicked={props.actions().onSortClicked}
              />
            )}
          </div>
        </div>
      </Card.SubHeader>
      <Card.Body
        css={css`
          padding-bottom: ${(props) => props.theme.sizes.spacing24};
        `}
      >
        {loadingUI}
        {ready && (
          <>
            {selectedNote ? (
              <NotesTileSelectedNote
                isLoading={props.data().isLoading}
                note={selectedNote}
                noteText={
                  props.data().notesTextByNoteId[selectedNote.notesId] || ''
                }
                canEditNotesPermission={permissions.canEditNotes}
                responsiveSize={RESPONSIVE_SIZE}
                onCreateNote={props.actions().onCreateNote}
                onUpdateNote={handleUpdateNote}
                onArchiveNote={handleArchiveNote}
                onSaveStateChanged={setSaveState}
              />
            ) : (
              props
                .data()
                .notes.map((note) => (
                  <NotesTileNoteListEntry
                    key={note.id}
                    note={note}
                    isViewingArchived={props.data().isViewingArchived}
                    responsiveSize={RESPONSIVE_SIZE}
                    onSelectNote={props.actions().onSelectNote}
                  />
                ))
            )}
          </>
        )}
        {isDisplayEmptyState && (
          <NotesTileEmptyState
            emptyStateMessage={t('You have no active meeting notes')}
            imageAltText={t('Meeting Notes Empty State Image')}
          />
        )}
      </Card.Body>
    </Card>
  )
})
