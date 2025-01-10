import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { css } from 'styled-components'

import type { Id } from '@mm/gql'

import {
  getShortDateDisplay,
  getYesterdayAndTodayFromDate,
} from '@mm/core/date'
import {
  EditForm,
  GetParentFormValidation,
  SaveStateType,
  formValidators,
  required,
} from '@mm/core/forms'

import { PermissionCheckResult } from '@mm/core-bloom'

import { useTranslation } from '@mm/core-web/i18n'
import {
  Clickable,
  Icon,
  Menu,
  NotesBox,
  Text,
  TextEllipsis,
  TextInput,
  toREM,
  useResizeObserver,
} from '@mm/core-web/ui'

import MeetingNotesEmptyStateSVG from '@mm/bloom-web/shared/components/bloomPageEmptyState/bloomPageEmptyStateAssets/emptyMeetingNotes.svg'

import { NOTES_TILE_SORT_OPTS } from './notesTileSharedConstants'
import {
  INotesTileNoteDatum,
  INotesTileSharedActions,
  INotesTileSharedData,
  TNotesTileResponsiveSize,
} from './notesTileSharedTypes'

interface INotesTileViewAllNotesButtonProps {
  notesCount: number
  onViewAllNotes: INotesTileSharedActions['onViewAllNotes']
}

export const NotesTileViewAllNotesButton = observer(
  function NotesTileViewAllNotesButton(
    props: INotesTileViewAllNotesButtonProps
  ) {
    const { t } = useTranslation()

    return (
      <Clickable clicked={props.onViewAllNotes}>
        <span
          css={css`
            display: flex;
            align-items: center;
            color: ${(prop) => prop.theme.colors.notesSubTitleTextColor};
          `}
        >
          <Icon
            iconName='chevronLeftIcon'
            iconSize='lg'
            css={css`
              margin-right: ${(prop) => prop.theme.sizes.spacing8};
            `}
          />
          <Text type='body' weight='semibold'>
            {t('View all notes ({{count}})', {
              count: props.notesCount,
            })}
          </Text>
        </span>
      </Clickable>
    )
  }
)

interface INotesTileAddNoteButtonProps {
  canCreateNotePermission: PermissionCheckResult
  onCreateNoteEntry: INotesTileSharedActions['onCreateNoteEntry']
}

export const NotesTileAddNoteButton = observer(function NotesTileAddNoteButton(
  props: INotesTileAddNoteButtonProps
) {
  const { t } = useTranslation()

  return (
    <Clickable
      disabled={!props.canCreateNotePermission.allowed}
      tooltip={
        !props.canCreateNotePermission.allowed
          ? {
              msg: props.canCreateNotePermission.message,
              position: 'top center',
            }
          : undefined
      }
      clicked={props.onCreateNoteEntry}
    >
      <span
        css={css`
          display: flex;
          align-items: center;
          color: ${(prop) => prop.theme.colors.buttonSecondaryTextDefault};
          margin-right: ${(prop) => prop.theme.sizes.spacing8};
        `}
      >
        <Icon
          iconName='plusIcon'
          iconSize='md'
          css={css`
            margin-right: ${(prop) => prop.theme.sizes.spacing8};
          `}
        />
        <TextEllipsis
          lineLimit={1}
          wordBreak={true}
          type='body'
          weight='semibold'
        >
          {t('Add new note')}
        </TextEllipsis>
      </span>
    </Clickable>
  )
})

interface INotesTileSortButtonProps {
  sortBy: INotesTileSharedData['sortBy']
  onSortClicked: INotesTileSharedActions['onSortClicked']
}

