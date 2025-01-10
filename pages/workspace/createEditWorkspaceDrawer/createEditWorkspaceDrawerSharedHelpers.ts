import type {
  TMeetingTile,
  TOtherTile,
  TPersonalTile,
} from './createEditWorkspaceDrawerSharedTypes'

export const isStringPersonalTile = (
  tileType: string
): tileType is TPersonalTile => {
  if (
    tileType === 'PERSONAL_GOALS' ||
    tileType === 'PERSONAL_TODOS' ||
    tileType === 'PERSONAL_METRICS' ||
    tileType === 'PERSONAL_NOTES'
  ) {
    return true
  }
  return false
}

export const isStringMeetingTile = (
  tileType: string
): tileType is TMeetingTile => {
  if (
    tileType === 'MEETING_GOALS' ||
    tileType === 'MEETING_TODOS' ||
    tileType === 'MEETING_HEADLINES' ||
    tileType === 'MEETING_ISSUES' ||
    tileType === 'MEETING_METRICS' ||
    tileType === 'MEETING_NOTES' ||
    tileType === 'MEETING_STATS'
  ) {
    return true
  }
  return false
}

export const isStringOtherTile = (tileType: string): tileType is TOtherTile => {
  if (
    tileType === 'ROLES' ||
    tileType === 'MANAGE' ||
    tileType === 'VALUES' ||
    tileType === 'PROCESSES' ||
    tileType === 'USER_PROFILE'
  ) {
    return true
  }
  return false
}
