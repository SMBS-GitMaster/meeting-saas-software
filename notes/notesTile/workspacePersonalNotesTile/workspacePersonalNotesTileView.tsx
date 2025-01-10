import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { css } from 'styled-components'

import type { Id } from '@mm/gql'

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
import { IWorkspacePersonalNotesTileViewProps } from './workspacePersonalNotesTileTypes'

export const WorkspacePersonalNotesTileView = observer(
  function WorkspacePersonalNotesTileView(
    props: IWorkspacePersonalNotesTileViewProps
  ) {
    const pageState = useObservable<{
      saveState: Maybe<SaveStateType>
    }>({
      saveState: null,
    })

    const [notesTileEl, setNotesTileEl] = useState<Maybe<HTMLDivElement>>(null)

    const { fullScreenTile, minimizeTile } =
      useWorkspaceFullScreenTileController()
    const { t } = useTranslation()
    const { width, ready } = useResizeObserver(notesTileEl)

    const permissions = props.data().permissions

    const selectedNote = props.data().selectedNote

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
          workspaceNoteId: values.id,
          title: values.title,
        })
      }
    )

    const handleArchiveNote = useAction(async (opts: { id: Id }) => {
      await props.actions().onArchiveNote({
        workspaceNoteId: opts.id,
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
              <TextEllipsis
                type={'h3'}
                lineLimit={1}
                wordBreak={true}
                css={css`
                  background-color: ${(prop) =>
                    prop.theme.colors.workspacePersonalTilePersonalItemsColor};
                  color: ${(prop) =>
                    prop.theme.colors
                      .workspacePersonalNotesTileHeaderFontcolor};
                  padding: 0 ${(prop) => prop.theme.sizes.spacing8};
                `}
              >
                {t('Private Notes')}
                {RESPONSIVE_SIZE !== 'SMALL' && (
                  <Text
                    type='small'
                    fontStyle='italic'
                    css={css`
                      color: ${(prop) =>
                        prop.theme.colors
                          .workspacePersonalNotesTileHeaderFontcolor};
                      margin-left: ${(prop) => prop.theme.sizes.spacing8};
                    `}
                  >
                    {t('Only you can see this')}
                  </Text>
                )}
              </TextEllipsis>
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
                        fullScreenTile(props.data().workspaceTileId)
                      }}
                    >
                      <Text type={'body'}>{t('View in full screen')}</Text>
                    </Menu.Item>
                    <Menu.Item
                      onClick={(e) => {
                        close(e)
                        props.actions().onDeleteTile()
                      }}
                    >
                      <Text type={'body'}>{t('Delete tile')}</Text>
                    </Menu.Item>
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
            </div>
          }
          css={css`
            padding-bottom: ${(prop) => prop.theme.sizes.spacing12};
            padding-left: ${(prop) => prop.theme.sizes.spacing8};
            padding-right: ${(prop) => prop.theme.sizes.spacing8};
            padding-top: ${(prop) => prop.theme.sizes.spacing12};
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
            {props.data().selectedNote ? (
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
          {isDisplayEmptyState && (
            <NotesTileEmptyState
              emptyStateMessage={t('You have no personal notes')}
              imageAltText={t('Personal notes empty state image')}
            />
          )}
        </Card.Body>
      </Card>
    )
  }
)
