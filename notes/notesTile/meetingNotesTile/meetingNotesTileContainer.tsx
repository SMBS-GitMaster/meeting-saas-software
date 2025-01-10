import { runInAction } from 'mobx'
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
  useBloomMeetingNode,
  useBloomNoteMutations,
  useBloomNoteQueries,
  useBloomWorkspaceMutations,
} from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'

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
import { TNotesTileSortType } from '../notesTileSharedTypes'
import { getMeetingNotesTilePermissions } from './meetingNotesTilePermissions'
import {
  IMeetingNotesTileActions,
  IMeetingNotesTileContainerProps,
} from './meetingNotesTileTypes'

export const MeetingNotesTileContainer = observer(
  function MeetingNotesTileContainer(props: IMeetingNotesTileContainerProps) {
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
    const { createMeetingNote, createNote, editMeetingNote } =
      useBloomNoteMutations()
    const { editWorkspaceTile } = useBloomWorkspaceMutations()
    const { getNoteById } = useBloomNoteQueries()
    const { getSecondsSinceEpochUTC } = useTimeController()
    const { logError } = useMMErrorLogger()
    const { openOverlazy } = useOverlazyController()

    const { t } = useTranslation()

    const pageType = props.pageType || 'MEETING'
    const workspaceType = props.workspaceType || 'MEETING'

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
        meeting: queryDefinition({
          def: useBloomMeetingNode(),
          target: { id: props.meetingId },
          map: ({ name, notes, currentMeetingAttendee }) => ({
            name,
            notes: notes({
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
            currentMeetingAttendee: currentMeetingAttendee({
              map: ({ permissions }) => ({
                permissions: permissions({
                  map: ({ view, edit, admin }) => ({ view, edit, admin }),
                }),
              }),
            }),
          }),
        }),
      },
      {
        subscriptionId: `MeetingNotesTileContainer-${props.meetingId}`,
      }
    )

    const currentUserPermissions = useComputed(
      () => {
        return getMeetingNotesTilePermissions(
          subscription().data.meeting.currentMeetingAttendee.permissions ?? null
        )
      },
      { name: 'MeetingNotesTileContainer-currentUserPermissions' }
    )

    const onGetNotesDataForMeetingNotes = useAction(async () => {
      const notes = subscription().data.meeting.notes
      const permissions = currentUserPermissions()

      if (notes && permissions.canEditNotes.allowed) {
        try {
          const noteData: Record<string, string> = {}
          await Promise.all(
            subscription().data.meeting.notes.nodes.map(async (note) => {
              const noteRespone = await getNoteById({ noteId: note.notesId })
              noteData[note.notesId] = noteRespone.text
            })
          )

          runInAction(() => {
            componentState.notesTextByNoteId = noteData
          })
        } catch (e) {
          logError(e, {
            context: `Error fetching meeting notes for meeting ${props.meetingId}`,
          })
        }
      }
    })

    const onSelectNote = useAction((id: Maybe<Id>) => {
      componentState.selectedNoteId = id
    })

    const onCreateNoteEntry: IMeetingNotesTileActions['onCreateNoteEntry'] =
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
          const id = await createMeetingNote({
            meetingId: props.meetingId,
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

    const onCreateNote: IMeetingNotesTileActions['onCreateNote'] = useAction(
      async (opts) => {
        return createNote(opts)
      }
    )

    const onUpdateNote: IMeetingNotesTileActions['onUpdateNote'] = useAction(
      async (opts) => {
        try {
          await editMeetingNote({ ...opts, meetingId: props.meetingId })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue updating the meeting note`),
            error: new UserActionError(error),
          })
        }
      }
    )

    const onArchiveNote: IMeetingNotesTileActions['onArchiveNote'] = useAction(
      async (opts) => {
        try {
          await editMeetingNote({
            meetingId: props.meetingId,
            meetingNoteId: opts.meetingNoteId,
            archived: true,
          })
          onViewAllNotes()
          openOverlazy('Toast', {
            type: 'success',
            text: t(`Meeting note deleted`),
            undoClicked: () => {
              console.log(
                '@TODO_BLOOM https://tractiontools.atlassian.net/browse/TTD-410'
              )
            },
          })
        } catch (error) {
          openOverlazy('Toast', {
            type: 'error',
            text: t(`There was an issue deleting the meeting note`),
            error: new UserActionError(error),
          })
        }
      }
    )

    const onRestoreNote: IMeetingNotesTileActions['onRestoreNote'] = useAction(
      async () => {
        console.log(`@TODO_BLOOM_TRANSACTIONAL: 'onRestore' not implemented `)
      }
    )

    const onViewAllNotes: IMeetingNotesTileActions['onViewAllNotes'] =
      useAction(() => {
        onSelectNote(null)
      })

    const onViewArchivedNotes: IMeetingNotesTileActions['onViewArchivedNotes'] =
      useAction((isViewingArchived: boolean) => {
        componentState.isViewingArchived = isViewingArchived
      })

    const onSortClicked: IMeetingNotesTileActions['onSortClicked'] = useAction(
      (newSortBy: TNotesTileSortType) => {
        componentState.sortBy = newSortBy
      }
    )

    const onExport: IMeetingNotesTileActions['onExport'] = useAction(() => {
      console.log(`@TODO_BLOOM_TRANSACTIONAL: 'onExport' not implemented `)
    })

    const onUpload: IMeetingNotesTileActions['onUpload'] = useAction(() => {
      console.log(`@TODO_BLOOM_TRANSACTIONAL: 'onUpload' not implemented `)
    })

    const onPrint: IMeetingNotesTileActions['onPrint'] = useAction(() => {
      console.log(`@TODO_BLOOM_TRANSACTIONAL: 'onPrint' not implemented `)
    })

    const onDeleteTile: IMeetingNotesTileActions['onDeleteTile'] = useAction(
      async () => {
        if (props.workspaceTileId) {
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
        }
      }
    )

    useEffect(() => {
      if (!subscription().querying) {
        onGetNotesDataForMeetingNotes()
      }
    }, [subscription().querying, onGetNotesDataForMeetingNotes])

    const getData = useComputed(
      () => {
        const permissions = currentUserPermissions()

        return {
          isLoading: subscription().querying,
          workspaceTileId: props.workspaceTileId,
          tileId: props.workspaceTileId,
          pageType,
          workspaceType,
          meetingName: subscription().data.meeting.name,
          selectedNote:
            subscription().data.meeting.notes.nodes.find(
              (x) => x.id === componentState.selectedNoteId
            ) || null,
          notes: subscription().data.meeting.notes.nodes,
          notesTextByNoteId: componentState.notesTextByNoteId,
          isViewingArchived: componentState.isViewingArchived,
          sortBy: componentState.sortBy,
          permissions,
          isExpandedOnWorkspacePage,
          className: props.className,
        }
      },
      {
        name: 'MeetingNotesTileContainer-getData',
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
          onExport,
          onUpload,
          onPrint,
          onRestoreNote,
          onDeleteTile,
        }
      },
      {
        name: 'MeetingNotesTileContainer-getActions',
      }
    )

    const MeetingNotesTileView = (
      <props.children data={getData} actions={getActions} />
    )

    if (isExpandedOnWorkspacePage) {
      return (
        <WorkspaceFullScreenTilePortal>
          {MeetingNotesTileView}
        </WorkspaceFullScreenTilePortal>
      )
    } else {
      return MeetingNotesTileView
    }
  }
)