export const NotesTileSortButton = observer(function NotesTileSortButton(
  props: INotesTileSortButtonProps
) {
  const { t } = useTranslation()

  return (
    <Menu
      content={(close) => (
        <>
          {NOTES_TILE_SORT_OPTS.map((option) => (
            <Menu.Item
              key={option.value}
              onClick={(e) => {
                close(e)
                props.onSortClicked(option.value)
              }}
            >
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  width: 100%;
                `}
              >
                <Text type={'body'}>{option.text}</Text>
                {option.value === props.sortBy && (
                  <Icon iconName='checkIcon' iconSize='md' />
                )}
              </div>
            </Menu.Item>
          ))}
        </>
      )}
    >
      <span>
        <Clickable clicked={() => null}>
          <span
            css={css`
              display: flex;
              align-items: center;
              color: ${(prop) =>
                prop.theme.colors.meetingSectionSortByTextColor};
            `}
          >
            <Text type='body'>
              <Text type='body' weight='semibold'>
                {t('Sort')}
              </Text>{' '}
            </Text>
            <Icon iconName='chevronDownIcon' iconSize='lg' />
          </span>
        </Clickable>
      </span>
    </Menu>
  )
})

interface INotesTileNoteListEntryProps {
  note: INotesTileNoteDatum
  isViewingArchived: boolean
  responsiveSize: TNotesTileResponsiveSize
  onSelectNote: INotesTileSharedActions['onSelectNote']
}

export const NotesTileNoteListEntry = observer(function NotesTileNoteListEntry(
  props: INotesTileNoteListEntryProps
) {
  const { t } = useTranslation()

  const { isToday, isYesterday } = getYesterdayAndTodayFromDate({
    dateSecondsSinceEpochUTC: props.note.dateCreated,
    timezone: 'utc',
  })

  return (
    <div>
      <Clickable
        clicked={() => {
          props.onSelectNote(props.note.id)
        }}
        css={css`
          width: 100%;
        `}
      >
        <div
          css={css`
            min-height: ${toREM(40)};
            display: flex;
            align-items: center;
            padding-bottom: ${(prop) => prop.theme.sizes.spacing8};
            padding-left: ${(prop) => prop.theme.sizes.spacing16};
            padding-right: ${(prop) => prop.theme.sizes.spacing16};
            padding-top: ${(prop) => prop.theme.sizes.spacing8};

            &:hover,
            &:focus {
              background-color: ${(prop) =>
                prop.theme.colors.itemHoverBackgroundColor};
            }
          `}
        >
          <Icon iconName='fileIcon' iconSize='lg' />
          <TextEllipsis
            lineLimit={1}
            wordBreak={true}
            css={css`
              flex: 1;
              text-align: left;
              margin-left: ${(prop) => prop.theme.sizes.spacing8};
              margin-right: ${(prop) => prop.theme.sizes.spacing40};
            `}
            type='body'
            color={{ intent: 'default' }}
          >
            {props.note.title}
          </TextEllipsis>
          {props.responsiveSize !== 'SMALL' && (
            <Text
              css={css`
                text-align: right;
                color: ${(prop) => prop.theme.colors.notesDateColor};
              `}
              type='body'
              fontStyle='italic'
            >
              {isToday
                ? t('Today')
                : isYesterday
                  ? t('Yesterday')
                  : props.note.dateCreated
                    ? getShortDateDisplay({
                        secondsSinceEpochUTC: props.note.dateCreated,
                        userTimezone: 'utc',
                      })
                    : t('N/A')}
            </Text>
          )}
        </div>
      </Clickable>
    </div>
  )
})

interface INoteTileSelectedNoteProps {
  isLoading: boolean
  note: INotesTileNoteDatum
  noteText: Maybe<string>
  canEditNotesPermission: PermissionCheckResult
  responsiveSize: TNotesTileResponsiveSize
  onCreateNote: INotesTileSharedActions['onCreateNote']
  onSaveStateChanged: (saveState: SaveStateType) => void
  onUpdateNote: (opts: { id: Id; notesId: Id; title: string }) => Promise<void>
  onArchiveNote: (opts: { id: Id }) => Promise<void>
}

export const NotesTileSelectedNote = observer(function NotesTileSelectedNote(
  props: INoteTileSelectedNoteProps
) {
  const [noteTileEl, setNoteTileEl] = useState<Maybe<HTMLDivElement>>(null)
  const [deleteButtonEl, setDeleteButtonEl] =
    useState<Maybe<HTMLDivElement>>(null)

  const { width: notesTileElWidth, ready: notesTileElReady } =
    useResizeObserver(noteTileEl)
  const { width: deleteButtonElWidth, ready: deleteButtonElReady } =
    useResizeObserver(deleteButtonEl)

  const memoizedNoteFormValues = useMemo(() => {
    return {
      id: props.note.id,
      title: props.note.title,
      notesId: props.note.notesId,
    }
  }, [props.note.id, props.note.title, props.note.notesId])

  return (
    <div
      ref={setNoteTileEl}
      css={css`
        padding-left: ${(prop) => prop.theme.sizes.spacing40};
        padding-right: ${(prop) => prop.theme.sizes.spacing40};
      `}
    >
      <EditForm
        isLoading={props.isLoading}
        disabled={!props.canEditNotesPermission.allowed}
        disabledTooltip={
          !props.canEditNotesPermission.allowed
            ? {
                msg: props.canEditNotesPermission.message,
                position: 'top center',
              }
            : undefined
        }
        values={memoizedNoteFormValues}
        validation={
          {
            id: formValidators.stringOrNumber({
              additionalRules: [required()],
            }),
            notesId: formValidators.stringOrNumber({
              additionalRules: [required()],
            }),
            title: formValidators.string({ additionalRules: [required()] }),
          } satisfies GetParentFormValidation<{
            id: Id
            notesId: Id
            title: string
          }>
        }
        onSaveStateChanged={props.onSaveStateChanged}
        onSubmit={async (values) => {
          if (values.title) {
            await props.onUpdateNote({
              id: props.note.id,
              notesId: props.note.notesId,
              title: values.title,
            })
          }
        }}
      >
        {({ fieldNames }) => (
          <div>
            <div
              css={css`
                display: flex;
                align-items: center;
                margin-bottom: ${(prop) => prop.theme.sizes.spacing16};
              `}
            >
              <TextInput
                id='title'
                name={fieldNames.title}
                clearable={false}
                css={css`
                  ${notesTileElReady &&
                  deleteButtonElReady &&
                  css`
                    width: ${notesTileElWidth - deleteButtonElWidth - 85}px;
                  `}
                `}
              />
              <div ref={setDeleteButtonEl}>
                <NotesTileArchiveButton
                  responsiveSize={props.responsiveSize}
                  canEditNote={props.canEditNotesPermission}
                  onArchiveNoteClicked={() =>
                    props.onArchiveNote({ id: props.note.id })
                  }
                />
              </div>
            </div>
            <NotesBox
              id='note-tile-selected-note-id-input-notes-drawer-view-notes-id-input'
              name={fieldNames.notesId}
              text={props.noteText}
              darkToolbar
              width='100%'
              disabled={!props.canEditNotesPermission.allowed}
              tooltip={
                !props.canEditNotesPermission.allowed
                  ? {
                      msg: props.canEditNotesPermission.message,
                      position: 'top center',
                    }
                  : undefined
              }
              createNotes={props.onCreateNote}
            />
          </div>
        )}
      </EditForm>
    </div>
  )
})

interface INotesTileArchiveButtonProps {
  responsiveSize: TNotesTileResponsiveSize
  canEditNote: PermissionCheckResult
  onArchiveNoteClicked: () => void
}

export const NotesTileArchiveButton = observer(function NotesTileArchiveButton(
  props: INotesTileArchiveButtonProps
) {
  const { t } = useTranslation()

  return (
    <Clickable
      disabled={!props.canEditNote.allowed}
      tooltip={
        !props.canEditNote.allowed
          ? {
              msg: props.canEditNote.message,
              position: 'top center',
            }
          : undefined
      }
      clicked={() => props.onArchiveNoteClicked()}
    >
      <span
        css={css`
          display: flex;
          align-items: center;
          color: ${(prop) => prop.theme.colors.notesSubTitleTextColor};
        `}
      >
        <Icon
          iconName='trashIcon'
          iconSize='md'
          css={css`
            margin-left: ${(prop) => prop.theme.sizes.spacing12};
            margin-right: ${(prop) => prop.theme.sizes.spacing4};
          `}
        />
        {props.responsiveSize !== 'SMALL' && (
          <Text type='body' weight='semibold'>
            {t('Delete')}
          </Text>
        )}
      </span>
    </Clickable>
  )
})

// function OptionsButton(
//   props: Pick<
//     IMeetingNotesDrawerActionHandlers,
//     'onPrint' | 'onUpload' | 'onExport' | 'onViewArchive'
//   > & {
//     viewingArchived: boolean
//     canEditMeetingNotesInMeeting: PermissionCheckResult
//     canCreateMeetingNotesInMeeting: PermissionCheckResult
//   }
// ) {
//   const { t } = useTranslation()
//   return (
//     <Menu
//       content={(close) => (
//         <>
//           <Menu.Item
//             disabled={!props.canEditMeetingNotesInMeeting.allowed}
//             tooltip={
//               !props.canEditMeetingNotesInMeeting.allowed
//                 ? {
//                     msg: props.canEditMeetingNotesInMeeting.message,
//                     position: 'right center',
//                   }
//                 : undefined
//             }
//             onClick={(e) => {
//               close(e)
//               props.onPrint()
//             }}
//           >
//             <Text type={'body'}>{t('Print')}</Text>
//           </Menu.Item>
//           <Menu.Item
//             disabled={!props.canCreateMeetingNotesInMeeting.allowed}
//             tooltip={
//               !props.canCreateMeetingNotesInMeeting.allowed
//                 ? {
//                     msg: props.canCreateMeetingNotesInMeeting.message,
//                     position: 'right center',
//                   }
//                 : undefined
//             }
//             onClick={(e) => {
//               close(e)
//               props.onUpload()
//             }}
//           >
//             <Text type={'body'}>{t('Upload')}</Text>
//           </Menu.Item>
//           <Menu.Item
//             disabled={!props.canEditMeetingNotesInMeeting.allowed}
//             tooltip={
//               !props.canEditMeetingNotesInMeeting.allowed
//                 ? {
//                     msg: props.canEditMeetingNotesInMeeting.message,
//                     position: 'right center',
//                   }
//                 : undefined
//             }
//             onClick={(e) => {
//               close(e)
//               props.onExport()
//             }}
//           >
//             <Text type={'body'}>{t('Export')}</Text>
//           </Menu.Item>
//           <Menu.Item
//             onClick={(e) => {
//               close(e)
//               props.onViewArchive(!props.viewingArchived)
//             }}
//           >
//             <Text type={'body'}>
//               {props.viewingArchived
//                 ? t('View Non-Archived Notes')
//                 : t('View Archived Notes')}
//             </Text>
//           </Menu.Item>
//         </>
//       )}
//     >
//       <span>
//         <Clickable clicked={() => null}>
//           <Icon iconName='moreVerticalIcon' iconSize='lg' />
//         </Clickable>
//       </span>
//     </Menu>
//   )
// }

interface INotesTileEmptyStateProps {
  emptyStateMessage: string
  imageAltText: string
}

export const NotesTileEmptyState = observer(function NotesTileEmptyState(
  props: INotesTileEmptyStateProps
) {
  return (
    <div
      css={css`
        align-items: center;
        background-color: ${({ theme }) => theme.colors.cardBackgroundColor};
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: center;
        width: 100%;
      `}
    >
      <img
        src={MeetingNotesEmptyStateSVG}
        alt={props.imageAltText}
        css={css`
          height: ${toREM(120)};
          object-fit: contain;
          object-position: center;
          width: ${toREM(120)};
        `}
      />
      <Text
        weight='semibold'
        css={css`
          color: ${(props) => props.theme.colors.pageEmptyStateTitle};
          line-height: ${(props) => props.theme.sizes.spacing20};
          margin-top: ${(props) => props.theme.sizes.spacing48};
        `}
      >
        {props.emptyStateMessage}
      </Text>
    </div>
  )
})
