import { observer } from 'mobx-react'
import React from 'react'

import { INotesBoxSectionProps } from '@mm/bloom-web/notesBox/notesBoxSectionTypes'
import { NotesBoxSectionView } from '@mm/bloom-web/notesBox/notesBoxSectionView'

export const NotesBoxSection = observer(function NoteBoxSection(
  props: INotesBoxSectionProps
) {
  return <NotesBoxSectionView {...props} />
})
