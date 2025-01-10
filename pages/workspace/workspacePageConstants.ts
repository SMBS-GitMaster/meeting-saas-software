import type { GridStackOptions } from 'gridstack'

import type { Id } from '@mm/gql'

import { uuid } from '@mm/core/utils'

import type { TWorkspaceTileFromV1ToIgnore } from '@mm/core-bloom'
import {
  BloomCustomTerms,
  type TMeetingType,
  getBloomWorkspaceTileTitle,
} from '@mm/core-bloom'

import { TWorkspacePageTile } from './workspacePageTypes'

export const MEETING_WORKSPACE_GRID_INIT_OPTS: GridStackOptions = {
  cellHeight: 48,
  column: 12,
  columnOpts: { breakpoints: [{ w: 768, c: 1 }] },
  float: true,
  margin: 10,
}

export const PERSONAL_WORKSPACE_GRID_INIT_OPTS: GridStackOptions = {
  cellHeight: 48,
  column: 12,
  columnOpts: { breakpoints: [{ w: 768, c: 1 }] },
  float: true,
  margin: 10,
  resizable: {
    handles: 's,e,w,se,sw,',
  },
}

export const getMeetingWorkspaceTiles = (opts: {
  meetingId: Id
  meetingType: TMeetingType
  terms: BloomCustomTerms
}): TWorkspacePageTile[] => {
  return [
    {
      id: uuid(),
      tileType: 'MEETING_METRICS',
      workspaceType: 'MEETING',
      tileTitle: getBloomWorkspaceTileTitle({
        tileType: 'MEETING_METRICS',
        terms: opts.terms,
      }),
      meetingId: opts.meetingId,
      gridstackWidgetOpts: {
        h: 8,
        w: 12,
        locked: true,
        noResize: true,
        noMove: true,
      },
    },
    {
      id: uuid(),
      tileType: 'MEETING_GOALS',
      workspaceType: 'MEETING',
      tileTitle: getBloomWorkspaceTileTitle({
        tileType: 'MEETING_GOALS',
        terms: opts.terms,
      }),
      meetingId: opts.meetingId,
      gridstackWidgetOpts: {
        h: 8,
        w: 4,
        locked: true,
        noResize: true,
        noMove: true,
      },
    },
    {
      id: uuid(),
      tileType: 'MEETING_TODOS',
      workspaceType: 'MEETING',
      tileTitle: getBloomWorkspaceTileTitle({
        tileType: 'MEETING_TODOS',
        terms: opts.terms,
      }),
      meetingId: opts.meetingId,
      gridstackWidgetOpts: {
        h: 8,
        w: 4,
        locked: true,
        noResize: true,
        noMove: true,
      },
    },
    {
      id: uuid(),
      tileType: 'MEETING_ISSUES',
      workspaceType: 'MEETING',
      tileTitle: getBloomWorkspaceTileTitle({
        tileType: 'MEETING_ISSUES',
        terms: opts.terms,
      }),

      meetingId: opts.meetingId,
      gridstackWidgetOpts: {
        h: 8,
        w: 4,
        locked: true,
        noResize: true,
        noMove: true,
      },
    },
    {
      id: uuid(),
      tileType: 'MEETING_HEADLINES',
      workspaceType: 'MEETING',
      tileTitle: getBloomWorkspaceTileTitle({
        tileType: 'MEETING_HEADLINES',
        terms: opts.terms,
      }),
      meetingId: opts.meetingId,
      gridstackWidgetOpts: {
        h: 8,
        w: 4,
        locked: true,
        noResize: true,
        noMove: true,
      },
    },
    {
      id: uuid(),
      tileType: 'MEETING_NOTES',
      workspaceType: 'MEETING',
      tileTitle: getBloomWorkspaceTileTitle({
        tileType: 'MEETING_NOTES',
        terms: opts.terms,
      }),
      meetingId: opts.meetingId,
      gridstackWidgetOpts: {
        h: 8,
        w: 4,
        locked: true,
        noResize: true,
        noMove: true,
      },
    },
    {
      id: uuid(),
      tileType: 'MEETING_STATS',
      workspaceType: 'MEETING',
      tileTitle: getBloomWorkspaceTileTitle({
        tileType: 'MEETING_STATS',
        terms: opts.terms,
      }),
      meetingId: opts.meetingId,
      gridstackWidgetOpts: {
        h: 8,
        w: 4,
        locked: true,
        noResize: true,
        noMove: true,
      },
    },
  ]
}

export const V1_TILES_TO_IGNORE: TWorkspaceTileFromV1ToIgnore[] = [
  'URL',
  'MEETING_SOLVED_ISSUES',
  'MILESTONES',
]
