import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { type Id, queryDefinition, useSubscription } from '@mm/gql'

import {
  getFullDateDisplay,
  getSimpleTimeDisplay,
  useTimeController,
} from '@mm/core/date'
import { UserActionError } from '@mm/core/exceptions/userActionError'
import { useMMErrorLogger } from '@mm/core/logging'

import {
  useAuthenticatedBloomUserQueryDefinition,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomWorkspaceMutations,
  useBloomWorkspaceNode,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import { useWorkspaceIdUrlParamGuard } from '@mm/core-web/router'

import { useOverlazyController } from '@mm/bloom-web/bloomProvider/overlazy/overlazyController'
import {
  useAction,
  useComputed,
  useObservable,
} from '@mm/bloom-web/pages/performance/mobx'
import {
  WorkspaceFullScreenTilePortal,
  useWorkspaceFullScreenTileController,
} from '@mm/bloom-web/pages/workspace'

import { NOTES_TILE_QUERY_SORT_VALUE_BY_SORTING_TYPE } from '../notesTileSharedConstants'
import type {
  INotesTileSharedData,
  TNotesTileSortType,
} from '../notesTileSharedTypes'
import type {
  IWorkspacePersonalNotesTileActions,
  IWorkspacePersonalNotesTileContainerProps,
} from './workspacePersonalNotesTileTypes'

export const WorkspacePersonalNotesTileContainer = observer(
  function WorkspacePersonalNotesTileContainer(
    props: IWorkspacePersonalNotesTileContainerProps
  ) {
    const componentState = useObservable<{
      selectedNoteId: Maybe<Id>
      isViewingArchived: boolean
      sortBy: TNotesTileSortType
      notesTextByNoteId: Record<string, string>
    }>({
      selectedNoteId: null,
      isViewingArchived: false,
      sortBy: 'NEWEST',
      notesTextByNoteId: {},
    })

    const { activeFullScreenTileId } = useWorkspaceFullScreenTileController()
    const { createNote, createWorkspaceNote, editWorkspaceNote } =
      useBloomNoteMutations()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { getNoteById } = useBloomNoteQueries()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { logError } = useMMErrorLogger()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()
    const { workspaceId } = useWorkspaceIdUrlParamGuard({
      workspaceIdViaProps: props.workspaceId,
    })

    const isExpandedOnWorkspacePage =
      activeFullScreenTileId !== null &&
      activeFullScreenTileId === props.workspaceTileId

    const subscription = useSubscription(
      {
        currentUser: useAuthenticatedBloomUserQueryDefinition({
          map: ({ fullName, settings }) => ({
            fullName,
            settings: settings({ map: ({ timezone }) => ({ timezone }) }),
          }),
        }),
        workspace: queryDefinition({
          def: useBloomWorkspaceNode(),
          target: { id: workspaceId },
          map: ({ tiles, workspaceNotes }) => ({
            tiles: tiles({
              filter: {
                and: [{ id: props.workspaceTileId }],
              },
              map: ({ tileType, tileSettings }) => ({ tileType, tileSettings }),
            }),
            workspaceNotes: workspaceNotes({
              filter: {
                and: [{ archived: componentState.isViewingArchived }],
              },
              sort: {
                ...NOTES_TILE_QUERY_SORT_VALUE_BY_SORTING_TYPE[
                  componentState.sortBy
                ],
                archivedTimestamp: componentState.isViewingArchived
                  ? 'desc'
                  : undefined,
              },
              map: ({
                title,
                archived,
                archivedTimestamp,
                dateCreated,
                notesId,
              }) => ({
                title,
                archived,
                dateCreated,
                archivedTimestamp,
                notesId,
              }),
            }),
          }),
        }),
      },
      {
        subscriptionId: `WorkspacePersonalNotesTileContainer-${workspaceId}-${props.workspaceTileId}`,
      }
    )

    const notesTileNode = useComputed(
      () => {
        return subscription().data.workspace.tiles.nodes.find(
          (t) => t.id === props.workspaceTileId
        )
      },
      { name: 'WorkspacePersonalNotesTileContainer-notesTileNode' }
    )

    const onSetSelectedNote = useAction((id: Maybe<Id>) => {
      componentState.selectedNoteId = id
    })

    const onSelectNote = useAction(async (id: Maybe<Id>) => {
      componentState.selectedNoteId = id
      const noteTile = notesTileNode()

      if (noteTile) {
        await editWorkspaceTile({
          id: props.workspaceTileId,
          meetingId: null,
          tileSettings: {
            ...noteTile.tileSettings,
            selectedNoteId: id ? `${id}` : null,
          },
        })
      }
    })

    const setIsViewingArchived = useAction((isViewingArchived: boolean) => {
      componentState.isViewingArchived = isViewingArchived
    })

    const setSortBy = useAction((sortBy: TNotesTileSortType) => {
      componentState.sortBy = sortBy
    })

    const setNotesTextByNoteId = useAction(
      (notesTextByNoteId: Record<string, string>) => {
        componentState.notesTextByNoteId = notesTextByNoteId
      }
    )

    const onGetNotesDataForNotes = useAction(async () => {
      const notes = subscription().data.workspace.workspaceNotes
      if (notes) {
        try {
          const noteData: Record<string, string> = {}
          await Promise.all(
            notes.nodes.map(async (note) => {
              const noteRespone = await getNoteById({ noteId: note.notesId })
              noteData[note.notesId] = noteRespone.text
            })
          )
          setNotesTextByNoteId(noteData)
        } catch (e) {
          logError(e, {
            context: `Error fetching notes for your workspace ${workspaceId}`,
          })
        }
      }
    })

    const onCreateNoteEntry: IWorkspacePersonalNotesTileActions['onCreateNoteEntry'] =
      useAction(async () => {
        const title = `${
          subscription().data.currentUser.fullName
        }: ${getFullDateDisplay({
          secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
        })}, ${getSimpleTimeDisplay({
          secondsSinceEpochUTC: getSecondsSinceEpochUTC(),
          userTimezone: 'utc',
        })}`
        try {
          const id = await createWorkspaceNote({
            workspaceId: subscription().data.workspace.id,
            title: title,
          })
          onSelectNote(id)
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`Error creating meeting note`),
            error: new UserActionError(error),
          })
        }
      })

    const onCreateNote: IWorkspacePersonalNotesTileActions['onCreateNote'] =
      useAction(async (opts) => {
        return createNote(opts)
      })

    const onUpdateNote: IWorkspacePersonalNotesTileActions['onUpdateNote'] =
      useAction(async (opts) => {
        try {
          await editWorkspaceNote({
            ...opts,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue updating the meeting note`),
            error: new UserActionError(error),
          })
        }
      })

    const onArchiveNote: IWorkspacePersonalNotesTileActions['onArchiveNote'] =
      useAction(async (opts) => {
        try {
          await editWorkspaceNote({
            workspaceNoteId: opts.workspaceNoteId,
            archived: true,
          })
          onViewAllNotes()
          openOverlazy('Toast', {
            type: 'success',
            text: t(`Workspace note deleted`),
            undoClicked: () => {
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              )
            },
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue archiving the meeting note`),
            error: new UserActionError(error),
          })
        }
      })

    const onRestoreNote: IWorkspacePersonalNotesTileActions['onRestoreNote'] =
      useAction(async () => {
        console.log(`@TODO_BLOOM_TRANSACTIONAL: 'onRestore' not implemented `)
      })

    const onViewAllNotes: IWorkspacePersonalNotesTileActions['onViewAllNotes'] =
      useAction(() => {
        onSelectNote(null)
      })

    const onViewArchivedNotes: IWorkspacePersonalNotesTileActions['onViewArchivedNotes'] =
      useAction(setIsViewingArchived)

    const onSortClicked: IWorkspacePersonalNotesTileActions['onSortClicked'] =
      useAction(setSortBy)

    const onDeleteTile: IWorkspacePersonalNotesTileActions['onDeleteTile'] =
      useAction(async () => {
        try {
          await editWorkspaceTile({
            id: props.workspaceTileId,
            meetingId: null,
            archived: true,
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue deleting the tile`),
            error: new UserActionError(error),
          })
          throw error
        }
      })

    useEffect(() => {
      if (!subscription().querying) {
        onGetNotesDataForNotes()
      }
    }, [subscription().querying, onGetNotesDataForNotes])

    useEffect(() => {
      const isQuerying = subscription().querying
      const notesTile = notesTileNode()

      if (!isQuerying && notesTile) {
        if (notesTile.tileSettings.selectedNoteId) {
          onSetSelectedNote(Number(notesTile.tileSettings.selectedNoteId))
        }
      }
    }, [subscription().querying, notesTileNode])

    const getData = useComputed(
      () => {
        const permissions: INotesTileSharedData['permissions'] = {
          canCreateNotes: { allowed: true },
          canEditNotes: { allowed: true },
        }

        return {
          isLoading: subscription().querying,
          workspaceTileId: props.workspaceTileId,
          selectedNote:
            subscription().data.workspace.workspaceNotes.nodes.find(
              (x) => x.id === componentState.selectedNoteId
            ) || null,
          notes: subscription().data.workspace.workspaceNotes.nodes,
          notesTextByNoteId: componentState.notesTextByNoteId,
          isViewingArchived: componentState.isViewingArchived,
          sortBy: componentState.sortBy,
          permissions,
          isExpandedOnWorkspacePage,
          className: props.className,
        }
      },
      {
        name: 'WorkspacePersonalNotesTileContainer-getData',
      }
    )

    const getActions = useComputed(
      () => {
        return {
          onSelectNote,
          onCreateNoteEntry,
          onCreateNote,
          onUpdateNote,
          onArchiveNote,
          onViewAllNotes,
          onViewArchivedNotes,
          onSortClicked,
          onRestoreNote,
          onDeleteTile,
        }
      },
      {
        name: 'WorkspacePersonalNotesTileContainer-getActions',
      }
    )

    const PersonalNotesTileView = (
      <props.children data={getData} actions={getActions} />
    )

    if (isExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {PersonalNotesTileView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return PersonalNotesTileView
    }
  }
)
